import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { isSacramentalRecordType } from '@/lib/sacramentalRecordConstants'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { SacramentalRecordRow, SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export type SacramentalRecordsListResult = {
  records: SacramentalRecordRow[]
  errorMessage: string
  searchQuery: string
  typeFilter: '' | SacramentalRecordType
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
  type?: string | string[] | undefined
}): { searchQuery: string; typeFilter: '' | SacramentalRecordType } {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  const rawType = String(Array.isArray(input.type) ? input.type[0] : input.type ?? '')
    .trim()
    .toLowerCase()
  const typeFilter: '' | SacramentalRecordType = isSacramentalRecordType(rawType) ? rawType : ''
  return { searchQuery, typeFilter }
}

export async function loadSacramentalRecordsList(searchParams: {
  q?: string | string[]
  type?: string | string[]
}): Promise<SacramentalRecordsListResult> {
  const { searchQuery, typeFilter } = parseListSearchParams(searchParams)

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
    }
  }

  // Same helper as dashboard (`fetchPrimaryParishId` + session client). When `parishId`
  // is null (e.g. `parishes` not readable under RLS), continue loading — sacramental_records
  // RLS still scopes rows via `primary_parish_id()` in the database.
  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      records: [],
      errorMessage: userMessageForDashboardQueryError('parish directory', parishErr),
      searchQuery,
      typeFilter,
    }
  }

  let query = supabase
    .from('sacramental_records')
    .select('*')
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
      errorMessage: error.message || 'Could not load sacramental records.',
      searchQuery,
      typeFilter,
    }
  }

  return {
    records: (data ?? []).map((row) => parseSacramentalRecordRow(row as Record<string, unknown>)),
    errorMessage: '',
    searchQuery,
    typeFilter,
  }
}
