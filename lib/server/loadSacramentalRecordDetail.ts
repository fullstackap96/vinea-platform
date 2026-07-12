import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { dashboardDetailPartialDataMessage } from '@/lib/dashboardDetailClientMessages'
import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { SACRAMENTAL_RECORD_DETAIL_SELECT } from '@/lib/server/sacramentalRecordReadProjections'
export { SACRAMENTAL_RECORD_DETAIL_SELECT } from '@/lib/server/sacramentalRecordReadProjections'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PersonPickerOption } from '@/app/dashboard/records/_components/PersonPickerField'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

export const SACRAMENTAL_RECORD_ACTIVITY_SELECT =
  'id, action, actor_email, created_at' as const

export type SacramentalRecordActivityRow = {
  id: string
  action: string
  actor_email: string | null
  created_at: string
}

function parseSacramentalRecordActivityRow(
  raw: Record<string, unknown>
): SacramentalRecordActivityRow {
  const actorEmail = String(raw.actor_email ?? '').trim()
  return {
    id: String(raw.id ?? ''),
    action: String(raw.action ?? ''),
    actor_email: actorEmail || null,
    created_at: String(raw.created_at ?? ''),
  }
}

export type LinkedSacramentalRecordPerson = {
  id: string
  displayName: string
}

export type SacramentalRecordDetailResult = {
  record: SacramentalRecordRow | null
  linkedPerson: LinkedSacramentalRecordPerson | null
  events: SacramentalRecordActivityRow[]
  hasCertificateEvent: boolean
  certificateEventMetadataLoaded: boolean
  peopleOptions: PersonPickerOption[]
  errorMessage: string
  warningMessage: string
  activeParishName: string | null
}

function emptySacramentalRecordDetailResult(
  errorMessage: string,
  activeParishName: string | null = null
): SacramentalRecordDetailResult {
  return {
    record: null,
    linkedPerson: null,
    events: [],
    hasCertificateEvent: false,
    certificateEventMetadataLoaded: false,
    peopleOptions: [],
    errorMessage,
    warningMessage: '',
    activeParishName,
  }
}

function noteLinkedDataError(context: string, error: unknown): true {
  logServerError(`[sacramental-record-detail] ${context}`, error)
  return true
}

export async function loadSacramentalRecordDetail(
  recordId: unknown
): Promise<SacramentalRecordDetailResult> {
  const id = String(recordId ?? '').trim()
  if (!id) {
    return emptySacramentalRecordDetailResult('Record not found.')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return emptySacramentalRecordDetailResult('Unauthorized')
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return emptySacramentalRecordDetailResult(parishContext.error)
  }

  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  const { data: recordRow, error: recordError } = await supabase
    .from('sacramental_records')
    .select(SACRAMENTAL_RECORD_DETAIL_SELECT)
    .eq('id', id)
    .eq('parish_id', parishContext.activeParishId)
    .maybeSingle()

  if (recordError) {
    return emptySacramentalRecordDetailResult(
      userMessageForDashboardQueryError('sacramentalRecord', recordError),
      activeParishName
    )
  }
  if (!recordRow) {
    return emptySacramentalRecordDetailResult('Record not found.', activeParishName)
  }

  const record = parseSacramentalRecordRow(recordRow as Record<string, unknown>)
  let linkedDataHadError = false

  let linkedPerson: LinkedSacramentalRecordPerson | null = null
  if (record.person_id) {
    const { data: personRow, error: personError } = await supabase
      .from('people')
      .select('id, parish_id, first_name, middle_name, last_name')
      .eq('id', record.person_id)
      .eq('parish_id', parishContext.activeParishId)
      .maybeSingle()

    if (personError) {
      linkedDataHadError = noteLinkedDataError('linked person', personError)
    }

    if (personRow) {
      const person = parsePersonRow(personRow as Record<string, unknown>)
      linkedPerson = {
        id: person.id,
        displayName: formatPersonDisplayName(person),
      }
    }
  }

  const { data: eventRows, error: eventRowsError } = await supabase
    .from('sacramental_record_events')
    .select(SACRAMENTAL_RECORD_ACTIVITY_SELECT)
    .eq('sacramental_record_id', id)
    .eq('parish_id', parishContext.activeParishId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (eventRowsError) {
    linkedDataHadError = noteLinkedDataError('recent activity', eventRowsError)
  }

  const events = (eventRows ?? []).map((row) =>
    parseSacramentalRecordActivityRow(row as Record<string, unknown>)
  )

  const { data: peopleRows, error: peopleRowsError } = await supabase
    .from('people')
    .select('id, parish_id, first_name, middle_name, last_name')
    .eq('parish_id', parishContext.activeParishId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (peopleRowsError) {
    linkedDataHadError = noteLinkedDataError('people picker options', peopleRowsError)
  }

  const peopleOptions = (peopleRows ?? []).map((row) => {
    const person = parsePersonRow(row as Record<string, unknown>)
    return {
      id: person.id,
      label: formatPersonDisplayName(person),
    }
  })

  return {
    record,
    linkedPerson,
    events,
    hasCertificateEvent: events.some(
      (event) => String(event.action ?? '').trim().toLowerCase() === 'certificate_generated'
    ),
    certificateEventMetadataLoaded: !eventRowsError,
    peopleOptions,
    errorMessage: '',
    warningMessage: linkedDataHadError
      ? dashboardDetailPartialDataMessage('sacramentalRecord')
      : '',
    activeParishName,
  }
}
