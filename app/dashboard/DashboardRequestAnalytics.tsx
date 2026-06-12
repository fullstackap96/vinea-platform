'use client'

import type { RequestAnalytics } from '@/lib/dashboard/buildRequestAnalytics'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  analytics: RequestAnalytics
  loading: boolean
  dataUnavailable?: boolean
}

function SummaryTile({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-gray-900/[0.03]">
      <p className="text-xs font-semibold text-gray-700">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-gray-600">{hint}</p> : null}
    </div>
  )
}

export function DashboardRequestAnalytics({
  analytics,
  loading,
  dataUnavailable = false,
}: Props) {
  const hide = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="request-analytics-heading"
      aria-busy={loading}
    >
      <h2 id="request-analytics-heading" className={sectionHeadingClassName}>
        Request analytics
      </h2>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
        How parish requests are distributed by type and status.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="status">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-gray-200/90 bg-gray-50/80"
            />
          ))}
        </div>
      ) : hide ? (
        <p className="text-sm text-gray-600">Analytics unavailable while requests did not load.</p>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryTile
              title="Total requests"
              value={String(analytics.totalRequests)}
              hint="All requests currently loaded for your parish."
            />
            <SummaryTile
              title="Open"
              value={String(analytics.openRequests)}
              hint="Not yet marked complete."
            />
            <SummaryTile
              title="Completed"
              value={String(analytics.completedRequests)}
              hint="Marked complete in Vinea."
            />
          </div>

          {analytics.byType.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center text-sm text-gray-600">
              No requests yet. Analytics will appear when intake forms are submitted.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-900/[0.03]">
              <table className="w-full min-w-[28rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/90">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Request type
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Open
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Completed
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.byType.map((row) => (
                    <tr key={row.typeLabel} className="border-b border-gray-100 last:border-0">
                      <th
                        scope="row"
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                      >
                        {row.typeLabel}
                      </th>
                      <td className="px-3 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {row.open}
                      </td>
                      <td className="px-3 py-3 text-right text-sm tabular-nums text-gray-700">
                        {row.complete}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
