import { formatRequestType } from '@/lib/formatRequestType'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import {
  STAFF_WORKLOAD_UNASSIGNED_LABEL,
  type StaffWorkloadRow,
} from '@/lib/dashboardStaffWorkload'
import type { CommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import type { StaffCommandCenterResult } from '@/lib/staffCommandCenter'
import type { ParishHealthOperatingSignals } from '@/lib/parishHealthScore'
import { safeDashboardHref } from '@/lib/safeDashboardHref'

export type OperationalIntelligenceTone = 'healthy' | 'watch' | 'urgent'

export type OperationalIntelligenceInsight = {
  key: string
  label: string
  value: string
  tone: OperationalIntelligenceTone
  reason: string
  recommendedAction: string
  href?: string
}

export type OperationalIntelligenceNextAction = {
  key: string
  title: string
  detail: string
  href?: string
}

export type OperationalIntelligenceBrief = {
  headline: string
  subline: string
  primaryBottleneck: OperationalIntelligenceInsight
  insights: OperationalIntelligenceInsight[]
  nextActions: OperationalIntelligenceNextAction[]
  coverageNotes: string[]
}

export type OperationalIntelligenceRequestSignal = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  assigned_staff_name?: unknown
  checklist_incomplete?: unknown
  checklist_incomplete_count?: unknown
}

export type BuildOperationalIntelligenceBriefInput = {
  now: Date
  requests: readonly OperationalIntelligenceRequestSignal[]
  staffCommandCenter: StaffCommandCenterResult
  staffWorkloadRows: readonly StaffWorkloadRow[]
  communicationCommitments: CommunicationCommitmentQueue
  operatingSignals?: ParishHealthOperatingSignals | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseMs(value: unknown): number | null {
  const raw = text(value)
  if (!raw) return null
  const ms = new Date(raw).getTime()
  return Number.isNaN(ms) ? null : ms
}

function openStatus(value: unknown): boolean {
  return text(value) !== 'complete'
}

function ageDays(value: unknown, now: Date): number | null {
  const ms = parseMs(value)
  if (ms === null || ms > now.getTime()) return null
  return Math.floor((now.getTime() - ms) / DAY_MS)
}

function checklistGapCount(request: OperationalIntelligenceRequestSignal): number {
  if (!openStatus(request.status)) return 0

  const explicitCount = Number(request.checklist_incomplete_count ?? 0)
  if (Number.isFinite(explicitCount) && explicitCount > 0) {
    return Math.floor(explicitCount)
  }

  return Boolean(request.checklist_incomplete) ? 1 : 0
}

function toneForCount(count: number, urgentAt: number, watchAt = 1): OperationalIntelligenceTone {
  if (count >= urgentAt) return 'urgent'
  if (count >= watchAt) return 'watch'
  return 'healthy'
}

function makeHealthyInsight(key: string, label: string, reason: string): OperationalIntelligenceInsight {
  return {
    key,
    label,
    value: 'Steady',
    tone: 'healthy',
    reason,
    recommendedAction: 'Keep reviewing this during the morning check-in.',
  }
}

function requestTypeBottleneck(
  requests: readonly OperationalIntelligenceRequestSignal[],
  now: Date
): OperationalIntelligenceInsight {
  const byType = new Map<
    string,
    {
      openCount: number
      ageSum: number
      ageCount: number
      overdueFollowUps: number
      checklistGaps: number
    }
  >()

  for (const request of requests) {
    if (!openStatus(request.status)) continue
    const typeKey = requestTypeFromRow(request)
    const current = byType.get(typeKey) ?? {
      openCount: 0,
      ageSum: 0,
      ageCount: 0,
      overdueFollowUps: 0,
      checklistGaps: 0,
    }

    current.openCount += 1
    const days = ageDays(request.created_at, now)
    if (days !== null) {
      current.ageSum += days
      current.ageCount += 1
    }
    if (isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) {
      current.overdueFollowUps += 1
    }
    current.checklistGaps += checklistGapCount(request)
    byType.set(typeKey, current)
  }

  let selected:
    | {
        typeKey: string
        openCount: number
        averageAge: number
        overdueFollowUps: number
        checklistGaps: number
        score: number
      }
    | null = null

  for (const [typeKey, value] of byType) {
    const averageAge = value.ageCount > 0 ? value.ageSum / value.ageCount : 0
    const score =
      averageAge +
      value.openCount * 1.5 +
      value.overdueFollowUps * 4 +
      Math.min(value.checklistGaps, 8)
    const candidate = {
      typeKey,
      openCount: value.openCount,
      averageAge,
      overdueFollowUps: value.overdueFollowUps,
      checklistGaps: value.checklistGaps,
      score,
    }

    if (
      !selected ||
      candidate.score > selected.score ||
      (candidate.score === selected.score &&
        formatRequestType(candidate.typeKey).localeCompare(formatRequestType(selected.typeKey)) < 0)
    ) {
      selected = candidate
    }
  }

  if (!selected || selected.openCount === 0) {
    return makeHealthyInsight(
      'request_type_bottleneck',
      'Request type bottleneck',
      'No open request type is currently dominating the work queue.'
    )
  }

  const averageAgeLabel =
    selected.averageAge < 1 ? 'same-day average age' : `${selected.averageAge.toFixed(1)} day average age`
  const typeLabel = formatRequestType(selected.typeKey)

  return {
    key: 'request_type_bottleneck',
    label: 'Request type bottleneck',
    value: typeLabel,
    tone: selected.overdueFollowUps > 0 || selected.averageAge >= 10 ? 'urgent' : 'watch',
    reason: `${typeLabel} has ${selected.openCount} open ${plural(
      selected.openCount,
      'request'
    )}, ${averageAgeLabel}, ${selected.overdueFollowUps} overdue ${plural(
      selected.overdueFollowUps,
      'follow-up'
    )}, and ${selected.checklistGaps} checklist/document ${plural(
      selected.checklistGaps,
      'gap'
    )}.`,
    recommendedAction: `Review the oldest ${typeLabel.toLowerCase()} requests and clear one follow-up, date, or document blocker at a time.`,
    href: safeDashboardHref('/dashboard/requests#staff-command-center-heading'),
  }
}

function followUpInsight(input: BuildOperationalIntelligenceBriefInput): OperationalIntelligenceInsight {
  const repliesOwed = input.communicationCommitments.summary.repliesOwed
  const stale = input.communicationCommitments.summary.stale
  const internalDecisions = input.communicationCommitments.summary.internalDecisions
  const overdue = input.requests.filter((request) =>
    isNextFollowUpOverdue(request.next_follow_up_date, request.status, input.now)
  ).length
  const total = overdue + repliesOwed + stale + internalDecisions

  if (total === 0) {
    return makeHealthyInsight(
      'follow_up_reliability',
      'Follow-up reliability',
      'No overdue follow-ups, stale communication commitments, or internal decisions are visible.'
    )
  }

  return {
    key: 'follow_up_reliability',
    label: 'Follow-up reliability',
    value: String(total),
    tone: toneForCount(total, 5),
    reason: `${overdue} overdue ${plural(overdue, 'follow-up')}, ${repliesOwed} staff-owed ${plural(
      repliesOwed,
      'reply',
      'replies'
    )}, ${internalDecisions} internal ${plural(internalDecisions, 'decision')}, and ${stale} stale ${plural(
      stale,
      'thread'
    )} need review.`,
    recommendedAction: 'Start with overdue family follow-ups, then close the oldest internal decision.',
    href: safeDashboardHref('/dashboard/communications'),
  }
}

function workloadInsight(rows: readonly StaffWorkloadRow[]): OperationalIntelligenceInsight {
  const busiest = [...rows]
    .filter((row) => row.staffDisplay !== STAFF_WORKLOAD_UNASSIGNED_LABEL)
    .sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return b.actionRequired - a.actionRequired
      if (a.openRequests !== b.openRequests) return b.openRequests - a.openRequests
      return a.staffDisplay.localeCompare(b.staffDisplay)
    })[0]
  const unassigned = rows.find((row) => row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL)

  if (!busiest && (!unassigned || unassigned.openRequests === 0)) {
    return makeHealthyInsight(
      'workload_balance',
      'Workload balance',
      'No staff workload concentration or unassigned backlog is visible.'
    )
  }

  if (unassigned && unassigned.openRequests > 0) {
    return {
      key: 'workload_balance',
      label: 'Workload balance',
      value: `${unassigned.openRequests} unassigned`,
      tone: toneForCount(unassigned.openRequests, 3),
      reason: `${unassigned.openRequests} open ${plural(
        unassigned.openRequests,
        'request'
      )} need a clear staff owner before handoffs can be trusted.`,
      recommendedAction: 'Assign owners before adding new follow-up work.',
      href: safeDashboardHref('/dashboard/requests#staff-command-center-heading'),
    }
  }

  return {
    key: 'workload_balance',
    label: 'Workload balance',
    value: busiest.staffDisplay,
    tone: toneForCount(busiest.actionRequired, 4, 2),
    reason: `${busiest.staffDisplay} has ${busiest.openRequests} open ${plural(
      busiest.openRequests,
      'request'
    )} and ${busiest.actionRequired} ${plural(busiest.actionRequired, 'item')} needing attention.`,
    recommendedAction: 'Rebalance one simple follow-up or document task if the queue feels heavy.',
    href: safeDashboardHref('/dashboard/requests#staff-workload-heading'),
  }
}

function recordAndDocumentInsight(
  input: BuildOperationalIntelligenceBriefInput
): OperationalIntelligenceInsight {
  const checklistGaps = input.requests.reduce(
    (total, request) => total + checklistGapCount(request),
    0
  )
  const incompleteRecords = input.operatingSignals?.incompleteSacramentalRecordCount ?? 0
  const certificateReady = input.operatingSignals?.certificateReadyCount ?? 0
  const continuityReview = input.operatingSignals?.unlinkedSacramentalRecordCount ?? 0
  const total = checklistGaps + incompleteRecords + continuityReview + certificateReady

  if (total === 0) {
    return {
      key: 'records_documents',
      label: 'Records and documents',
      value: 'No continuity review',
      tone: 'healthy',
      reason:
        'No sacramental records in the selected parish currently need request-to-record continuity review, and no document/checklist, incomplete record, or certificate-ready signal is visible.',
      recommendedAction:
        'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.',
    }
  }

  const href =
    continuityReview > 0
      ? '/dashboard/records?continuity=needs_review'
      : certificateReady > 0 || incompleteRecords > 0
        ? '/dashboard/records'
        : '/dashboard/requests#staff-command-center-heading'
  const continuityClause =
    continuityReview > 0
      ? `${continuityReview} request-to-record continuity ${plural(
          continuityReview,
          'review item'
        )}`
      : 'no request-to-record continuity review items'

  return {
    key: 'records_documents',
    label: 'Records and documents',
    value: String(total),
    tone: toneForCount(total, 6, 1),
    reason: `${checklistGaps} checklist/document ${plural(
      checklistGaps,
      'gap'
    )}, ${incompleteRecords} incomplete sacramental ${plural(
      incompleteRecords,
      'record'
    )}, ${continuityClause}, and ${certificateReady} baptism certificate ${plural(
      certificateReady,
      'review item'
    )} are visible.`,
    recommendedAction:
      continuityReview > 0
        ? 'Open the Records continuity review queue before certificate work; staff should verify request links manually.'
        : 'No continuity review items are visible; clear required documents first, then review incomplete record fields and certificate-ready baptism records.',
    href: safeDashboardHref(href),
  }
}

function sortInsights(
  insights: readonly OperationalIntelligenceInsight[]
): OperationalIntelligenceInsight[] {
  const toneRank: Record<OperationalIntelligenceTone, number> = {
    urgent: 0,
    watch: 1,
    healthy: 2,
  }

  return insights
    .map((insight, index) => ({ insight, index }))
    .sort((a, b) => {
      if (toneRank[a.insight.tone] !== toneRank[b.insight.tone]) {
        return toneRank[a.insight.tone] - toneRank[b.insight.tone]
      }
      return a.index - b.index
    })
    .map(({ insight }) => insight)
}

function nextActionsFor(insights: readonly OperationalIntelligenceInsight[]): OperationalIntelligenceNextAction[] {
  const actions = insights
    .filter((insight) => insight.tone !== 'healthy')
    .map((insight) => ({
      key: insight.key,
      title: insight.label,
      detail: insight.recommendedAction,
      href: safeDashboardHref(insight.href),
    }))
    .slice(0, 3)

  if (actions.length > 0) return actions

  return [
    {
      key: 'steady_review',
      title: 'Keep the morning review short',
      detail:
        'No major bottleneck is visible. Review new requests, check today’s follow-ups, and keep owners current.',
      href: safeDashboardHref('/dashboard/requests'),
    },
  ]
}

export function buildOperationalIntelligenceBrief(
  input: BuildOperationalIntelligenceBriefInput
): OperationalIntelligenceBrief {
  const insights = sortInsights([
    requestTypeBottleneck(input.requests, input.now),
    followUpInsight(input),
    workloadInsight(input.staffWorkloadRows),
    recordAndDocumentInsight(input),
  ])
  const primaryBottleneck = insights[0]
  const riskyCount = insights.filter((insight) => insight.tone !== 'healthy').length

  return {
    headline:
      primaryBottleneck.tone === 'healthy'
        ? 'No major bottleneck is visible right now.'
        : `${primaryBottleneck.label} needs the first look.`,
    subline:
      riskyCount > 0
        ? `${riskyCount} operational ${plural(
            riskyCount,
            'signal'
          )} should be reviewed before routine work.`
        : 'The dashboard signals look steady. Keep the morning review focused and pastoral.',
    primaryBottleneck,
    insights,
    nextActions: nextActionsFor(insights),
    coverageNotes: [
      'This is read-only guidance from existing request, communication, workload, record, and duplicate-review signals.',
      'A steady continuity signal means no selected-parish sacramental record rows currently need request-link review in this dashboard signal.',
      'It does not send reminders, change records, run exports, inspect documents, call AI, or make sacramental/canonical decisions.',
      'True calendar-conflict detection remains a separate future integration slice.',
    ],
  }
}
