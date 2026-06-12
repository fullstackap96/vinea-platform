import { NextResponse, type NextRequest } from 'next/server'
import { formatNotificationsBadgeCount } from '@/lib/notificationsCenter/buildNotificationsCenter'
import { loadNotificationsCenter } from '@/lib/server/loadNotificationsCenter'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerReadOnlyClient(request)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await loadNotificationsCenter(supabase)

  return NextResponse.json({
    totalCount: result.totalCount,
    badgeLabel: formatNotificationsBadgeCount(result.totalCount),
    groups: result.groups,
    visible: result.visible,
    hasMoreRequestItems: result.hasMoreRequestItems,
    hasMoreRecommended: result.hasMoreRecommended,
    errorMessage: result.errorMessage,
  })
}
