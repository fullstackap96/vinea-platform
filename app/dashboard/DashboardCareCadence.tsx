'use client'

import Link from 'next/link'
import { HeartHandshake } from 'lucide-react'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { chipBase } from '@/lib/chipStyles'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import {
  type CareCadenceEvaluation,
  type CareCadenceLevel,
  type CareCadenceResult,
} from '@/lib/careCadence'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'

function levelClass(level: CareCadenceLevel): string {
  switch (level) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'medium':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function rowLevelLabel(level: CareCadenceLevel): string {
  switch (level) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'High care'
    case 'medium':
      return 'Watch'
    case 'steady':
    default:
      return 'Steady'
  }
}

function DashboardCareCadenceRow({ row }: { row: CareCadenceEvaluation }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RequestTypeBadge requestType={row.requestType} />
            <span className={`${chipBase} text-[10px] uppercase ${levelClass(row.level)}`}>
              {rowLevelLabel(row.level)}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-gray-950">{row.personLabel}</h3>
          <p className="mt-1 text-sm font-medium text-gray-800">{row.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{row.reason}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-sm text-violet-950">
          <p className="text-xs font-semibold uppercase tracking-wide">Suggested follow-up</p>
          <p className="mt-0.5 font-semibold">{row.suggestedFollowUpLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <a href={row.detailHref} className={`${primaryButtonSm} justify-center`}>
          Work care step
        </a>
        <span className="text-sm leading-relaxed text-gray-600">{row.recommendedAction}</span>
      </div>
    </article>
  )
}

export function DashboardCareCadence({
  cadence,
  loading,
  dataUnavailable,
}: {
  cadence: CareCadenceResult
  loading: boolean
  dataUnavailable: boolean
}) {
  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="care-cadence-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 ring-1 ring-rose-100"
            aria-hidden
          >
            <HeartHandshake className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 id="care-cadence-heading" className={sectionHeadingClassName}>
              Needs care today
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
              Pastoral cadence for sacramental families: first contact, stale care, blockers,
              and the next follow-up date Vinea recommends.
            </p>
          </div>
        </div>
        {!loading && !dataUnavailable ? (
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-64">
            <div className={`rounded-lg border px-3 py-2 ${levelClass('urgent')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Urgent</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{cadence.summary.urgent}</p>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${levelClass('high')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">High</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{cadence.summary.high}</p>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${levelClass('medium')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Stale</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{cadence.summary.staleCare}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 h-5 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-4 max-w-2xl rounded bg-gray-200" />
            </div>
          ))
        ) : dataUnavailable ? (
          <div className={vineaEmptyStateClassName} role="alert">
            <p className="text-base font-semibold text-gray-900">Care cadence is unavailable.</p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
              It will appear after request data loads successfully.
            </p>
          </div>
        ) : cadence.rows.length === 0 ? (
          <div className={vineaEmptyStateClassName} role="status">
            <p className="text-base font-semibold text-gray-900">
              No sacramental families need urgent care follow-up.
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
              Vinea will surface families here when first contact, follow-up, or blockers need
              pastoral attention.
            </p>
          </div>
        ) : (
          <>
            {cadence.rows.map((row) => (
              <DashboardCareCadenceRow key={row.requestId} row={row} />
            ))}
            <Link href="/dashboard/requests" className={`${secondaryButtonSm} justify-center`}>
              Review all requests
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
