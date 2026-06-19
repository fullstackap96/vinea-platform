import { formatRequestType } from '@/lib/formatRequestType'
import { formatNextFollowUpDateCompact, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import type { CarePlan } from '@/lib/carePlans'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

export type ParishCareCalendarKind =
  | 'follow_up'
  | 'funeral'
  | 'wedding'
  | 'baptism'
  | 'ocia'
  | 'mass_intention'

export type ParishCareCalendarPriority = 'urgent' | 'today' | 'upcoming' | 'steady'

export type ParishCareCalendarRequest = {
  id?: unknown
  request_type?: unknown
  status?: unknown
  child_name?: unknown
  confirmed_baptism_date?: unknown
  next_follow_up_date?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  waiting_on?: unknown
  parishioner?: { full_name?: unknown } | null
  funeral_detail?: {
    deceased_name?: unknown
    confirmed_service_at?: unknown
  } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
    confirmed_ceremony_at?: unknown
  } | null
  ocia_detail?: {
    confirmed_session_at?: unknown
  } | null
}

export type ParishCareCalendarItem = {
  id: string
  kind: ParishCareCalendarKind
  priority: ParishCareCalendarPriority
  title: string
  subtitle: string
  date: string
  timeLabel: string
  ownerLabel: string
  statusLabel: string
  href: string
  actionLabel: string
}

export type TodaysCareBrief = {
  headline: string
  subline: string
  counts: {
    dueToday: number
    overdue: number
    blocked: number
    carePlans: number
  }
  actions: ParishCareCalendarItem[]
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseDate(value: unknown): Date | null {
  const raw = text(value)
  if (!raw) return null
  const dateOnly = raw.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split('-').map(Number)
    const local = new Date(year, month - 1, day, raw.length > 10 ? 0 : 12, 0, 0, 0)
    if (!Number.isNaN(local.getTime())) {
      if (raw.length > 10) {
        const parsed = new Date(raw)
        return Number.isNaN(parsed.getTime()) ? local : parsed
      }
      return local
    }
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(now: Date = new Date()): string {
  return dateKey(now)
}

export function addDaysKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

function timeLabel(date: Date, source: unknown): string {
  const raw = text(source)
  if (!raw || raw.length <= 10) return 'All day'
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function requestOwnerLabel(request: ParishCareCalendarRequest): string {
  const names = [
    assignmentDisplayLabel(request.assigned_staff_name),
    assignmentDisplayLabel(request.assigned_priest_name),
    assignmentDisplayLabel(request.assigned_deacon_name),
  ].filter((value) => value && value !== 'Unassigned')
  return names[0] || 'Unassigned'
}

function requestTitle(request: ParishCareCalendarRequest): string {
  return getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
}

function requestHref(request: ParishCareCalendarRequest): string {
  return `/dashboard/requests/${encodeURIComponent(text(request.id))}`
}

function priorityForDate(date: string, now: Date, status: unknown): ParishCareCalendarPriority {
  const today = todayKey(now)
  if (date < today) return 'urgent'
  if (date === today) return 'today'
  if (String(status ?? '').trim() === 'complete') return 'steady'
  return 'upcoming'
}

function scheduledRequestItem(
  request: ParishCareCalendarRequest,
  kind: Exclude<ParishCareCalendarKind, 'follow_up' | 'mass_intention'>,
  rawDate: unknown,
  now: Date
): ParishCareCalendarItem | null {
  const parsed = parseDate(rawDate)
  const id = text(request.id)
  if (!parsed || !id) return null
  const typeLabel = formatRequestType(requestTypeFromRow(request)) || 'Request'
  const date = dateKey(parsed)
  return {
    id: `${kind}-${id}`,
    kind,
    priority: priorityForDate(date, now, request.status),
    title: requestTitle(request),
    subtitle: `${typeLabel} on the parish calendar`,
    date,
    timeLabel: timeLabel(parsed, rawDate),
    ownerLabel: requestOwnerLabel(request),
    statusLabel: text(request.status) || 'Open',
    href: requestHref(request),
    actionLabel: 'Prepare',
  }
}

function followUpItem(
  request: ParishCareCalendarRequest,
  now: Date
): ParishCareCalendarItem | null {
  const parsed = parseDate(request.next_follow_up_date)
  const id = text(request.id)
  if (!parsed || !id || text(request.status) === 'complete') return null
  const date = dateKey(parsed)
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  return {
    id: `follow-up-${id}`,
    kind: 'follow_up',
    priority: overdue ? 'urgent' : priorityForDate(date, now, request.status),
    title: requestTitle(request),
    subtitle: overdue
      ? `Past due follow-up: ${formatNextFollowUpDateCompact(request.next_follow_up_date)}`
      : 'Pastoral follow-up due',
    date,
    timeLabel: 'Follow-up',
    ownerLabel: requestOwnerLabel(request),
    statusLabel: text(request.waiting_on)
      ? `Waiting on ${text(request.waiting_on)}`
      : text(request.status) || 'Open',
    href: `${requestHref(request)}#next-follow-up`,
    actionLabel: overdue ? 'Call today' : 'Follow up',
  }
}

function massIntentionItem(
  intention: MassIntentionRow,
  now: Date
): ParishCareCalendarItem | null {
  const rawDate = intention.assigned_mass_date || intention.requested_date
  const parsed = parseDate(rawDate)
  if (!parsed) return null
  const date = dateKey(parsed)
  return {
    id: `mass-intention-${intention.id}`,
    kind: 'mass_intention',
    priority: intention.is_fulfilled ? 'steady' : priorityForDate(date, now, null),
    title: intention.requester_name,
    subtitle: intention.intention_text,
    date,
    timeLabel: intention.assigned_mass_date ? 'Assigned Mass' : 'Requested date',
    ownerLabel: assignmentDisplayLabel(intention.assigned_priest_name),
    statusLabel: intention.is_fulfilled ? 'Fulfilled' : 'Not fulfilled',
    href: `/dashboard/intentions/${encodeURIComponent(intention.id)}`,
    actionLabel: intention.is_fulfilled ? 'Review' : 'Confirm',
  }
}

export function buildParishCareCalendarItems(input: {
  requests?: readonly ParishCareCalendarRequest[]
  intentions?: readonly MassIntentionRow[]
  now?: Date
}): ParishCareCalendarItem[] {
  const now = input.now ?? new Date()
  const items: ParishCareCalendarItem[] = []

  for (const request of input.requests ?? []) {
    const followUp = followUpItem(request, now)
    if (followUp) items.push(followUp)

    const type = requestTypeFromRow(request)
    if (type === 'baptism') {
      const item = scheduledRequestItem(request, 'baptism', request.confirmed_baptism_date, now)
      if (item) items.push(item)
    } else if (type === 'funeral') {
      const item = scheduledRequestItem(
        request,
        'funeral',
        request.funeral_detail?.confirmed_service_at,
        now
      )
      if (item) items.push(item)
    } else if (type === 'wedding') {
      const item = scheduledRequestItem(
        request,
        'wedding',
        request.wedding_detail?.confirmed_ceremony_at,
        now
      )
      if (item) items.push(item)
    } else if (type === 'ocia') {
      const item = scheduledRequestItem(
        request,
        'ocia',
        request.ocia_detail?.confirmed_session_at,
        now
      )
      if (item) items.push(item)
    }
  }

  for (const intention of input.intentions ?? []) {
    const item = massIntentionItem(intention, now)
    if (item) items.push(item)
  }

  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.priority !== b.priority) {
      const rank = { urgent: 0, today: 1, upcoming: 2, steady: 3 }
      return rank[a.priority] - rank[b.priority]
    }
    if (a.timeLabel !== b.timeLabel) return a.timeLabel.localeCompare(b.timeLabel)
    return a.title.localeCompare(b.title)
  })
}

export function buildTodaysCareBrief(input: {
  requests: readonly ParishCareCalendarRequest[]
  carePlans: readonly CarePlan[]
  now?: Date
  limit?: number
}): TodaysCareBrief {
  const now = input.now ?? new Date()
  const today = todayKey(now)
  const items = buildParishCareCalendarItems({ requests: input.requests, now })
  const dueToday = items.filter((item) => item.date === today)
  const overdue = items.filter((item) => item.priority === 'urgent')
  const blocked = input.requests.filter((request) => Boolean(text(request.waiting_on)))
  const actions = [...overdue, ...dueToday.filter((item) => item.priority !== 'urgent')]
    .slice(0, input.limit ?? 5)

  const attentionCount = overdue.length + dueToday.length + input.carePlans.length
  return {
    headline:
      attentionCount > 0
        ? `${attentionCount} parish care item${attentionCount === 1 ? '' : 's'} need attention today`
        : 'Today is clear for scheduled parish care',
    subline:
      attentionCount > 0
        ? "Start with overdue follow-ups, then handle today's scheduled pastoral work."
        : 'No overdue follow-ups or due care plans are showing right now.',
    counts: {
      dueToday: dueToday.length,
      overdue: overdue.length,
      blocked: blocked.length,
      carePlans: input.carePlans.length,
    },
    actions,
  }
}
