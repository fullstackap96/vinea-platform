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
}

type SummaryCard = {
  key: keyof ReturnType<typeof getDashboardCommandSummaryCounts>
  label: string
  hint: string
  icon: typeof Inbox
  tint: string
  num: string
  iconWrap: string
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
    label: 'Action Required',
    hint: 'Follow-up overdue, due today, or unassigned',
    icon: Bell,
    tint: 'border-amber-200/80 bg-amber-50/65',
    num: 'text-amber-950',
    iconWrap: 'bg-amber-100/90 text-amber-950',
  },
  {
    key: 'overdueFollowUps',
    label: 'Overdue Follow-Ups',
    hint: 'Past-due follow-up dates on open requests',
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
    tint: 'border-emerald-200/75 bg-emerald-50/60',
    num: 'text-emerald-950',
    iconWrap: 'bg-emerald-100/90 text-emerald-950',
  },
]

export function DashboardCommandSummary({ requests = [], loading = false }: Props) {
  const counts = useMemo(
    () => getDashboardCommandSummaryCounts(requests),
    [requests]
  )

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="command-summary-heading"
    >
      <h2 id="command-summary-heading" className={sectionHeadingClassName}>
        At a glance
      </h2>
      <p className="mb-5 max-w-2xl text-base leading-relaxed text-gray-600">
        Key numbers from your current request list. Scroll down for Action Required, the
        follow-up queue, and the full table.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon
          const value = loading ? null : counts[c.key]
          return (
            <div
              key={c.key}
              className={`flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border p-4 shadow-sm ring-1 ring-gray-900/[0.03] ${dashboardCardHoverPolish} ${c.tint}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconWrap}`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    {c.label}
                  </div>
                  <div
                    className={`mt-1 text-3xl font-bold tabular-nums leading-none ${c.num}`}
                  >
                    {loading ? '—' : value}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-snug text-gray-600">{c.hint}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
