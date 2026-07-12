import { NextResponse, type NextRequest } from 'next/server'

import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { matchPeopleForRequest } from '@/lib/relationshipIntelligence/matchPeopleForRequest'
import {
  buildHouseholdNamesByPersonId,
  suggestHouseholdsForPerson,
  type HouseholdMembershipRow,
} from '@/lib/relationshipIntelligence/suggestHouseholdsForPeople'
import type {
  ParishionerContact,
  PersonCandidate,
  PersonMatchSuggestion,
} from '@/lib/relationshipIntelligence/types'

type RouteParams = { params: Promise<{ id: string }> }

type LinkedPerson = {
  id: string
  displayName: string
}

const MAX_SUGGESTIONS = 5

function linkedPersonFromRow(row: Record<string, unknown> | null | undefined): LinkedPerson | null {
  if (!row?.id) return null
  const parsed = parsePersonRow(row)
  return {
    id: parsed.id,
    displayName: formatPersonDisplayName(parsed),
  }
}

function householdRowsFromRaw(rows: readonly Record<string, unknown>[]): HouseholdMembershipRow[] {
  const householdRows: HouseholdMembershipRow[] = []

  for (const row of rows) {
    const householdsRaw = row.households
    const householdName =
      householdsRaw != null &&
      typeof householdsRaw === 'object' &&
      !Array.isArray(householdsRaw)
        ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
        : ''

    householdRows.push({
      person_id: String(row.person_id ?? ''),
      household_id: String(row.household_id ?? ''),
      household_name: householdName,
    })
  }

  return householdRows
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select('id, person_id, parishioner_id')
      .eq('id', access.requestId)
      .maybeSingle()

    if (requestError) throw requestError
    if (!requestRow?.id) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const personId = requestRow.person_id != null ? String(requestRow.person_id).trim() : ''
    const parishionerId =
      requestRow.parishioner_id != null ? String(requestRow.parishioner_id).trim() : ''

    const { data: parishionerRow, error: parishionerError } = parishionerId
      ? await admin
          .from('parishioners')
          .select('id, full_name, email, phone')
          .eq('id', parishionerId)
          .eq('parish_id', access.parishId)
          .maybeSingle()
      : { data: null, error: null }

    if (parishionerError) throw parishionerError

    const linkedPersonResult = personId
      ? await admin
          .from('people')
          .select('id, parish_id, parishioner_id, first_name, middle_name, last_name, email, phone')
          .eq('id', personId)
          .eq('parish_id', access.parishId)
          .maybeSingle()
      : { data: null, error: null }

    if (linkedPersonResult.error) throw linkedPersonResult.error

    const existingForParishionerResult =
      !personId && parishionerId
        ? await admin
            .from('people')
            .select('id, parish_id, parishioner_id, first_name, middle_name, last_name, email, phone')
            .eq('parishioner_id', parishionerId)
            .eq('parish_id', access.parishId)
            .maybeSingle()
        : { data: null, error: null }

    if (existingForParishionerResult.error) throw existingForParishionerResult.error

    const { data: peopleRows, error: peopleError } = await admin
      .from('people')
      .select('id, parish_id, parishioner_id, first_name, middle_name, last_name, email, phone')
      .eq('parish_id', access.parishId)

    if (peopleError) throw peopleError

    const { data: memberRows, error: memberError } = await admin
      .from('household_members')
      .select('person_id, household_id, households(name)')
      .eq('parish_id', access.parishId)

    if (memberError) throw memberError

    const people: PersonCandidate[] = (peopleRows ?? []).map((row) => {
      const parsed = parsePersonRow(row as Record<string, unknown>)
      return {
        id: parsed.id,
        parishioner_id: parsed.parishioner_id,
        first_name: parsed.first_name,
        middle_name: parsed.middle_name,
        last_name: parsed.last_name,
        email: parsed.email,
        phone: parsed.phone,
      }
    })

    const householdRows = householdRowsFromRaw((memberRows ?? []) as Record<string, unknown>[])
    const householdNamesByPersonId = buildHouseholdNamesByPersonId(householdRows)
    const parishionerContact: ParishionerContact | null =
      parishionerRow?.id != null
        ? {
            id: String(parishionerRow.id),
            full_name: String(parishionerRow.full_name ?? '').trim(),
            email: String(parishionerRow.email ?? '').trim() || null,
            phone: String(parishionerRow.phone ?? '').trim() || null,
          }
        : null

    const personMatches: PersonMatchSuggestion[] = personId
      ? []
      : matchPeopleForRequest({
          requestId: access.requestId,
          requestPersonId: null,
          parishioner: parishionerContact,
          people,
          householdNamesByPersonId,
        }).slice(0, MAX_SUGGESTIONS)

    const linkedHouseholds = personId
      ? suggestHouseholdsForPerson(personId, householdRows).map((household) => ({
          householdId: household.householdId,
          householdName: household.householdName,
        }))
      : []

    return NextResponse.json({
      ok: true,
      requestId: access.requestId,
      parishId: access.parishId,
      linkedPerson: linkedPersonFromRow(linkedPersonResult.data as Record<string, unknown> | null),
      existingForParishioner: linkedPersonFromRow(
        existingForParishionerResult.data as Record<string, unknown> | null
      ),
      personMatches,
      linkedHouseholds,
    })
  } catch (error: unknown) {
    logServerError('[request-relationship-suggestions] load failed', error, {
      route: '/api/requests/[id]/relationship-suggestions',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load request relationship suggestions.' },
      { status: 500 }
    )
  }
}
