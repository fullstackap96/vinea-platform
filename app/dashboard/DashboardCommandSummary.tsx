'use client'

import { useMemo } from 'react'
import { AlertTriangle, Bell, CalendarDays, Inbox } from 'lucide-react'
import { getDashboardCommandSummaryCounts } from '@/lib/dashboardSummaryCounts'
import { dashboardCardHoverPolish } from '@/lib/cardStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  requests: unknown[]
  loading?: boolean
  /** When true (and not loading), do not show numeric counts — request data did not load. */
  dataUnavailable?: boolean
  /**
   * Shared “as of” time for overdue / due-today / schedule boundaries.
   * Pass from the dashboard page so totals match staff workload row sums.
   */
  metricsAt?: Date
}

type SummaryCard = {
  key: keyof ReturnType<typeof getDashboardCommandSummaryCounts>
  label: string
  hint: string
  icon: typeof Inbox
  tint: string
  num: string
  iconWrap: string
  /** Stronger card for the primary “start here” metric. */
  emphasis?: boolean
  /** Softer card for supporting context. */
  muted?: boolean
  /** Short line under the count (emphasis cards only). */
  callout?: string
}

const CARDS: SummaryCard[] = [
  {
    key: 'newRequests',
    label: 'New Requests',
    hint: 'Marked new — ready for a first look',
    icon: Inbox,
    tint: 'border-sky-200/80 bg-sky-50/70',
    num: 'text-sky-950',
    iconWrap: 'bg-sky-100/90 text-sky-900',
  },
  {
    key: 'actionRequired',
    label: 'Needs attention',
    hint: 'Follow-up is past due or due today, or nobody is assigned yet',
    icon: Bell,
    tint: 'border-2 border-amber-400/80 bg-amber-100/85 shadow-md',
    num: 'text-amber-950',
    iconWrap: 'bg-amber-200/95 text-amber-950',
    emphasis: true,
    callout: 'Start here — these need attention now',
  },
  {
    key: 'overdueFollowUps',
    label: 'Past due',
    hint: 'Open requests whose follow-up date has already passed',
    icon: AlertTriangle,
    tint: 'border-rose-200/75 bg-rose-50/60',
    num: 'text-rose-950',
    iconWrap: 'bg-rose-100/90 text-rose-950',
  },
  {
    key: 'upcomingScheduled',
    label: 'Upcoming Scheduled Events',
    hint: 'Confirmed dates from today onward',
    icon: CalendarDays,
    tint: 'border-gray-200/80 bg-slate-50/95',
    num: 'text-slate-600',
    iconWrap: 'bg-slate-200/80 text-slate-600',
    muted: true,
  },
]

export function DashboardCommandSummary({
  requests = [],
  loading = false,
  dataUnavailable = false,
  metricsAt,
}: Props) {
  const counts = useMemo(() => {
    const at = metricsAt ?? new Date()
    return getDashboardCommandSummaryCounts(requests, at)
  }, [requests, metricsAt])

  const hideCounts = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="command-summary-heading"
    >
      <h2 id="command-summary-heading" className={sectionHeadingClassName}>
        At a glance
      </h2>
      <p className="mb-5 max-w-2xl text-base leading-relaxed text-gray-600">
        Key numbers from your current request list. Scroll down for Needs attention, the
        follow-up queue, and the full table.
      </p>
      {hideCounts ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200/90 bg-rose-50/80 px-4 py-5 text-center text-sm text-rose-950 sm:px-6"
        >
          <p className="text-base font-semibold">Summary unavailable</p>
          <p className="mt-2 max-w-xl mx-auto leading-relaxed text-rose-900/95">
            Requests could not be loaded, so these counts are not shown. Fix the issue
            above, then refresh the page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {CARDS.map((c) => {
            const Icon = c.icon
            const value = loading ? null : counts[c.key]
            const emphasis = Boolean(c.emphasis)
            const muted = Boolean(c.muted)
            const pad = emphasis ? 'p-5 sm:p-6' : 'p-4'
            const iconWrapSize = emphasis
              ? 'h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem]'
              : 'h-11 w-11'
            const iconSvg = emphasis ? 'h-6 w-6' : 'h-5 w-5'
            const numSize = emphasis
              ? 'text-4xl font-bold tabular-nums leading-none sm:text-[2.5rem]'
              : 'text-3xl font-bold tabular-nums leading-none'
            const labelClass = emphasis
              ? 'text-sm font-bold text-amber-950 tracking-tight'
              : muted
                ? 'text-xs font-semibold uppercase tracking-wide text-slate-500'
                : 'text-xs font-semibold uppercase tracking-wide text-gray-600'
            const hintClass = muted
              ? 'text-xs leading-snug text-slate-500'
              : 'text-xs leading-snug text-gray-600'
            const ringClass = emphasis
              ? 'ring-amber-900/10'
              : muted
                ? 'ring-slate-900/[0.04]'
                : 'ring-gray-900/[0.03]'

            return (
              <div
                key={c.key}
                className={`flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border shadow-sm ring-1 ${ringClass} ${dashboardCardHoverPolish} ${pad} ${c.tint}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-xl ${iconWrapSize} ${c.iconWrap}`}
                    aria-hidden
                  >
                    <Icon className={iconSvg} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={labelClass}>{c.label}</div>
                    <div className={`mt-1 ${numSize} ${c.num}`}>
                      {loading ? '—' : value}
                    </div>
                  </div>
                </div>
                {c.callout ? (
                  <p className="text-sm font-semibold leading-snug text-amber-950">
                    {c.callout}
                  </p>
                ) : null}
                <p className={hintClass}>{c.hint}</p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
