import 'server-only'

import { cookies } from 'next/headers'

import { isSacramentalRecordType } from '@/lib/sacramentalRecordConstants'
import {
  EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
  buildSacramentalRecordsContinuitySummary,
  filterSacramentalRecordsByContinuity,
  normalizeSacramentalRecordsContinuityFilter,
  type SacramentalRecordsContinuityFilter,
  type SacramentalRecordsContinuitySummary,
} from '@/lib/sacramentalRecordsContinuitySummary'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { SacramentalRecordRow, SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export type SacramentalRecordsListResult = {
  records: SacramentalRecordListRow[]
  errorMessage: string
  searchQuery: string
  typeFilter: '' | SacramentalRecordType
  continuityFilter: SacramentalRecordsContinuityFilter
  continuitySummary: SacramentalRecordsContinuitySummary
  activeParishName: string | null
}

export type SacramentalRecordListRow = Pick<
  SacramentalRecordRow,
  | 'id'
  | 'request_id'
  | 'record_type'
  | 'person_name'
  | 'sacrament_date'
  | 'minister'
  | 'book'
  | 'page'
  | 'line'
>

export const SACRAMENTAL_RECORD_LIST_SELECT =
  'id, request_id, record_type, person_name, sacrament_date, minister, book, page, line' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function parseSacramentalRecordListRow(raw: Record<string, unknown>): SacramentalRecordListRow {
  return {
    id: String(raw.id ?? ''),
    request_id: raw.request_id != null ? String(raw.request_id) : null,
    record_type: String(raw.record_type ?? '') as SacramentalRecordType,
    person_name: String(raw.person_name ?? '').trim(),
    sacrament_date:
      raw.sacrament_date != null ? String(raw.sacrament_date).slice(0, 10) : null,
    minister: nullableString(raw.minister),
    book: nullableString(raw.book),
    page: nullableString(raw.page),
    line: nullableString(raw.line),
  }
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
  type?: string | string[] | undefined
  continuity?: string | string[] | undefined
}): {
  searchQuery: string
  typeFilter: '' | SacramentalRecordType
  continuityFilter: SacramentalRecordsContinuityFilter
} {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  const rawType = String(Array.isArray(input.type) ? input.type[0] : input.type ?? '')
    .trim()
    .toLowerCase()
  const typeFilter: '' | SacramentalRecordType = isSacramentalRecordType(rawType) ? rawType : ''
  const continuityFilter = normalizeSacramentalRecordsContinuityFilter(input.continuity)
  return { searchQuery, typeFilter, continuityFilter }
}

export async function loadSacramentalRecordsList(searchParams: {
  q?: string | string[]
  type?: string | string[]
  continuity?: string | string[]
}): Promise<SacramentalRecordsListResult> {
  const { searchQuery, typeFilter, continuityFilter } = parseListSearchParams(searchParams)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      records: [],
      errorMessage: 'Unauthorized',
      searchQuery,
      typeFilter,
      continuityFilter,
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName: null,
    }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return {
      records: [],
      errorMessage: parishContext.error,
      searchQuery,
      typeFilter,
      continuityFilter,
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName: null,
    }
  }

  const parishId = parishContext.activeParishId
  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  let query = supabase
    .from('sacramental_records')
    .select(SACRAMENTAL_RECORD_LIST_SELECT)
    .order('sacrament_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  if (typeFilter) {
    query = query.eq('record_type', typeFilter)
  }

  if (searchQuery) {
    query = query.ilike('person_name', `%${searchQuery.replace(/[%_]/g, '')}%`)
  }

  const { data, error } = await query

  if (error) {
    return {
      records: [],
      errorMessage: userMessageForDashboardQueryError('sacramental records', error),
      searchQuery,
      typeFilter,
      continuityFilter,
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName,
    }
  }

  let summaryQuery = supabase.from('sacramental_records').select('id, request_id')
  let certificateActivityQuery = supabase
    .from('sacramental_record_events')
    .select('sacramental_record_id')
    .eq('action', 'certificate_generated')

  if (parishId) {
    summaryQuery = summaryQuery.eq('parish_id', parishId)
    certificateActivityQuery = certificateActivityQuery.eq('parish_id', parishId)
  }

  const [
    { data: summaryRows, error: summaryError },
    { data: certificateActivityRows, error: certificateActivityError },
  ] = await Promise.all([summaryQuery, certificateActivityQuery])

  const certificateRecordIds = (certificateActivityRows ?? []).map((row) =>
    String((row as { sacramental_record_id?: unknown }).sacramental_record_id ?? '').trim()
  )
  const parsedRecords = (data ?? []).map((row) =>
    parseSacramentalRecordListRow(row as Record<string, unknown>)
  )
  const continuitySummary = buildSacramentalRecordsContinuitySummary({
    records: summaryError
      ? parsedRecords
      : (summaryRows ?? []).map((row) => ({
          id: String((row as { id?: unknown }).id ?? ''),
          request_id:
            (row as { request_id?: unknown }).request_id != null
              ? String((row as { request_id?: unknown }).request_id)
              : null,
        })),
    certificateRecordIds,
  })
  const continuityErrorMessage =
    summaryError || certificateActivityError
      ? 'Could not load all continuity signals. Parish-scoped records are still shown.'
      : ''

  return {
    records: filterSacramentalRecordsByContinuity(
      parsedRecords,
      continuityFilter,
      certificateRecordIds
    ),
    errorMessage: continuityErrorMessage,
    searchQuery,
    typeFilter,
    continuityFilter,
    continuitySummary,
    activeParishName,
  }
}
