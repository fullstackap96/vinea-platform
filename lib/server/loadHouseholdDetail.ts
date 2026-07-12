import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { dashboardDetailPartialDataMessage } from '@/lib/dashboardDetailClientMessages'
import {
  type CareTimelineCommunication,
  type CareTimelineRequest,
} from '@/lib/careTimeline'
import { formatRequestType } from '@/lib/formatRequestType'
import {
  parseHouseholdMemberWithPerson,
  parseHouseholdRow,
} from '@/lib/households'
import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import {
  SACRAMENTAL_RECORD_SUMMARY_SELECT,
  parseSacramentalRecordSummary,
  type SacramentalRecordSummary,
} from '@/lib/server/sacramentalRecordReadProjections'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { HouseholdMemberWithPerson, HouseholdRow } from '@/lib/types/households'

export const HOUSEHOLD_DETAIL_SELECT =
  'id, parish_id, name, address, city, state, postal_code, notes, created_at, updated_at' as const

export type HouseholdPeopleOption = {
  id: string
  label: string
}

export type HouseholdDetailResult = {
  household: HouseholdRow | null
  members: HouseholdMemberWithPerson[]
  requests: CareTimelineRequest[]
  records: SacramentalRecordSummary[]
  communications: CareTimelineCommunication[]
  peopleOptions: HouseholdPeopleOption[]
  errorMessage: string
  warningMessage: string
  activeParishName: string | null
}

function emptyHouseholdDetailResult(
  errorMessage: string,
  activeParishName: string | null = null
): HouseholdDetailResult {
  return {
    household: null,
    members: [],
    requests: [],
    records: [],
    communications: [],
    peopleOptions: [],
    errorMessage,
    warningMessage: '',
    activeParishName,
  }
}

function noteLinkedDataError(context: string, error: unknown): true {
  logServerError(`[household-detail] ${context}`, error)
  return true
}

function parseTimelineRequest(row: Record<string, unknown>): CareTimelineRequest {
  return {
    id: String(row.id),
    request_type: String(row.request_type ?? ''),
    status: String(row.status ?? ''),
    child_name: row.child_name != null ? String(row.child_name) : null,
    created_at: String(row.created_at ?? ''),
    last_contacted_at: row.last_contacted_at != null ? String(row.last_contacted_at) : null,
    next_follow_up_date:
      row.next_follow_up_date != null ? String(row.next_follow_up_date) : null,
    assigned_staff_name:
      row.assigned_staff_name != null ? String(row.assigned_staff_name) : null,
    assigned_priest_name:
      row.assigned_priest_name != null ? String(row.assigned_priest_name) : null,
    assigned_deacon_name:
      row.assigned_deacon_name != null ? String(row.assigned_deacon_name) : null,
  }
}

function membershipPersonParishionerIds(rows: readonly unknown[]): string[] {
  const ids = new Set<string>()
  for (const raw of rows) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) continue
    const row = raw as Record<string, unknown>
    const peopleRaw = row.people
    if (peopleRaw == null || typeof peopleRaw !== 'object' || Array.isArray(peopleRaw)) continue
    const parishionerId = String(
      (peopleRaw as Record<string, unknown>).parishioner_id ?? ''
    ).trim()
    if (parishionerId) ids.add(parishionerId)
  }
  return Array.from(ids)
}

function parseMemberWithPerson(row: Record<string, unknown>): HouseholdMemberWithPerson {
  const peopleRaw = row.people
  const personObj =
    peopleRaw != null && typeof peopleRaw === 'object' && !Array.isArray(peopleRaw)
      ? (peopleRaw as Record<string, unknown>)
      : {}

  return parseHouseholdMemberWithPerson({
    ...row,
    person: personObj,
  })
}

export async function loadHouseholdDetail(
  householdId: unknown
): Promise<HouseholdDetailResult> {
  const id = String(householdId ?? '').trim()
  if (!id) {
    return emptyHouseholdDetailResult('Household not found.')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return emptyHouseholdDetailResult('Unauthorized')
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return emptyHouseholdDetailResult(parishContext.error)
  }

  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  const { data: householdRow, error: householdError } = await supabase
    .from('households')
    .select(HOUSEHOLD_DETAIL_SELECT)
    .eq('id', id)
    .eq('parish_id', parishContext.activeParishId)
    .maybeSingle()

  if (householdError) {
    return emptyHouseholdDetailResult(
      userMessageForDashboardQueryError('household', householdError),
      activeParishName
    )
  }
  if (!householdRow) {
    return emptyHouseholdDetailResult('Household not found.', activeParishName)
  }

  const household = parseHouseholdRow(householdRow as Record<string, unknown>)
  let linkedDataHadError = false

  const { data: memberRows, error: memberRowsError } = await supabase
    .from('household_members')
    .select(
      'id, parish_id, household_id, person_id, relationship, is_primary_contact, created_at, people!inner(id, parish_id, parishioner_id, first_name, middle_name, last_name, email, phone)'
    )
    .eq('household_id', id)
    .eq('parish_id', parishContext.activeParishId)
    .eq('people.parish_id', parishContext.activeParishId)
    .order('is_primary_contact', { ascending: false })

  if (memberRowsError) {
    linkedDataHadError = noteLinkedDataError('members', memberRowsError)
  }

  const members = (memberRows ?? []).map((row) =>
    parseMemberWithPerson(row as Record<string, unknown>)
  )
  const personIds = members.map((member) => member.person_id).filter(Boolean)
  const parishionerIds = membershipPersonParishionerIds(memberRows ?? [])

  const { data: peopleRows, error: peopleRowsError } = await supabase
    .from('people')
    .select('id, parish_id, first_name, middle_name, last_name, email, phone')
    .eq('parish_id', parishContext.activeParishId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (peopleRowsError) {
    linkedDataHadError = noteLinkedDataError('people options', peopleRowsError)
  }

  const peopleOptions = (peopleRows ?? []).map((row) => {
    const person = parsePersonRow(row as Record<string, unknown>)
    return {
      id: person.id,
      label: formatPersonDisplayName(person),
    }
  })

  const requestById = new Map<string, CareTimelineRequest>()
  const requestSelect =
    'id, request_type, status, child_name, created_at, last_contacted_at, next_follow_up_date, assigned_staff_name, assigned_priest_name, assigned_deacon_name, person_id, parishioner_id'

  if (personIds.length > 0) {
    const { data: directRequestRows, error: directRequestRowsError } = await supabase
      .from('requests')
      .select(requestSelect)
      .eq('parish_id', parishContext.activeParishId)
      .in('person_id', personIds)
      .order('created_at', { ascending: false })

    if (directRequestRowsError) {
      linkedDataHadError = noteLinkedDataError('direct requests', directRequestRowsError)
    }

    for (const row of directRequestRows ?? []) {
      const parsed = parseTimelineRequest(row as Record<string, unknown>)
      requestById.set(parsed.id, parsed)
    }
  }

  if (parishionerIds.length > 0) {
    const { data: contactRequestRows, error: contactRequestRowsError } = await supabase
      .from('requests')
      .select(requestSelect)
      .eq('parish_id', parishContext.activeParishId)
      .in('parishioner_id', parishionerIds)
      .order('created_at', { ascending: false })

    if (contactRequestRowsError) {
      linkedDataHadError = noteLinkedDataError('contact requests', contactRequestRowsError)
    }

    for (const row of contactRequestRows ?? []) {
      const parsed = parseTimelineRequest(row as Record<string, unknown>)
      requestById.set(parsed.id, parsed)
    }
  }

  const requests = Array.from(requestById.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  let records: SacramentalRecordSummary[] = []
  if (personIds.length > 0) {
    const { data: recordRows, error: recordRowsError } = await supabase
      .from('sacramental_records')
      .select(SACRAMENTAL_RECORD_SUMMARY_SELECT)
      .eq('parish_id', parishContext.activeParishId)
      .in('person_id', personIds)
      .order('sacrament_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (recordRowsError) {
      linkedDataHadError = noteLinkedDataError('sacramental records', recordRowsError)
    }

    records = (recordRows ?? []).map((row) =>
      parseSacramentalRecordSummary(row as Record<string, unknown>)
    )
  }

  const requestIds = requests.map((request) => request.id)
  const communications: CareTimelineCommunication[] = []

  if (requestIds.length > 0) {
    const { data: commRows, error: commRowsError } = await supabase
      .from('request_communications')
      .select('id, request_id, contacted_at, method, notes')
      .in('request_id', requestIds)
      .order('contacted_at', { ascending: false })

    if (commRowsError) {
      linkedDataHadError = noteLinkedDataError('communication history', commRowsError)
    }

    const labelByRequestId = new Map(
      requests.map((request) => [request.id, formatRequestType(request.request_type)])
    )

    for (const row of commRows ?? []) {
      const raw = row as Record<string, unknown>
      const requestId = String(raw.request_id ?? '')
      communications.push({
        id: String(raw.id),
        requestId,
        requestLabel: labelByRequestId.get(requestId) ?? 'Request',
        contacted_at: String(raw.contacted_at ?? ''),
        method: String(raw.method ?? ''),
        notes: raw.notes != null ? String(raw.notes) : null,
      })
    }
  }

  return {
    household,
    members,
    requests,
    records,
    communications,
    peopleOptions,
    errorMessage: '',
    warningMessage: linkedDataHadError ? dashboardDetailPartialDataMessage('household') : '',
    activeParishName,
  }
}
