import { evaluateAtRiskRequest, type AtRiskEvaluation } from '@/lib/atRiskRequest'
import { isMissingConfirmedSchedule } from '@/lib/requestConfirmedSchedule'
import {
  dashboardRequestScheduleRow,
  requestWorkflowDetailHref,
  resolveRequestWorkflowV2,
  workflowUrgencyRank,
  type RequestWorkflowV2Result,
} from '@/lib/requestWorkflowV2'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { evaluateSmartFollowUp, type SmartFollowUpEvaluation } from '@/lib/smartFollowUpEngine'

const DAY_MS = 24 * 60 * 60 * 1000

export type StaffCommandCenterRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  checklist_incomplete?: unknown
  checklist_incomplete_count?: unknown
  confirmed_baptism_date?: unknown
  funeral_detail?: { confirmed_service_at?: unknown; deceased_name?: unknown } | null
  wedding_detail?: {
    confirmed_ceremony_at?: unknown
    partner_one_name?: unknown
    partner_two_name?: unknown
  } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
  child_name?: unknown
  parishioner?: { full_name?: unknown; email?: unknown } | null
}

export type StaffCommandCenterBucket = 'act_now' | 'blocked' | 'aging' | 'upcoming'

export type StaffCommandCenterRow = {
  request: StaffCommandCenterRequest
  requestId: string
  requestType: string
  bucket: StaffCommandCenterBucket
  bucketLabel: string
  ownerLabel: string
  blockerLabel: string
  ageDays: number | null
  daysSinceContact: number | null
  missingConfirmedSchedule: boolean
  openChecklistCount: number
  detailHref: string
  sortScore: number
  workflow: RequestWorkflowV2Result
  smartFollowUp: SmartFollowUpEvaluation
  atRisk: AtRiskEvaluation
}

export type StaffCommandCenterSummary = {
  actNow: number
  blocked: number
  aging: number
  upcoming: number
}

export type StaffCommandCenterResult = {
  rows: StaffCommandCenterRow[]
  summary: StaffCommandCenterSummary
}

function parseTimeMs(value: unknown): number | null {
  if (value == null || value === '') return null
  const t = new Date(String(value)).getTime()
  return Number.isNaN(t) ? null : t
}

function wholeDaysSince(value: unknown, now: Date): number | null {
  const t = parseTimeMs(value)
  if (t === null) return null
  const days = Math.floor((now.getTime() - t) / DAY_MS)
  return days < 0 ? 0 : days
}

function displayName(value: unknown, fallback = 'Unassigned'): string {
  const s = String(value ?? '').trim()
  if (!s || s.toLowerCase() === 'unassigned') return fallback
  return s
}

function checklistCount(row: StaffCommandCenterRequest): number {
  const count = Number(row.checklist_incomplete_count ?? 0)
  if (Number.isFinite(count) && count > 0) return Math.floor(count)
  return Boolean(row.checklist_incomplete) ? 1 : 0
}

function resolveBucket(input: {
  row: StaffCommandCenterRequest
  workflow: RequestWorkflowV2Result
  smartFollowUp: SmartFollowUpEvaluation
  atRisk: AtRiskEvaluation
  daysSinceContact: number | null
}): StaffCommandCenterBucket {
  const waitingLabel = requestWaitingOnLabel(input.row.waiting_on)
  if (
    input.workflow.urgency === 'overdue' ||
    input.workflow.urgency === 'high' ||
    input.smartFollowUp.urgency === 'critical' ||
    input.atRisk.highestRiskLevel === 'critical' ||
    input.atRisk.highestRiskLevel === 'high'
  ) {
    return 'act_now'
  }
  if (waitingLabel) return 'blocked'
  if (input.daysSinceContact !== null && input.daysSinceContact >= 7) return 'aging'
  return 'upcoming'
}

const BUCKET_LABELS: Record<StaffCommandCenterBucket, string> = {
  act_now: 'Act now',
  blocked: 'Blocked',
  aging: 'Aging',
  upcoming: 'Upcoming',
}

const BUCKET_SORT_RANK: Record<StaffCommandCenterBucket, number> = {
  act_now: 0,
  blocked: 1,
  aging: 2,
  upcoming: 3,
}

function sortScore(row: StaffCommandCenterRow): number {
  let score = BUCKET_SORT_RANK[row.bucket] * 1000
  score += workflowUrgencyRank(row.workflow.urgency) * 100
  score += row.smartFollowUp.sortPriority
  if (row.atRisk.highestRiskLevel === 'critical') score -= 90
  else if (row.atRisk.highestRiskLevel === 'high') score -= 60
  else if (row.atRisk.highestRiskLevel === 'medium') score -= 20
  if (row.missingConfirmedSchedule) score -= 10
  if (row.openChecklistCount > 0) score -= Math.min(row.openChecklistCount, 5)
  return score
}

export function buildStaffCommandCenterRows(
  requests: readonly StaffCommandCenterRequest[],
  options?: { now?: Date; limit?: number }
): StaffCommandCenterResult {
  const now = options?.now ?? new Date()
  const rows: StaffCommandCenterRow[] = []

  for (const request of requests) {
    if (String(request.status ?? '').trim() === 'complete') continue

    const requestId = String(request.id ?? '').trim()
    if (!requestId) continue

    const scheduleRow = dashboardRequestScheduleRow(request)
    const workflow = resolveRequestWorkflowV2({
      request,
      scheduleRow,
      checklistIncomplete: Boolean(request.checklist_incomplete),
      now,
    })
    const smartFollowUp = evaluateSmartFollowUp(request, { now })
    const atRisk = evaluateAtRiskRequest(request, { now })
    const daysSinceContact = wholeDaysSince(request.last_contacted_at, now)
    const waitingLabel = requestWaitingOnLabel(request.waiting_on)
    const bucket = resolveBucket({ row: request, workflow, smartFollowUp, atRisk, daysSinceContact })
    const openChecklistCount = checklistCount(request)
    const row: StaffCommandCenterRow = {
      request,
      requestId,
      requestType: requestTypeFromRow(request),
      bucket,
      bucketLabel: BUCKET_LABELS[bucket],
      ownerLabel: displayName(request.assigned_staff_name),
      blockerLabel: waitingLabel ?? 'No blocker',
      ageDays: wholeDaysSince(request.created_at, now),
      daysSinceContact,
      missingConfirmedSchedule: isMissingConfirmedSchedule(scheduleRow),
      openChecklistCount,
      detailHref: requestWorkflowDetailHref(requestId, workflow.sectionAnchor),
      sortScore: 0,
      workflow,
      smartFollowUp,
      atRisk,
    }
    row.sortScore = sortScore(row)
    rows.push(row)
  }

  rows.sort((a, b) => {
    if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore
    const aCreated = parseTimeMs(a.request.created_at) ?? 0
    const bCreated = parseTimeMs(b.request.created_at) ?? 0
    return bCreated - aCreated
  })

  const limitedRows = rows.slice(0, options?.limit ?? rows.length)
  const summary: StaffCommandCenterSummary = {
    actNow: rows.filter((r) => r.bucket === 'act_now').length,
    blocked: rows.filter((r) => r.bucket === 'blocked').length,
    aging: rows.filter((r) => r.bucket === 'aging').length,
    upcoming: rows.filter((r) => r.bucket === 'upcoming').length,
  }

  return { rows: limitedRows, summary }
}
