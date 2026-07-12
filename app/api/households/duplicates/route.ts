import { NextResponse, type NextRequest } from 'next/server'
import {
  combineHouseholdNotes,
  findHouseholdDuplicateCandidates,
  type HouseholdDuplicateCandidate,
} from '@/lib/householdDuplicateReview'
import { parseHouseholdRow } from '@/lib/households'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { HouseholdRow } from '@/lib/types/households'

export const runtime = 'nodejs'

const MERGE_FIELDS = ['name', 'address', 'city', 'state', 'postal_code', 'notes'] as const
const HOUSEHOLD_DUPLICATE_SELECT =
  'id, parish_id, name, address, city, state, postal_code, notes, created_at, updated_at' as const
type MergeField = (typeof MERGE_FIELDS)[number]
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

function householdDuplicateErrorResponse(
  action: string,
  error: unknown,
  message: string,
  status = 500
) {
  logServerError(`[household-duplicates] ${action} failed`, error)
  return NextResponse.json({ ok: false, error: message }, { status })
}

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

function activeParishCookie(request: NextRequest): string | null {
  const nextCookie = (request as { cookies?: { get?: (name: string) => { value?: string } | undefined } })
    .cookies
    ?.get?.(ACTIVE_STAFF_PARISH_COOKIE)?.value
  if (nextCookie) return nextCookie

  const rawCookie = request.headers.get('cookie') ?? ''
  const match = rawCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACTIVE_STAFF_PARISH_COOKIE}=`))
  return match ? decodeURIComponent(match.slice(ACTIVE_STAFF_PARISH_COOKIE.length + 1)) : null
}

async function duplicateReadParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const parishContext = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })
  if (!parishContext.ok) {
    return { ok: false as const, error: parishContext.error, requestedParishId }
  }
  if (requestedParishId && parishContext.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      error: 'You are not authorized to review duplicate households for this parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && parishContext.source !== 'membership') {
    return {
      ok: false as const,
      error: 'You are not authorized to review duplicate households for this parish.',
      requestedParishId,
    }
  }

  return { ok: true as const, parishId: parishContext.activeParishId }
}

async function duplicateWriteParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const parishContext = await resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason:
      'Household duplicate merge used legacy parish context because active parish selection was not available.',
  })

  if (!parishContext.ok) {
    return { ok: false as const, error: parishContext.error, requestedParishId }
  }

  return { ok: true as const, parishId: parishContext.parishId }
}

async function loadHouseholds(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  parishId: string
) {
  const { data, error } = await admin
    .from('households')
    .select(HOUSEHOLD_DUPLICATE_SELECT)
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
  const parishScope = await duplicateReadParishId(staff.supabase, activeParishCookie(request))
  if (!parishScope.ok) {
    const status = parishScope.error === 'Parish is not configured.' ? 404 : 403
    return NextResponse.json({ ok: false, error: parishScope.error }, { status })
  }

  const parishId = parishScope.parishId
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  try {
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
  } catch (error: unknown) {
    return householdDuplicateErrorResponse(
      'load',
      error,
      'Could not load household review.'
    )
  }
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, 32 * 1024)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Merge request is too large.'
            : 'Invalid merge request.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
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
  const parishScope = await duplicateWriteParishId(staff.supabase, activeParishCookie(request))
  if (!parishScope.ok) {
    const status = parishScope.error === 'Parish is not configured.' ? 404 : 403
    return NextResponse.json({ ok: false, error: parishScope.error }, { status })
  }

  const parishId = parishScope.parishId
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data: householdRows, error: householdsError } = await admin
    .from('households')
    .select(HOUSEHOLD_DUPLICATE_SELECT)
    .eq('parish_id', parishId)
    .in('id', [canonicalHouseholdId, duplicateHouseholdId])

  if (householdsError) {
    return householdDuplicateErrorResponse(
      'merge_households_lookup',
      householdsError,
      'Could not merge these households.'
    )
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

  const { data: updatedCanonical, error: updateCanonicalError } = await admin
    .from('households')
    .update(normalized.payload)
    .eq('id', canonicalHouseholdId)
    .eq('parish_id', parishId)
    .select('id')
    .maybeSingle()
  if (updateCanonicalError || !updatedCanonical?.id) {
    return householdDuplicateErrorResponse(
      'merge_update_canonical_household',
      updateCanonicalError ?? new Error('Canonical household was not updated.'),
      'Could not merge these households.'
    )
  }

  const { data: duplicateMembers, error: duplicateMembersError } = await admin
    .from('household_members')
    .select('id, person_id, relationship, is_primary_contact')
    .eq('parish_id', parishId)
    .eq('household_id', duplicateHouseholdId)

  if (duplicateMembersError) {
    return householdDuplicateErrorResponse(
      'merge_load_duplicate_members',
      duplicateMembersError,
      'Could not merge these households.'
    )
  }

  const { data: canonicalMembers, error: canonicalMembersError } = await admin
    .from('household_members')
    .select('id, person_id, is_primary_contact')
    .eq('parish_id', parishId)
    .eq('household_id', canonicalHouseholdId)

  if (canonicalMembersError) {
    return householdDuplicateErrorResponse(
      'merge_load_canonical_members',
      canonicalMembersError,
      'Could not merge these households.'
    )
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
      const { data: insertedMember, error: insertError } = await admin
        .from('household_members')
        .insert({
          parish_id: parishId,
          household_id: canonicalHouseholdId,
          person_id: personId,
          relationship: text(member.relationship, 80) || 'member',
          is_primary_contact: shouldBePrimary,
        })
        .select('id')
        .maybeSingle()
      if (insertError || !insertedMember?.id) {
        return householdDuplicateErrorResponse(
          'merge_insert_canonical_member',
          insertError ?? new Error('Canonical household member was not created.'),
          'Could not merge these households.'
        )
      }
      movedMembers += 1
      canonicalPersonIds.add(personId)
      if (shouldBePrimary) canonicalHasPrimary = true
    } else {
      skippedExistingMembers += 1
    }

    const { data: deletedMember, error: deleteMemberError } = await admin
      .from('household_members')
      .delete()
      .eq('id', memberId)
      .eq('parish_id', parishId)
      .select('id')
      .maybeSingle()
    if (deleteMemberError || !deletedMember?.id) {
      return householdDuplicateErrorResponse(
        'merge_delete_duplicate_member',
        deleteMemberError ?? new Error('Duplicate household member was not deleted.'),
        'Could not merge these households.'
      )
    }
  }

  const { data: deletedHousehold, error: deleteHouseholdError } = await admin
    .from('households')
    .delete()
    .eq('id', duplicateHouseholdId)
    .eq('parish_id', parishId)
    .select('id')
    .maybeSingle()

  if (deleteHouseholdError || !deletedHousehold?.id) {
    return householdDuplicateErrorResponse(
      'merge_delete_duplicate_household',
      deleteHouseholdError ?? new Error('Duplicate household was not deleted.'),
      'Could not merge these households.'
    )
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'household.merge_completed',
    targetType: 'household',
    targetId: canonicalHouseholdId,
    metadata: {
      duplicate_household_id: duplicateHouseholdId,
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

export const householdDuplicatesRouteTestInternals = {
  activeParishCookie,
  duplicateReadParishId,
  duplicateWriteParishId,
}
