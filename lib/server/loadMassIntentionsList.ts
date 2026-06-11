import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import {
  parseMassIntentionFulfilledFilter,
  parseMassIntentionRow,
  sanitizeMassIntentionsSearchQuery,
} from '@/lib/massIntentions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MassIntentionFulfilledFilter, MassIntentionRow } from '@/lib/types/massIntentions'

export type MassIntentionsListResult = {
  intentions: MassIntentionRow[]
  errorMessage: string
  searchQuery: string
  fulfilledFilter: MassIntentionFulfilledFilter
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
  fulfilled?: string | string[] | undefined
}): { searchQuery: string; fulfilledFilter: MassIntentionFulfilledFilter } {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  const rawFulfilled = Array.isArray(input.fulfilled) ? input.fulfilled[0] : input.fulfilled
  const fulfilledFilter = parseMassIntentionFulfilledFilter(rawFulfilled)
  return { searchQuery, fulfilledFilter }
}

export async function loadMassIntentionsList(searchParams: {
  q?: string | string[]
  fulfilled?: string | string[]
}): Promise<MassIntentionsListResult> {
  const { searchQuery, fulfilledFilter } = parseListSearchParams(searchParams)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      intentions: [],
      errorMessage: 'Unauthorized',
      searchQuery,
      fulfilledFilter,
    }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      intentions: [],
      errorMessage: userMessageForDashboardQueryError('parish directory', parishErr),
      searchQuery,
      fulfilledFilter,
    }
  }

  let query = supabase
    .from('mass_intentions')
    .select('*')
    .order('assigned_mass_date', { ascending: true, nullsFirst: false })
    .order('requested_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  if (fulfilledFilter === 'unfulfilled') {
    query = query.eq('is_fulfilled', false)
  } else if (fulfilledFilter === 'fulfilled') {
    query = query.eq('is_fulfilled', true)
  }

  const sanitized = sanitizeMassIntentionsSearchQuery(searchQuery)
  if (sanitized) {
    const pattern = `%${sanitized}%`
    query = query.or(
      [`requester_name.ilike.${pattern}`, `intention_text.ilike.${pattern}`].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    return {
      intentions: [],
      errorMessage: userMessageForDashboardQueryError('mass intentions', error),
      searchQuery,
      fulfilledFilter,
    }
  }

  const intentions = (data ?? []).map((row) =>
    parseMassIntentionRow(row as Record<string, unknown>)
  )

  return { intentions, errorMessage: '', searchQuery, fulfilledFilter }
}
