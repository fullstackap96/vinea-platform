'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { auditEventDetail, auditEventTitle, type AuditEventRow } from '@/lib/auditEvents'
import { auditLogClientErrorMessage } from '@/lib/auditLogClientMessages'
import { requestDetailHref } from '@/lib/dashboardRequestNavigation'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import {
  vineaEmptyStateClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

const FILTERS = [
  { key: '', label: 'All activity' },
  { key: 'staff_user.', label: 'Staff access' },
  { key: 'parish_settings.', label: 'Settings' },
  { key: 'public_intake.', label: 'Intake' },
  { key: 'request.', label: 'Requests' },
]

const AUDIT_LOG_LOAD_TIMEOUT_MS = 15_000

function formatDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function eventHref(event: AuditEventRow): string | null {
  if (event.target_type === 'request' && event.target_id) {
    return safeDashboardHrefOrFallback(`${requestDetailHref(event.target_id)}#activity`, '/dashboard/requests')
  }
  if (event.target_type === 'staff_user' || event.target_type === 'parish') {
    return '/dashboard/settings'
  }
  return null
}

export function AuditLogPage() {
  const [events, setEvents] = useState<AuditEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [activeParishName, setActiveParishName] = useState('')
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller
    const timeoutId = window.setTimeout(() => controller.abort(), AUDIT_LOG_LOAD_TIMEOUT_MS)
    const isLatestLoad = () => loadSequence === loadSequenceRef.current

    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '75' })
      if (filter) params.set('actionPrefix', filter)
      const res = await fetch(`/api/audit-events?${params.toString()}`, {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setError(auditLogClientErrorMessage(data?.error))
        setEvents([])
        setActiveParishName('')
        return
      }
      setEvents(Array.isArray(data.events) ? data.events : [])
      setActiveParishName(String(data.activeParishName ?? '').trim())
    } catch (err) {
      if (!isLatestLoad()) return
      setError(auditLogClientErrorMessage(err))
      setEvents([])
      setActiveParishName('')
    } finally {
      window.clearTimeout(timeoutId)
      if (isLatestLoad()) setLoading(false)
      if (loadAbortRef.current === controller) loadAbortRef.current = null
    }
  }, [filter])

  function selectFilter(nextFilter: string) {
    if (nextFilter === filter) return
    loadSequenceRef.current += 1
    loadAbortRef.current?.abort()
    setFilter(nextFilter)
  }

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void load()
    })
    return () => {
      cancelled = true
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
  }, [load])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Admin
        </p>
        <h1 className={`${sectionHeadingClassName} mt-1`}>Audit log</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          Review staff access changes, settings updates, intake submissions, and request activity.
        </p>
        {activeParishName ? (
          <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-950">
            Audit log is scoped to {activeParishName}.
          </p>
        ) : null}
      </div>

      <section className={vineaSectionShellClassName} aria-busy={loading}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key || 'all'}
                type="button"
                onClick={() => selectFilter(item.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  filter === item.key
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void load()} className={secondaryButtonSm}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-sm font-medium text-gray-700">
            <span className={vineaSpinnerClassName} aria-hidden />
            Loading audit log...
          </div>
        ) : error ? (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
            role="alert"
          >
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className={`${vineaEmptyStateClassName} mt-6`}>
            <p className="font-semibold text-gray-900">No audit events found.</p>
            <p className="mt-2 text-sm text-gray-600">Try a different filter or check again later.</p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {events.map((event) => {
              const href = eventHref(event)
              const content = (
                <>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-950">{auditEventTitle(event)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {auditEventDetail(event)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {event.actor_email || 'System'} - {event.action}
                    </p>
                  </div>
                  <time className="shrink-0 text-sm text-gray-500" dateTime={event.created_at}>
                    {formatDateTime(event.created_at)}
                  </time>
                </>
              )
              return href ? (
                <Link
                  key={event.id}
                  href={href}
                  className="flex flex-col gap-3 px-4 py-4 hover:bg-gray-50 sm:flex-row sm:items-start sm:justify-between"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  {content}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
