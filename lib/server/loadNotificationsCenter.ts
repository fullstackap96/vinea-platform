import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { buildNotificationsCenter } from '@/lib/notificationsCenter/buildNotificationsCenter'
import type { NotificationsCenterBuildResult } from '@/lib/notificationsCenter/types'
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'

export type LoadNotificationsCenterResult = NotificationsCenterBuildResult & {
  errorMessage: string
}

const EMPTY: NotificationsCenterBuildResult = {
  groups: {
    overdue: [],
    due_today: [],
    new_requests: [],
    recommended: [],
  },
  totalCount: 0,
  visible: [],
  hasMoreRequestItems: false,
  hasMoreRecommended: false,
}

export async function loadNotificationsCenter(
  supabase: SupabaseClient
): Promise<LoadNotificationsCenterResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ...EMPTY, errorMessage: 'Unauthorized' }
  }

  const requestsResult = await loadDashboardRequests(supabase)
  if (!requestsResult.ok) {
    return {
      ...EMPTY,
      errorMessage: requestsResult.userMessage,
    }
  }

  const suggestedActions = await loadDashboardSuggestedActions(
    supabase,
    requestsResult.requests
  )

  const built = buildNotificationsCenter({
    requests: requestsResult.requests,
    suggestedActions,
  })

  return {
    ...built,
    errorMessage: '',
  }
}
