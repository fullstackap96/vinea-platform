'use client'

import { useEffect, useState } from 'react'
import {
  parseReportsSummaryResponse,
  type ReportsSummary,
} from '@/lib/dashboard/parseReportsSummaryResponse'
import { DashboardParishInsights } from '../DashboardParishInsights'
import { DashboardRequestAnalytics } from '../DashboardRequestAnalytics'
import { DashboardStaffWorkload } from '../DashboardStaffWorkload'
import { DashboardTrendMetrics } from '../DashboardTrendMetrics'

const EMPTY_REPORTS_SUMMARY: ReportsSummary = {
  requestAnalytics: {
    totalRequests: 0,
    openRequests: 0,
    completedRequests: 0,
    byType: [],
  },
  parishInsights: {
    totalOpenRequests: 0,
    submittedThisWeek: 0,
    averageOpenAgeDays: null,
    mostCommonRequestTypeLabel: null,
    overdueFollowUps: 0,
    unassignedOpenRequests: 0,
  },
  staffWorkloadRows: [],
}

const REPORTS_READ_TIMEOUT_MS = 15_000

export function DashboardReportsPage({
  activeParishId = null,
  activeParishName = null,
}: {
  activeParishId?: string | null
  activeParishName?: string | null
}) {
  const [summary, setSummary] = useState<ReportsSummary>(EMPTY_REPORTS_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let readTimeoutId: number | undefined

    async function load() {
      setLoading(true)
      setLoadError(null)
      setFetchFailed(false)

      if (!activeParishId) {
        setSummary(EMPTY_REPORTS_SUMMARY)
        setLoadError('Selected parish context is unavailable. Refresh to try again.')
        setLoading(false)
        return
      }

      readTimeoutId = window.setTimeout(
        () => controller.abort(),
        REPORTS_READ_TIMEOUT_MS,
      )

      try {
        const response = await fetch('/api/dashboard/reports-summary', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'X-Vinea-Active-Parish-Id': activeParishId,
          },
        })
        const payload = parseReportsSummaryResponse(
          await response.json().catch(() => null),
        )

        if (cancelled) return

        if (!response.ok || !payload || !payload.ok) {
          setSummary(EMPTY_REPORTS_SUMMARY)
          const softScopeFailure =
            response.ok &&
            payload?.ok === false &&
            payload.fetchFailed === false
          setFetchFailed(!softScopeFailure)
          setLoadError(softScopeFailure ? payload.error : null)
          return
        }

        setSummary(payload.summary)
        setFetchFailed(false)
        setLoadError(
          payload.warnings.join(' | ') || null,
        )
      } catch (error: unknown) {
        if (cancelled && error instanceof DOMException && error.name === 'AbortError') return
        if (cancelled) return
        setSummary(EMPTY_REPORTS_SUMMARY)
        setFetchFailed(true)
        setLoadError(null)
      } finally {
        if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
      controller.abort()
    }
  }, [activeParishId])

  return (
    <main className="mx-auto min-h-full w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
          Parish-wide numbers, request trends, and staff workload for planning and check-ins.
        </p>
        {activeParishName ? (
          <p className="mt-2 inline-flex max-w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            <span className="truncate">
              Reports are scoped to{' '}
              <span className="font-semibold text-gray-900">{activeParishName}</span>.
            </span>
          </p>
        ) : null}
      </header>

      {fetchFailed ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-950 sm:mb-5"
        >
          <p className="text-base font-semibold">Reports could not be loaded.</p>
          <p className="mt-1.5 text-sm leading-relaxed text-rose-900/95">
            Check your connection or try again. If this keeps happening, contact support.
          </p>
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:mb-5"
        >
          {loadError}
        </div>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        <DashboardParishInsights
          insights={summary.parishInsights}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardRequestAnalytics
          analytics={summary.requestAnalytics}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardTrendMetrics
          insights={summary.parishInsights}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardStaffWorkload
          rows={summary.staffWorkloadRows}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
      </div>
    </main>
  )
}
