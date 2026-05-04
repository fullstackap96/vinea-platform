import { ClipboardList } from 'lucide-react'
import { type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import { chipBase } from '@/lib/chipStyles'
import { primaryButtonMd } from '@/lib/buttonStyles'
import {
  resolveRequestWorkflowV2,
  type RequestWorkflowV2Input,
  type RequestWorkflowV2Result,
  workflowUrgencyChipClassName,
  workflowUrgencyLabel,
  type WorkflowPriorityKey,
  type WorkflowSectionAnchor,
} from '@/lib/requestWorkflowV2'

/** Fields used from `requests` for workflow resolution (null = no row yet). */
export type RequestNextStepRequestFields = NonNullable<RequestWorkflowV2Input['request']>

export type RequestNextStepCardProps = {
  request: RequestNextStepRequestFields | null
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
}

export type RequestNextStepPriorityKey = WorkflowPriorityKey

/** Backward-compatible shape: includes V2 fields plus legacy aliases used in JSX. */
export type RequestNextStepDecision = RequestWorkflowV2Result & {
  title: string
  instruction: string
  targetSectionId: WorkflowSectionAnchor
  buttonLabel: string
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

/**
 * Target section for the current next step (checklist ignored so anchors stay on the
 * earliest pipeline gap).
 */
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

export function RequestNextStepCard({
  request,
  scheduleRow,
  checklistIncomplete,
}: RequestNextStepCardProps) {
  const nextStep = resolveRequestNextStep({ request, scheduleRow, checklistIncomplete })
  const urgencyClass = workflowUrgencyChipClassName(nextStep.urgency)
  const urgencyReadable = workflowUrgencyLabel[nextStep.urgency]

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
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {nextStep.buttonLabel}
        </a>
      </div>
    </section>
  )
}
