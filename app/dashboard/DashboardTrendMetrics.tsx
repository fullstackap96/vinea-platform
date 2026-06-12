'use client'

import type { ParishInsights } from '@/lib/dashboardParishInsights'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  insights: ParishInsights
  loading: boolean
  dataUnavailable?: boolean
}

function TrendTile({
  title,
  value,
  hint,
  emphasize,
}: {
  title: string
  value: string
  hint: string
  emphasize?: 'neutral' | 'amber' | 'rose'
}) {
  const tone =
    emphasize === 'rose'
      ? 'border-rose-200/90 bg-rose-50/70'
      : emphasize === 'amber'
        ? 'border-amber-200/90 bg-amber-50/70'
        : 'border-gray-200/90 bg-white'

  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-sm ring-1 ring-gray-900/[0.03] ${tone}`}
    >
      <p className="text-xs font-semibold text-gray-700">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-snug text-gray-600">{hint}</p>
    </div>
  )
}

export function DashboardTrendMetrics({
  insights,
  loading,
  dataUnavailable = false,
}: Props) {
  const hide = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="trend-metrics-heading"
      aria-busy={loading}
    >
      <h2 id="trend-metrics-heading" className={sectionHeadingClassName}>
        Trend metrics
      </h2>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
        Recent intake and follow-up patterns. “This week” runs Monday through today in your local
        time zone.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="status">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-gray-200/90 bg-gray-50/80"
            />
          ))}
        </div>
      ) : hide ? (
        <p className="text-sm text-gray-600">Trend metrics unavailable while requests did not load.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TrendTile
            title="Submitted this week"
            value={String(insights.submittedThisWeek)}
            hint="New intakes since Monday, any status."
          />
          <TrendTile
            title="Average age of open requests"
            value={
              insights.averageOpenAgeDays === null
                ? '—'
                : `${insights.averageOpenAgeDays} days`
            }
            hint="From intake date to today, for open requests."
          />
          <TrendTile
            title="Unassigned open requests"
            value={String(insights.unassignedOpenRequests)}
            hint="Open requests with no staff assignee yet."
            emphasize={insights.unassignedOpenRequests >= 2 ? 'amber' : 'neutral'}
          />
          <TrendTile
            title="Past-due follow-ups"
            value={String(insights.overdueFollowUps)}
            hint="Open requests whose follow-up date has passed."
            emphasize={insights.overdueFollowUps > 0 ? 'rose' : 'neutral'}
          />
        </div>
      )}
    </section>
  )
}
