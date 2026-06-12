'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { buildParishInsights } from '@/lib/dashboardParishInsights'
import { buildRequestAnalytics } from '@/lib/dashboard/buildRequestAnalytics'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { buildStaffWorkloadRows } from '@/lib/dashboardStaffWorkload'
import { DashboardParishInsights } from '../DashboardParishInsights'
import { DashboardRequestAnalytics } from '../DashboardRequestAnalytics'
import { DashboardStaffWorkload } from '../DashboardStaffWorkload'
import { DashboardTrendMetrics } from '../DashboardTrendMetrics'

export function DashboardReportsPage() {
  const [requests, setRequests] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [technicalDetail, setTechnicalDetail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      setFetchFailed(false)
      setTechnicalDetail(null)

      const result = await loadDashboardRequests(supabase)
      if (cancelled) return

      if (!result.ok) {
        setRequests([])
        setFetchFailed(result.fetchFailed)
        setLoadError(result.userMessage)
        setTechnicalDetail(result.technicalDetail)
        setLoading(false)
        return
      }

      setRequests(result.requests)
      setFetchFailed(false)
      setTechnicalDetail(null)
      setLoadError(result.softWarnings.length > 0 ? result.softWarnings.join(' • ') : null)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const metricsAt = useMemo(() => new Date(), [requests])
  const parishInsights = useMemo(() => buildParishInsights(requests), [requests])
  const requestAnalytics = useMemo(() => buildRequestAnalytics(requests), [requests])
  const staffWorkloadRows = useMemo(
    () => buildStaffWorkloadRows(requests, metricsAt),
    [requests, metricsAt]
  )

  const isDevRuntime = process.env.NODE_ENV === 'development'

  return (
    <main className="mx-auto min-h-full w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
          Parish-wide numbers, request trends, and staff workload—helpful for planning and
          check-ins.
        </p>
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
          {isDevRuntime && technicalDetail ? (
            <pre className="mt-3 max-h-52 overflow-auto rounded-md border border-rose-200/80 bg-white/90 p-3 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-900">
              {technicalDetail}
            </pre>
          ) : null}
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
          insights={parishInsights}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardRequestAnalytics
          analytics={requestAnalytics}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardTrendMetrics
          insights={parishInsights}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
        <DashboardStaffWorkload
          rows={staffWorkloadRows}
          loading={loading}
          dataUnavailable={fetchFailed}
        />
      </div>
    </main>
  )
}
