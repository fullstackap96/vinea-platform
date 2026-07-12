import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'

export type WorkflowReminderKind =
  | 'overdue_follow_up'
  | 'missing_documents'
  | 'upcoming_sacramental_date'
  | 'stalled_request'
  | 'unassigned_request'
  | 'certificate_ready'
  | 'duplicate_review'

export type WorkflowReminderSeverity = 'urgent' | 'warning' | 'info'

export type WorkflowReminderCandidate = {
  id: string
  kind: WorkflowReminderKind
  severity: WorkflowReminderSeverity
  title: string
  detail: string
  recommendedAction: string
  ownerLabel: string
  href: string
  requestId: string | null
  dueAt: string | null
  reasonSignals: string[]
  staffReviewRequired: true
  outboundCommunicationAllowed: false
  runtimeStatus: 'non_runtime_dto_only'
}

export type WorkflowReminderRequestSignal = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  assigned_staff_name?: unknown
  checklist_incomplete?: unknown
  checklist_incomplete_count?: unknown
  confirmed_baptism_date?: unknown
  funeral_detail?: { deceased_name?: unknown; confirmed_service_at?: unknown } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
    confirmed_ceremony_at?: unknown
  } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
  child_name?: unknown
  parishioner?: { full_name?: unknown; email?: unknown } | null
}

export type CertificateReadyReminderSignal = {
  id: string
  label: string
  href: string
  certificateType: string
  ownerLabel?: string
  dueAt?: string | null
}

export type DuplicateReviewReminderSignal = {
  peopleCandidateCount?: number
  householdCandidateCount?: number
  href?: string
}

export type BuildWorkflowReminderCandidatesInput = {
  now: Date
  requests: readonly WorkflowReminderRequestSignal[]
  upcomingDateWindowDays?: number
  stalledAfterDays?: number
  certificateReady?: readonly CertificateReadyReminderSignal[]
  duplicateReview?: DuplicateReviewReminderSignal | null
}

const DAY_MS = 24 * 60 * 60 * 1000
const DOCUMENT_WAITING_ON_KEYS = new Set([
  'documents',
  'godparent_paperwork',
  'marriage_prep_documents',
])

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function isOpenRequest(request: WorkflowReminderRequestSignal): boolean {
  return text(request.status) !== 'complete'
}

function requestId(request: WorkflowReminderRequestSignal): string | null {
  const id = text(request.id)
  return id || null
}

function requestHref(id: string): string {
  const normalizedId = text(id)
  if (!normalizedId) return '/dashboard/requests'
  return safeDashboardHrefOrFallback(
    `/dashboard/requests/${encodeURIComponent(normalizedId)}`,
    '/dashboard/requests'
  )
}

function ownerLabel(value: unknown): string {
  const label = text(value)
  return label && label.toLowerCase() !== 'unassigned' ? label : 'Unassigned'
}

function primaryLabel(request: WorkflowReminderRequestSignal): string {
  return (
    text(request.parishioner?.full_name) ||
    text(request.child_name) ||
    text(request.funeral_detail?.deceased_name) ||
    text(request.wedding_detail?.partner_one_name) ||
    text(request.wedding_detail?.partner_two_name) ||
    'Request'
  )
}

function parseMs(value: unknown): number | null {
  const raw = text(value)
  if (!raw) return null
  const ms = new Date(raw).getTime()
  return Number.isNaN(ms) ? null : ms
}

function wholeDaysSince(value: unknown, now: Date): number | null {
  const ms = parseMs(value)
  if (ms === null) return null
  return Math.max(0, Math.floor((now.getTime() - ms) / DAY_MS))
}

function isoOrNull(value: unknown): string | null {
  const ms = parseMs(value)
  if (ms === null) return null
  return new Date(ms).toISOString()
}

function checklistGapCount(request: WorkflowReminderRequestSignal): number {
  const explicit = Number(request.checklist_incomplete_count ?? 0)
  if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit)
  return Boolean(request.checklist_incomplete) ? 1 : 0
}

function confirmedDateForRequest(request: WorkflowReminderRequestSignal): unknown {
  const type = text(request.request_type)
  if (type === 'funeral') return request.funeral_detail?.confirmed_service_at
  if (type === 'wedding') return request.wedding_detail?.confirmed_ceremony_at
  if (type === 'ocia') return request.ocia_detail?.confirmed_session_at
  if (type === 'baptism') return request.confirmed_baptism_date
  return null
}

function isUpcoming(value: unknown, now: Date, windowDays: number): boolean {
  const ms = parseMs(value)
  if (ms === null) return false
  const delta = ms - now.getTime()
  return delta >= 0 && delta <= windowDays * DAY_MS
}

function makeRequestReminder(input: {
  request: WorkflowReminderRequestSignal
  kind: WorkflowReminderKind
  severity: WorkflowReminderSeverity
  title: string
  detail: string
  recommendedAction: string
  dueAt?: string | null
  reasonSignals: string[]
  anchor?: string
}): WorkflowReminderCandidate | null {
  const id = requestId(input.request)
  if (!id) return null
  const href = `${requestHref(id)}${input.anchor ? `#${input.anchor}` : ''}`
  return {
    id: `${input.kind}:${id}`,
    kind: input.kind,
    severity: input.severity,
    title: input.title,
    detail: input.detail,
    recommendedAction: input.recommendedAction,
    ownerLabel: ownerLabel(input.request.assigned_staff_name),
    href,
    requestId: id,
    dueAt: input.dueAt ?? null,
    reasonSignals: input.reasonSignals,
    staffReviewRequired: true,
    outboundCommunicationAllowed: false,
    runtimeStatus: 'non_runtime_dto_only',
  }
}

function severityRank(severity: WorkflowReminderSeverity): number {
  switch (severity) {
    case 'urgent':
      return 0
    case 'warning':
      return 1
    case 'info':
    default:
      return 2
  }
}

export function buildWorkflowReminderCandidates(
  input: BuildWorkflowReminderCandidatesInput
): WorkflowReminderCandidate[] {
  const now = input.now
  const upcomingDateWindowDays = input.upcomingDateWindowDays ?? 14
  const stalledAfterDays = input.stalledAfterDays ?? 7
  const reminders: WorkflowReminderCandidate[] = []

  for (const request of input.requests) {
    if (!isOpenRequest(request)) continue

    const id = requestId(request)
    if (!id) continue

    const typeLabel = requestTypeFromRow(request)
    const person = primaryLabel(request)
    const owner = ownerLabel(request.assigned_staff_name)

    if (isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) {
      const reminder = makeRequestReminder({
        request,
        kind: 'overdue_follow_up',
        severity: 'urgent',
        title: `Overdue follow-up: ${person}`,
        detail: `${typeLabel} request has a past-due follow-up date.`,
        recommendedAction: 'Staff should contact the family or update the follow-up date after review.',
        dueAt: isoOrNull(request.next_follow_up_date),
        reasonSignals: ['next_follow_up_date is past due'],
        anchor: 'send-email',
      })
      if (reminder) reminders.push(reminder)
    }

    const checklistCount = checklistGapCount(request)
    const waitingKey = text(request.waiting_on)
    if (checklistCount > 0 || DOCUMENT_WAITING_ON_KEYS.has(waitingKey)) {
      const waitingLabel = requestWaitingOnLabel(request.waiting_on)
      const reminder = makeRequestReminder({
        request,
        kind: 'missing_documents',
        severity: 'warning',
        title: `Documents/checklist needed: ${person}`,
        detail:
          checklistCount > 0
            ? `${checklistCount} checklist or document-related item${checklistCount === 1 ? '' : 's'} need attention.`
            : `${typeLabel} request is waiting on ${waitingLabel?.toLowerCase() ?? 'documents'}.`,
        recommendedAction:
          'Staff should review required items and prepare a staff-approved family nudge if appropriate.',
        reasonSignals: [
          checklistCount > 0 ? 'checklist_incomplete_count is greater than zero' : '',
          DOCUMENT_WAITING_ON_KEYS.has(waitingKey) ? `waiting_on is ${waitingKey}` : '',
        ].filter(Boolean),
        anchor: 'workflow',
      })
      if (reminder) reminders.push(reminder)
    }

    const confirmedDate = confirmedDateForRequest(request)
    if (isUpcoming(confirmedDate, now, upcomingDateWindowDays)) {
      const reminder = makeRequestReminder({
        request,
        kind: 'upcoming_sacramental_date',
        severity: 'warning',
        title: `Upcoming date: ${person}`,
        detail: `${typeLabel} request has a confirmed date within ${upcomingDateWindowDays} days.`,
        recommendedAction:
          'Staff should confirm readiness, documents, record needs, and calendar details.',
        dueAt: isoOrNull(confirmedDate),
        reasonSignals: ['confirmed sacramental or pastoral date is inside the planning window'],
        anchor: 'schedule',
      })
      if (reminder) reminders.push(reminder)
    }

    const daysSinceContact = wholeDaysSince(request.last_contacted_at, now)
    if (daysSinceContact === null || daysSinceContact >= stalledAfterDays) {
      const reminder = makeRequestReminder({
        request,
        kind: 'stalled_request',
        severity: daysSinceContact === null ? 'warning' : 'urgent',
        title: `Stalled request: ${person}`,
        detail:
          daysSinceContact === null
            ? `${typeLabel} request has no logged contact yet.`
            : `${typeLabel} request has gone ${daysSinceContact} days without logged contact.`,
        recommendedAction: 'Staff should log a touchpoint or decide the next pastoral step.',
        reasonSignals: [
          daysSinceContact === null
            ? 'last_contacted_at is missing'
            : `last_contacted_at is at least ${stalledAfterDays} days old`,
        ],
        anchor: 'communication',
      })
      if (reminder) reminders.push(reminder)
    }

    if (owner === 'Unassigned') {
      const reminder = makeRequestReminder({
        request,
        kind: 'unassigned_request',
        severity: 'urgent',
        title: `Assign owner: ${person}`,
        detail: `${typeLabel} request has no clear staff owner.`,
        recommendedAction: 'Staff should assign ownership before routine work continues.',
        reasonSignals: ['assigned_staff_name is blank or unassigned'],
        anchor: 'assignment',
      })
      if (reminder) reminders.push(reminder)
    }
  }

  for (const item of input.certificateReady ?? []) {
    reminders.push({
      id: `certificate_ready:${item.id}`,
      kind: 'certificate_ready',
      severity: 'info',
      title: `Certificate ready for review: ${item.label}`,
      detail: `${item.certificateType} certificate appears ready for staff review from an explicit upstream signal.`,
      recommendedAction:
        'Staff should review the record before generating or issuing a certificate. This reminder does not decide sacramental eligibility.',
      ownerLabel: item.ownerLabel ?? 'Staff',
      href: safeDashboardHrefOrFallback(item.href, '/dashboard/records'),
      requestId: null,
      dueAt: item.dueAt ?? null,
      reasonSignals: ['explicit certificate-ready signal supplied'],
      staffReviewRequired: true,
      outboundCommunicationAllowed: false,
      runtimeStatus: 'non_runtime_dto_only',
    })
  }

  const peopleDuplicateCount = Math.max(0, input.duplicateReview?.peopleCandidateCount ?? 0)
  const householdDuplicateCount = Math.max(0, input.duplicateReview?.householdCandidateCount ?? 0)
  const duplicateTotal = peopleDuplicateCount + householdDuplicateCount
  if (duplicateTotal > 0) {
    reminders.push({
      id: 'duplicate_review:people_households',
      kind: 'duplicate_review',
      severity: 'info',
      title: 'Duplicate review needed',
      detail: `${duplicateTotal} possible duplicate people or household candidate${duplicateTotal === 1 ? '' : 's'} need staff review.`,
      recommendedAction:
        'Staff should review possible duplicates carefully. This reminder does not merge or mutate records.',
      ownerLabel: 'Staff',
      href: safeDashboardHrefOrFallback(input.duplicateReview?.href, '/dashboard/people/duplicates'),
      requestId: null,
      dueAt: null,
      reasonSignals: [
        peopleDuplicateCount > 0 ? `${peopleDuplicateCount} possible people duplicate candidates` : '',
        householdDuplicateCount > 0
          ? `${householdDuplicateCount} possible household duplicate candidates`
          : '',
      ].filter(Boolean),
      staffReviewRequired: true,
      outboundCommunicationAllowed: false,
      runtimeStatus: 'non_runtime_dto_only',
    })
  }

  return reminders.sort((a, b) => {
    const severity = severityRank(a.severity) - severityRank(b.severity)
    if (severity !== 0) return severity
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY
    if (aDue !== bDue) return aDue - bDue
    return a.title.localeCompare(b.title)
  })
}
