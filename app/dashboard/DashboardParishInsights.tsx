'use client'

import type { ParishInsights } from '@/lib/dashboardParishInsights'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  insights: ParishInsights
  loading: boolean
  dataUnavailable?: boolean
}

function InsightTile(props: {
  title: string
  value: string
  hint?: string
  emphasize?: 'neutral' | 'amber' | 'rose'
}) {
  const { title, value, hint, emphasize = 'neutral' } = props
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
      {hint ? <p className="mt-1.5 text-xs leading-snug text-gray-600">{hint}</p> : null}
    </div>
  )
}

export function DashboardParishInsights({
  insights,
  loading,
  dataUnavailable = false,
}: Props) {
  const hideInsights = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="parish-insights-heading"
      aria-busy={loading}
    >
      <h2 id="parish-insights-heading" className={sectionHeadingClassName}>
        Parish insights
      </h2>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
        Snapshot from every request currently loaded for your parish. “This week” runs
        Monday through today in your local time zone.
      </p>

      {loading ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading parish insights"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-gray-200/90 bg-gray-50/80 ring-1 ring-gray-900/[0.03]"
            />
          ))}
        </div>
      ) : hideInsights ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-5 text-center text-sm text-rose-950"
        >
          <p className="text-base font-semibold">Parish insights unavailable</p>
          <p className="mt-2 max-w-xl mx-auto leading-relaxed text-rose-900/95">
            Requests could not be loaded, so these figures are hidden.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <InsightTile
            title="Total open requests"
            value={String(insights.totalOpenRequests)}
            hint="Everything not marked complete."
          />
          <InsightTile
            title="Submitted this week"
            value={String(insights.submittedThisWeek)}
            hint="New intakes since Monday, any status."
          />
          <InsightTile
            title="Average age of open requests"
            value={
              insights.averageOpenAgeDays === null
                ? '—'
                : `${insights.averageOpenAgeDays} days`
            }
            hint="From intake date to today, for open requests only."
          />
          <InsightTile
            title="Most common request type"
            value={insights.mostCommonRequestTypeLabel ?? '—'}
            hint="Among open requests only."
          />
          <InsightTile
            title="Overdue follow-ups"
            value={String(insights.overdueFollowUps)}
            hint="Open requests whose follow-up date has passed."
            emphasize={insights.overdueFollowUps > 0 ? 'rose' : 'neutral'}
          />
        </div>
      )}
    </section>
  )
}
