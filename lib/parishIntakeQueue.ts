import { evaluateIntakeTriage } from '@/lib/intakeTriage'
import { formatRequestType } from '@/lib/formatRequestType'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

export type ParishIntakeQueueFilter =
  | 'needs_review'
  | 'missing_info'
  | 'ready_to_schedule'
  | 'needs_owner'
  | 'waiting'

export type ParishIntakeQueuePriority = 'urgent' | 'high' | 'normal'

export type ParishIntakeQueueKind =
  | 'request'
  | 'mass_intention'

export type ParishIntakeQueueRequest = Parameters<typeof evaluateIntakeTriage>[0] & {
  id?: unknown
  waiting_on?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: {
    deceased_name?: unknown
  } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
  } | null
}

export type ParishIntakeQueueItem = {
  id: string
  kind: ParishIntakeQueueKind
  title: string
  subtitle: string
  label: string
  priority: ParishIntakeQueuePriority
  filters: ParishIntakeQueueFilter[]
  recommendedAction: string
  suggestedOwner: string
  missingDetails: string[]
  href: string
  createdAt: string
  ageLabel: string
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

function daysSince(value: unknown, now: Date): number {
  const time = parseTime(value)
  if (time === null) return 0
  return Math.max(0, Math.floor((now.getTime() - time) / (24 * 60 * 60 * 1000)))
}

function ageLabel(value: unknown, now: Date): string {
  const days = daysSince(value, now)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day old'
  return `${days} days old`
}

function hasOwner(request: ParishIntakeQueueRequest): boolean {
  return Boolean(
    text(request.assigned_staff_name) ||
      text(request.assigned_priest_name) ||
      text(request.assigned_deacon_name)
  )
}

function requestHref(request: ParishIntakeQueueRequest, sectionId: string): string {
  const id = encodeURIComponent(text(request.id))
  return `/dashboard/requests/${id}#${sectionId}`
}

function requestPriority(
  label: string,
  request: ParishIntakeQueueRequest,
  now: Date
): ParishIntakeQueuePriority {
  if (label === 'Urgent contact') return 'urgent'
  if (requestTypeFromRow(request) === 'funeral' && daysSince(request.created_at, now) >= 1) {
    return 'urgent'
  }
  if (!hasOwner(request) || text(request.waiting_on)) return 'high'
  return 'normal'
}

function buildRequestItem(
  request: ParishIntakeQueueRequest,
  now: Date
): ParishIntakeQueueItem | null {
  const id = text(request.id)
  if (!id || text(request.status) === 'complete') return null

  const triage = evaluateIntakeTriage(request, { now })
  const requestType = requestTypeFromRow(request)
  const waiting = Boolean(text(request.waiting_on))
  const ownerMissing = !hasOwner(request)
  const missingInfo = triage.quality.status === 'needs_confirmation'
  const needsSchedule =
    !missingInfo &&
    ['baptism', 'funeral', 'wedding', 'ocia'].includes(requestType) &&
    !text(request.next_follow_up_date)

  const filters: ParishIntakeQueueFilter[] = ['needs_review']
  if (missingInfo) filters.push('missing_info')
  if (ownerMissing) filters.push('needs_owner')
  if (needsSchedule) filters.push('ready_to_schedule')
  if (waiting) filters.push('waiting')

  const title = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
  const typeLabel = formatRequestType(requestType) || 'Request'

  return {
    id: `request-${id}`,
    kind: 'request',
    title,
    subtitle: `${typeLabel} intake`,
    label: waiting ? 'Waiting on family' : triage.label,
    priority: requestPriority(triage.label, request, now),
    filters,
    recommendedAction: waiting ? 'Check the waiting item or nudge the family' : triage.suggestedAction,
    suggestedOwner: triage.suggestedOwner,
    missingDetails: triage.missingDetails,
    href: requestHref(request, triage.actionSectionId),
    createdAt: text(request.created_at),
    ageLabel: ageLabel(request.created_at, now),
  }
}

function buildMassIntentionItem(
  intention: MassIntentionRow,
  now: Date
): ParishIntakeQueueItem | null {
  if (intention.is_fulfilled) return null
  const missingDetails = [
    !intention.assigned_mass_date ? 'Assign this intention to a Mass date.' : '',
    !intention.assigned_priest_name ? 'Assign a priest if the parish tracks celebrants.' : '',
    !intention.stipend_received ? 'Confirm whether the stipend has been received.' : '',
  ].filter(Boolean)

  const filters: ParishIntakeQueueFilter[] = ['needs_review']
  if (missingDetails.length > 0) filters.push('missing_info')
  if (!intention.assigned_mass_date) filters.push('ready_to_schedule')

  return {
    id: `mass-intention-${intention.id}`,
    kind: 'mass_intention',
    title: intention.requester_name,
    subtitle: 'Mass intention intake',
    label: intention.assigned_mass_date ? 'Needs confirmation' : 'Ready to schedule',
    priority: !intention.assigned_mass_date ? 'high' : 'normal',
    filters,
    recommendedAction: intention.assigned_mass_date
      ? 'Confirm details and mark fulfilled when complete'
      : 'Assign a Mass date',
    suggestedOwner: 'Parish office staff',
    missingDetails,
    href: `/dashboard/intentions/${encodeURIComponent(intention.id)}`,
    createdAt: intention.created_at,
    ageLabel: ageLabel(intention.created_at, now),
  }
}

export function buildParishIntakeQueue(input: {
  requests?: readonly ParishIntakeQueueRequest[]
  intentions?: readonly MassIntentionRow[]
  now?: Date
}): ParishIntakeQueueItem[] {
  const now = input.now ?? new Date()
  const items = [
    ...(input.requests ?? []).map((request) => buildRequestItem(request, now)),
    ...(input.intentions ?? []).map((intention) => buildMassIntentionItem(intention, now)),
  ].filter((item): item is ParishIntakeQueueItem => Boolean(item))

  const rank = { urgent: 0, high: 1, normal: 2 }
  return items.sort((a, b) => {
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority]
    const aTime = parseTime(a.createdAt) ?? 0
    const bTime = parseTime(b.createdAt) ?? 0
    if (aTime !== bTime) return bTime - aTime
    return a.title.localeCompare(b.title)
  })
}
