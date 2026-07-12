import Link from 'next/link'
import { Pencil } from 'lucide-react'
import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { WorkflowSectionCard } from '@/app/dashboard/requests/[id]/_components/WorkflowSectionCard'
import { MassIntentionStatusBadge } from '../_components/MassIntentionStatusBadge'
import { massIntentionEditHref } from '@/lib/dashboardEntityNavigation'
import { formatMassIntentionDateDisplay } from '@/lib/massIntentions'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { maybeMissingValue } from '@/lib/missingValue'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

function yesNo(value: boolean) {
  return value ? 'Yes' : 'No'
}

export function MassIntentionDetailPage({
  intention,
  errorMessage,
  activeParishName,
}: {
  intention: MassIntentionRow | null
  errorMessage: string
  activeParishName: string | null
}) {
  if (errorMessage || !intention) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/intentions"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Back to Mass intentions
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Intention not found.'}
        </div>
      </main>
    )
  }

  const requestedDisplay = formatMassIntentionDateDisplay(intention.requested_date)
  const massDisplay = formatMassIntentionDateDisplay(intention.assigned_mass_date)

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/intentions"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          Back to Mass intentions
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {activeParishName ? (
            <p className="mb-2 text-sm font-medium text-gray-600">
              Scoped to {activeParishName}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <MassIntentionStatusBadge isFulfilled={intention.is_fulfilled} />
            {intention.stipend_received ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80">
                Stipend received
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl break-words">
            {intention.requester_name}
          </h1>
        </div>
        <Link
          href={massIntentionEditHref(intention.id)}
          className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          Edit
        </Link>
      </header>

      <div className="space-y-6">
        <WorkflowSectionCard title="Intention" description="Text to be offered at Mass.">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {intention.intention_text}
          </p>
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Scheduling" description="Requested and assigned Mass dates.">
          <LabelValueGrid>
            <LabelValueRow
              label="Requested date"
              value={requestedDisplay ? requestedDisplay : maybeMissingValue('Not set')}
            />
            <LabelValueRow
              label="Assigned Mass"
              value={massDisplay ? massDisplay : maybeMissingValue('Not set')}
            />
            <LabelValueRow
              label="Assigned priest"
              value={maybeMissingValue(assignmentDisplayLabel(intention.assigned_priest_name))}
            />
          </LabelValueGrid>
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Stipend & status">
          <LabelValueGrid>
            <LabelValueRow label="Stipend received" value={yesNo(intention.stipend_received)} />
            <LabelValueRow label="Fulfilled" value={yesNo(intention.is_fulfilled)} />
          </LabelValueGrid>
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Notes">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {displayValue(intention.notes)}
          </p>
        </WorkflowSectionCard>
      </div>
    </main>
  )
}
