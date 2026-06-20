import { NextResponse, type NextRequest } from 'next/server'
import { formatNotificationsBadgeCount } from '@/lib/notificationsCenter/buildNotificationsCenter'
import { loadNotificationsCenter } from '@/lib/server/loadNotificationsCenter'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const result = await loadNotificationsCenter(staff.supabase)

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
