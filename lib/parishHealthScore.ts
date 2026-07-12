import type { CareCadenceResult } from '@/lib/careCadence'
import type { CommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import { STAFF_WORKLOAD_UNASSIGNED_LABEL, type StaffWorkloadRow } from '@/lib/dashboardStaffWorkload'
import type { ParishOpsBrief } from '@/lib/parishOpsBrief'
import type { StaffCommandCenterResult } from '@/lib/staffCommandCenter'
import {
  buildRequestRecordContinuityEmptyStateCue,
  type RequestRecordContinuityEmptyStateCue,
} from '@/lib/requestRecordContinuityEmptyState'
import { safeDashboardHref } from '@/lib/safeDashboardHref'

export type ParishHealthTone = 'healthy' | 'watch' | 'urgent'

export type ParishHealthFactor = {
  key: string
  label: string
  valueLabel: string
  tone: ParishHealthTone
  scoreImpact: number
  maxImpact: number
  reason: string
  recommendedAction: string
  href?: string
}

export type ParishHealthRecommendation = {
  key: string
  title: string
  detail: string
  href?: string
}

export type ParishHealthCoverageNote = {
  key: string
  label: string
  detail: string
}

export type ParishHealthScore = {
  score: number
  tone: ParishHealthTone
  label: string
  headline: string
  subline: string
  factors: ParishHealthFactor[]
  recommendations: ParishHealthRecommendation[]
  recordsContinuityEmptyState: RequestRecordContinuityEmptyStateCue | null
  coverageNotes: ParishHealthCoverageNote[]
}

export type ParishHealthRequestSignal = {
  status?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  checklist_incomplete?: unknown
  checklist_incomplete_count?: unknown
}

export type ParishHealthOperatingSignals = {
  duplicateCandidateCount?: number
  incompleteSacramentalRecordCount?: number
  certificateReadyCount?: number
  linkedSacramentalRecordCount?: number
  unlinkedSacramentalRecordCount?: number
  certificateActivityCount?: number
}

export type BuildParishHealthScoreInput = {
  now: Date
  requests: readonly ParishHealthRequestSignal[]
  staffCommandCenter: StaffCommandCenterResult
  parishOpsBrief: ParishOpsBrief
  staffWorkloadRows: readonly StaffWorkloadRow[]
  careCadence: CareCadenceResult
  communicationCommitments: CommunicationCommitmentQueue
  operatingSignals?: ParishHealthOperatingSignals | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function factorTone(scoreImpact: number, maxImpact: number): ParishHealthTone {
  if (scoreImpact <= 0) return 'healthy'
  if (scoreImpact >= Math.ceil(maxImpact * 0.6)) return 'urgent'
  return 'watch'
}

function countPenalty(count: number, pointsPerItem: number, maxImpact: number): number {
  return Math.min(maxImpact, Math.max(0, count) * pointsPerItem)
}

function openChecklistGapCount(requests: readonly ParishHealthRequestSignal[]): number {
  return requests.reduce((total, request) => {
    if (String(request.status ?? '').trim() === 'complete') return total

    const explicitCount = Number(request.checklist_incomplete_count ?? 0)
    if (Number.isFinite(explicitCount) && explicitCount > 0) {
      return total + Math.floor(explicitCount)
    }

    return total + (Boolean(request.checklist_incomplete) ? 1 : 0)
  }, 0)
}

function unassignedOpen(rows: readonly StaffWorkloadRow[]): number {
  return rows.find((row) => row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL)?.openRequests ?? 0
}

function overloadedOwners(rows: readonly StaffWorkloadRow[]): StaffWorkloadRow[] {
  return rows
    .filter((row) => row.staffDisplay !== STAFF_WORKLOAD_UNASSIGNED_LABEL)
    .filter((row) => row.openRequests >= 5 || row.actionRequired >= 3 || row.overdueFollowUps >= 2)
}

function parseMs(value: unknown): number | null {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const ms = new Date(raw).getTime()
  return Number.isNaN(ms) ? null : ms
}

function averageFirstResponseDays(requests: readonly ParishHealthRequestSignal[]): number | null {
  const responseDays = requests
    .map((request) => {
      const created = parseMs(request.created_at)
      const contacted = parseMs(request.last_contacted_at)
      if (created === null || contacted === null || contacted < created) return null
      return Math.max(0, (contacted - created) / DAY_MS)
    })
    .filter((value): value is number => value !== null)

  if (responseDays.length === 0) return null
  return responseDays.reduce((sum, value) => sum + value, 0) / responseDays.length
}

function formatDays(days: number | null): string {
  if (days === null) return 'Not enough data'
  if (days < 0.1) return 'Same day'
  return `${days.toFixed(days >= 10 ? 0 : 1)} days`
}

function makeFactor(input: {
  key: string
  label: string
  count: number
  valueLabel?: string
  pointsPerItem: number
  maxImpact: number
  healthyReason: string
  issueReason: string
  recommendedAction: string
  healthyRecommendedAction?: string
  href?: string
}): ParishHealthFactor {
  const scoreImpact = countPenalty(input.count, input.pointsPerItem, input.maxImpact)
  return {
    key: input.key,
    label: input.label,
    valueLabel: input.valueLabel ?? String(input.count),
    tone: factorTone(scoreImpact, input.maxImpact),
    scoreImpact,
    maxImpact: input.maxImpact,
    reason: input.count > 0 ? input.issueReason : input.healthyReason,
    recommendedAction:
      input.count > 0
        ? input.recommendedAction
        : input.healthyRecommendedAction ?? 'Keep this habit steady.',
    href: safeDashboardHref(input.href),
  }
}

function scoreLabel(score: number): { tone: ParishHealthTone; label: string; headline: string } {
  if (score >= 85) {
    return {
      tone: 'healthy',
      label: 'Healthy',
      headline: 'Parish operations look steady.',
    }
  }
  if (score >= 70) {
    return {
      tone: 'watch',
      label: 'Needs attention',
      headline: 'A few operational gaps need staff attention.',
    }
  }
  return {
    tone: 'urgent',
    label: 'At risk',
    headline: 'Operational follow-up risk is high today.',
  }
}

export function buildParishHealthScore(input: BuildParishHealthScoreInput): ParishHealthScore {
  const overdueFollowUps = input.parishOpsBrief.today.overdueFollowUps
  const ownershipGaps = unassignedOpen(input.staffWorkloadRows)
  const blocked = input.staffCommandCenter.summary.blocked
  const stalled = input.staffCommandCenter.summary.aging
  const checklistGaps = openChecklistGapCount(input.requests)
  const pendingCommunications =
    input.communicationCommitments.summary.repliesOwed +
    input.communicationCommitments.summary.internalDecisions +
    input.communicationCommitments.summary.stale
  const missingDates = input.parishOpsBrief.today.missingConfirmedSchedules
  const firstContactGaps = input.parishOpsBrief.today.firstContactNeeded
  const careCadenceGaps = input.careCadence.summary.needsCareToday
  const duplicateCandidates = Math.max(0, input.operatingSignals?.duplicateCandidateCount ?? 0)
  const incompleteSacramentalRecords = Math.max(
    0,
    input.operatingSignals?.incompleteSacramentalRecordCount ?? 0
  )
  const certificateReady = Math.max(0, input.operatingSignals?.certificateReadyCount ?? 0)
  const recordsNeedingContinuityReview = Math.max(
    0,
    input.operatingSignals?.unlinkedSacramentalRecordCount ?? 0
  )
  const overloaded = overloadedOwners(input.staffWorkloadRows)
  const averageResponse = averageFirstResponseDays(input.requests)
  const responsePenalty =
    averageResponse === null || averageResponse <= 2
      ? 0
      : Math.min(8, Math.ceil(averageResponse - 2) * 2)

  const factors: ParishHealthFactor[] = [
    makeFactor({
      key: 'overdue_followups',
      label: 'Overdue follow-ups',
      count: overdueFollowUps,
      pointsPerItem: 4,
      maxImpact: 16,
      healthyReason: 'No family follow-ups are past due.',
      issueReason: `${plural(overdueFollowUps, 'follow-up')} are past due.`,
      recommendedAction: 'Start by contacting families with past-due follow-up dates.',
      href: '/dashboard/requests#follow-up-queue-heading',
    }),
    makeFactor({
      key: 'ownership_gaps',
      label: 'Unassigned work',
      count: ownershipGaps,
      pointsPerItem: 4,
      maxImpact: 14,
      healthyReason: 'Open work has clear staff ownership.',
      issueReason: `${plural(ownershipGaps, 'open request')} need a staff owner.`,
      recommendedAction: 'Assign owners before routine request work continues.',
      href: '/dashboard/requests#staff-command-center-heading',
    }),
    makeFactor({
      key: 'blocked_work',
      label: 'Blocked work',
      count: blocked,
      pointsPerItem: 3,
      maxImpact: 12,
      healthyReason: 'No blockers are currently tagged.',
      issueReason: `${plural(blocked, 'request')} are waiting on a person, document, date, or staff action.`,
      recommendedAction: 'Review blockers and decide who should nudge or clear each one.',
      href: '/dashboard/requests#staff-command-center-heading',
    }),
    makeFactor({
      key: 'stalled_workflows',
      label: 'Stalled workflows',
      count: stalled,
      pointsPerItem: 3,
      maxImpact: 12,
      healthyReason: 'No stale workflow rows are currently flagged.',
      issueReason: `${plural(stalled, 'request')} need a fresh touchpoint.`,
      recommendedAction: 'Open the oldest stalled requests and log the next pastoral step.',
      href: '/dashboard/requests#staff-command-center-heading',
    }),
    makeFactor({
      key: 'documents_checklist',
      label: 'Documents/checklist gaps',
      count: checklistGaps,
      pointsPerItem: 2,
      maxImpact: 10,
      healthyReason: 'No open checklist gaps are visible in this dashboard view.',
      issueReason: `${plural(checklistGaps, 'checklist or document item')} need attention.`,
      recommendedAction: 'Clear required checklist items or request missing documents from families.',
      href: '/dashboard/requests#staff-command-center-heading',
    }),
    makeFactor({
      key: 'communications',
      label: 'Pending communications',
      count: pendingCommunications,
      pointsPerItem: 2,
      maxImpact: 10,
      healthyReason: 'No staff-owed replies or stale communication commitments are flagged.',
      issueReason: `${plural(pendingCommunications, 'communication item')} need staff review.`,
      recommendedAction: 'Review family replies owed, internal decisions, and stale communication threads.',
      href: '/dashboard/communications',
    }),
    makeFactor({
      key: 'missing_dates',
      label: 'Missing dates',
      count: missingDates,
      pointsPerItem: 2,
      maxImpact: 8,
      healthyReason: 'Required sacramental and pastoral dates are confirmed.',
      issueReason: `${plural(missingDates, 'request')} need a confirmed date or time.`,
      recommendedAction: 'Confirm dates for sacramental and pastoral requests.',
      href: '/dashboard/calendar',
    }),
    makeFactor({
      key: 'first_contact',
      label: 'First-contact gaps',
      count: firstContactGaps,
      pointsPerItem: 2,
      maxImpact: 8,
      healthyReason: 'Every open request has first contact logged.',
      issueReason: `${plural(firstContactGaps, 'open request')} still need first contact logged.`,
      recommendedAction: 'Make or record first contact so families know the parish received the request.',
      href: '/dashboard/requests',
    }),
    makeFactor({
      key: 'care_cadence',
      label: 'Pastoral care cadence',
      count: careCadenceGaps,
      pointsPerItem: 2,
      maxImpact: 6,
      healthyReason: 'No urgent care cadence items are flagged.',
      issueReason: `${plural(careCadenceGaps, 'family')} need care cadence attention.`,
      recommendedAction: 'Review care cadence items and decide the next staff touchpoint.',
      href: '/dashboard/calendar',
    }),
    makeFactor({
      key: 'duplicate_review',
      label: 'Duplicate review backlog',
      count: duplicateCandidates,
      pointsPerItem: 2,
      maxImpact: 8,
      healthyReason: 'No possible duplicate people or households are currently flagged.',
      issueReason: `${plural(duplicateCandidates, 'possible duplicate candidate')} need staff review.`,
      recommendedAction:
        'Review possible duplicate people and households before they make records harder to trust.',
      href: '/dashboard/people/duplicates',
    }),
    makeFactor({
      key: 'incomplete_records',
      label: 'Incomplete sacramental records',
      count: incompleteSacramentalRecords,
      pointsPerItem: 2,
      maxImpact: 8,
      healthyReason: 'No incomplete sacramental record metadata is visible in this dashboard signal.',
      issueReason: `${plural(incompleteSacramentalRecords, 'sacramental record')} are missing a date, register book, page, or line.`,
      recommendedAction:
        'Review incomplete records before generating certificates or relying on register details.',
      href: '/dashboard/records',
    }),
    makeFactor({
      key: 'records_continuity',
      label: 'Request-to-record continuity',
      count: recordsNeedingContinuityReview,
      pointsPerItem: 2,
      maxImpact: 8,
      healthyReason:
        'No sacramental records in the selected parish currently need request-to-record continuity review.',
      issueReason: `${plural(recordsNeedingContinuityReview, 'sacramental record')} need request-to-record continuity review.`,
      recommendedAction:
        'Open the Records continuity review queue before certificate work; staff should verify the originating request link manually.',
      healthyRecommendedAction:
        'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.',
      href: '/dashboard/records?continuity=needs_review',
    }),
    makeFactor({
      key: 'certificate_ready',
      label: 'Certificate-ready review',
      count: certificateReady,
      pointsPerItem: 1,
      maxImpact: 6,
      healthyReason: 'No baptism certificate review candidates are visible right now.',
      issueReason: `${plural(certificateReady, 'baptism certificate candidate')} need staff review.`,
      recommendedAction:
        'Review complete baptism records before generating or issuing certificates. Vinea does not decide sacramental eligibility.',
      href: '/dashboard/records',
    }),
    {
      key: 'response_time',
      label: 'Average first response',
      valueLabel: formatDays(averageResponse),
      tone: factorTone(responsePenalty, 8),
      scoreImpact: responsePenalty,
      maxImpact: 8,
      reason:
        responsePenalty > 0
          ? `Average logged first response is ${formatDays(averageResponse)}, above the V1 target of 2 days.`
          : averageResponse === null
            ? 'There is not enough first-response data to score this yet.'
            : `Average logged first response is ${formatDays(averageResponse)}.`,
      recommendedAction:
        responsePenalty > 0
          ? 'Prioritize first replies for new requests before routine cleanup.'
          : 'Keep first-contact logging consistent.',
      href: safeDashboardHref('/dashboard/requests'),
    },
    {
      key: 'workload_balance',
      label: 'Workload balance',
      valueLabel: overloaded.length === 0 ? 'Balanced' : String(overloaded.length),
      tone: factorTone(countPenalty(overloaded.length, 3, 6), 6),
      scoreImpact: countPenalty(overloaded.length, 3, 6),
      maxImpact: 6,
      reason:
        overloaded.length > 0
          ? `${plural(overloaded.length, 'staff member')} may need relief or reassignment.`
          : 'No staff member appears overloaded in this dashboard view.',
      recommendedAction:
        overloaded.length > 0
          ? 'Review staff workload and move urgent items if one person is carrying too much.'
          : 'Keep reviewing workload as new requests arrive.',
      href: safeDashboardHref('/dashboard/requests#staff-command-center-heading'),
    },
  ]

  const totalImpact = factors.reduce((sum, factor) => sum + factor.scoreImpact, 0)
  const score = clampScore(100 - totalImpact)
  const label = scoreLabel(score)
  const recommendations = factors
    .filter((factor) => factor.scoreImpact > 0)
    .sort((a, b) => {
      if (a.scoreImpact !== b.scoreImpact) return b.scoreImpact - a.scoreImpact
      return b.maxImpact - a.maxImpact
    })
    .slice(0, 3)
    .map((factor) => ({
      key: factor.key,
      title: factor.label,
      detail: factor.recommendedAction,
      href: safeDashboardHref(factor.href),
    }))

  return {
    score,
    tone: label.tone,
    label: label.label,
    headline: label.headline,
    subline:
      recommendations.length > 0
        ? 'The score is lowered only by visible operational gaps. Use the recommendations to improve it.'
        : 'No major operational gaps are visible in the current dashboard signals.',
    factors,
    recommendations,
    recordsContinuityEmptyState: buildRequestRecordContinuityEmptyStateCue(
      recordsNeedingContinuityReview
    ),
    coverageNotes: [
      {
        key: 'duplicates',
        label: 'Duplicate review',
        detail:
          'People and household duplicate candidates are scored from read-only duplicate-review signals. No merge or record change happens from the score.',
      },
      {
        key: 'records_certificates',
        label: 'Records/certificates',
        detail:
          'Incomplete records, request-to-record continuity review, and baptism certificate review candidates are scored from record metadata and certificate-generated events only. When continuity is steady, no selected-parish record rows need request-link review in this dashboard signal. This is not a canonical, sacramental, or eligibility decision, and it does not link records.',
      },
    ],
  }
}
