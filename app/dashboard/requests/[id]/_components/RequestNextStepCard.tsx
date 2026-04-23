import { ClipboardList } from 'lucide-react'
import {
  isMissingConfirmedSchedule,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'

/** Minimal `requests` fields used for next-step copy and in-page anchor routing. */
export type RequestNextStepRequestFields = {
  assigned_staff_name?: unknown
  next_follow_up_date?: unknown
  last_contacted_at?: unknown
}

export type RequestNextStepCardProps = {
  request: RequestNextStepRequestFields | null
  scheduleRow: RequestScheduleRow
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

/**
 * Target section for the current next step (same priority as {@link resolveRequestNextStepDescription}).
 */
export function resolveNextStepAnchorId(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  const r = request ?? {}
  if (isBlank(r.assigned_staff_name)) {
    return 'assignment'
  }
  if (isBlank(r.next_follow_up_date)) {
    return 'next-follow-up'
  }
  if (isMissingConfirmedSchedule(scheduleRow)) {
    return 'confirmed-time'
  }
  if (isBlank(r.last_contacted_at)) {
    return 'send-email'
  }
  return 'communication'
}

export function resolveRequestNextStepDescription(
  request: RequestNextStepRequestFields | null | undefined,
  scheduleRow: RequestScheduleRow
): string {
  if (isBlank(request?.assigned_staff_name)) {
    return 'Assign a staff member to this request'
  }

  if (isBlank(request?.next_follow_up_date)) {
    return 'Set a follow-up date to stay on track'
  }

  if (isMissingConfirmedSchedule(scheduleRow)) {
    return 'Confirm the date/time for this request'
  }

  if (isBlank(request?.last_contacted_at)) {
    return 'Send your first message to this person'
  }

  return "You're on track. Continue managing this request."
}

export function RequestNextStepCard({ request, scheduleRow }: RequestNextStepCardProps) {
  const description = resolveRequestNextStepDescription(request, scheduleRow)
  const anchorId = resolveNextStepAnchorId(request, scheduleRow)

  return (
    <a
      href={`#${anchorId}`}
      className="mb-6 sm:mb-8 block cursor-pointer rounded-xl border border-purple-200/80 bg-purple-50 p-4 text-inherit no-underline shadow-sm transition-colors duration-150 hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 sm:p-5"
      aria-label={`Next step: ${description}`}
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
    </a>
  )
}
