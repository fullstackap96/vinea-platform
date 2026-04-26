import { ClipboardList } from 'lucide-react'
import {
  isMissingConfirmedSchedule,
  type RequestScheduleRow,
  missingConfirmedScheduleCopy,
} from '@/lib/requestConfirmedSchedule'
import { primaryButtonMd } from '@/lib/buttonStyles'

/** Minimal `requests` fields used for next-step copy and in-page anchor routing. */
export type RequestNextStepRequestFields = {
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  next_follow_up_date?: unknown
  last_contacted_at?: unknown
  status?: unknown
  request_type?: unknown
}

export type RequestNextStepCardProps = {
  request: RequestNextStepRequestFields | null
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

export type RequestNextStepPriorityKey =
  | 'missing_assignment'
  | 'missing_first_contact'
  | 'missing_next_follow_up'
  | 'missing_confirmed_schedule'
  | 'checklist_incomplete'
  | 'ready_to_complete'

export type RequestNextStepDecision = {
  priorityKey: RequestNextStepPriorityKey
  title: string
  instruction: string
  targetSectionId:
    | 'assignment'
    | 'communication'
    | 'next-follow-up'
    | 'confirmed-time'
    | 'checklist'
    | 'completion'
  buttonLabel: string
  helperText: string
}

function scheduleMissingInstruction(requestType: unknown): string {
  const copy = missingConfirmedScheduleCopy(String(requestType ?? 'baptism'))
  const line = String(copy.followUpContextLine || '').trim()
  return line.startsWith('- ') ? line.slice(2) : line || 'There is no confirmed date/time set yet.'
}

/**
 * Strong Next Step engine for request detail workflow.
 * Returns title + instruction + target + button label + helper + priority key.
 */
export function resolveRequestNextStep(input: {
  request: RequestNextStepRequestFields | null | undefined
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
}): RequestNextStepDecision {
  const r = input.request ?? {}
  const staffBlank = isBlank(r.assigned_staff_name)
  const priestBlank = isBlank(r.assigned_priest_name)
  const deaconBlank = isBlank(r.assigned_deacon_name)
  const hasAssignment = !(staffBlank && priestBlank && deaconBlank)

  const missingFirstContact = isBlank(r.last_contacted_at)
  const missingNextFollowUp = isBlank(r.next_follow_up_date)
  const missingConfirmed = isMissingConfirmedSchedule(input.scheduleRow)

  if (!hasAssignment) {
    return {
      priorityKey: 'missing_assignment',
      title: 'Assign ownership',
      instruction: 'Assign a staff member, priest, or deacon to this request.',
      targetSectionId: 'assignment',
      buttonLabel: 'Assign now',
      helperText: 'Every request should have a clear owner before follow-up begins.',
    }
  }

  if (missingFirstContact) {
    return {
      priorityKey: 'missing_first_contact',
      title: 'Contact the family',
      instruction: 'Log the first communication with this family.',
      targetSectionId: 'communication',
      buttonLabel: 'Log communication',
      helperText: 'This creates a clear record of the first follow-up.',
    }
  }

  if (missingNextFollowUp) {
    return {
      priorityKey: 'missing_next_follow_up',
      title: 'Set next follow-up',
      instruction: 'Choose the next date staff should follow up.',
      targetSectionId: 'next-follow-up',
      buttonLabel: 'Set follow-up',
      helperText: 'This keeps the request from falling through the cracks.',
    }
  }

  if (missingConfirmed) {
    return {
      priorityKey: 'missing_confirmed_schedule',
      title: 'Confirm the schedule',
      instruction: scheduleMissingInstruction(r.request_type ?? input.scheduleRow.request_type),
      targetSectionId: 'confirmed-time',
      buttonLabel: 'Confirm date',
      helperText: 'A confirmed date allows staff to coordinate calendar details.',
    }
  }

  if (input.checklistIncomplete) {
    return {
      priorityKey: 'checklist_incomplete',
      title: 'Finish checklist',
      instruction: 'Complete the remaining checklist items for this request.',
      targetSectionId: 'checklist',
      buttonLabel: 'Review checklist',
      helperText: 'Checklist items help ensure nothing important is missed.',
    }
  }

  return {
    priorityKey: 'ready_to_complete',
    title: 'Ready to complete',
    instruction: 'This request appears ready to mark complete.',
    targetSectionId: 'completion',
    buttonLabel: 'Review completion',
    helperText: 'Review the record once more before closing it.',
  }
}

/**
 * Target section for the current next step (same priority as {@link resolveRequestNextStepDescription}).
 */
export function resolveNextStepAnchorId(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  return resolveRequestNextStep({
    request,
    scheduleRow,
    checklistIncomplete: false,
  }).targetSectionId
}

export function resolveRequestNextStepDescription(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  return resolveRequestNextStep({
    request,
    scheduleRow,
    checklistIncomplete: false,
  }).instruction
}

export function RequestNextStepCard({
  request,
  scheduleRow,
  checklistIncomplete,
}: RequestNextStepCardProps) {
  const nextStep = resolveRequestNextStep({ request, scheduleRow, checklistIncomplete })

  return (
    <section
      className="mb-7 sm:mb-10 rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50 to-white p-5 shadow-sm ring-1 ring-purple-200/30 sm:p-7"
      aria-labelledby="request-next-step-heading"
      aria-label={`Next step: ${nextStep.instruction}`}
    >
      <div className="flex gap-4 sm:gap-5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-700 shadow-sm ring-1 ring-purple-100"
          aria-hidden
        >
          <ClipboardList className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2
            id="request-next-step-heading"
            className="text-xs font-semibold uppercase tracking-wide text-purple-900/75"
          >
            Next Step • {nextStep.title}
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-snug text-gray-900 sm:text-base">
            {nextStep.instruction}
          </p>
          <p className="mt-2 text-xs text-purple-900/70">
            {nextStep.helperText}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
