import { NextResponse, type NextRequest } from 'next/server'
import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import {
  combinePersonNotes,
  findPersonDuplicateCandidates,
  type PersonDuplicateCandidate,
} from '@/lib/personDuplicateReview'
import { parsePersonRow } from '@/lib/people'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { PersonRow } from '@/lib/types/people'

export const runtime = 'nodejs'

const MERGE_FIELDS = [
  'first_name',
  'middle_name',
  'last_name',
  'email',
  'phone',
  'date_of_birth',
  'notes',
] as const

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

async function loadPeople(admin: ReturnType<typeof createSupabaseServiceRoleClient>, parishId: string) {
  const { data, error } = await admin
    .from('people')
    .select('*')
    .eq('parish_id', parishId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(5000)

  if (error) throw error
  return (data ?? []).map((row) => parsePersonRow(row as Record<string, unknown>))
}

async function primaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { parishId, error } = await fetchPrimaryParishId(admin)
  if (error) throw error
  return parishId
}

async function loadLinkCounts(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  personIds: string[]
) {
  const counts = new Map<string, { requests: number; records: number; households: number }>()
  for (const id of personIds) counts.set(id, { requests: 0, records: 0, households: 0 })

  if (personIds.length === 0) return counts

  const [requestRows, recordRows, householdRows] = await Promise.all([
    admin.from('requests').select('person_id').in('person_id', personIds),
    admin.from('sacramental_records').select('person_id').in('person_id', personIds),
    admin.from('household_members').select('person_id').in('person_id', personIds),
  ])

  for (const row of requestRows.data ?? []) {
    const id = String((row as Record<string, unknown>).person_id ?? '')
    const current = counts.get(id)
    if (current) current.requests += 1
  }
  for (const row of recordRows.data ?? []) {
    const id = String((row as Record<string, unknown>).person_id ?? '')
    const current = counts.get(id)
    if (current) current.records += 1
  }
  for (const row of householdRows.data ?? []) {
    const id = String((row as Record<string, unknown>).person_id ?? '')
    const current = counts.get(id)
    if (current) current.households += 1
  }

  return counts
}

function serializeCandidate(
  candidate: PersonDuplicateCandidate,
  counts: Map<string, { requests: number; records: number; households: number }>
) {
  return {
    ...candidate,
    people: candidate.people.map((person) => ({
      ...person,
      linkCounts: counts.get(person.id) ?? { requests: 0, records: 0, households: 0 },
    })),
  }
}

function selectedPayload(
  canonical: PersonRow,
  duplicate: PersonRow,
  selectedFields: Record<string, unknown>
) {
  const sourceFor = (field: MergeField) =>
    selectedFields[field] === duplicate.id ? duplicate : canonical

  const first_name = text(sourceFor('first_name').first_name, 120)
  const last_name = text(sourceFor('last_name').last_name, 120)
  if (!first_name || !last_name) {
    return { ok: false as const, error: 'First and last name are required.' }
  }

  return {
    ok: true as const,
    payload: {
      first_name,
      middle_name: nullableText(sourceFor('middle_name').middle_name, 120),
      last_name,
      email: nullableText(sourceFor('email').email, 240),
      phone: nullableText(sourceFor('phone').phone, 80),
      date_of_birth: nullableText(sourceFor('date_of_birth').date_of_birth, 20),
      notes:
        selectedFields.notes === 'combine'
          ? combinePersonNotes(canonical.notes, duplicate.notes)
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

  const people = await loadPeople(admin, parishId)
  const candidates = findPersonDuplicateCandidates(people).slice(0, 50)
  const personIds = Array.from(new Set(candidates.flatMap((candidate) => candidate.people.map((p) => p.id))))
  const counts = await loadLinkCounts(admin, personIds)

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

  const canonicalPersonId = text(body.canonicalPersonId, 80)
  const duplicatePersonId = text(body.duplicatePersonId, 80)
  if (!canonicalPersonId || !duplicatePersonId || canonicalPersonId === duplicatePersonId) {
    return NextResponse.json({ ok: false, error: 'Choose two different people to merge.' }, { status: 400 })
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

  const { data: peopleRows, error: peopleError } = await admin
    .from('people')
    .select('*')
    .eq('parish_id', parishId)
    .in('id', [canonicalPersonId, duplicatePersonId])

  if (peopleError) {
    return NextResponse.json({ ok: false, error: peopleError.message }, { status: 500 })
  }

  const people = (peopleRows ?? []).map((row) => parsePersonRow(row as Record<string, unknown>))
  const canonical = people.find((person) => person.id === canonicalPersonId)
  const duplicate = people.find((person) => person.id === duplicatePersonId)
  if (!canonical || !duplicate) {
    return NextResponse.json({ ok: false, error: 'One of these people was not found.' }, { status: 404 })
  }

  const normalized = selectedPayload(canonical, duplicate, selectedFields)
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  const transferParishionerId = !canonical.parishioner_id && duplicate.parishioner_id
  if (transferParishionerId) {
    const { error } = await admin
      .from('people')
      .update({ parishioner_id: null })
      .eq('id', duplicatePersonId)
      .eq('parish_id', parishId)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const { error: updateCanonicalError } = await admin
    .from('people')
    .update({
      ...normalized.payload,
      parishioner_id: transferParishionerId ? duplicate.parishioner_id : canonical.parishioner_id,
    })
    .eq('id', canonicalPersonId)
    .eq('parish_id', parishId)

  if (updateCanonicalError) {
    return NextResponse.json({ ok: false, error: updateCanonicalError.message }, { status: 500 })
  }

  const [requestsUpdate, recordsUpdate] = await Promise.all([
    admin
      .from('requests')
      .update({ person_id: canonicalPersonId })
      .eq('parish_id', parishId)
      .eq('person_id', duplicatePersonId),
    admin
      .from('sacramental_records')
      .update({ person_id: canonicalPersonId })
      .eq('parish_id', parishId)
      .eq('person_id', duplicatePersonId),
  ])

  if (requestsUpdate.error) {
    return NextResponse.json({ ok: false, error: requestsUpdate.error.message }, { status: 500 })
  }
  if (recordsUpdate.error) {
    return NextResponse.json({ ok: false, error: recordsUpdate.error.message }, { status: 500 })
  }

  const { data: duplicateMemberships, error: membershipsError } = await admin
    .from('household_members')
    .select('id, household_id, relationship, is_primary_contact')
    .eq('parish_id', parishId)
    .eq('person_id', duplicatePersonId)

  if (membershipsError) {
    return NextResponse.json({ ok: false, error: membershipsError.message }, { status: 500 })
  }

  let movedHouseholds = 0
  for (const raw of duplicateMemberships ?? []) {
    const membership = raw as Record<string, unknown>
    const membershipId = String(membership.id ?? '')
    const householdId = String(membership.household_id ?? '')
    if (!membershipId || !householdId) continue

    const { data: existingCanonical } = await admin
      .from('household_members')
      .select('id')
      .eq('household_id', householdId)
      .eq('person_id', canonicalPersonId)
      .maybeSingle()

    const { data: existingPrimaryRows } = await admin
      .from('household_members')
      .select('id')
      .eq('household_id', householdId)
      .eq('is_primary_contact', true)

    const primaryExistsBesidesDuplicate = (existingPrimaryRows ?? []).some(
      (row) => String((row as Record<string, unknown>).id ?? '') !== membershipId
    )
    const shouldBePrimary = Boolean(membership.is_primary_contact) && !primaryExistsBesidesDuplicate

    const { error: deleteMembershipError } = await admin
      .from('household_members')
      .delete()
      .eq('id', membershipId)
      .eq('parish_id', parishId)
    if (deleteMembershipError) {
      return NextResponse.json({ ok: false, error: deleteMembershipError.message }, { status: 500 })
    }

    if (!existingCanonical?.id) {
      const { error: insertMembershipError } = await admin.from('household_members').insert({
        parish_id: parishId,
        household_id: householdId,
        person_id: canonicalPersonId,
        relationship: text(membership.relationship, 80) || 'member',
        is_primary_contact: shouldBePrimary,
      })
      if (insertMembershipError) {
        return NextResponse.json({ ok: false, error: insertMembershipError.message }, { status: 500 })
      }
      movedHouseholds += 1
    }
  }

  const { error: deletePersonError } = await admin
    .from('people')
    .delete()
    .eq('id', duplicatePersonId)
    .eq('parish_id', parishId)

  if (deletePersonError) {
    return NextResponse.json({ ok: false, error: deletePersonError.message }, { status: 500 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'person.merge_completed',
    targetType: 'person',
    targetId: canonicalPersonId,
    metadata: {
      duplicate_person_id: duplicatePersonId,
      canonical_name_before: formatName(canonical),
      duplicate_name: formatName(duplicate),
      moved_households: movedHouseholds,
      transferred_parishioner_id: Boolean(transferParishionerId),
    },
  })

  return NextResponse.json({
    ok: true,
    mergedIntoPersonId: canonicalPersonId,
    deletedPersonId: duplicatePersonId,
  })
}

function formatName(person: PersonRow) {
  return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
}
