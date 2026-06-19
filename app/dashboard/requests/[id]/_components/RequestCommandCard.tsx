'use client'

import { ArrowRight, CheckCircle2, ClipboardList, TriangleAlert } from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type { RequestFirstReview } from '@/lib/requestFirstReview'
import type { RequestHandoffBrief } from '@/lib/requestHandoffBrief'
import {
  workflowUrgencyChipClassName,
  workflowUrgencyLabel,
  type WorkflowSectionAnchor,
} from '@/lib/requestWorkflowV2'
import type { RequestNextStepDecision } from './RequestNextStepCard'

type CommandRequirement = {
  key: string
  label: string
  ok: boolean
  missingText: string
  jumpTo: string
}

type Props = {
  nextStep: RequestNextStepDecision
  firstReview: RequestFirstReview
  handoffBrief: RequestHandoffBrief
  completionRequirements: readonly CommandRequirement[]
  followUpDisplay: string
  canMarkComplete: boolean
  onNavigateToSection: (sectionId: string) => void
  onMarkComplete: () => void
}

function commandToneClass(urgency: RequestNextStepDecision['urgency']): string {
  if (urgency === 'overdue') return 'border-rose-300 bg-rose-50'
  if (urgency === 'high') return 'border-amber-300 bg-amber-50'
  return 'border-brand/20 bg-brand-muted/30'
}

function toneIcon(urgency: RequestNextStepDecision['urgency']) {
  if (urgency === 'overdue' || urgency === 'high') {
    return <TriangleAlert className="h-5 w-5" aria-hidden />
  }
  return <ClipboardList className="h-5 w-5" aria-hidden />
}

export function RequestCommandCard({
  nextStep,
  firstReview,
  handoffBrief,
  completionRequirements,
  followUpDisplay,
  canMarkComplete,
  onNavigateToSection,
  onMarkComplete,
}: Props) {
  const missingRequirements = completionRequirements.filter((item) => !item.ok)
  const missingDetails = firstReview.missingDetails.slice(0, 4)
  const jumpTargets = completionRequirements.slice(0, 5)

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ring-1 ring-gray-900/[0.03] sm:p-6 ${commandToneClass(
        nextStep.urgency
      )}`}
      aria-labelledby="request-command-card-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
            aria-hidden
          >
            {toneIcon(nextStep.urgency)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-command-card-heading"
                className="text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Request command card
              </h2>
              <span
                className={`${chipBase} text-[10px] uppercase ${workflowUrgencyChipClassName(
                  nextStep.urgency
                )}`}
              >
                {workflowUrgencyLabel[nextStep.urgency]}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold leading-snug text-gray-950">
              {nextStep.nextStepDescription}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
              <span className="font-semibold text-gray-900">Why: </span>
              {nextStep.reason}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToSection(nextStep.sectionAnchor as WorkflowSectionAnchor)}
          className={`${primaryButtonMd} w-full justify-center gap-2 lg:w-auto`}
        >
          {nextStep.recommendedActionLabel}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stage</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {nextStep.nextStepTitle}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {handoffBrief.ownerLine}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Blocked by</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {handoffBrief.blockerLine}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Follow-up
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {followUpDisplay}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.75fr)]">
        <div className="rounded-xl border border-gray-200 bg-white/85 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Check before moving on
          </p>
          {missingDetails.length > 0 || missingRequirements.length > 0 ? (
            <ul className="mt-3 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
              {[...missingDetails, ...missingRequirements.map((item) => item.missingText)]
                .slice(0, 6)
                .map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              No major missing details are showing right now.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white/85 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Jump to section
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {jumpTargets.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigateToSection(item.jumpTo)}
                className={`${secondaryButtonSm} gap-2`}
              >
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                ) : null}
                {item.label.replace('?', '')}
              </button>
            ))}
            <button
              type="button"
              onClick={onMarkComplete}
              disabled={!canMarkComplete}
              className={`${secondaryButtonSm} gap-2`}
            >
              {canMarkComplete ? <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden /> : null}
              Completion
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
