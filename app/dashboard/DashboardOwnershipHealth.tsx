'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, UsersRound } from 'lucide-react'
import type { OwnershipHealthAction, OwnershipHealthResult, OwnershipHealthTone } from '@/lib/ownershipHealth'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  health: OwnershipHealthResult
  loading: boolean
  dataUnavailable?: boolean
}

function toneClass(tone: OwnershipHealthTone): string {
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-950">{value}</p>
    </div>
  )
}

function ActionCard({ action }: { action: OwnershipHealthAction }) {
  return (
    <article className={`rounded-xl border px-4 py-3 ${toneClass(action.tone)}`}>
      <p className="text-sm font-bold leading-snug">{action.title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{action.detail}</p>
      {action.href && action.actionLabel ? (
        <Link href={action.href} className={`${secondaryButtonSm} mt-3 bg-white/80`}>
          {action.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </article>
  )
}

export function DashboardOwnershipHealth({
  health,
  loading,
  dataUnavailable = false,
}: Props) {
  const hidePanel = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="ownership-health-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Office manager view
          </p>
          <h2 id="ownership-health-heading" className={`${sectionHeadingClassName} mt-1`}>
            Ownership health
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            See who needs assignment, relief, or urgent follow-up before routine work begins.
          </p>
        </div>
        {!loading && !hidePanel ? (
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
              health.actions.length > 0
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
            }`}
          >
            {health.actions.length > 0 ? (
              <UsersRound className="h-4 w-4" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            )}
            {health.headline}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3" role="status" aria-label="Loading ownership health">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : hidePanel ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Ownership health unavailable</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            Requests could not be loaded, so ownership recommendations are not shown.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Open unassigned" value={health.unassignedOpen} />
            <Metric label="Urgent unassigned" value={health.unassignedUrgent} />
            <Metric label="Possibly overloaded" value={health.overloadedOwners} />
          </div>

          {health.actions.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {health.actions.map((action) => (
                <ActionCard key={action.key} action={action} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-950">
              <p className="font-semibold">{health.summary}</p>
              <p className="mt-1">
                Keep reviewing the command center as new funeral, wedding, baptism, and OCIA
                requests arrive.
              </p>
            </div>
          )}

          <div className="mt-4">
            <Link href="/dashboard/requests" className={`${primaryButtonSm} justify-center`}>
              Review request list
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
