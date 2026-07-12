'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { dashboardShellClientErrorMessage } from '@/lib/dashboardShellClientMessages'
import type { NotificationCenterItem } from '@/lib/notificationsCenter/types'
import { safeDashboardHref } from '@/lib/safeDashboardHref'
import { NotificationsCenterPanel } from './NotificationsCenterPanel'

type NotificationsResponse = {
  totalCount: number
  badgeLabel: string | null
  visible: NotificationCenterItem[]
  hasMoreRequestItems: boolean
  hasMoreRecommended: boolean
  errorMessage: string
}

const EMPTY_RESPONSE: NotificationsResponse = {
  totalCount: 0,
  badgeLabel: null,
  visible: [],
  hasMoreRequestItems: false,
  hasMoreRecommended: false,
  errorMessage: '',
}

const NOTIFICATION_GROUPS = new Set(['overdue', 'due_today', 'new_requests', 'recommended'])

function parseNotificationsResponse(value: unknown): NotificationsResponse | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const response = value as Record<string, unknown>
  if (
    !Number.isInteger(response.totalCount) ||
    Number(response.totalCount) < 0 ||
    (response.badgeLabel !== null && typeof response.badgeLabel !== 'string') ||
    !Array.isArray(response.visible) ||
    typeof response.hasMoreRequestItems !== 'boolean' ||
    typeof response.hasMoreRecommended !== 'boolean' ||
    typeof response.errorMessage !== 'string'
  ) {
    return null
  }

  const visible: NotificationCenterItem[] = []
  for (const valueItem of response.visible) {
    if (!valueItem || typeof valueItem !== 'object' || Array.isArray(valueItem)) return null
    const item = valueItem as Record<string, unknown>
    const href = safeDashboardHref(typeof item.href === 'string' ? item.href : null)
    if (
      typeof item.key !== 'string' ||
      !NOTIFICATION_GROUPS.has(String(item.group)) ||
      typeof item.label !== 'string' ||
      typeof item.context !== 'string' ||
      !href
    ) {
      return null
    }
    visible.push({
      key: item.key,
      group: item.group as NotificationCenterItem['group'],
      label: item.label,
      context: item.context,
      href,
    })
  }

  return {
    totalCount: Number(response.totalCount),
    badgeLabel: response.badgeLabel as string | null,
    visible,
    hasMoreRequestItems: response.hasMoreRequestItems,
    hasMoreRecommended: response.hasMoreRecommended,
    errorMessage: response.errorMessage,
  }
}

export function DashboardNotificationsCenter({
  activeParishName,
}: {
  activeParishName?: string | null
}) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NotificationsResponse>(EMPTY_RESPONSE)

  const fetchNotifications = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === loadSequenceRef.current

    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/notifications', {
        credentials: 'include',
        signal: controller.signal,
      })
      if (!isLatestLoad()) return
      if (!response.ok) {
        setData({
          ...EMPTY_RESPONSE,
          errorMessage:
            response.status === 401
              ? 'Please sign in again to view items.'
              : 'Could not load items needing attention.',
        })
        return
      }

      const json = parseNotificationsResponse(await response.json().catch(() => null))
      if (!isLatestLoad()) return
      if (!json) {
        setData({
          ...EMPTY_RESPONSE,
          errorMessage: 'Could not load items needing attention.',
        })
        return
      }
      setData({
        totalCount: json.totalCount,
        badgeLabel: json.badgeLabel,
        visible: json.visible,
        hasMoreRequestItems: json.hasMoreRequestItems,
        hasMoreRecommended: json.hasMoreRecommended,
        errorMessage: json.errorMessage
          ? dashboardShellClientErrorMessage('notifications', json.errorMessage)
          : '',
      })
    } catch (error: unknown) {
      if (!isLatestLoad() || (error instanceof DOMException && error.name === 'AbortError')) return
      setData({
        ...EMPTY_RESPONSE,
        errorMessage: 'Could not load items needing attention.',
      })
    } finally {
      if (isLatestLoad()) setLoading(false)
      if (loadAbortRef.current === controller) loadAbortRef.current = null
    }
  }, [])

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!open) return
    void fetchNotifications()
  }, [open, fetchNotifications])

  useEffect(() => {
    return () => {
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
  }, [])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const badgeLabel = data.badgeLabel
  const showBadge = Boolean(badgeLabel)

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-busy={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200/90 bg-amber-50/80 px-3 py-2.5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 sm:w-auto sm:justify-start sm:py-2"
      >
        <Bell className="h-4 w-4 shrink-0" aria-hidden />
        <span>Needs attention</span>
        {showBadge ? (
          <span
            className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
            aria-label={`${data.totalCount} items need attention`}
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-900/5 sm:left-auto sm:right-0 sm:w-96"
        >
          <header className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Needs attention</h2>
            <p className="mt-0.5 text-sm text-gray-600">Items that may need a next step.</p>
            {activeParishName ? (
              <p className="mt-1 text-xs font-medium text-gray-500">
                Scoped to {activeParishName}
              </p>
            ) : null}
          </header>

          <NotificationsCenterPanel
            visible={data.visible}
            loading={loading}
            errorMessage={data.errorMessage}
            hasMoreRequestItems={data.hasMoreRequestItems}
            hasMoreRecommended={data.hasMoreRecommended}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  )
}
