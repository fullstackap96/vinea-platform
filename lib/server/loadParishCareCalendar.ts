import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { parseMassIntentionRow } from '@/lib/massIntentions'
import {
  buildParishCareCalendarItems,
  type ParishCareCalendarRequest,
  type ParishCareCalendarItem,
} from '@/lib/parishCareCalendar'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

export type LoadParishCareCalendarResult = {
  items: ParishCareCalendarItem[]
  errorMessage: string
  softWarnings: string[]
}

export async function loadParishCareCalendar(): Promise<LoadParishCareCalendarResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { items: [], errorMessage: 'Unauthorized', softWarnings: [] }
  }

  const requestResult = await loadDashboardRequests(supabase)
  if (!requestResult.ok) {
    return {
      items: [],
      errorMessage: requestResult.userMessage,
      softWarnings: [],
    }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      items: buildParishCareCalendarItems({
        requests: requestResult.requests as ParishCareCalendarRequest[],
      }),
      errorMessage: '',
      softWarnings: [userMessageForDashboardQueryError('mass intentions', parishErr)],
    }
  }

  let intentions: MassIntentionRow[] = []
  let softWarnings = [...requestResult.softWarnings]

  let intentionsQuery = supabase
    .from('mass_intentions')
    .select('*')
    .order('assigned_mass_date', { ascending: true, nullsFirst: false })
    .order('requested_date', { ascending: true, nullsFirst: false })

  if (parishId) {
    intentionsQuery = intentionsQuery.eq('parish_id', parishId)
  }

  const { data: intentionsData, error: intentionsError } = await intentionsQuery
  if (intentionsError) {
    softWarnings = [
      ...softWarnings,
      userMessageForDashboardQueryError('mass intentions', intentionsError),
    ]
  } else {
    intentions = (intentionsData ?? []).map((row) =>
      parseMassIntentionRow(row as Record<string, unknown>)
    )
  }

  return {
    items: buildParishCareCalendarItems({
      requests: requestResult.requests as ParishCareCalendarRequest[],
      intentions,
    }),
    errorMessage: '',
    softWarnings,
  }
}
