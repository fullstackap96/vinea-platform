import {
  isMissingConfirmedSchedule,
  type RequestScheduleRow,
  missingConfirmedScheduleCopy,
} from '@/lib/requestConfirmedSchedule'
import { isNextFollowUpDueToday, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import {
  normalizeRequestWaitingOn,
  REQUEST_WAITING_ON_LABELS,
  type RequestWaitingOnValue,
} from '@/lib/requestWaitingOn'

/** Stale contact window aligned with dashboard follow-up queue (`FOLLOWUP_STALE_MS`). */
export const WORKFLOW_STALE_CONTACT_MS = 7 * 24 * 60 * 60 * 1000

export type WorkflowUrgency = 'low' | 'medium' | 'high' | 'overdue'

export type WorkflowSectionAnchor =
  | 'assignment'
  | 'communication'
  | 'next-follow-up'
  | 'confirmed-time'
  | 'checklist'
  | 'completion'
  | 'send-email'
  | 'internal-notes'

export type WorkflowPriorityKey =
  | 'completed'
  | 'missing_assignment'
  | 'missing_first_contact'
  | 'missing_next_follow_up'
  | 'overdue_follow_up'
  | 'follow_up_due_today'
  | 'missing_confirmed_schedule'
  | 'stale_family_contact'
  | 'checklist_incomplete'
  | 'ready_to_complete'
  | 'waiting_on_family_response'
  | 'waiting_on_priest_availability'
  | 'waiting_on_documents'
  | 'waiting_on_date_confirmation'
  | 'waiting_on_parish_staff_action'
  | 'waiting_on_payment_or_stipend'
  | 'waiting_on_godparent_paperwork'
  | 'waiting_on_marriage_prep_documents'
  | 'waiting_on_other'

export type RequestWorkflowV2Input = {
  request: {
    status?: unknown
    request_type?: unknown
    assigned_staff_name?: unknown
    assigned_priest_name?: unknown
    assigned_deacon_name?: unknown
    next_follow_up_date?: unknown
    last_contacted_at?: unknown
    /** Operational wait reason (`requests.waiting_on`). */
    waiting_on?: unknown
  } | null | undefined
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
  /** When true, checklist gaps do not drive the next step (legacy anchor helpers). */
  pretendChecklistComplete?: boolean
  now?: Date
}

export type RequestWorkflowV2Result = {
  priorityKey: WorkflowPriorityKey
  /** Short headline for the step */
  nextStepTitle: string
  /** What staff should do */
  nextStepDescription: string
  /** Why this step was chosen (tooltips, dashboard cues) */
  reason: string
  urgency: WorkflowUrgency
  recommendedActionLabel: string
  sectionAnchor: WorkflowSectionAnchor
  helperText: string
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

function toTime(value: unknown): number | null {
  if (value == null || value === '') return null
  const d = new Date(String(value))
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

function hasAssignment(request: NonNullable<RequestWorkflowV2Input['request']>): boolean {
  const staffBlank = isBlank(request.assigned_staff_name)
  const priestBlank = isBlank(request.assigned_priest_name)
  const deaconBlank = isBlank(request.assigned_deacon_name)
  return !(staffBlank && priestBlank && deaconBlank)
}

export function requestTypeNeedsConfirmedSchedule(requestType: unknown): boolean {
  const t = String(requestType || 'baptism').toLowerCase()
  return t === 'baptism' || t === 'funeral' || t === 'wedding' || t === 'ocia'
}

function scheduleMissingForType(
  requestType: unknown,
  scheduleRow: RequestScheduleRow
): boolean {
  if (!requestTypeNeedsConfirmedSchedule(requestType)) return false
  return isMissingConfirmedSchedule(scheduleRow)
}

function scheduleMissingInstruction(requestType: unknown): string {
  const copy = missingConfirmedScheduleCopy(String(requestType ?? 'baptism'))
  const line = String(copy.followUpContextLine || '').trim()
  return line.startsWith('- ') ? line.slice(2) : line || 'There is no confirmed date/time set yet.'
}

/** Build {@link RequestScheduleRow} from a dashboard request row (merged detail tables). */
export function dashboardRequestScheduleRow(request: {
  request_type?: unknown
  confirmed_baptism_date?: unknown
  funeral_detail?: { confirmed_service_at?: unknown } | null
  wedding_detail?: { confirmed_ceremony_at?: unknown } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
}): RequestScheduleRow {
  return {
    request_type: request.request_type as string | null | undefined,
    confirmed_baptism_date: request.confirmed_baptism_date as string | null | undefined,
    funeral_detail: request.funeral_detail
      ? {
          confirmed_service_at: request.funeral_detail.confirmed_service_at as
            | string
            | null
            | undefined,
        }
      : null,
    wedding_detail: request.wedding_detail
      ? {
          confirmed_ceremony_at: request.wedding_detail.confirmed_ceremony_at as
            | string
            | null
            | undefined,
        }
      : null,
    ocia_detail: request.ocia_detail
      ? {
          confirmed_session_at: request.ocia_detail.confirmed_session_at as
            | string
            | null
            | undefined,
        }
      : null,
  }
}

export function requestWorkflowDetailHref(
  requestId: string,
  anchor: WorkflowSectionAnchor
): string {
  return `/dashboard/requests/${encodeURIComponent(requestId)}#${anchor}`
}

/** Lower sort value = more urgent */
export function workflowUrgencyRank(urgency: WorkflowUrgency): number {
  switch (urgency) {
    case 'overdue':
      return 0
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'low':
      return 3
    default:
      return 4
  }
}

export const workflowUrgencyLabel: Record<WorkflowUrgency, string> = {
  overdue: 'Overdue',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

/** Compact chip styles for list rows (dashboard). */
export function workflowUrgencyChipClassName(urgency: WorkflowUrgency): string {
  switch (urgency) {
    case 'overdue':
      return 'border border-rose-200/90 bg-rose-50 text-rose-950'
    case 'high':
      return 'border border-amber-200/90 bg-amber-50 text-amber-950'
    case 'medium':
      return 'border border-sky-200/90 bg-sky-50 text-sky-950'
    case 'low':
      return 'border border-gray-200/90 bg-slate-50 text-gray-800'
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200'
  }
}

function workflowResultForWaitingOn(value: RequestWaitingOnValue): RequestWorkflowV2Result {
  switch (value) {
    case 'family_response':
      return {
        priorityKey: 'waiting_on_family_response',
        nextStepTitle: 'Waiting on the family',
        nextStepDescription:
          'Follow up by email or phone when appropriate, or update this tag when the family responds.',
        reason: 'Staff tagged this request as waiting on a response or information from the family.',
        urgency: 'medium',
        recommendedActionLabel: 'Send follow-up',
        sectionAnchor: 'send-email',
        helperText: 'Clear or change “Waiting on” when you are no longer blocked on the family.',
      }
    case 'priest_availability':
      return {
        priorityKey: 'waiting_on_priest_availability',
        nextStepTitle: 'Waiting on priest availability',
        nextStepDescription:
          'Coordinate internally so a priest can be assigned or confirmed for the next step.',
        reason: 'Staff tagged this request as waiting on priest availability.',
        urgency: 'high',
        recommendedActionLabel: 'Review assignment',
        sectionAnchor: 'assignment',
        helperText: 'Update assignment or internal notes as availability becomes clear.',
      }
    case 'documents':
      return {
        priorityKey: 'waiting_on_documents',
        nextStepTitle: 'Waiting on documents',
        nextStepDescription:
          'Track required documents; log contact when you request or receive them.',
        reason: 'Staff tagged this request as waiting on documents from the family or third parties.',
        urgency: 'medium',
        recommendedActionLabel: 'Log contact',
        sectionAnchor: 'communication',
        helperText: 'Use communication history to record document requests and receipts.',
      }
    case 'date_confirmation':
      return {
        priorityKey: 'waiting_on_date_confirmation',
        nextStepTitle: 'Waiting on date confirmation',
        nextStepDescription:
          'Finalize the confirmed date and time with the family, then record it on this request.',
        reason: 'Staff tagged this request as waiting on confirmation of a date or time.',
        urgency: 'medium',
        recommendedActionLabel: 'Confirm schedule',
        sectionAnchor: 'confirmed-time',
        helperText:
          'Once confirmed, update the schedule fields so calendars and checklists stay accurate.',
      }
    case 'parish_staff_action':
      return {
        priorityKey: 'waiting_on_parish_staff_action',
        nextStepTitle: 'Waiting on parish staff',
        nextStepDescription:
          'An internal parish action is needed before the family workflow can move forward.',
        reason: 'Staff tagged this request as waiting on action from the parish team.',
        urgency: 'high',
        recommendedActionLabel: 'Add internal note',
        sectionAnchor: 'internal-notes',
        helperText: 'Use internal notes to coordinate who will take the next staff-side step.',
      }
    case 'payment_or_stipend':
      return {
        priorityKey: 'waiting_on_payment_or_stipend',
        nextStepTitle: 'Waiting on payment or stipend',
        nextStepDescription:
          'Follow parish policy for stipends or fees; log contact when payment is arranged or received.',
        reason: 'Staff tagged this request as waiting on payment or a stipend.',
        urgency: 'medium',
        recommendedActionLabel: 'Log contact',
        sectionAnchor: 'communication',
        helperText:
          'Record relevant communication about fees without putting sensitive payment details in email subject lines.',
      }
    case 'godparent_paperwork':
      return {
        priorityKey: 'waiting_on_godparent_paperwork',
        nextStepTitle: 'Waiting on godparent paperwork',
        nextStepDescription:
          'Ensure sponsor forms and godparent requirements are collected and filed.',
        reason: 'Staff tagged this request as waiting on godparent or sponsor paperwork.',
        urgency: 'medium',
        recommendedActionLabel: 'Review checklist',
        sectionAnchor: 'checklist',
        helperText: 'Checklist items can track sponsor documentation milestones.',
      }
    case 'marriage_prep_documents':
      return {
        priorityKey: 'waiting_on_marriage_prep_documents',
        nextStepTitle: 'Waiting on marriage prep documents',
        nextStepDescription:
          'Track marriage preparation forms and certificates required before the wedding.',
        reason: 'Staff tagged this request as waiting on marriage preparation documents.',
        urgency: 'medium',
        recommendedActionLabel: 'Review checklist',
        sectionAnchor: 'checklist',
        helperText: 'Align checklist items with your parish marriage preparation checklist.',
      }
    case 'other':
      return {
        priorityKey: 'waiting_on_other',
        nextStepTitle: 'Waiting on external or other item',
        nextStepDescription:
          'Review internal notes and follow up when the blocking item clears.',
        reason: 'Staff tagged this request as waiting on something outside the standard list.',
        urgency: 'medium',
        recommendedActionLabel: 'Set follow-up',
        sectionAnchor: 'next-follow-up',
        helperText: 'Use internal notes to spell out what “other” means for the team.',
      }
  }
}

function withWaitingOnHelperText(
  result: RequestWorkflowV2Result,
  waitingOnRaw: unknown
): RequestWorkflowV2Result {
  const w = normalizeRequestWaitingOn(waitingOnRaw)
  if (!w) return result
  if (String(result.priorityKey).startsWith('waiting_on_')) return result
  if (result.priorityKey === 'completed') return result
  const label = REQUEST_WAITING_ON_LABELS[w]
  const tag = ` Tagged as waiting on: ${label}.`
  if (result.helperText.includes('Tagged as waiting on:')) return result
  return { ...result, helperText: `${result.helperText}${tag}` }
}

/**
 * V2 workflow brain: one place for next step, reason, urgency, CTA label, and detail-page hash.
 */
export function resolveRequestWorkflowV2(input: RequestWorkflowV2Input): RequestWorkflowV2Result {
  const now = input.now ?? new Date()
  const r = input.request ?? {}
  const status = String(r.status ?? '').trim()
  const checklistIncomplete =
    input.pretendChecklistComplete === true ? false : input.checklistIncomplete
  const requestType = r.request_type ?? input.scheduleRow.request_type

  if (status === 'complete') {
    return {
      priorityKey: 'completed',
      nextStepTitle: 'Request complete',
      nextStepDescription:
        'This intake is marked complete. You can still review the record or adjust anything if needed.',
      reason: 'Status is set to complete.',
      urgency: 'low',
      recommendedActionLabel: 'View completion',
      sectionAnchor: 'completion',
      helperText: 'Completed requests stay searchable for your records.',
    }
  }

  if (!hasAssignment(r)) {
    const urgency: WorkflowUrgency = status === 'new' ? 'high' : 'medium'
    return withWaitingOnHelperText(
      {
        priorityKey: 'missing_assignment',
        nextStepTitle: 'Assign ownership',
        nextStepDescription: 'Assign a staff member, priest, or deacon to this request.',
        reason: 'No staff member, priest, or deacon is assigned yet.',
        urgency,
        recommendedActionLabel: 'Assign now',
        sectionAnchor: 'assignment',
        helperText: 'Every request should have a clear owner before follow-up begins.',
      },
      r.waiting_on
    )
  }

  if (isBlank(r.last_contacted_at)) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'missing_first_contact',
        nextStepTitle: 'Contact the family',
        nextStepDescription: 'Log the first communication with this family.',
        reason: 'No communication has been logged yet.',
        urgency: 'high',
        recommendedActionLabel: 'Log communication',
        sectionAnchor: 'communication',
        helperText: 'This creates a clear record of the first follow-up.',
      },
      r.waiting_on
    )
  }

  if (isBlank(r.next_follow_up_date)) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'missing_next_follow_up',
        nextStepTitle: 'Set next follow-up',
        nextStepDescription: 'Choose the next date staff should follow up.',
        reason: 'A next follow-up date is not set.',
        urgency: 'medium',
        recommendedActionLabel: 'Set follow-up',
        sectionAnchor: 'next-follow-up',
        helperText: 'This keeps the request from falling through the cracks.',
      },
      r.waiting_on
    )
  }

  if (isNextFollowUpOverdue(r.next_follow_up_date, r.status, now)) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'overdue_follow_up',
        nextStepTitle: 'Catch up on follow-up',
        nextStepDescription:
          'The planned follow-up date has passed. Reach out to the family or set a new follow-up date.',
        reason: 'The next follow-up date is before today.',
        urgency: 'overdue',
        recommendedActionLabel: 'Update follow-up',
        sectionAnchor: 'next-follow-up',
        helperText: 'Clearing overdue follow-ups keeps families from feeling forgotten.',
      },
      r.waiting_on
    )
  }

  if (isNextFollowUpDueToday(r.next_follow_up_date, r.status, now)) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'follow_up_due_today',
        nextStepTitle: 'Follow-up due today',
        nextStepDescription: 'Plan contact or update the follow-up before the day ends.',
        reason: 'The next follow-up date is today.',
        urgency: 'high',
        recommendedActionLabel: 'Act on follow-up',
        sectionAnchor: 'next-follow-up',
        helperText: 'Same-day follow-up protects momentum with the family.',
      },
      r.waiting_on
    )
  }

  if (scheduleMissingForType(requestType, input.scheduleRow)) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'missing_confirmed_schedule',
        nextStepTitle: 'Confirm the schedule',
        nextStepDescription: scheduleMissingInstruction(requestType),
        reason: 'This sacrament type still needs a confirmed date or time on file.',
        urgency: 'medium',
        recommendedActionLabel: 'Confirm date',
        sectionAnchor: 'confirmed-time',
        helperText: 'A confirmed date allows staff to coordinate calendar details.',
      },
      r.waiting_on
    )
  }

  const last = toTime(r.last_contacted_at)
  const waiting = normalizeRequestWaitingOn(r.waiting_on)
  if (
    last !== null &&
    now.getTime() - last >= WORKFLOW_STALE_CONTACT_MS &&
    waiting === 'family_response'
  ) {
    return workflowResultForWaitingOn('family_response')
  }

  if (last !== null && now.getTime() - last >= WORKFLOW_STALE_CONTACT_MS) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'stale_family_contact',
        nextStepTitle: 'Check in with the family',
        nextStepDescription:
          'There has been no recorded contact in the last seven days. Log a touchpoint or note why a pause is OK.',
        reason: 'Last contact was more than a week ago.',
        urgency: 'medium',
        recommendedActionLabel: 'Log contact',
        sectionAnchor: 'communication',
        helperText: 'Regular contact helps families feel supported through the process.',
      },
      r.waiting_on
    )
  }

  if (checklistIncomplete) {
    return withWaitingOnHelperText(
      {
        priorityKey: 'checklist_incomplete',
        nextStepTitle: 'Finish checklist',
        nextStepDescription: 'Complete the remaining checklist items for this request.',
        reason: 'One or more checklist items are still open.',
        urgency: 'low',
        recommendedActionLabel: 'Review checklist',
        sectionAnchor: 'checklist',
        helperText: 'Checklist items help ensure nothing important is missed.',
      },
      r.waiting_on
    )
  }

  if (waiting) {
    return workflowResultForWaitingOn(waiting)
  }

  return {
    priorityKey: 'ready_to_complete',
    nextStepTitle: 'Ready to complete',
    nextStepDescription: 'This request appears ready to mark complete.',
    reason:
      'Assignment, contact, follow-up, schedule (if required), and checklist all look satisfied.',
    urgency: 'low',
    recommendedActionLabel: 'Review completion',
    sectionAnchor: 'completion',
    helperText: 'Review the record once more before closing it.',
  }
}
