'use client'

import Link from 'next/link'
import { ClipboardList, Eye, ShieldCheck } from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { DailyOfficeHandoffDigest } from '@/lib/dailyOfficeHandoffDigest'
import {
  buildDailyOfficeHandoffSavedViewPlan,
  type DailyOfficeHandoffSavedViewPlan,
} from '@/lib/dailyOfficeHandoffSavedViews'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

const approvedSavedViewLabels =
  'Front desk opening view, Sacramental records handoff view, and Administrator closeout view'

export function DashboardDailyOfficeHandoffSavedViews({
  dailyOfficeHandoffDigest,
  loading,
  dataUnavailable,
  activeParishName,
}: {
  dailyOfficeHandoffDigest: DailyOfficeHandoffDigest
  loading: boolean
  dataUnavailable: boolean
  activeParishName: string | null
}) {
  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-60 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 rounded-xl bg-gray-100" />
          ))}
        </div>
      </section>
    )
  }

  if (dataUnavailable) {
    return (
      <section className={vineaSectionShellClassName}>
        <div className={vineaEmptyStateClassName}>
          Handoff saved-view guidance could not load because dashboard signals are unavailable.
        </div>
      </section>
    )
  }

  const plan: DailyOfficeHandoffSavedViewPlan = buildDailyOfficeHandoffSavedViewPlan({
    digest: dailyOfficeHandoffDigest,
  })

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="daily-office-handoff-saved-views-heading"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="sr-only">{approvedSavedViewLabels}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Read-only handoff lenses
          </p>
          <h2
            id="daily-office-handoff-saved-views-heading"
            className={`${sectionHeadingClassName} mt-1`}
          >
            Daily office handoff saved-view presets
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            {activeParishName
              ? `Built from the existing Daily Office Handoff Digest for the selected active parish, ${activeParishName}.`
              : 'Built from the existing Daily Office Handoff Digest for the active parish.'}{' '}
            These are staff-reviewed queues, not saved preferences.
          </p>
        </div>
        <span className={`${chipBase} border-emerald-200 bg-emerald-50 text-emerald-950`}>
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          No automation
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-sky-950">{plan.summary}</p>
            <p className="mt-1 text-sm leading-relaxed text-sky-900">
              Use a preset as a plain-English lens for the next staff handoff. Nothing is
              persisted, filtered automatically, or sent from this card.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.presets.map((preset) => (
          <article key={preset.key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-950">{preset.label}</h3>
                <p className="mt-1 text-xs leading-snug text-gray-600">{preset.whenToUse}</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {preset.plainEnglishPurpose}
            </p>
            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                Handoff rhythm
              </p>
              <ol className="mt-2 space-y-1 text-sm leading-snug text-amber-950">
                {preset.reviewRhythm.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <Link href={preset.recommendedQueueHref} className={`${secondaryButtonSm} mt-3`}>
              Open staff-reviewed queues
            </Link>

            {preset.cues.length > 0 ? (
              <div className="mt-3 space-y-2">
                {preset.cues.map((cue) => (
                  <div key={cue.key} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-sm font-semibold text-gray-950">{cue.title}</p>
                      <span className={`${chipBase} border-gray-200 bg-gray-50 text-gray-700`}>
                        {cue.priority === 'urgent' ? 'Review first' : 'Watch today'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-gray-700">{cue.detail}</p>
                    <p className="mt-2 text-sm leading-snug text-gray-700">
                      <span className="font-semibold text-gray-950">Staff handoff:</span>{' '}
                      {cue.staffAction}
                    </p>
                    {cue.href ? (
                      <Link href={cue.href} className={`${secondaryButtonSm} mt-3`}>
                        Open cue queue
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-950">
                <span className="font-semibold">No handoff cue:</span> {preset.emptyState} This
                calm empty state keeps the preset visible without adding work.
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-950">Read-only staff-reviewed boundary</h3>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gray-600">
          {plan.coverageNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
