import { formatNextFollowUpDateDisplay, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type CarePlanPriority = 'urgent' | 'high' | 'steady'
export type CarePlanStage = 'before_service' | 'post_funeral' | 'ongoing_care'

export type CarePlanRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: {
    deceased_name?: unknown
    confirmed_service_at?: unknown
    post_funeral_follow_up_date?: unknown
  } | null
}

export type CarePlan = {
  requestId: string
  planType: 'funeral_bereavement'
  familyLabel: string
  stage: CarePlanStage
  priority: CarePlanPriority
  headline: string
  summary: string
  nextTouchpoint: string
  dueLabel: string
  detailHref: string
  sortScore: number
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

function serviceHasPassed(value: unknown, now: Date): boolean {
  const time = parseTime(value)
  if (time === null) return false
  return time < now.getTime()
}

function serviceIsUpcoming(value: unknown, now: Date): boolean {
  const time = parseTime(value)
  if (time === null) return false
  return time >= now.getTime()
}

function formatDueLabel(request: CarePlanRequest, now: Date): string {
  const formatted = formatNextFollowUpDateDisplay(request.next_follow_up_date)
  if (!formatted) return 'No care follow-up date set'
  if (isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) {
    return `Past due: ${formatted}`
  }
  return `Next follow-up: ${formatted}`
}

export function buildFuneralBereavementCarePlan(
  request: CarePlanRequest,
  options?: { now?: Date }
): CarePlan | null {
  const now = options?.now ?? new Date()
  if (requestTypeFromRow(request) !== 'funeral') return null
  if (text(request.status) === 'complete' && !request.funeral_detail?.post_funeral_follow_up_date) {
    // Completed funeral requests still get care plans if a post-funeral follow-up date exists.
    return null
  }

  const requestId = text(request.id)
  if (!requestId) return null

  const familyLabel = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
  })
  const serviceAt = request.funeral_detail?.confirmed_service_at
  const postFuneralFollowUp = request.funeral_detail?.post_funeral_follow_up_date
  const lastContactDays = daysSince(request.last_contacted_at, now)
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)

  let stage: CarePlanStage = 'ongoing_care'
  let headline = 'Bereavement care follow-up'
  let summary = 'Keep the family connected after the funeral liturgy and committal.'
  let nextTouchpoint = 'Call or email the family, then set the next bereavement follow-up.'
  let priority: CarePlanPriority = 'steady'

  if (serviceIsUpcoming(serviceAt, now)) {
    stage = 'before_service'
    headline = 'Prepare family care before the funeral'
    summary = 'Confirm pastoral support, service details, and who will stay close to the family.'
    nextTouchpoint = 'Contact the family or funeral home to confirm the next practical detail.'
    priority = lastContactDays === null || lastContactDays >= 1 ? 'urgent' : 'high'
  } else if (serviceHasPassed(serviceAt, now) || postFuneralFollowUp) {
    stage = 'post_funeral'
    headline = 'Post-funeral bereavement care'
    summary = 'The funeral has passed; the family may need a pastoral check-in.'
    nextTouchpoint = 'Schedule or complete the bereavement follow-up call.'
    priority = overdue || lastContactDays === null || lastContactDays >= 14 ? 'high' : 'steady'
  }

  if (overdue) priority = 'urgent'

  const sortScore =
    (priority === 'urgent' ? 0 : priority === 'high' ? 100 : 200) +
    (lastContactDays === null ? 0 : Math.max(0, 30 - Math.min(lastContactDays, 30)))

  return {
    requestId,
    planType: 'funeral_bereavement',
    familyLabel,
    stage,
    priority,
    headline,
    summary,
    nextTouchpoint,
    dueLabel: formatDueLabel(request, now),
    detailHref: `/dashboard/requests/${encodeURIComponent(requestId)}#next-follow-up`,
    sortScore,
  }
}

export function buildCarePlans(
  requests: readonly CarePlanRequest[],
  options?: { now?: Date; limit?: number }
): CarePlan[] {
  const rows = requests
    .map((request) => buildFuneralBereavementCarePlan(request, options))
    .filter((plan): plan is CarePlan => Boolean(plan))
    .sort((a, b) => {
      if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore
      return a.familyLabel.localeCompare(b.familyLabel)
    })

  return rows.slice(0, options?.limit ?? rows.length)
}
