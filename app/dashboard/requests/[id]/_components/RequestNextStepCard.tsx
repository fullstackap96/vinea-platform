'use client'

import { ArrowRight, ClipboardList } from 'lucide-react'
import { type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import { chipBase } from '@/lib/chipStyles'
import { primaryButtonMd } from '@/lib/buttonStyles'
import {
  getRequestDetailSmartQuickActions,
  type RequestDetailQuickAction,
} from '@/lib/requestDetailQuickActions'
import type { RequestWorkflowV2Input } from '@/lib/requestWorkflowV2'
import {
  resolveRequestWorkflowV2,
  type RequestWorkflowV2Result,
  workflowUrgencyChipClassName,
  type WorkflowPriorityKey,
  type WorkflowSectionAnchor,
  type WorkflowUrgency,
} from '@/lib/requestWorkflowV2'
import { RequestWorkflowActionButton } from './RequestWorkflowActionButton'

/** Fields used from `requests` for workflow resolution (null = no row yet). */
export type RequestNextStepRequestFields = NonNullable<RequestWorkflowV2Input['request']>

export type RequestNextStepCardProps = {
  request: RequestNextStepRequestFields | null
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
  variant?: 'default' | 'dominant'
  canMarkComplete?: boolean
  hasRecipientEmail?: boolean
  onMarkComplete?: () => void
}

export type RequestNextStepPriorityKey = WorkflowPriorityKey

/** Backward-compatible shape: includes V2 fields plus legacy aliases used in JSX. */
export type RequestNextStepDecision = RequestWorkflowV2Result & {
  title: string
  instruction: string
  targetSectionId: WorkflowSectionAnchor
  buttonLabel: string
}

const urgencyFriendlyLabel: Record<WorkflowUrgency, string> = {
  overdue: 'Urgent — act today',
  high: 'Important',
  medium: 'Do soon',
  low: 'When you can',
}

function toLegacyDecision(v: RequestWorkflowV2Result): RequestNextStepDecision {
  return {
    ...v,
    title: v.nextStepTitle,
    instruction: v.nextStepDescription,
    targetSectionId: v.sectionAnchor,
    buttonLabel: v.recommendedActionLabel,
  }
}

export function resolveRequestNextStep(input: {
  request: RequestNextStepRequestFields | null | undefined
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
}): RequestNextStepDecision {
  return toLegacyDecision(
    resolveRequestWorkflowV2({
      request: input.request,
      scheduleRow: input.scheduleRow,
      checklistIncomplete: input.checklistIncomplete,
    })
  )
}

export function resolveNextStepAnchorId(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  return resolveRequestWorkflowV2({
    request,
    scheduleRow,
    checklistIncomplete: false,
    pretendChecklistComplete: true,
  }).sectionAnchor
}

export function resolveRequestNextStepDescription(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  return resolveRequestWorkflowV2({
    request,
    scheduleRow,
    checklistIncomplete: false,
    pretendChecklistComplete: true,
  }).nextStepDescription
}

export { resolveRequestWorkflowV2 } from '@/lib/requestWorkflowV2'

function DominantNextStepCard({
  nextStep,
  primary,
  secondary,
  isComplete,
  onMarkComplete,
}: {
  nextStep: RequestNextStepDecision
  primary: RequestDetailQuickAction
  secondary: RequestDetailQuickAction[]
  isComplete: boolean
  onMarkComplete?: () => void
}) {
  const urgencyClass = workflowUrgencyChipClassName(nextStep.urgency)
  const urgencyLabel = urgencyFriendlyLabel[nextStep.urgency]

  return (
    <section
      id="next-step"
      className="rounded-2xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50 via-white to-white p-5 shadow-md ring-2 ring-violet-900/[0.06] sm:p-7"
      aria-labelledby="request-dominant-next-step-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm sm:h-14 sm:w-14"
            aria-hidden
          >
            <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
              What to do now
            </p>
            <h2
              id="request-dominant-next-step-heading"
              className="mt-1 text-xl font-bold leading-snug text-gray-900 sm:text-2xl"
            >
              {nextStep.instruction}
            </h2>
            <p className="mt-1 text-sm font-medium text-violet-900/90">{nextStep.title}</p>
          </div>
        </div>
        <span
          className={`${chipBase} shrink-0 self-start px-3 py-1.5 text-xs font-semibold ${urgencyClass}`}
        >
          {urgencyLabel}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-violet-100/80 bg-white/80 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-sm leading-relaxed text-gray-800">
          <span className="font-semibold text-gray-900">Why it matters: </span>
          {nextStep.reason}
        </p>
        {nextStep.helperText ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{nextStep.helperText}</p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <RequestWorkflowActionButton
          action={primary}
          variant="primary"
          onMarkComplete={onMarkComplete}
          isComplete={isComplete}
        />
        {secondary.length > 0 ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Other helpful actions"
          >
            {secondary.slice(0, 2).map((action) => (
              <RequestWorkflowActionButton key={action.key} action={action} variant="secondary" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function DefaultNextStepCard({ nextStep }: { nextStep: RequestNextStepDecision }) {
  const urgencyClass = workflowUrgencyChipClassName(nextStep.urgency)
  const urgencyReadable = urgencyFriendlyLabel[nextStep.urgency]

  return (
    <section
      className="mb-8 sm:mb-10 rounded-2xl border border-violet-200/50 bg-gradient-to-b from-violet-50/40 via-white to-white p-6 shadow-sm ring-1 ring-violet-900/[0.04] sm:p-8"
      aria-labelledby="request-next-step-heading"
      aria-label={`Next step: ${nextStep.instruction}`}
    >
      <div className="flex gap-4 sm:gap-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-800 shadow-sm ring-1 ring-violet-100"
          aria-hidden
        >
          <ClipboardList className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="request-next-step-heading"
              className="text-xs font-semibold uppercase tracking-wide text-violet-900/80"
            >
              Next step · {nextStep.title}
            </h2>
            <span className={`${chipBase} text-[10px] uppercase ${urgencyClass}`}>
              {urgencyReadable}
            </span>
          </div>
          <p className="mt-2 text-base font-medium leading-snug text-gray-900 sm:text-lg">
            {nextStep.instruction}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            <span className="font-medium text-gray-700">Why: </span>
            {nextStep.reason}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-violet-900/75">{nextStep.helperText}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={`#${nextStep.targetSectionId}`}
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          {nextStep.buttonLabel}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      </div>
    </section>
  )
}

export function RequestNextStepCard({
  request,
  scheduleRow,
  checklistIncomplete,
  variant = 'default',
  canMarkComplete = false,
  hasRecipientEmail = false,
  onMarkComplete,
}: RequestNextStepCardProps) {
  const nextStep = resolveRequestNextStep({ request, scheduleRow, checklistIncomplete })
  const isComplete = String(request?.status ?? '').trim() === 'complete'

  if (variant === 'dominant') {
    const workflowInput: RequestWorkflowV2Input = {
      request,
      scheduleRow,
      checklistIncomplete,
    }
    const { primary, secondary } = getRequestDetailSmartQuickActions({
      workflowInput,
      canMarkComplete,
      hasRecipientEmail,
    })

    return (
      <DominantNextStepCard
        nextStep={nextStep}
        primary={primary}
        secondary={secondary}
        isComplete={isComplete}
        onMarkComplete={onMarkComplete}
      />
    )
  }

  return <DefaultNextStepCard nextStep={nextStep} />
}
