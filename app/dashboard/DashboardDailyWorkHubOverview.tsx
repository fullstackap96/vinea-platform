'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileWarning,
  GitBranch,
  HeartHandshake,
  MailCheck,
  Sunrise,
  UserRoundCheck,
} from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type {
  DailyWorkHubMetricTone,
  DailyWorkHubOverview,
  DailyWorkHubWatchItem,
} from '@/lib/dailyWorkHubOverview'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function toneClasses(tone: DailyWorkHubMetricTone): string {
  switch (tone) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function watchIcon(key: DailyWorkHubWatchItem['key']) {
  switch (key) {
    case 'documents_checklist':
      return <FileWarning className="h-4 w-4" aria-hidden="true" />
    case 'communications':
      return <MailCheck className="h-4 w-4" aria-hidden="true" />
    case 'missing_dates':
      return <CalendarClock className="h-4 w-4" aria-hidden="true" />
    case 'care_today':
      return <HeartHandshake className="h-4 w-4" aria-hidden="true" />
    case 'first_contact':
      return <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
    default:
      return <ClipboardList className="h-4 w-4" aria-hidden="true" />
  }
}

export function DashboardDailyWorkHubOverview({
  overview,
  loading,
  dataUnavailable,
  activeParishName,
}: {
  overview: DailyWorkHubOverview
  loading: boolean
  dataUnavailable: boolean
  activeParishName: string | null
}) {
  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-8 w-3/4 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-gray-200" />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
      </section>
    )
  }

  if (dataUnavailable) {
    return (
      <section className={vineaSectionShellClassName}>
        <div className={vineaEmptyStateClassName}>
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Daily Work Hub could not load request signals. Try refreshing before starting the day.
        </div>
      </section>
    )
  }

  return (
    <section className={`${vineaSectionShellClassName} overflow-hidden`} aria-labelledby="daily-work-hub-heading">
      <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/60 to-emerald-50/70 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className={`${chipBase} border-violet-200 bg-white/85 text-violet-950`}>
              <Sunrise className="h-3.5 w-3.5" aria-hidden="true" />
              {overview.greeting}
              {activeParishName ? `, ${activeParishName}` : ''}
            </p>
            <h2 id="daily-work-hub-heading" className={`${sectionHeadingClassName} mt-3`}>
              {overview.headline}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
              {overview.subline}
            </p>
          </div>

          <div className="rounded-xl border border-white/80 bg-white/90 p-3 shadow-sm lg:w-80">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Start here</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-gray-950">
              {overview.firstAction}
            </p>
            <Link href="/dashboard/requests" className={`${primaryButtonMd} mt-3 w-full justify-center`}>
              Open today&apos;s request work
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.metrics.map((metric) => (
            <div key={metric.key} className={`rounded-xl border p-3 ${toneClasses(metric.tone)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-sm leading-snug opacity-90">{metric.helper}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                What needs attention today?
              </p>
              <h3 className="mt-1 text-base font-semibold text-gray-950">Top staff actions</h3>
            </div>
            <Link href="/dashboard/requests#staff-command-center-heading" className={secondaryButtonSm}>
              See queue
            </Link>
          </div>

          {overview.topActions.length > 0 ? (
            <div className="mt-3 space-y-2">
              {overview.topActions.map((action) => (
                <Link
                  key={action.key}
                  href={action.href}
                  className="block rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-violet-200 hover:bg-white"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-950">{action.label}</p>
                      <p className="mt-1 text-sm leading-snug text-gray-700">{action.detail}</p>
                    </div>
                    <span className={`${chipBase} ${toneClasses(action.urgency)} shrink-0`}>
                      {action.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-500">Owner: {action.ownerLabel}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`${vineaEmptyStateClassName} mt-3`}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              No urgent request actions are currently flagged.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Watch before the day gets busy
          </p>
          <div className="mt-3 space-y-2">
            {overview.watchItems.map((item) => (
              <div key={item.key} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${toneClasses(item.tone)}`}>
                  {watchIcon(item.key)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-semibold text-gray-950">{item.label}</p>
                    <span className="text-sm font-bold text-gray-700">{item.value}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-gray-700">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ready for staff review
            </p>
            <div className="mt-2 space-y-2">
              {overview.readyNextItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:border-violet-200 hover:bg-white"
                >
                  <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${toneClasses(item.tone)}`}>
                    <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-950">{item.label}</span>
                      <span className="text-sm font-bold text-gray-700">{item.value}</span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-gray-700">
                      {item.detail}
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href={overview.requestToRecordContinuity.href}
              className="mt-2 flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:border-violet-200 hover:bg-white"
            >
              <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${toneClasses(overview.requestToRecordContinuity.tone)}`}>
                <GitBranch className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-950">
                    {overview.requestToRecordContinuity.label}
                  </span>
                  <span className={`${chipBase} ${toneClasses(overview.requestToRecordContinuity.tone)}`}>
                    {overview.requestToRecordContinuity.stateLabel}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-gray-700">
                  {overview.requestToRecordContinuity.detail}
                </span>
                <span className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                  <span>{overview.requestToRecordContinuity.linkedRecordCount} linked</span>
                  <span>{overview.requestToRecordContinuity.unlinkedRecordCount} need review</span>
                  <span>
                    {overview.requestToRecordContinuity.certificateActivityCount} certificate events
                  </span>
                </span>
                <span className="mt-2 block rounded-md border border-violet-100 bg-white px-3 py-2 text-xs leading-snug text-violet-800">
                  <span className="block font-semibold">
                    {overview.requestToRecordContinuity.drilldownLabel}
                  </span>
                  <span className="mt-0.5 block text-violet-700">
                    {overview.requestToRecordContinuity.drilldownDetail}
                  </span>
                </span>
              </span>
            </Link>
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Next signals to bring into this hub
            </p>
            <div className="mt-2 space-y-2">
              {overview.futureSignals.map((signal) => (
                <div key={signal.key}>
                  <p className="text-sm font-semibold text-gray-900">
                    {signal.label}{' '}
                    <span className="font-medium text-gray-500">({signal.statusLabel})</span>
                  </p>
                  <p className="text-sm leading-snug text-gray-600">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
