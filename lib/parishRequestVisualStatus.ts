import {
  hasConfirmedSchedule,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { needsAttentionEligible } from '@/lib/needsAttention'
import { requestTypeNeedsConfirmedSchedule } from '@/lib/requestWorkflowV2'
import {
  normalizeRequestWaitingOn,
  REQUEST_WAITING_ON_LABELS,
} from '@/lib/requestWaitingOn'

/** Staff-facing status (derived from DB status + workflow signals). */
export type ParishVisualStatusKey =
  | 'completed'
  | 'follow_up_overdue'
  | 'action_required'
  | 'waiting_on_hold'
  | 'waiting_on_family'
  | 'scheduled'
  | 'new_request'
  | 'in_progress'

export type ParishRequestVisualStatusInput = {
  status?: unknown
  next_follow_up_date?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  request_type?: unknown
  /** `requests.waiting_on` — operational wait reason. */
  waiting_on?: unknown
  scheduleRow?: RequestScheduleRow | null
  now?: Date
}

export type ParishRequestVisualStatus = {
  key: ParishVisualStatusKey
  label: string
  description: string
  /** Tailwind classes for the pill (border + bg + text); pair with {@link REQUEST_STATUS_BADGE_BASE}. */
  badgeSurfaceClassName: string
}

const LABELS: Record<ParishVisualStatusKey, string> = {
  completed: 'Completed',
  follow_up_overdue: 'Follow-Up Overdue',
  action_required: 'Action Required',
  waiting_on_hold: 'Waiting On',
  waiting_on_family: 'Waiting on Family',
  scheduled: 'Scheduled',
  new_request: 'New Request',
  in_progress: 'In Progress',
}

const DESCRIPTIONS: Record<ParishVisualStatusKey, string> = {
  completed: 'This request is closed and fully handled.',
  follow_up_overdue:
    'The follow-up date on this request has passed. Reach out to the family or set a new date.',
  action_required:
    'Something needs attention soon: follow-up is due today, or no staff member is assigned yet.',
  waiting_on_hold:
    'Staff tagged what this request is waiting on (family, documents, priest availability, etc.).',
  waiting_on_family: 'You are waiting on information or a response from the family.',
  scheduled: 'A confirmed date or time is on file for this sacrament or meeting.',
  new_request: 'This intake was just submitted and still needs a first review.',
  in_progress: 'Staff are actively working this request.',
}

/** Border + background + text (no layout / padding). */
const SURFACE: Record<ParishVisualStatusKey, string> = {
  completed: 'border-emerald-300/70 bg-emerald-100/80 text-emerald-950',
  follow_up_overdue: 'border-rose-400/75 bg-rose-100/90 text-rose-950 shadow-sm shadow-rose-900/5',
  action_required: 'border-orange-300/75 bg-orange-100/90 text-orange-950',
  waiting_on_hold: 'border-indigo-300/70 bg-indigo-100/80 text-indigo-950',
  waiting_on_family: 'border-violet-300/70 bg-violet-100/80 text-violet-950',
  scheduled: 'border-teal-300/70 bg-teal-100/80 text-teal-950',
  new_request: 'border-sky-300/70 bg-sky-100/80 text-sky-950',
  in_progress: 'border-amber-300/70 bg-amber-100/80 text-amber-950',
}

export function resolveParishRequestVisualStatus(
  input: ParishRequestVisualStatusInput
): ParishRequestVisualStatus {
  const now = input.now ?? new Date()
  const db = String(input.status ?? '').trim()
  const scheduleRow: RequestScheduleRow =
    input.scheduleRow ??
    ({
      request_type:
        input.request_type == null || input.request_type === ''
          ? null
          : String(input.request_type),
    } as RequestScheduleRow)

  const attentionLike: Parameters<typeof needsAttentionEligible>[0] = {
    status: input.status,
    next_follow_up_date: input.next_follow_up_date,
    assigned_staff_name: input.assigned_staff_name,
  }

  const overdue = isNextFollowUpOverdue(input.next_follow_up_date, input.status, now)

  const pick = (key: ParishVisualStatusKey): ParishRequestVisualStatus => ({
    key,
    label: LABELS[key],
    description: DESCRIPTIONS[key],
    badgeSurfaceClassName: SURFACE[key],
  })

  if (db === 'complete') {
    return pick('completed')
  }

  if (overdue) {
    return pick('follow_up_overdue')
  }

  if (needsAttentionEligible(attentionLike) && !overdue) {
    return pick('action_required')
  }

  const waitingCol = normalizeRequestWaitingOn(input.waiting_on)
  if (waitingCol) {
    const label = REQUEST_WAITING_ON_LABELS[waitingCol]
    return {
      key: 'waiting_on_hold',
      label: `Waiting on: ${label}`,
      description: `Staff tagged this request as waiting on ${label.toLowerCase()}.`,
      badgeSurfaceClassName: SURFACE.waiting_on_hold,
    }
  }

  if (db === 'waiting_on_family') {
    return pick('waiting_on_family')
  }

  if (db === 'new') {
    return pick('new_request')
  }

  const rt = input.request_type ?? scheduleRow.request_type
  if (requestTypeNeedsConfirmedSchedule(rt) && hasConfirmedSchedule(scheduleRow)) {
    return pick('scheduled')
  }

  if (db === 'in_progress') {
    return pick('in_progress')
  }

  return pick('in_progress')
}
