import Link from 'next/link'
import type { NotificationCenterItem, NotificationItemGroup } from '@/lib/notificationsCenter/types'
import { DashboardRequestNameLink } from '@/app/dashboard/_components/DashboardRequestNameLink'
import {
  dashboardRequestOpenLabel,
  isRequestDetailHref,
} from '@/lib/dashboardRequestNavigation'

const GROUP_LABELS: Record<NotificationItemGroup, string> = {
  overdue: 'Overdue',
  due_today: 'Due today',
  new_requests: 'New requests',
  recommended: 'Recommended',
}

const GROUP_ORDER: NotificationItemGroup[] = [
  'overdue',
  'due_today',
  'new_requests',
  'recommended',
]

function groupVisibleItems(items: NotificationCenterItem[]): Map<NotificationItemGroup, NotificationCenterItem[]> {
  const map = new Map<NotificationItemGroup, NotificationCenterItem[]>()
  for (const group of GROUP_ORDER) {
    map.set(group, [])
  }
  for (const item of items) {
    map.get(item.group)?.push(item)
  }
  return map
}

export function NotificationsCenterPanel({
  visible,
  loading,
  errorMessage,
  hasMoreRequestItems,
  hasMoreRecommended,
  onNavigate,
}: {
  visible: NotificationCenterItem[]
  loading?: boolean
  errorMessage?: string
  hasMoreRequestItems?: boolean
  hasMoreRecommended?: boolean
  onNavigate?: () => void
}) {
  if (loading) {
    return <p className="px-4 py-5 text-sm text-gray-600">Checking what needs attention…</p>
  }

  if (errorMessage) {
    return (
      <p className="px-4 py-5 text-sm text-red-800" role="alert">
        {errorMessage}
      </p>
    )
  }

  if (visible.length === 0) {
    return (
      <p className="px-4 py-5 text-sm text-gray-700">Nothing needs attention right now.</p>
    )
  }

  const grouped = groupVisibleItems(visible)

  return (
    <div className="py-2">
      {GROUP_ORDER.map((group) => {
        const items = grouped.get(group) ?? []
        if (items.length === 0) return null

        return (
          <div key={group} className="px-2 py-1">
            <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {GROUP_LABELS[group]}
            </p>
            <ul>
              {items.map((item) => {
                const isRequest = isRequestDetailHref(item.href)
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-label={isRequest ? dashboardRequestOpenLabel(item.label) : undefined}
                      className="group/card block cursor-pointer rounded-xl border border-transparent px-3 py-2.5 transition-[background-color,border-color] hover:border-gray-300/90 hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
                      {isRequest ? (
                        <DashboardRequestNameLink name={item.label} embedded size="sm" />
                      ) : (
                        <p className="text-sm font-semibold leading-snug text-gray-900">{item.label}</p>
                      )}
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.context}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {hasMoreRequestItems || hasMoreRecommended ? (
        <div className="space-y-1 border-t border-gray-100 px-3 py-2.5">
          {hasMoreRequestItems ? (
            <Link
              href="/dashboard/requests"
              onClick={onNavigate}
              className="block rounded-lg px-2 py-2 text-sm font-medium text-brand hover:bg-slate-50"
            >
              View requests →
            </Link>
          ) : null}
          {hasMoreRecommended ? (
            <Link
              href="/dashboard#suggested-actions-heading"
              onClick={onNavigate}
              className="block rounded-lg px-2 py-2 text-sm font-medium text-brand hover:bg-slate-50"
            >
              View recommended actions →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
