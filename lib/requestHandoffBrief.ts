import {
  formatNextFollowUpDateDisplay,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
} from '@/lib/nextFollowUpDate'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { formatRequestType } from '@/lib/formatRequestType'
import { type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { evaluateAtRiskRequest } from '@/lib/atRiskRequest'
import {
  resolveRequestWorkflowV2,
  workflowUrgencyLabel,
  type WorkflowSectionAnchor,
} from '@/lib/requestWorkflowV2'

export type RequestHandoffBriefTone = 'urgent' | 'warning' | 'steady' | 'muted'

export type RequestHandoffBriefItem = {
  key: string
  label: string
  value: string
  tone: RequestHandoffBriefTone
}

export type RequestHandoffBriefRequest = {
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  waiting_on_changed_at?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
} | null | undefined

export type RequestHandoffBriefInput = {
  request: RequestHandoffBriefRequest
  scheduleRow: RequestScheduleRow
  checklistIncomplete: boolean
  remainingChecklistCount: number
  notesCount?: number
  communicationsCount?: number
  now?: Date
  funeralDetail?: { deceased_name?: unknown } | null
  weddingDetail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
}

export type RequestHandoffBrief = {
  title: string
  nextAction: string
  nextActionLabel: string
  nextActionHref: string
  handoffNote: string
  urgencyLabel: string
  urgencyTone: RequestHandoffBriefTone
  statusLine: string
  ownerLine: string
  blockerLine: string
  followUpLine: string
  checklistLine: string
  riskLine: string
  careLine: string
  contextLine: string
  items: RequestHandoffBriefItem[]
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function daysSince(value: unknown, now: Date): number | null {
  const raw = text(value)
  if (!raw) return null
  const time = new Date(raw).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, Math.floor((now.getTime() - time) / (24 * 60 * 60 * 1000)))
}

function plural(count: number, singular: string, pluralLabel = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralLabel}`
}

function ownerLine(request: NonNullable<RequestHandoffBriefRequest>): string {
  const staff = text(request.assigned_staff_name)
  const priest = text(request.assigned_priest_name)
  const deacon = text(request.assigned_deacon_name)
  const parts = [
    staff ? `Staff: ${assignmentDisplayLabel(staff)}` : '',
    priest ? `Priest: ${assignmentDisplayLabel(priest)}` : '',
    deacon ? `Deacon: ${assignmentDisplayLabel(deacon)}` : '',
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' | ') : 'No owner assigned yet.'
}

function urgencyTone(urgency: string): RequestHandoffBriefTone {
  if (urgency === 'overdue') return 'urgent'
  if (urgency === 'high') return 'warning'
  if (urgency === 'medium') return 'steady'
  return 'muted'
}

function followUpLine(request: NonNullable<RequestHandoffBriefRequest>, now: Date): string {
  const formatted = formatNextFollowUpDateDisplay(request.next_follow_up_date)
  if (!formatted) return 'No next follow-up date set.'
  if (isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) {
    return `Past due: ${formatted}.`
  }
  if (isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)) {
    return `Due today: ${formatted}.`
  }
  return `Next follow-up: ${formatted}.`
}

function blockerLine(request: NonNullable<RequestHandoffBriefRequest>, now: Date): string {
  const blocker = requestWaitingOnLabel(request.waiting_on)
  if (!blocker) return 'No blocker recorded.'
  const age = daysSince(request.waiting_on_changed_at, now)
  return age == null
    ? `Waiting on: ${blocker}.`
    : `Waiting on: ${blocker} for ${plural(age, 'day')}.`
}

function careLine(request: NonNullable<RequestHandoffBriefRequest>, communicationsCount: number, now: Date): string {
  const lastContactDays = daysSince(request.last_contacted_at, now)
  if (lastContactDays == null) {
    return communicationsCount > 0
      ? `${plural(communicationsCount, 'communication')} logged; no last-contact date set.`
      : 'No logged family contact yet.'
  }
  const contactLabel =
    lastContactDays === 0 ? 'Last contact was today.' : `Last contact was ${plural(lastContactDays, 'day')} ago.`
  return communicationsCount > 0
    ? `${contactLabel} ${plural(communicationsCount, 'communication')} logged.`
    : contactLabel
}

function buildHandoffNote(input: {
  title: string
  requestType: string
  owner: string
  blocker: string
  nextAction: string
  followUp: string
  care: string
  checklist: string
  risk: string
  context: string
}): string {
  return [
    `Handoff: ${input.requestType} request for ${input.title}`,
    '',
    `Owner: ${input.owner}`,
    `Blocker: ${input.blocker}`,
    `Next action: ${input.nextAction}`,
    `Follow-up: ${input.followUp}`,
    `Care history: ${input.care}`,
    `Checklist: ${input.checklist}`,
    `Risk: ${input.risk}`,
    `Context: ${input.context}`,
  ].join('\n')
}

export function buildRequestHandoffBrief(input: RequestHandoffBriefInput): RequestHandoffBrief {
  const now = input.now ?? new Date()
  const request = input.request ?? {}
  const workflow = resolveRequestWorkflowV2({
    request,
    scheduleRow: input.scheduleRow,
    checklistIncomplete: input.checklistIncomplete,
    now,
  })
  const risk = evaluateAtRiskRequest(request, { now })
  const remainingChecklistCount = Math.max(0, input.remainingChecklistCount)
  const notesCount = Math.max(0, input.notesCount ?? 0)
  const communicationsCount = Math.max(0, input.communicationsCount ?? 0)
  const title = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: input.funeralDetail,
    weddingDetail: input.weddingDetail,
  })
  const requestTypeLabel = formatRequestType(request.request_type) || 'Request'
  const status = text(request.status) || 'new'
  const blocker = blockerLine(request, now)
  const checklistLine =
    remainingChecklistCount === 0
      ? 'Checklist is complete.'
      : `${plural(remainingChecklistCount, 'checklist item')} still open.`
  const riskLine = risk.isAtRisk
    ? `${risk.highestRiskLevel.toUpperCase()} risk: ${risk.recommendedAction}`
    : 'No at-risk signals detected.'
  const handoffTone = urgencyTone(workflow.urgency)
  const owner = ownerLine(request)
  const followUp = followUpLine(request, now)
  const care = careLine(request, communicationsCount, now)
  const context = `${plural(notesCount, 'internal note')} and ${plural(communicationsCount, 'communication')} on file.`

  return {
    title,
    nextAction: workflow.nextStepDescription,
    nextActionLabel: workflow.recommendedActionLabel,
    nextActionHref: `#${workflow.sectionAnchor as WorkflowSectionAnchor}`,
    handoffNote: buildHandoffNote({
      title,
      requestType: requestTypeLabel,
      owner,
      blocker,
      nextAction: workflow.nextStepDescription,
      followUp,
      care,
      checklist: checklistLine,
      risk: riskLine,
      context,
    }),
    urgencyLabel: workflowUrgencyLabel[workflow.urgency],
    urgencyTone: handoffTone,
    statusLine: `Status: ${status.replaceAll('_', ' ')}.`,
    ownerLine: owner,
    blockerLine: blocker,
    followUpLine: followUp,
    checklistLine,
    riskLine,
    careLine: care,
    contextLine: context,
    items: [
      { key: 'owner', label: 'Owner', value: owner, tone: owner.includes('No owner') ? 'warning' : 'steady' },
      { key: 'blocker', label: 'Blocker', value: blocker, tone: blocker.includes('Waiting on') ? 'warning' : 'muted' },
      {
        key: 'follow-up',
        label: 'Follow-up',
        value: followUp,
        tone: followUp.startsWith('Past due') ? 'urgent' : followUp.startsWith('Due today') ? 'warning' : 'steady',
      },
      { key: 'checklist', label: 'Checklist', value: checklistLine, tone: remainingChecklistCount > 0 ? 'warning' : 'steady' },
      { key: 'risk', label: 'Risk', value: riskLine, tone: risk.isAtRisk ? (risk.highestRiskLevel === 'critical' || risk.highestRiskLevel === 'high' ? 'urgent' : 'warning') : 'muted' },
      { key: 'care', label: 'Care history', value: care, tone: care.includes('No logged') ? 'warning' : 'steady' },
    ],
  }
}
