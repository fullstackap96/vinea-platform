'use client'

import { ArrowRight, CheckCircle2, Circle, ClipboardList } from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import type { RequestPlaybookProgress, RequestPlaybookStep } from '@/lib/requestPlaybookProgress'

type Props = {
  progress: RequestPlaybookProgress
  onNavigateToSection: (sectionId: string) => void
}

function StepRow({
  step,
  onNavigateToSection,
}: {
  step: RequestPlaybookStep
  onNavigateToSection: (sectionId: string) => void
}) {
  const icon = step.complete ? (
    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
  ) : (
    <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
  )

  return (
    <li className="flex gap-2.5">
      {icon}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${step.complete ? 'text-gray-600' : 'font-medium text-gray-950'}`}>
          {step.label}
        </p>
        {!step.complete ? (
          <button
            type="button"
            onClick={() => onNavigateToSection(step.anchor)}
            className="mt-1 text-xs font-semibold text-blue-800 underline decoration-blue-800/50 underline-offset-2 hover:text-blue-950"
          >
            Go to section
          </button>
        ) : null}
      </div>
    </li>
  )
}

export function RequestPlaybookProgressPanel({ progress, onNavigateToSection }: Props) {
  const nextStep = progress.nextStep

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03] sm:p-6"
      aria-labelledby="request-playbook-progress-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-brand ring-1 ring-brand/15"
            aria-hidden
          >
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pastoral workflow playbook
            </p>
            <h2
              id="request-playbook-progress-heading"
              className="mt-1 text-lg font-bold leading-snug text-gray-950"
            >
              {progress.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-700">
              {progress.description}
            </p>
          </div>
        </div>
        <div className="min-w-[9rem] rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-left lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Progress</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
            {progress.completionPercent}%
          </p>
          <p className="text-xs font-medium text-gray-600">
            {progress.completeCount} of {progress.totalCount} done
          </p>
        </div>
      </div>

      {nextStep ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                Recommended next action
              </p>
              <p className="mt-1 text-base font-semibold text-gray-950">{nextStep.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{nextStep.helper}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToSection(nextStep.anchor)}
              className={`${primaryButtonMd} w-full shrink-0 gap-2 md:w-auto`}
            >
              Go to next step
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            This playbook looks complete. Review completion when the office is ready to close it.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {progress.phases.map((phase) => (
          <div key={phase.name} className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-950">{phase.name}</h3>
              <span className="text-xs font-semibold tabular-nums text-gray-500">
                {phase.completeCount}/{phase.totalCount}
              </span>
            </div>
            <ul className="mt-3 space-y-3">
              {phase.steps.map((step) => (
                <StepRow
                  key={step.key}
                  step={step}
                  onNavigateToSection={onNavigateToSection}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onNavigateToSection('checklist')}
          className={secondaryButtonSm}
        >
          Review checklist
        </button>
        <button
          type="button"
          onClick={() => onNavigateToSection('communication')}
          className={secondaryButtonSm}
        >
          Log communication
        </button>
        <button
          type="button"
          onClick={() => onNavigateToSection('next-follow-up')}
          className={secondaryButtonSm}
        >
          Set follow-up
        </button>
      </div>
    </section>
  )
}
