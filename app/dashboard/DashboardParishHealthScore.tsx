'use client'

import Link from 'next/link'
import { Activity, AlertTriangle, CheckCircle2, ClipboardCheck, Info } from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import type { ParishHealthFactor, ParishHealthScore, ParishHealthTone } from '@/lib/parishHealthScore'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function toneClasses(tone: ParishHealthTone): string {
  switch (tone) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'watch':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'healthy':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function scoreBarClass(tone: ParishHealthTone): string {
  switch (tone) {
    case 'urgent':
      return 'bg-rose-600'
    case 'watch':
      return 'bg-amber-500'
    case 'healthy':
    default:
      return 'bg-emerald-600'
  }
}

function FactorRow({ factor }: { factor: ParishHealthFactor }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-950">{factor.label}</p>
          <p className="mt-1 text-sm leading-snug text-gray-700">{factor.reason}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Action: {factor.recommendedAction}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses(factor.tone)}`}>
            {factor.valueLabel}
          </span>
          <span className="text-xs font-semibold tabular-nums text-gray-500">
            -{factor.scoreImpact}/{factor.maxImpact}
          </span>
        </div>
      </div>
    </div>
  )
}

export function DashboardParishHealthScore({
  health,
  loading,
  dataUnavailable,
}: {
  health: ParishHealthScore
  loading: boolean
  dataUnavailable: boolean
}) {
  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="h-52 rounded-xl bg-gray-100" />
          <div className="h-52 rounded-xl bg-gray-100" />
        </div>
      </section>
    )
  }

  if (dataUnavailable) {
    return (
      <section className={vineaSectionShellClassName}>
        <div className={vineaEmptyStateClassName}>
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Operations Health Score could not load request signals. Try refreshing before using the score.
        </div>
      </section>
    )
  }

  return (
    <section className={vineaSectionShellClassName} aria-labelledby="parish-health-score-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Explainable operations health
          </p>
          <h2 id="parish-health-score-heading" className={`${sectionHeadingClassName} mt-1`}>
            Parish Health Score
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            A plain-English score based on visible follow-up, ownership, workflow, communication,
            document/checklist, date, and workload signals.
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${toneClasses(health.tone)}`}>
          {health.tone === 'healthy' ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Activity className="h-4 w-4" aria-hidden="true" />
          )}
          {health.label}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className={`rounded-xl border p-4 shadow-sm ${toneClasses(health.tone)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Today&apos;s score</p>
          <p className="mt-2 text-5xl font-bold tabular-nums">{health.score}</p>
          <div className="mt-3 h-2 rounded-full bg-white/80">
            <div
              className={`h-2 rounded-full ${scoreBarClass(health.tone)}`}
              style={{ width: `${health.score}%` }}
            />
          </div>
          <p className="mt-3 text-base font-semibold leading-snug">{health.headline}</p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{health.subline}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-950">Recommended next actions</h3>
          </div>
          {health.recommendations.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {health.recommendations.map((item) => (
                <div key={item.key} className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-snug text-gray-700">{item.detail}</p>
                  {item.href ? (
                    <Link href={item.href} className={`${secondaryButtonSm} mt-3`}>
                      Open related work
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-950">
              No major operational gaps are visible. Keep reviewing new requests and follow-up dates.
            </div>
          )}
        </div>
      </div>

      {health.recordsContinuityEmptyState ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-emerald-950">
                  {health.recordsContinuityEmptyState.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                {health.recordsContinuityEmptyState.detail}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                {health.recordsContinuityEmptyState.boundary}
              </p>
            </div>
            <span className="inline-flex shrink-0 rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900">
              {health.recordsContinuityEmptyState.statusLabel}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {health.factors.map((factor) => (
          <FactorRow key={factor.key} factor={factor} />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-950">Signal coverage</h3>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {health.coverageNotes.map((note) => (
            <div key={note.key} className="text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-gray-900">{note.label}:</span> {note.detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
