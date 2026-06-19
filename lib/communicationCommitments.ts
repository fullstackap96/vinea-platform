import {
  formatNextFollowUpDateCompact,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
} from '@/lib/nextFollowUpDate'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'

const DAY_MS = 24 * 60 * 60 * 1000
const STALE_COMMUNICATION_DAYS = 7

export type CommunicationCommitmentStatus =
  | 'staff_owes_family'
  | 'waiting_on_family'
  | 'internal_decision'
  | 'no_recent_contact'
  | 'clear'

export type CommunicationCommitmentTone = 'urgent' | 'warning' | 'steady' | 'muted'

export type CommunicationCommitmentRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  assigned_staff_name?: unknown
  communication_notes?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: { deceased_name?: unknown } | null
  wedding_detail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
}

export type CommunicationCommitmentEvent = {
  contacted_at?: unknown
  method?: unknown
  notes?: unknown
  created_at?: unknown
}

export type CommunicationCommitmentNote = {
  body?: unknown
  created_at?: unknown
}

export type CommunicationCommitmentEvaluation = {
  request: CommunicationCommitmentRequest
  requestId: string
  personLabel: string
  requestType: string
  status: CommunicationCommitmentStatus
  tone: CommunicationCommitmentTone
  title: string
  reason: string
  suggestedAction: string
  latestContext: string
  detailHref: string
  sortScore: number
  daysSinceContact: number | null
}

export type CommunicationCommitmentQueue = {
  rows: CommunicationCommitmentEvaluation[]
  summary: {
    repliesOwed: number
    internalDecisions: number
    waitingOnFamily: number
    stale: number
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseTimeMs(value: unknown): number | null {
  const raw = text(value)
  if (!raw) return null
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? null : t
}

function wholeDaysSince(value: unknown, now: Date): number | null {
  const t = parseTimeMs(value)
  if (t === null) return null
  return Math.max(0, Math.floor((now.getTime() - t) / DAY_MS))
}

function eventTime(event: CommunicationCommitmentEvent): number {
  return parseTimeMs(event.contacted_at) ?? parseTimeMs(event.created_at) ?? 0
}

function latestCommunication(
  communications: readonly CommunicationCommitmentEvent[]
): CommunicationCommitmentEvent | null {
  const sorted = [...communications].sort((a, b) => eventTime(b) - eventTime(a))
  return sorted[0] ?? null
}

function latestNote(notes: readonly CommunicationCommitmentNote[]): CommunicationCommitmentNote | null {
  const sorted = [...notes].sort(
    (a, b) => (parseTimeMs(b.created_at) ?? 0) - (parseTimeMs(a.created_at) ?? 0)
  )
  return sorted[0] ?? null
}

function summarize(value: unknown, fallback: string): string {
  const raw = text(value).replace(/\s+/g, ' ')
  if (!raw) return fallback
  return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw
}

function isFamilyWaitingKey(waitingOn: unknown): boolean {
  const key = text(waitingOn)
  return [
    'family_response',
    'documents',
    'payment_or_stipend',
    'godparent_paperwork',
    'marriage_prep_documents',
  ].includes(key)
}

function isInternalWaitingKey(waitingOn: unknown): boolean {
  const key = text(waitingOn)
  return ['priest_availability', 'parish_staff_action', 'date_confirmation'].includes(key)
}

function statusSort(status: CommunicationCommitmentStatus): number {
  switch (status) {
    case 'staff_owes_family':
      return 0
    case 'internal_decision':
      return 1
    case 'waiting_on_family':
      return 2
    case 'no_recent_contact':
      return 3
    case 'clear':
    default:
      return 9
  }
}

export function evaluateCommunicationCommitment(input: {
  request: CommunicationCommitmentRequest
  communications?: readonly CommunicationCommitmentEvent[]
  notes?: readonly CommunicationCommitmentNote[]
  now?: Date
}): CommunicationCommitmentEvaluation | null {
  const now = input.now ?? new Date()
  const request = input.request
  if (text(request.status) === 'complete') return null

  const requestId = text(request.id)
  if (!requestId) return null

  const daysSinceContact = wholeDaysSince(request.last_contacted_at, now)
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  const dueToday = isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)
  const waitingLabel = requestWaitingOnLabel(request.waiting_on)
  const latestComm = latestCommunication(input.communications ?? [])
  const latestInternalNote = latestNote(input.notes ?? [])
  const latestContext = latestComm
    ? summarize(latestComm.notes, 'A communication was logged without notes.')
    : summarize(request.communication_notes, 'No communication summary has been logged yet.')
  const personLabel = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
  const requestType = requestTypeFromRow(request)

  let status: CommunicationCommitmentStatus = 'clear'
  let tone: CommunicationCommitmentTone = 'muted'
  let title = 'No open communication commitment'
  let reason = 'Nothing indicates that staff or the family owes a reply right now.'
  let suggestedAction = 'Keep logging important calls, emails, and internal decisions.'
  let anchor = 'communication'

  if (overdue || dueToday) {
    status = 'staff_owes_family'
    tone = overdue ? 'urgent' : 'warning'
    title = overdue ? 'Staff owes the family follow-up' : 'Follow-up is due today'
    reason = overdue
      ? `The next follow-up date has passed (${formatNextFollowUpDateCompact(request.next_follow_up_date)}).`
      : 'The next follow-up date is today.'
    suggestedAction = 'Reply, call, or update the follow-up date after staff reviews the request.'
    anchor = 'send-email'
  } else if (isInternalWaitingKey(request.waiting_on)) {
    status = 'internal_decision'
    tone = 'warning'
    title = 'Internal decision needed'
    reason = waitingLabel
      ? `This request is waiting on ${waitingLabel.toLowerCase()}.`
      : 'This request is waiting on an internal parish decision.'
    suggestedAction = 'Decide the parish-side next step, then update the family or the wait reason.'
    anchor = 'internal-notes'
  } else if (isFamilyWaitingKey(request.waiting_on)) {
    status = 'waiting_on_family'
    tone = 'steady'
    title = 'Waiting on the family'
    reason = waitingLabel
      ? `The next move depends on ${waitingLabel.toLowerCase()}.`
      : 'The next move depends on information from the family.'
    suggestedAction = 'Nudge gently if the wait has gone long, or keep the current follow-up date.'
    anchor = 'send-email'
  } else if (daysSinceContact === null) {
    status = 'staff_owes_family'
    tone = 'warning'
    title = 'First contact has not been logged'
    reason = 'There is no logged communication with this family yet.'
    suggestedAction = 'Make or record the first touchpoint so the team knows contact happened.'
  } else if (daysSinceContact >= STALE_COMMUNICATION_DAYS) {
    status = 'no_recent_contact'
    tone = 'warning'
    title = 'No recent communication'
    reason = `Last logged contact was ${daysSinceContact} days ago.`
    suggestedAction = 'Send a brief check-in, or add an internal note explaining why no reply is needed.'
  }

  const noteContext = latestInternalNote
    ? ` Latest internal note: ${summarize(latestInternalNote.body, 'No note text.')}`
    : ''
  const sortScore = statusSort(status) * 1000 + Math.min(daysSinceContact ?? 99, 99)

  return {
    request,
    requestId,
    personLabel,
    requestType,
    status,
    tone,
    title,
    reason,
    suggestedAction,
    latestContext: `${latestContext}${noteContext}`,
    detailHref: `/dashboard/requests/${encodeURIComponent(requestId)}#${anchor}`,
    sortScore,
    daysSinceContact,
  }
}

export function buildCommunicationCommitmentQueue(
  requests: readonly CommunicationCommitmentRequest[],
  options?: { now?: Date; limit?: number }
): CommunicationCommitmentQueue {
  const rows = requests
    .map((request) => evaluateCommunicationCommitment({ request, now: options?.now }))
    .filter((row): row is CommunicationCommitmentEvaluation => Boolean(row))
    .filter((row) => row.status !== 'clear')
    .sort((a, b) => {
      if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore
      return a.personLabel.localeCompare(b.personLabel)
    })

  return {
    rows: rows.slice(0, options?.limit ?? rows.length),
    summary: {
      repliesOwed: rows.filter((row) => row.status === 'staff_owes_family').length,
      internalDecisions: rows.filter((row) => row.status === 'internal_decision').length,
      waitingOnFamily: rows.filter((row) => row.status === 'waiting_on_family').length,
      stale: rows.filter((row) => row.status === 'no_recent_contact').length,
    },
  }
}
