import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { dashboardDetailPartialDataMessage } from '@/lib/dashboardDetailClientMessages'
import { parsePersonRow } from '@/lib/people'
import { formatRequestType } from '@/lib/formatRequestType'
import { formatRequestStatus } from '@/lib/requestStatus'
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
import type { PersonRow } from '@/lib/types/people'

export const PERSON_DETAIL_SELECT =
  'id, parish_id, parishioner_id, first_name, middle_name, last_name, email, phone, date_of_birth, notes, created_at, updated_at' as const

export type PersonHouseholdMembership = {
  memberId: string
  householdId: string
  householdName: string
  relationship: string
  isPrimaryContact: boolean
}

export type LinkedPersonRequest = {
  id: string
  request_type: string
  status: string
  child_name: string | null
  created_at: string
  last_contacted_at: string | null
  next_follow_up_date: string | null
  assigned_staff_name: string | null
  assigned_priest_name: string | null
  assigned_deacon_name: string | null
  linkSource: 'person_id' | 'parishioner_id'
}

export type PersonCommunication = {
  id: string
  requestId: string
  requestLabel: string
  contacted_at: string
  method: string
  notes: string | null
}

export type PersonDetailResult = {
  person: PersonRow | null
  households: PersonHouseholdMembership[]
  records: SacramentalRecordSummary[]
  requests: LinkedPersonRequest[]
  communications: PersonCommunication[]
  errorMessage: string
  warningMessage: string
  activeParishName: string | null
}

function emptyPersonDetailResult(
  errorMessage: string,
  activeParishName: string | null = null
): PersonDetailResult {
  return {
    person: null,
    households: [],
    records: [],
    requests: [],
    communications: [],
    errorMessage,
    warningMessage: '',
    activeParishName,
  }
}

function noteLinkedDataError(context: string, error: unknown): true {
  logServerError(`[people-detail] ${context}`, error)
  return true
}

export async function loadPersonDetail(personId: unknown): Promise<PersonDetailResult> {
  const id = String(personId ?? '').trim()
  if (!id) {
    return emptyPersonDetailResult('Person not found.')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return emptyPersonDetailResult('Unauthorized')
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return emptyPersonDetailResult(parishContext.error)
  }

  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  const { data: personRow, error: personError } = await supabase
    .from('people')
    .select(PERSON_DETAIL_SELECT)
    .eq('id', id)
    .eq('parish_id', parishContext.activeParishId)
    .maybeSingle()

  if (personError) {
    return emptyPersonDetailResult(userMessageForDashboardQueryError('person', personError), activeParishName)
  }
  if (!personRow) {
    return emptyPersonDetailResult('Person not found.', activeParishName)
  }

  const person = parsePersonRow(personRow as Record<string, unknown>)
  let linkedDataHadError = false

  const { data: memberRows, error: memberRowsError } = await supabase
    .from('household_members')
    .select('id, household_id, relationship, is_primary_contact, households!inner(name, parish_id)')
    .eq('person_id', id)
    .eq('households.parish_id', parishContext.activeParishId)
    .order('is_primary_contact', { ascending: false })

  if (memberRowsError) {
    linkedDataHadError = noteLinkedDataError('household memberships', memberRowsError)
  }

  const households: PersonHouseholdMembership[] = []
  for (const raw of memberRows ?? []) {
    const row = raw as Record<string, unknown>
    const householdsRaw = row.households
    const householdName =
      householdsRaw != null &&
      typeof householdsRaw === 'object' &&
      !Array.isArray(householdsRaw)
        ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
        : ''
    households.push({
      memberId: String(row.id),
      householdId: String(row.household_id),
      householdName: householdName || 'Household',
      relationship: String(row.relationship ?? '').trim(),
      isPrimaryContact: Boolean(row.is_primary_contact),
    })
  }

  const { data: recordRows, error: recordRowsError } = await supabase
    .from('sacramental_records')
    .select(SACRAMENTAL_RECORD_SUMMARY_SELECT)
    .eq('person_id', id)
    .eq('parish_id', parishContext.activeParishId)
    .order('sacrament_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (recordRowsError) {
    linkedDataHadError = noteLinkedDataError('sacramental records', recordRowsError)
  }

  const records = (recordRows ?? []).map((row) =>
    parseSacramentalRecordSummary(row as Record<string, unknown>)
  )

  let requestsQuery = supabase
    .from('requests')
    .select(
      'id, request_type, status, child_name, created_at, last_contacted_at, next_follow_up_date, assigned_staff_name, assigned_priest_name, assigned_deacon_name, person_id, parishioner_id'
    )
    .eq('parish_id', parishContext.activeParishId)
    .order('created_at', { ascending: false })

  if (person.parishioner_id) {
    requestsQuery = requestsQuery.or(`person_id.eq.${id},parishioner_id.eq.${person.parishioner_id}`)
  } else {
    requestsQuery = requestsQuery.eq('person_id', id)
  }

  const { data: requestRows, error: requestRowsError } = await requestsQuery
  if (requestRowsError) {
    linkedDataHadError = noteLinkedDataError('linked requests', requestRowsError)
  }

  const requests: LinkedPersonRequest[] = (requestRows ?? []).map((row) => {
    const r = row as Record<string, unknown>
    const rowPersonId = r.person_id != null ? String(r.person_id).trim() : ''
    const linkSource: LinkedPersonRequest['linkSource'] =
      rowPersonId === id ? 'person_id' : 'parishioner_id'
    return {
      id: String(r.id),
      request_type: String(r.request_type ?? ''),
      status: String(r.status ?? ''),
      child_name: r.child_name != null ? String(r.child_name) : null,
      created_at: String(r.created_at ?? ''),
      last_contacted_at: r.last_contacted_at != null ? String(r.last_contacted_at) : null,
      next_follow_up_date: r.next_follow_up_date != null ? String(r.next_follow_up_date) : null,
      assigned_staff_name: r.assigned_staff_name != null ? String(r.assigned_staff_name) : null,
      assigned_priest_name: r.assigned_priest_name != null ? String(r.assigned_priest_name) : null,
      assigned_deacon_name: r.assigned_deacon_name != null ? String(r.assigned_deacon_name) : null,
      linkSource,
    }
  })

  const requestIds = requests.map((request) => request.id)
  const communications: PersonCommunication[] = []

  if (requestIds.length > 0) {
    const { data: commRows, error: commRowsError } = await supabase
      .from('request_communications')
      .select('id, request_id, contacted_at, method, notes')
      .in('request_id', requestIds)
      .order('contacted_at', { ascending: false })

    if (commRowsError) {
      linkedDataHadError = noteLinkedDataError('communication history', commRowsError)
    }

    const requestLabelById = new Map(
      requests.map((request) => [
        request.id,
        `${formatRequestType(request.request_type)} - ${formatRequestStatus(request.status)}`,
      ])
    )

    for (const raw of commRows ?? []) {
      const row = raw as Record<string, unknown>
      const requestId = String(row.request_id ?? '')
      communications.push({
        id: String(row.id),
        requestId,
        requestLabel: requestLabelById.get(requestId) ?? 'Request',
        contacted_at: String(row.contacted_at ?? ''),
        method: String(row.method ?? ''),
        notes: row.notes != null ? String(row.notes) : null,
      })
    }
  }

  return {
    person,
    households,
    records,
    requests,
    communications,
    errorMessage: '',
    warningMessage: linkedDataHadError ? dashboardDetailPartialDataMessage('person') : '',
    activeParishName,
  }
}
