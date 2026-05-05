import {
  isMissingConfirmedSchedule,
  missingConfirmedScheduleCopy,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import {
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
  todayCalendarDateString,
} from '@/lib/nextFollowUpDate'
import { isStaffUnassignedForAttention } from '@/lib/needsAttention'
import { normalizeRequestWaitingOn, requestWaitingOnLabel } from '@/lib/requestWaitingOn'

/** Default: same as dashboard `FOLLOWUP_STALE_MS` (7 days). */
export const DEFAULT_FOLLOW_UP_STALE_MS = 7 * 24 * 60 * 60 * 1000

/** Calendar buckets for `next_follow_up_date` (date-only semantics). */
export const DUE_SOON_WINDOW_CALENDAR_DAYS = 3

export type FollowUpEngineStatus =
  | 'on_track'
  | 'due_soon'
  | 'due_today'
  | 'overdue'
  | 'unassigned'
  | 'waiting'
  | 'ready_to_complete'

export type FollowUpEngineUrgency = 'low' | 'medium' | 'high' | 'critical'

export type SmartFollowUpDashboardRow = {
  status?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  confirmed_baptism_date?: unknown
  last_contacted_at?: unknown
  request_type?: unknown
  checklist_incomplete?: unknown
  funeral_detail?: { confirmed_service_at?: unknown } | null
  wedding_detail?: { confirmed_ceremony_at?: unknown } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
}

export type SmartFollowUpEvaluation = {
  followUpStatus: FollowUpEngineStatus
  label: string
  description: string
  urgency: FollowUpEngineUrgency
  recommendedAction: string
  /** Lower = sort earlier (more attention), aligned with `needsAttentionPriorityRank` spirit. */
  sortPriority: number
}

function calendarDaysAhead(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split('-').map(Number)
  const [ty, tm, td] = toYmd.split('-').map(Number)
  const a = new Date(fy, fm - 1, fd)
  const b = new Date(ty, tm - 1, td)
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

function lastContactedMs(value: unknown): number | null {
  const t = new Date(String(value ?? '')).getTime()
  return Number.isNaN(t) ? null : t
}

function isContactStale(
  lastContactedAt: unknown,
  staleMs: number,
  now: Date
): boolean {
  const t = lastContactedMs(lastContactedAt)
  if (t === null) return true
  return now.getTime() - t >= staleMs
}

function priestLooksUnassigned(assignedPriestName: unknown): boolean {
  const s = String(assignedPriestName ?? '').trim()
  if (!s) return true
  if (s.toLowerCase() === 'unassigned') return true
  return false
}

export type EvaluateSmartFollowUpOptions = {
  now?: Date
  /** Staleness threshold for “needs touchpoint” (default 7 days). */
  followUpStaleMs?: number
}

/**
 * Smart Follow-Up Engine — single evaluation for a dashboard request row.
 * Uses the same primitives as the dashboard follow-up queue (`nextFollowUpDate`, `needsAttention`, `requestConfirmedSchedule`, `waiting_on`).
 */
export function evaluateSmartFollowUp(
  row: SmartFollowUpDashboardRow,
  options?: EvaluateSmartFollowUpOptions
): SmartFollowUpEvaluation {
  const now = options?.now ?? new Date()
  const staleMs = options?.followUpStaleMs ?? DEFAULT_FOLLOW_UP_STALE_MS

  const status = String(row.status ?? '').trim()
  const requestType = requestTypeFromRow(row)
  const waitingKey = normalizeRequestWaitingOn(row.waiting_on)
  const waitingLabel = waitingKey ? requestWaitingOnLabel(waitingKey) : null
  const staffUnassigned = isStaffUnassignedForAttention(row.assigned_staff_name)
  const priestUnassigned = priestLooksUnassigned(row.assigned_priest_name)
  const missingConfirmed = isMissingConfirmedSchedule(row as RequestScheduleRow)
  const scheduleCopy = missingConfirmedScheduleCopy(requestType)
  const checklistIncomplete = Boolean(row.checklist_incomplete)
  const staleContact = isContactStale(row.last_contacted_at, staleMs, now)

  const nextYmd = parseFollowUpCalendarDate(row.next_follow_up_date)
  const todayYmd = todayCalendarDateString(now)
  const overdue = isNextFollowUpOverdue(row.next_follow_up_date, row.status, now)
  const dueToday = isNextFollowUpDueToday(row.next_follow_up_date, row.status, now)
  const daysAhead =
    nextYmd && nextYmd > todayYmd ? calendarDaysAhead(todayYmd, nextYmd) : null
  const dueSoon =
    Boolean(nextYmd && nextYmd > todayYmd) &&
    daysAhead !== null &&
    daysAhead >= 1 &&
    daysAhead <= DUE_SOON_WINDOW_CALENDAR_DAYS

  if (status === 'complete') {
    return {
      followUpStatus: 'ready_to_complete',
      label: 'Complete',
      description: 'This request is marked complete; no follow-up work remains.',
      urgency: 'low',
      recommendedAction: 'Archive or review for reporting only.',
      sortPriority: 900,
    }
  }

  if (overdue) {
    const bits: string[] = [`Next follow-up was scheduled for ${nextYmd} and is now overdue.`]
    if (waitingLabel) bits.push(`Waiting on: ${waitingLabel}.`)
    if (staffUnassigned) bits.push('No staff assignee is set.')
    if (missingConfirmed) bits.push(scheduleCopy.followUpContextLine.replace(/^-+\s*/, ''))
    if (checklistIncomplete) bits.push('Parish checklist items are still open.')
    const urgency: FollowUpEngineUrgency =
      missingConfirmed || staffUnassigned ? 'critical' : 'high'
    let sortPriority = 12
    if (missingConfirmed) sortPriority -= 4
    if (staffUnassigned) sortPriority -= 3
    if (checklistIncomplete) sortPriority -= 1
    return {
      followUpStatus: 'overdue',
      label: 'Follow-up overdue',
      description: bits.join(' '),
      urgency,
      recommendedAction:
        'Contact the family, update the follow-up date, or clear blockers—then log contact.',
      sortPriority,
    }
  }

  if (dueToday) {
    const bits: string[] = ['Next follow-up date is today.']
    if (waitingLabel) bits.push(`Waiting on: ${waitingLabel}.`)
    if (staffUnassigned) bits.push('Staff assignee is still empty.')
    return {
      followUpStatus: 'due_today',
      label: 'Due today',
      description: bits.join(' '),
      urgency: staffUnassigned || waitingLabel ? 'high' : 'medium',
      recommendedAction: 'Work the touchpoint today or reschedule the follow-up date.',
      sortPriority: staffUnassigned ? 40 : 45,
    }
  }

  if (waitingKey && waitingLabel) {
    return {
      followUpStatus: 'waiting',
      label: 'Waiting on external party',
      description: `Progress depends on: ${waitingLabel}.${nextYmd ? ` Next staff follow-up: ${nextYmd}.` : ''}`,
      urgency: dueSoon || staleContact ? 'high' : 'medium',
      recommendedAction:
        waitingKey === 'parish_staff_action'
          ? 'Complete the parish-side task or update what you are waiting on.'
          : 'Nudge the party you are waiting on, or document the next internal check-in.',
      sortPriority: staleContact ? 52 : 58,
    }
  }

  if (staffUnassigned) {
    const bits: string[] = ['No staff member is assigned to own this request.']
    if (priestUnassigned && (requestType === 'wedding' || requestType === 'funeral'))
      bits.push('Priest assignee is also not set—clarify who will cover the liturgy.')
    if (missingConfirmed) bits.push(scheduleCopy.followUpContextLine.replace(/^-+\s*/, ''))
    if (staleContact) bits.push('Last contact is older than the usual follow-up window.')
    return {
      followUpStatus: 'unassigned',
      label: 'Unassigned staff',
      description: bits.join(' '),
      urgency: missingConfirmed || staleContact ? 'high' : 'medium',
      recommendedAction: 'Assign a staff owner and confirm who will shepherd the family.',
      sortPriority: missingConfirmed ? 50 : 55,
    }
  }

  if (dueSoon && nextYmd) {
    const bits: string[] = [
      `Follow-up is coming up (${nextYmd}; within ${DUE_SOON_WINDOW_CALENDAR_DAYS} calendar days).`,
    ]
    if (missingConfirmed) bits.push(scheduleCopy.followUpContextLine.replace(/^-+\s*/, ''))
    return {
      followUpStatus: 'due_soon',
      label: 'Due soon',
      description: bits.join(' '),
      urgency: missingConfirmed || checklistIncomplete ? 'high' : 'medium',
      recommendedAction: missingConfirmed
        ? 'Confirm the schedule on the calendar, then touch base with the family.'
        : 'Prepare the next touchpoint before the follow-up date arrives.',
      sortPriority: missingConfirmed ? 62 : 65,
    }
  }

  // on_track: open request, no higher-priority bucket matched
  const trackBits: string[] = []
  if (nextYmd && nextYmd > todayYmd && !dueSoon) {
    trackBits.push(`Next follow-up is scheduled for ${nextYmd}.`)
  } else if (!nextYmd) {
    trackBits.push('No next follow-up date is set yet.')
  }
  if (missingConfirmed) trackBits.push(scheduleCopy.followUpContextLine.replace(/^-+\s*/, ''))
  if (checklistIncomplete) trackBits.push('Some checklist items are still incomplete.')
  if (staleContact) trackBits.push('Last contact is older than the usual follow-up window.')
  if (trackBits.length === 0) {
    trackBits.push('Request is open; nothing in the automated follow-up engine is flagging risk.')
  }

  let urgency: FollowUpEngineUrgency = 'low'
  if (missingConfirmed || checklistIncomplete) urgency = 'high'
  else if (staleContact) urgency = 'medium'

  let sortPriority = 75
  if (missingConfirmed) sortPriority = 68
  else if (checklistIncomplete) sortPriority = 70
  else if (staleContact) sortPriority = 72

  let recommendedAction = 'Keep the request moving; update dates and notes as things change.'
  if (missingConfirmed) {
    recommendedAction = 'Set a confirmed date or session time, then communicate it to the family.'
  } else if (checklistIncomplete) {
    recommendedAction = 'Finish open checklist items or document why they are deferred.'
  } else if (staleContact) {
    recommendedAction = 'Send a brief check-in or log contact so the thread stays warm.'
  }

  return {
    followUpStatus: 'on_track',
    label: 'On track',
    description: trackBits.join(' '),
    urgency,
    recommendedAction,
    sortPriority,
  }
}
