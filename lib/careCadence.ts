import {
  formatNextFollowUpDateCompact,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
  todayCalendarDateString,
} from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestWorkflowDetailHref } from '@/lib/requestWorkflowV2'

const DAY_MS = 24 * 60 * 60 * 1000

export type CareCadenceLevel = 'urgent' | 'high' | 'medium' | 'steady'

export type CareCadenceRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  waiting_on_changed_at?: unknown
  assigned_staff_name?: unknown
  confirmed_baptism_date?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: { deceased_name?: unknown; confirmed_service_at?: unknown } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
    confirmed_ceremony_at?: unknown
  } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
}

export type CareCadenceEvaluation = {
  request: CareCadenceRequest
  requestId: string
  requestType: string
  personLabel: string
  level: CareCadenceLevel
  label: string
  reason: string
  recommendedAction: string
  suggestedFollowUpDate: string
  suggestedFollowUpLabel: string
  detailHref: string
  sortScore: number
  daysSinceCreated: number | null
  daysSinceContact: number | null
  waitingDays: number | null
}

export type CareCadenceResult = {
  rows: CareCadenceEvaluation[]
  summary: {
    urgent: number
    high: number
    needsCareToday: number
    missingFirstContact: number
    staleCare: number
  }
}

const SACRAMENTAL_REQUEST_TYPES = new Set(['baptism', 'funeral', 'wedding', 'ocia'])

export type CareCadenceSlaRules = {
  firstContactDays?: Record<string, number>
  ownerAssignmentDays?: Record<string, number>
}

export const DEFAULT_CARE_CADENCE_SLA_RULES = {
  firstContactDays: {
    funeral: 1,
    wedding: 2,
    baptism: 3,
    ocia: 3,
  },
  ownerAssignmentDays: {
    funeral: 0,
    wedding: 1,
    baptism: 2,
    ocia: 2,
  },
} satisfies Required<CareCadenceSlaRules>

const FIRST_CONTACT_SLA_DAYS: Record<string, number> = {
  funeral: 1,
  wedding: 2,
  baptism: 3,
  ocia: 3,
}

const OWNER_SLA_DAYS: Record<string, number> = {
  funeral: 0,
  wedding: 1,
  baptism: 2,
  ocia: 2,
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

function addCalendarDays(now: Date, days: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function suggestedDelayDays(row: CareCadenceRequest, level: CareCadenceLevel): number {
  const waitingOn = text(row.waiting_on)
  if (level === 'urgent') return 1
  if (waitingOn === 'priest_availability' || waitingOn === 'parish_staff_action') return 2
  if (waitingOn === 'date_confirmation') return 3
  if (
    waitingOn === 'documents' ||
    waitingOn === 'family_response' ||
    waitingOn === 'godparent_paperwork' ||
    waitingOn === 'marriage_prep_documents'
  ) {
    return 5
  }
  if (waitingOn === 'payment_or_stipend') return 7

  const requestType = requestTypeFromRow(row)
  if (requestType === 'funeral') return 1
  if (requestType === 'wedding') return 7
  if (requestType === 'ocia') return 7
  return 5
}

function levelRank(level: CareCadenceLevel): number {
  switch (level) {
    case 'urgent':
      return 0
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'steady':
    default:
      return 3
  }
}

function higherLevel(a: CareCadenceLevel, b: CareCadenceLevel): CareCadenceLevel {
  return levelRank(a) <= levelRank(b) ? a : b
}

function isUnassigned(value: unknown): boolean {
  const s = text(value).toLowerCase()
  return !s || s === 'unassigned'
}

function configuredSlaDays(
  rules: CareCadenceSlaRules | undefined,
  kind: keyof Required<CareCadenceSlaRules>,
  requestType: string,
  fallback: number
): number {
  const n = rules?.[kind]?.[requestType]
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(30, Math.round(n)))
}

export function evaluateCareCadence(
  request: CareCadenceRequest,
  options?: { now?: Date; slaRules?: CareCadenceSlaRules }
): CareCadenceEvaluation | null {
  const now = options?.now ?? new Date()
  if (text(request.status) === 'complete') return null

  const requestType = requestTypeFromRow(request)
  if (!SACRAMENTAL_REQUEST_TYPES.has(requestType)) return null

  const requestId = text(request.id)
  if (!requestId) return null

  const today = todayCalendarDateString(now)
  const nextFollowUp = parseFollowUpCalendarDate(request.next_follow_up_date)
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  const dueToday = isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)
  const daysSinceCreated = wholeDaysSince(request.created_at, now)
  const daysSinceContact = wholeDaysSince(request.last_contacted_at, now)
  const waitingLabel = requestWaitingOnLabel(request.waiting_on)
  const waitingDays = waitingLabel ? wholeDaysSince(request.waiting_on_changed_at, now) : null
  const firstContactSla = configuredSlaDays(
    options?.slaRules,
    'firstContactDays',
    requestType,
    FIRST_CONTACT_SLA_DAYS[requestType] ?? 3
  )
  const ownerSla = configuredSlaDays(
    options?.slaRules,
    'ownerAssignmentDays',
    requestType,
    OWNER_SLA_DAYS[requestType] ?? 2
  )

  let level: CareCadenceLevel = 'steady'
  let label = 'Care cadence set'
  const reasons: string[] = []
  let recommendedAction = 'Keep the next pastoral touchpoint on the calendar.'
  let anchor: Parameters<typeof requestWorkflowDetailHref>[1] = 'next-follow-up'

  if (overdue) {
    level = 'urgent'
    label = 'Pastoral follow-up overdue'
    reasons.push(`Next follow-up was ${formatNextFollowUpDateCompact(nextFollowUp)}.`)
    recommendedAction = 'Contact the family today or reset the follow-up date with a clear reason.'
  } else if (dueToday) {
    level = higherLevel(level, 'high')
    label = 'Care due today'
    reasons.push('Next follow-up is scheduled for today.')
    recommendedAction = 'Make the planned touchpoint today, then set the next follow-up.'
  }

  if (daysSinceContact === null && daysSinceCreated !== null && daysSinceCreated >= firstContactSla) {
    level = higherLevel(level, requestType === 'funeral' ? 'urgent' : 'high')
    label = requestType === 'funeral' ? 'Funeral family needs first contact' : 'First contact needed'
    reasons.push(
      `No family contact has been logged within the ${firstContactSla}-day care window.`
    )
    recommendedAction = 'Log the first call, email, or pastoral touchpoint.'
    anchor = 'communication'
  }

  if (isUnassigned(request.assigned_staff_name) && daysSinceCreated !== null && daysSinceCreated >= ownerSla) {
    level = higherLevel(level, requestType === 'funeral' ? 'urgent' : 'high')
    label = requestType === 'funeral' ? 'Funeral request needs an owner' : label
    reasons.push('No staff owner is assigned for the next pastoral step.')
    recommendedAction = 'Assign a staff owner so the family has a clear point person.'
    anchor = 'assignment'
  }

  if (waitingLabel) {
    const staleWaiting = waitingDays !== null && waitingDays >= 7
    level = higherLevel(level, staleWaiting ? 'high' : 'medium')
    if (level !== 'urgent' && label === 'Care cadence set') label = 'Blocked care follow-up'
    reasons.push(
      staleWaiting
        ? `Waiting on ${waitingLabel} for ${waitingDays} days.`
        : `Waiting on ${waitingLabel}.`
    )
    recommendedAction = 'Nudge the blocker or document why the pause is intentional.'
  }

  if (daysSinceContact !== null && daysSinceContact >= 10) {
    level = higherLevel(level, 'medium')
    if (label === 'Care cadence set') label = 'Care thread is getting stale'
    reasons.push(`Last logged contact was ${daysSinceContact} days ago.`)
    recommendedAction = 'Send a brief check-in or log why no contact is needed yet.'
    anchor = 'communication'
  }

  if (!nextFollowUp || nextFollowUp < today) {
    level = higherLevel(level, level === 'steady' ? 'medium' : level)
    if (label === 'Care cadence set') label = 'Follow-up date needed'
    reasons.push('No future follow-up date is protecting this request.')
    if (level === 'medium') {
      recommendedAction = 'Set the next follow-up date so the family does not fall through the cracks.'
    }
    anchor = 'next-follow-up'
  }

  const suggestedFollowUpDate = addCalendarDays(now, suggestedDelayDays(request, level))
  const personLabel = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
  const sortScore =
    levelRank(level) * 1000 +
    (overdue ? 0 : dueToday ? 20 : 100) +
    Math.min(daysSinceContact ?? 0, 30) * -2 +
    Math.min(waitingDays ?? 0, 30) * -1

  return {
    request,
    requestId,
    requestType,
    personLabel,
    level,
    label,
    reason: reasons.length > 0 ? reasons.join(' ') : 'No urgent care gaps are currently detected.',
    recommendedAction,
    suggestedFollowUpDate,
    suggestedFollowUpLabel: formatNextFollowUpDateCompact(suggestedFollowUpDate),
    detailHref: requestWorkflowDetailHref(requestId, anchor),
    sortScore,
    daysSinceCreated,
    daysSinceContact,
    waitingDays,
  }
}

export function buildCareCadenceQueue(
  requests: readonly CareCadenceRequest[],
  options?: { now?: Date; limit?: number; slaRules?: CareCadenceSlaRules }
): CareCadenceResult {
  const rows = requests
    .map((request) => evaluateCareCadence(request, options))
    .filter((row): row is CareCadenceEvaluation => Boolean(row))
    .filter((row) => row.level !== 'steady')
    .sort((a, b) => {
      if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore
      return text(a.personLabel).localeCompare(text(b.personLabel))
    })

  const limitedRows = rows.slice(0, options?.limit ?? rows.length)

  return {
    rows: limitedRows,
    summary: {
      urgent: rows.filter((row) => row.level === 'urgent').length,
      high: rows.filter((row) => row.level === 'high').length,
      needsCareToday: rows.filter((row) => row.level === 'urgent' || row.level === 'high').length,
      missingFirstContact: rows.filter((row) =>
        row.reason.toLowerCase().includes('no family contact')
      ).length,
      staleCare: rows.filter((row) =>
        row.reason.toLowerCase().includes('last logged contact')
      ).length,
    },
  }
}
