import { hasConfirmedSchedule } from '@/lib/requestConfirmedSchedule'
import {
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import {
  resolveRequestWorkflowV2,
  requestTypeNeedsConfirmedSchedule,
  WORKFLOW_STALE_CONTACT_MS,
  type RequestWorkflowV2Input,
} from '@/lib/requestWorkflowV2'

export type RequestDetailQuickAction = {
  key: string
  label: string
  /** Hash only, e.g. `#assignment` */
  href: string
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

type Candidate = RequestDetailQuickAction & { sort: number }

/**
 * One primary action (aligned with {@link resolveRequestWorkflowV2}) and up to three
 * secondary jumps for the request detail page.
 */
export function getRequestDetailSmartQuickActions(input: {
  workflowInput: RequestWorkflowV2Input
  canMarkComplete: boolean
  hasRecipientEmail: boolean
  now?: Date
}): { primary: RequestDetailQuickAction; secondary: RequestDetailQuickAction[] } {
  const now = input.now ?? new Date()
  const workflow = resolveRequestWorkflowV2(input.workflowInput)
  const primaryHref = `#${workflow.sectionAnchor}`

  let primaryLabel = workflow.recommendedActionLabel
  if (workflow.priorityKey === 'ready_to_complete' && input.canMarkComplete) {
    primaryLabel = 'Mark complete'
  }
  if (workflow.priorityKey === 'completed') {
    primaryLabel = 'View completion'
  }

  const primary: RequestDetailQuickAction = {
    key: `primary:${workflow.priorityKey}`,
    label: primaryLabel,
    href: primaryHref,
  }

  const r = input.workflowInput.request ?? {}
  const status = String(r.status ?? '').trim()
  if (status === 'complete') {
    return { primary, secondary: [] }
  }

  const scheduleRow = input.workflowInput.scheduleRow
  const requestType = r.request_type ?? scheduleRow.request_type
  const assigned = hasAssignment(r as NonNullable<RequestWorkflowV2Input['request']>)
  const scheduleMissing =
    requestTypeNeedsConfirmedSchedule(requestType) && !hasConfirmedSchedule(scheduleRow)

  const fu = parseFollowUpCalendarDate(r.next_follow_up_date)
  const overdue = isNextFollowUpOverdue(r.next_follow_up_date, r.status, now)
  const dueToday = isNextFollowUpDueToday(r.next_follow_up_date, r.status, now)
  const followUpNeedsWork = !fu || overdue || dueToday

  const last = toTime(r.last_contacted_at)
  const staleContact =
    last !== null && now.getTime() - last >= WORKFLOW_STALE_CONTACT_MS
  const contactNeedsWork = isBlank(r.last_contacted_at) || staleContact

  const candidates: Candidate[] = []

  if (!assigned) {
    candidates.push({ key: 'assign', label: 'Assign staff', href: '#assignment', sort: 10 })
  }
  if (primaryHref !== '#ai-tools') {
    candidates.push({ key: 'draft', label: 'Draft reply', href: '#ai-tools', sort: 20 })
  }
  if (input.hasRecipientEmail && primaryHref !== '#send-email') {
    candidates.push({
      key: 'send',
      label: 'Send follow-up',
      href: '#send-email',
      sort: 30,
    })
  }
  if (scheduleMissing && primaryHref !== '#confirmed-time') {
    candidates.push({ key: 'schedule', label: 'Add schedule', href: '#confirmed-time', sort: 40 })
  }
  if (followUpNeedsWork && primaryHref !== '#next-follow-up') {
    candidates.push({
      key: 'followup',
      label: overdue ? 'Update follow-up' : 'Set follow-up',
      href: '#next-follow-up',
      sort: 50,
    })
  }
  if (contactNeedsWork && primaryHref !== '#communication') {
    candidates.push({ key: 'contact', label: 'Log contact', href: '#communication', sort: 60 })
  }
  if (input.workflowInput.checklistIncomplete && primaryHref !== '#checklist') {
    candidates.push({ key: 'checklist', label: 'Review checklist', href: '#checklist', sort: 70 })
  }
  if (primaryHref !== '#internal-notes') {
    candidates.push({
      key: 'note',
      label: 'Internal note',
      href: '#internal-notes',
      sort: 80,
    })
  }
  if (input.canMarkComplete && primaryHref !== '#completion') {
    candidates.push({ key: 'complete', label: 'Mark complete', href: '#completion', sort: 90 })
  }

  const secondary = candidates
    .filter((c) => c.href !== primaryHref)
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3)
    .map(({ key, label, href }) => ({ key, label, href }))

  return { primary, secondary }
}
