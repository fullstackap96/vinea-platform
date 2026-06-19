import { formatNextFollowUpDateCompact, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { formatRequestType } from '@/lib/formatRequestType'

export type ParishCommunicationFilter =
  | 'needs_reply'
  | 'overdue_follow_up'
  | 'recent_contact'
  | 'no_first_contact'
  | 'funeral'
  | 'wedding'
  | 'baptism'
  | 'ocia'

export type ParishCommunicationPriority = 'urgent' | 'high' | 'normal'

export type ParishCommunicationRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  waiting_on?: unknown
  reply_draft?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: { deceased_name?: unknown } | null
  wedding_detail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
}

export type ParishCommunicationEvent = {
  id?: unknown
  request_id?: unknown
  contacted_at?: unknown
  method?: unknown
  notes?: unknown
  created_at?: unknown
}

export type ParishCommunicationItem = {
  id: string
  requestId: string
  title: string
  requestType: string
  requestTypeLabel: string
  priority: ParishCommunicationPriority
  filters: ParishCommunicationFilter[]
  recommendedAction: string
  reason: string
  latestNote: string
  lastContactLabel: string
  nextFollowUpLabel: string
  ownerLabel: string
  contactLine: string
  href: string
  hasDraft: boolean
  currentFollowUpDate: string
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseTime(value: unknown): number | null {
  const raw = text(value)
  if (!raw) return null
  const time = new Date(raw).getTime()
  return Number.isNaN(time) ? null : time
}

function daysSince(value: unknown, now: Date): number | null {
  const time = parseTime(value)
  if (time === null) return null
  return Math.max(0, Math.floor((now.getTime() - time) / (24 * 60 * 60 * 1000)))
}

function compact(value: unknown, fallback: string): string {
  const raw = text(value).replace(/\s+/g, ' ')
  if (!raw) return fallback
  return raw.length > 150 ? `${raw.slice(0, 147).trimEnd()}...` : raw
}

function latestEvent(events: readonly ParishCommunicationEvent[]): ParishCommunicationEvent | null {
  const sorted = [...events].sort((a, b) => {
    const bTime = parseTime(b.contacted_at) ?? parseTime(b.created_at) ?? 0
    const aTime = parseTime(a.contacted_at) ?? parseTime(a.created_at) ?? 0
    return bTime - aTime
  })
  return sorted[0] ?? null
}

function formatLastContact(value: unknown, now: Date): string {
  const days = daysSince(value, now)
  if (days === null) return 'No contact logged'
  if (days === 0) return 'Contacted today'
  if (days === 1) return 'Last contacted yesterday'
  return `Last contacted ${days} days ago`
}

function ownerLabel(request: ParishCommunicationRequest): string {
  const names = [
    assignmentDisplayLabel(request.assigned_staff_name),
    assignmentDisplayLabel(request.assigned_priest_name),
    assignmentDisplayLabel(request.assigned_deacon_name),
  ].filter((name) => name && name !== 'Unassigned')
  return names[0] || 'Unassigned'
}

function contactLine(request: ParishCommunicationRequest): string {
  const email = text(request.parishioner?.email)
  const phone = text(request.parishioner?.phone)
  return [email, phone].filter(Boolean).join(' | ') || 'No email or phone on file'
}

function requestTitle(request: ParishCommunicationRequest): string {
  return getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
}

function priorityRank(priority: ParishCommunicationPriority): number {
  if (priority === 'urgent') return 0
  if (priority === 'high') return 1
  return 2
}

export function buildParishCommunicationCenter(input: {
  requests: readonly ParishCommunicationRequest[]
  communications?: readonly ParishCommunicationEvent[]
  now?: Date
}): ParishCommunicationItem[] {
  const now = input.now ?? new Date()
  const byRequestId = new Map<string, ParishCommunicationEvent[]>()
  for (const event of input.communications ?? []) {
    const requestId = text(event.request_id)
    if (!requestId) continue
    byRequestId.set(requestId, [...(byRequestId.get(requestId) ?? []), event])
  }

  const rows: ParishCommunicationItem[] = []

  for (const request of input.requests) {
    if (text(request.status) === 'complete') continue
    const requestId = text(request.id)
    if (!requestId) continue

    const events = byRequestId.get(requestId) ?? []
    const latest = latestEvent(events)
    const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
    const contactDays = daysSince(request.last_contacted_at, now)
    const requestType = requestTypeFromRow(request)
    const noFirstContact = contactDays === null && events.length === 0
    const recentContact = contactDays !== null && contactDays <= 7
    const stale = contactDays === null || contactDays >= 7
    const hasDraft = Boolean(text(request.reply_draft))

    const filters: ParishCommunicationFilter[] = [requestType as ParishCommunicationFilter].filter(
      (filter): filter is ParishCommunicationFilter =>
        ['funeral', 'wedding', 'baptism', 'ocia'].includes(filter)
    )
    if (overdue) filters.push('overdue_follow_up', 'needs_reply')
    if (noFirstContact) filters.push('no_first_contact', 'needs_reply')
    if (recentContact) filters.push('recent_contact')
    if (stale && !overdue && !noFirstContact) filters.push('needs_reply')

    if (filters.length === 0) continue

    let priority: ParishCommunicationPriority = 'normal'
    let recommendedAction = 'Review the latest contact and decide whether to follow up.'
    let reason = 'This request has communication context worth reviewing.'

    if (overdue) {
      priority = 'urgent'
      recommendedAction = 'Follow up with the family today.'
      reason = `Follow-up is overdue (${formatNextFollowUpDateCompact(request.next_follow_up_date)}).`
    } else if (noFirstContact) {
      priority = requestType === 'funeral' || requestType === 'ocia' ? 'urgent' : 'high'
      recommendedAction = 'Make or log the first contact.'
      reason = 'No first contact has been logged yet.'
    } else if (stale) {
      priority = 'high'
      recommendedAction = 'Send a brief check-in or update the next follow-up date.'
      reason = contactDays === null ? 'No contact date is set.' : `Last contact was ${contactDays} days ago.`
    }

    rows.push({
      id: `communication-${requestId}`,
      requestId,
      title: requestTitle(request),
      requestType,
      requestTypeLabel: formatRequestType(requestType) || 'Request',
      priority,
      filters,
      recommendedAction,
      reason,
      latestNote: compact(latest?.notes, 'No communication note has been logged yet.'),
      lastContactLabel: formatLastContact(request.last_contacted_at, now),
      nextFollowUpLabel: formatNextFollowUpDateCompact(request.next_follow_up_date) || 'No follow-up date',
      ownerLabel: ownerLabel(request),
      contactLine: contactLine(request),
      href: `/dashboard/requests/${encodeURIComponent(requestId)}#communication-history`,
      hasDraft,
      currentFollowUpDate: text(request.next_follow_up_date).slice(0, 10),
    })
  }

  return rows.sort((a, b) => {
    const priorityDiff = priorityRank(a.priority) - priorityRank(b.priority)
    if (priorityDiff !== 0) return priorityDiff
    return a.title.localeCompare(b.title)
  })
}
