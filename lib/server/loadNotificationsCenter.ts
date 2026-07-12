import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { buildNotificationsCenter } from '@/lib/notificationsCenter/buildNotificationsCenter'
import type { NotificationsCenterBuildResult } from '@/lib/notificationsCenter/types'
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'

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

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })

  if (!parishContext.ok) {
    return { ...EMPTY, errorMessage: parishContext.error }
  }

  const requestsResult = await loadDashboardRequests(supabase, {
    activeParishId: parishContext.activeParishId,
  })
  if (!requestsResult.ok) {
    return {
      ...EMPTY,
      errorMessage: requestsResult.userMessage,
    }
  }

  const suggestedActions = await loadDashboardSuggestedActions(
    supabase,
    requestsResult.requests,
    parishContext.activeParishId,
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
