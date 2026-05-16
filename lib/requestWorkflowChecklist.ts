import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import {
  hasConfirmedSchedule,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { requestTypeNeedsConfirmedSchedule } from '@/lib/requestWorkflowV2'

export type WorkflowChecklistItemState = 'complete' | 'incomplete' | 'not_applicable'

export type WorkflowChecklistItem = {
  key: string
  label: string
  state: WorkflowChecklistItemState
  /** Section id for hash link when incomplete (no `#` prefix). */
  sectionId?: string
  detail?: string
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

function hasStaffAssignment(request: {
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
}): boolean {
  return (
    !isBlank(request.assigned_staff_name) ||
    !isBlank(request.assigned_priest_name) ||
    !isBlank(request.assigned_deacon_name)
  )
}

export type RequestWorkflowChecklistInput = {
  request: {
    status?: unknown
    request_type?: unknown
    assigned_staff_name?: unknown
    assigned_priest_name?: unknown
    assigned_deacon_name?: unknown
    next_follow_up_date?: unknown
    last_contacted_at?: unknown
  } | null
  scheduleRow: RequestScheduleRow
  hasRecipientEmail: boolean
}

/**
 * Parish-friendly workflow checklist for the request detail page.
 */
export function buildRequestWorkflowChecklist(
  input: RequestWorkflowChecklistInput
): WorkflowChecklistItem[] {
  const request = input.request
  const status = String(request?.status ?? '').trim()
  const requestType = requestTypeFromRow({
    request_type: request?.request_type ?? input.scheduleRow.request_type,
  })
  const scheduleRequired = requestTypeNeedsConfirmedSchedule(requestType)
  const hasFollowUp = Boolean(parseFollowUpCalendarDate(request?.next_follow_up_date))
  const hasContact = !isBlank(request?.last_contacted_at)
  const isComplete = status === 'complete'

  const items: WorkflowChecklistItem[] = [
    {
      key: 'received',
      label: 'Request received',
      state: request ? 'complete' : 'incomplete',
      sectionId: request ? undefined : 'request-details',
    },
    {
      key: 'assigned',
      label: 'Staff assigned',
      state: request && hasStaffAssignment(request) ? 'complete' : 'incomplete',
      sectionId: 'assignment',
    },
    {
      key: 'first_contact',
      label: 'First contact made',
      state: hasContact ? 'complete' : 'incomplete',
      sectionId: 'communication',
    },
    {
      key: 'follow_up',
      label: 'Follow-up date set',
      state: hasFollowUp ? 'complete' : 'incomplete',
      sectionId: 'next-follow-up',
    },
  ]

  if (scheduleRequired) {
    items.push({
      key: 'scheduled',
      label: 'Date scheduled',
      state: hasConfirmedSchedule(input.scheduleRow) ? 'complete' : 'incomplete',
      sectionId: 'confirmed-time',
    })
  } else {
    items.push({
      key: 'scheduled',
      label: 'Date scheduled',
      state: 'not_applicable',
      detail: 'Not required for this request type',
    })
  }

  if (input.hasRecipientEmail || hasContact) {
    items.push({
      key: 'final_communication',
      label: 'Final communication sent',
      state: isComplete && hasContact ? 'complete' : 'incomplete',
      sectionId: input.hasRecipientEmail ? 'send-email' : 'communication',
    })
  } else {
    items.push({
      key: 'final_communication',
      label: 'Final communication sent',
      state: 'not_applicable',
      detail: 'No email on file — log contact when you reach the family',
    })
  }

  items.push({
    key: 'completed',
    label: 'Request completed',
    state: isComplete ? 'complete' : 'incomplete',
    sectionId: 'completion',
  })

  return items
}
