import { NextResponse, type NextRequest } from 'next/server'
import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import {
  combineHouseholdNotes,
  findHouseholdDuplicateCandidates,
  type HouseholdDuplicateCandidate,
} from '@/lib/householdDuplicateReview'
import { parseHouseholdRow } from '@/lib/households'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { HouseholdRow } from '@/lib/types/households'

export const runtime = 'nodejs'

const MERGE_FIELDS = ['name', 'address', 'city', 'state', 'postal_code', 'notes'] as const
type MergeField = (typeof MERGE_FIELDS)[number]

function text(value: unknown, max = 2000): string {
  return String(value ?? '').trim().slice(0, max)
}

function nullableText(value: unknown, max = 2000): string | null {
  const s = text(value, max)
  return s ? s : null
}

function isMergeField(value: unknown): value is MergeField {
  return MERGE_FIELDS.includes(value as MergeField)
}

async function primaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { parishId, error } = await fetchPrimaryParishId(admin)
  if (error) throw error
  return parishId
}

async function loadHouseholds(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  parishId: string
) {
  const { data, error } = await admin
    .from('households')
    .select('*')
    .eq('parish_id', parishId)
    .order('name', { ascending: true })
    .limit(5000)

  if (error) throw error
  return (data ?? []).map((row) => parseHouseholdRow(row as Record<string, unknown>))
}

async function loadMemberCounts(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  householdIds: string[]
) {
  const counts = new Map<string, { members: number; primaryContacts: number }>()
  for (const id of householdIds) counts.set(id, { members: 0, primaryContacts: 0 })
  if (householdIds.length === 0) return counts

  const { data } = await admin
    .from('household_members')
    .select('household_id, is_primary_contact')
    .in('household_id', householdIds)

  for (const rowRaw of data ?? []) {
    const row = rowRaw as Record<string, unknown>
    const id = String(row.household_id ?? '')
    const current = counts.get(id)
    if (!current) continue
    current.members += 1
    if (Boolean(row.is_primary_contact)) current.primaryContacts += 1
  }

  return counts
}

function serializeCandidate(
  candidate: HouseholdDuplicateCandidate,
  counts: Map<string, { members: number; primaryContacts: number }>
) {
  return {
    ...candidate,
    households: candidate.households.map((household) => ({
      ...household,
      memberCounts: counts.get(household.id) ?? { members: 0, primaryContacts: 0 },
    })),
  }
}

function selectedPayload(
  canonical: HouseholdRow,
  duplicate: HouseholdRow,
  selectedFields: Record<string, unknown>
) {
  const sourceFor = (field: MergeField) =>
    selectedFields[field] === duplicate.id ? duplicate : canonical

  const name = text(sourceFor('name').name, 200)
  if (!name) return { ok: false as const, error: 'Household name is required.' }

  return {
    ok: true as const,
    payload: {
      name,
      address: nullableText(sourceFor('address').address, 500),
      city: nullableText(sourceFor('city').city, 120),
      state: nullableText(sourceFor('state').state, 80),
      postal_code: nullableText(sourceFor('postal_code').postal_code, 40),
      notes:
        selectedFields.notes === 'combine'
          ? combineHouseholdNotes(canonical.notes, duplicate.notes)
          : nullableText(sourceFor('notes').notes, 2000),
    },
  }
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const households = await loadHouseholds(admin, parishId)
  const candidates = findHouseholdDuplicateCandidates(households).slice(0, 50)
  const householdIds = Array.from(
    new Set(candidates.flatMap((candidate) => candidate.households.map((h) => h.id)))
  )
  const counts = await loadMemberCounts(admin, householdIds)

  return NextResponse.json({
    ok: true,
    candidates: candidates.map((candidate) => serializeCandidate(candidate, counts)),
  })
}

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid merge request.' }, { status: 400 })
  }

  const canonicalHouseholdId = text(body.canonicalHouseholdId, 80)
  const duplicateHouseholdId = text(body.duplicateHouseholdId, 80)
  if (
    !canonicalHouseholdId ||
    !duplicateHouseholdId ||
    canonicalHouseholdId === duplicateHouseholdId
  ) {
    return NextResponse.json(
      { ok: false, error: 'Choose two different households to merge.' },
      { status: 400 }
    )
  }

  const selectedFieldsRaw =
    body.selectedFields && typeof body.selectedFields === 'object' && !Array.isArray(body.selectedFields)
      ? (body.selectedFields as Record<string, unknown>)
      : {}
  const selectedFields = Object.entries(selectedFieldsRaw).reduce<Record<string, unknown>>(
    (next, [field, value]) => {
      if (isMergeField(field)) next[field] = value
      return next
    },
    {}
  )

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data: householdRows, error: householdsError } = await admin
    .from('households')
    .select('*')
    .eq('parish_id', parishId)
    .in('id', [canonicalHouseholdId, duplicateHouseholdId])

  if (householdsError) {
    return NextResponse.json({ ok: false, error: householdsError.message }, { status: 500 })
  }

  const households = (householdRows ?? []).map((row) =>
    parseHouseholdRow(row as Record<string, unknown>)
  )
  const canonical = households.find((household) => household.id === canonicalHouseholdId)
  const duplicate = households.find((household) => household.id === duplicateHouseholdId)
  if (!canonical || !duplicate) {
    return NextResponse.json(
      { ok: false, error: 'One of these households was not found.' },
      { status: 404 }
    )
  }

  const normalized = selectedPayload(canonical, duplicate, selectedFields)
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  const { error: updateCanonicalError } = await admin
    .from('households')
    .update(normalized.payload)
    .eq('id', canonicalHouseholdId)
    .eq('parish_id', parishId)
  if (updateCanonicalError) {
    return NextResponse.json({ ok: false, error: updateCanonicalError.message }, { status: 500 })
  }

  const { data: duplicateMembers, error: duplicateMembersError } = await admin
    .from('household_members')
    .select('id, person_id, relationship, is_primary_contact')
    .eq('parish_id', parishId)
    .eq('household_id', duplicateHouseholdId)

  if (duplicateMembersError) {
    return NextResponse.json({ ok: false, error: duplicateMembersError.message }, { status: 500 })
  }

  const { data: canonicalMembers, error: canonicalMembersError } = await admin
    .from('household_members')
    .select('id, person_id, is_primary_contact')
    .eq('parish_id', parishId)
    .eq('household_id', canonicalHouseholdId)

  if (canonicalMembersError) {
    return NextResponse.json({ ok: false, error: canonicalMembersError.message }, { status: 500 })
  }

  const canonicalPersonIds = new Set(
    (canonicalMembers ?? []).map((row) => String((row as Record<string, unknown>).person_id ?? ''))
  )
  let canonicalHasPrimary = (canonicalMembers ?? []).some((row) =>
    Boolean((row as Record<string, unknown>).is_primary_contact)
  )
  let movedMembers = 0
  let skippedExistingMembers = 0

  for (const raw of duplicateMembers ?? []) {
    const member = raw as Record<string, unknown>
    const personId = String(member.person_id ?? '')
    const memberId = String(member.id ?? '')
    if (!personId || !memberId) continue

    const alreadyInCanonical = canonicalPersonIds.has(personId)
    if (!alreadyInCanonical) {
      const shouldBePrimary = Boolean(member.is_primary_contact) && !canonicalHasPrimary
      const { error: insertError } = await admin.from('household_members').insert({
        parish_id: parishId,
        household_id: canonicalHouseholdId,
        person_id: personId,
        relationship: text(member.relationship, 80) || 'member',
        is_primary_contact: shouldBePrimary,
      })
      if (insertError) {
        return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
      }
      movedMembers += 1
      canonicalPersonIds.add(personId)
      if (shouldBePrimary) canonicalHasPrimary = true
    } else {
      skippedExistingMembers += 1
    }

    const { error: deleteMemberError } = await admin
      .from('household_members')
      .delete()
      .eq('id', memberId)
      .eq('parish_id', parishId)
    if (deleteMemberError) {
      return NextResponse.json({ ok: false, error: deleteMemberError.message }, { status: 500 })
    }
  }

  const { error: deleteHouseholdError } = await admin
    .from('households')
    .delete()
    .eq('id', duplicateHouseholdId)
    .eq('parish_id', parishId)

  if (deleteHouseholdError) {
    return NextResponse.json({ ok: false, error: deleteHouseholdError.message }, { status: 500 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'household.merge_completed',
    targetType: 'household',
    targetId: canonicalHouseholdId,
    metadata: {
      duplicate_household_id: duplicateHouseholdId,
      canonical_name_before: canonical.name,
      duplicate_name: duplicate.name,
      moved_members: movedMembers,
      skipped_existing_members: skippedExistingMembers,
    },
  })

  return NextResponse.json({
    ok: true,
    mergedIntoHouseholdId: canonicalHouseholdId,
    deletedHouseholdId: duplicateHouseholdId,
  })
}
