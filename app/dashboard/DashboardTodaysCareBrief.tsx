'use client'

import Link from 'next/link'
import { AlertCircle, CalendarDays, CheckCircle2 } from 'lucide-react'
import type { TodaysCareBrief } from '@/lib/parishCareCalendar'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  brief: TodaysCareBrief
  loading: boolean
  dataUnavailable?: boolean
}

function countTone(value: number, urgent = false): string {
  if (value <= 0) return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  if (urgent) return 'border-rose-200 bg-rose-50 text-rose-950'
  return 'border-amber-200 bg-amber-50 text-amber-950'
}

export function DashboardTodaysCareBrief({
  brief,
  loading,
  dataUnavailable = false,
}: Props) {
  const hideBrief = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="todays-care-brief-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Today&apos;s care brief
          </p>
          <h2 id="todays-care-brief-heading" className={`${sectionHeadingClassName} mt-1`}>
            Start here this morning
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            A simple daily view of follow-ups, blockers, care plans, and scheduled pastoral work.
          </p>
        </div>
        <Link href="/dashboard/calendar" className={`${secondaryButtonSm} gap-2`}>
          <CalendarDays className="h-4 w-4" aria-hidden />
          Open calendar
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4" role="status">
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      ) : hideBrief ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Today&apos;s brief unavailable</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            Requests could not be loaded, so the daily care brief is not shown.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {brief.counts.overdue > 0 ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                )}
                <p className="text-lg font-bold leading-snug text-gray-950">{brief.headline}</p>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{brief.subline}</p>
            </div>
            <Link href="/dashboard/requests" className={`${primaryButtonSm} shrink-0`}>
              Work requests
            </Link>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className={`rounded-xl border px-3 py-3 ${countTone(brief.counts.overdue, true)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Overdue</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{brief.counts.overdue}</p>
            </div>
            <div className={`rounded-xl border px-3 py-3 ${countTone(brief.counts.dueToday)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Due today</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{brief.counts.dueToday}</p>
            </div>
            <div className={`rounded-xl border px-3 py-3 ${countTone(brief.counts.carePlans)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Care plans</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{brief.counts.carePlans}</p>
            </div>
            <div className={`rounded-xl border px-3 py-3 ${countTone(brief.counts.blocked)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Waiting on</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{brief.counts.blocked}</p>
            </div>
          </div>

          {brief.actions.length > 0 ? (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Handle before the office closes
              </p>
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
                {brief.actions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm transition hover:border-brand/30 hover:bg-brand-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`${chipBase} border border-white bg-white text-[10px] uppercase text-gray-700`}>
                        {item.actionLabel}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {item.timeLabel}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold leading-snug text-gray-950">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {item.subtitle}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      Owner: {item.ownerLabel}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
