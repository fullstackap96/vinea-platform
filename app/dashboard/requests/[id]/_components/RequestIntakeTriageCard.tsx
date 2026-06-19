'use client'

import { ArrowRight, ClipboardList, Siren, UserCheck } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type { IntakeTriageResult, IntakeTriageStatus } from '@/lib/intakeTriage'

function statusTone(status: IntakeTriageStatus): string {
  switch (status) {
    case 'urgent_pastoral_contact':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'needs_review':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'ready_to_start':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function statusIcon(status: IntakeTriageStatus) {
  if (status === 'urgent_pastoral_contact') return <Siren className="h-5 w-5" aria-hidden />
  if (status === 'ready_to_start') return <UserCheck className="h-5 w-5" aria-hidden />
  return <ClipboardList className="h-5 w-5" aria-hidden />
}

export function RequestIntakeTriageCard({
  triage,
  onNavigateToSection,
}: {
  triage: IntakeTriageResult
  onNavigateToSection: (sectionId: string) => void
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${statusTone(triage.status)}`}
      aria-labelledby="request-intake-triage-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
            aria-hidden
          >
            {statusIcon(triage.status)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-intake-triage-heading"
                className="text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Intake triage
              </h2>
              <span className={`${chipBase} border bg-white/80 text-[10px] uppercase`}>
                {triage.label}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {triage.headline}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{triage.summary}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToSection(triage.actionSectionId)}
          className={`${primaryButtonMd} w-full justify-center gap-2 lg:w-auto`}
        >
          {triage.suggestedAction}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/80 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Suggested owner
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {triage.suggestedOwner}
          </p>
        </div>
        <div className="rounded-xl border border-white/80 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            First action
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-900">
            {triage.suggestedAction}
          </p>
        </div>
      </div>

      {triage.missingDetails.length > 0 ? (
        <div className="mt-4 rounded-xl border border-white/80 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Check these before intake is clear
          </p>
          <ul className="mt-2 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
            {triage.missingDetails.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" aria-hidden />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
