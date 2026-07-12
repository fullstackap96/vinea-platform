'use client'

import Link from 'next/link'
import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type {
  OperationalIntelligenceBrief,
  OperationalIntelligenceInsight,
  OperationalIntelligenceTone,
} from '@/lib/operationalIntelligenceBrief'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function toneClasses(tone: OperationalIntelligenceTone): string {
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

function toneLabel(tone: OperationalIntelligenceTone): string {
  switch (tone) {
    case 'urgent':
      return 'Needs attention'
    case 'watch':
      return 'Watch'
    case 'healthy':
    default:
      return 'Steady'
  }
}

function InsightCard({ insight }: { insight: OperationalIntelligenceInsight }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-950">{insight.label}</p>
          <p className="mt-1 text-sm leading-snug text-gray-700">{insight.reason}</p>
        </div>
        <span className={`${chipBase} ${toneClasses(insight.tone)} shrink-0`}>
          {toneLabel(insight.tone)}: {insight.value}
        </span>
      </div>
      <p className="mt-3 text-sm leading-snug text-gray-700">
        <span className="font-semibold text-gray-950">Try next:</span>{' '}
        {insight.recommendedAction}
      </p>
      {insight.href ? (
        <Link href={insight.href} className={`${secondaryButtonSm} mt-3`}>
          Open related work
        </Link>
      ) : null}
    </article>
  )
}

export function DashboardOperationalIntelligenceBrief({
  brief,
  loading,
  dataUnavailable,
}: {
  brief: OperationalIntelligenceBrief
  loading: boolean
  dataUnavailable: boolean
}) {
  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-56 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="h-44 rounded-xl bg-gray-100" />
          <div className="h-44 rounded-xl bg-gray-100" />
        </div>
      </section>
    )
  }

  if (dataUnavailable) {
    return (
      <section className={vineaSectionShellClassName}>
        <div className={vineaEmptyStateClassName}>
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Operational intelligence could not load request signals. Try refreshing before using this
          brief.
        </div>
      </section>
    )
  }

  return (
    <section className={vineaSectionShellClassName} aria-labelledby="operational-intelligence-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Practical parish operations insight
          </p>
          <h2 id="operational-intelligence-heading" className={`${sectionHeadingClassName} mt-1`}>
            Where work is slowing down
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            A read-only brief that turns dashboard signals into plain next steps for staff and
            parish leaders.
          </p>
        </div>
        <span className={`${chipBase} border-sky-200 bg-sky-50 text-sky-950`}>
          Staff-reviewed guidance
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className={`rounded-xl border p-4 shadow-sm ${toneClasses(brief.primaryBottleneck.tone)}`}>
          <div className="flex items-center gap-2">
            {brief.primaryBottleneck.tone === 'healthy' ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            )}
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              First thing to notice
            </p>
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug">{brief.headline}</p>
          <p className="mt-2 text-sm leading-relaxed opacity-90">{brief.subline}</p>

          <div className="mt-4 rounded-lg border border-white/70 bg-white/75 p-3">
            <p className="text-sm font-semibold">{brief.primaryBottleneck.label}</p>
            <p className="mt-1 text-sm leading-snug opacity-90">{brief.primaryBottleneck.reason}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-950">Recommended next moves</h3>
          </div>
          <div className="mt-3 grid gap-2">
            {brief.nextActions.map((action) => (
              <div key={action.key} className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-sm font-semibold text-gray-950">{action.title}</p>
                <p className="mt-1 text-sm leading-snug text-gray-700">{action.detail}</p>
                {action.href ? (
                  <Link href={action.href} className={`${secondaryButtonSm} mt-3`}>
                    Review safely
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {brief.insights.map((insight) => (
          <InsightCard key={insight.key} insight={insight} />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-950">Safe-use boundaries</h3>
        </div>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gray-600">
          {brief.coverageNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
