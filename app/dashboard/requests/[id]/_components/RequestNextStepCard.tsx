import { ClipboardList } from 'lucide-react'
import {
  isMissingConfirmedSchedule,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'

export type RequestNextStepCardProps = {
  assignedStaffName: unknown
  nextFollowUpDate: unknown
  lastContactedAt: unknown
  scheduleRow: RequestScheduleRow
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

export function resolveRequestNextStepDescription(
  props: RequestNextStepCardProps
): string {
  if (isBlank(props.assignedStaffName)) {
    return 'Assign a staff member to this request'
  }

  if (isBlank(props.nextFollowUpDate)) {
    return 'Set a follow-up date to stay on track'
  }

  if (isMissingConfirmedSchedule(props.scheduleRow)) {
    return 'Confirm the date/time for this request'
  }

  if (isBlank(props.lastContactedAt)) {
    return 'Send your first message to this person'
  }

  return "You're on track. Continue managing this request."
}

export function RequestNextStepCard(props: RequestNextStepCardProps) {
  const description = resolveRequestNextStepDescription(props)

  return (
    <div
      className="mb-6 sm:mb-8 rounded-xl border border-purple-200/80 bg-purple-50 p-4 shadow-sm sm:p-5"
      role="region"
      aria-labelledby="request-next-step-heading"
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-purple-700 shadow-sm ring-1 ring-purple-100"
          aria-hidden
        >
          <ClipboardList className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2
            id="request-next-step-heading"
            className="text-xs font-semibold uppercase tracking-wide text-purple-900/75"
          >
            Next Step
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-snug text-gray-900 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
