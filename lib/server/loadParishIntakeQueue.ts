import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { parseMassIntentionRow } from '@/lib/massIntentions'
import {
  buildParishIntakeQueue,
  type ParishIntakeQueueItem,
  type ParishIntakeQueueRequest,
} from '@/lib/parishIntakeQueue'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

export type LoadParishIntakeQueueResult = {
  items: ParishIntakeQueueItem[]
  errorMessage: string
  softWarnings: string[]
}

export async function loadParishIntakeQueue(): Promise<LoadParishIntakeQueueResult> {
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
  let intentions: MassIntentionRow[] = []
  let softWarnings = [...requestResult.softWarnings]

  if (parishErr) {
    softWarnings = [
      ...softWarnings,
      userMessageForDashboardQueryError('mass intentions', parishErr),
    ]
  } else {
    let intentionsQuery = supabase
      .from('mass_intentions')
      .select('*')
      .eq('is_fulfilled', false)
      .order('created_at', { ascending: false })

    if (parishId) {
      intentionsQuery = intentionsQuery.eq('parish_id', parishId)
    }

    const { data, error } = await intentionsQuery
    if (error) {
      softWarnings = [
        ...softWarnings,
        userMessageForDashboardQueryError('mass intentions', error),
      ]
    } else {
      intentions = (data ?? []).map((row) =>
        parseMassIntentionRow(row as Record<string, unknown>)
      )
    }
  }

  return {
    items: buildParishIntakeQueue({
      requests: requestResult.requests as ParishIntakeQueueRequest[],
      intentions,
    }),
    errorMessage: '',
    softWarnings,
  }
}
