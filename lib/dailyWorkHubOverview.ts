import type { CareCadenceResult } from '@/lib/careCadence'
import type { CommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import type { DailyOperatingSystemHealthSignals } from '@/lib/dailyOperatingSystemSignals'
import type { StaffWorkloadRow } from '@/lib/dashboardStaffWorkload'
import { STAFF_WORKLOAD_UNASSIGNED_LABEL } from '@/lib/dashboardStaffWorkload'
import type { ParishOpsBrief } from '@/lib/parishOpsBrief'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'
import type { StaffCommandCenterResult } from '@/lib/staffCommandCenter'

export type DailyWorkHubMetricTone = 'urgent' | 'warning' | 'steady'

export type DailyWorkHubMetric = {
  key: string
  label: string
  value: number | string
  helper: string
  tone: DailyWorkHubMetricTone
}

export type DailyWorkHubAction = {
  key: string
  label: string
  detail: string
  href: string
  ownerLabel: string
  urgency: DailyWorkHubMetricTone
  category: string
}

export type DailyWorkHubWatchItem = {
  key: string
  label: string
  value: number | string
  detail: string
  tone: DailyWorkHubMetricTone
}

export type DailyWorkHubReadyNextItem = {
  key: string
  label: string
  value: number | string
  detail: string
  href: string
  tone: DailyWorkHubMetricTone
}

export type DailyWorkHubContinuityCue = {
  label: string
  stateLabel: string
  detail: string
  href: string
  drilldownLabel: string
  drilldownDetail: string
  tone: DailyWorkHubMetricTone
  linkedRecordCount: number
  unlinkedRecordCount: number
  certificateActivityCount: number
}

export type DailyWorkHubFutureSignal = {
  key: string
  label: string
  statusLabel: string
  detail: string
}

export type DailyWorkHubOverview = {
  greeting: string
  headline: string
  subline: string
  firstAction: string
  metrics: DailyWorkHubMetric[]
  topActions: DailyWorkHubAction[]
  watchItems: DailyWorkHubWatchItem[]
  readyNextItems: DailyWorkHubReadyNextItem[]
  requestToRecordContinuity: DailyWorkHubContinuityCue
  futureSignals: DailyWorkHubFutureSignal[]
}

export type DailyWorkHubRequestSignal = {
  status?: unknown
  checklist_incomplete?: unknown
  checklist_incomplete_count?: unknown
}

export type BuildDailyWorkHubOverviewInput = {
  now: Date
  requests: readonly DailyWorkHubRequestSignal[]
  staffCommandCenter: StaffCommandCenterResult
  parishOpsBrief: ParishOpsBrief
  staffWorkloadRows: readonly StaffWorkloadRow[]
  careCadence: CareCadenceResult
  communicationCommitments: CommunicationCommitmentQueue
  operatingSignals?: DailyOperatingSystemHealthSignals
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm
}

function toneForCount(count: number, urgentAt = 1): DailyWorkHubMetricTone {
  return count >= urgentAt ? 'urgent' : 'steady'
}

function openChecklistGapCount(requests: readonly DailyWorkHubRequestSignal[]): number {
  return requests.reduce((total, request) => {
    if (String(request.status ?? '').trim() === 'complete') return total

    const explicitCount = Number(request.checklist_incomplete_count ?? 0)
    if (Number.isFinite(explicitCount) && explicitCount > 0) {
      return total + Math.floor(explicitCount)
    }

    return total + (Boolean(request.checklist_incomplete) ? 1 : 0)
  }, 0)
}

function timeGreeting(now: Date): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function unassignedCount(rows: readonly StaffWorkloadRow[]): number {
  return rows.find((row) => row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL)?.openRequests ?? 0
}

function workloadBalance(rows: readonly StaffWorkloadRow[]): DailyWorkHubWatchItem {
  const busiest = [...rows]
    .filter((row) => row.staffDisplay !== STAFF_WORKLOAD_UNASSIGNED_LABEL)
    .sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return b.actionRequired - a.actionRequired
      return b.openRequests - a.openRequests
    })[0]

  if (!busiest || busiest.actionRequired === 0) {
    return {
      key: 'workload_balance',
      label: 'Workload balance',
      value: 'Steady',
      detail: 'No staff member has urgent work concentrated in this view.',
      tone: 'steady',
    }
  }

  return {
    key: 'workload_balance',
    label: 'Workload balance',
    value: busiest.actionRequired,
    detail: `${busiest.staffDisplay} has ${busiest.actionRequired} ${plural(
      busiest.actionRequired,
      'item'
    )} needing attention.`,
    tone: busiest.actionRequired >= 3 ? 'urgent' : 'warning',
  }
}

function buildTopActions(input: BuildDailyWorkHubOverviewInput): DailyWorkHubAction[] {
  const fromFocusItems = input.parishOpsBrief.focusItems.map((item) => ({
    key: `focus-${item.requestId}`,
    label: item.nextStepTitle,
    detail: `${item.requestTypeLabel}: ${item.title}`,
    href: safeDashboardHrefOrFallback(item.href, '/dashboard/requests'),
    ownerLabel: item.ownerLabel,
    urgency: 'urgent' as const,
    category: item.actionLabel,
  }))

  const fallbackActions = input.staffCommandCenter.rows.slice(0, 3).map((row) => ({
    key: `command-${row.requestId}`,
    label: row.workflow.nextStepTitle,
    detail:
      row.blockerLabel !== 'No blocker'
        ? `${row.requestType}: waiting on ${row.blockerLabel.toLowerCase()}.`
        : `${row.requestType}: ${row.workflow.recommendedActionLabel}.`,
    href: safeDashboardHrefOrFallback(row.detailHref, '/dashboard/requests'),
    ownerLabel: row.ownerLabel,
    urgency: row.bucket === 'act_now' ? ('urgent' as const) : ('warning' as const),
    category: row.bucketLabel,
  }))

  return (fromFocusItems.length > 0 ? fromFocusItems : fallbackActions).slice(0, 3)
}

export function buildDailyWorkHubOverview(
  input: BuildDailyWorkHubOverviewInput
): DailyWorkHubOverview {
  const attentionToday = input.staffCommandCenter.summary.actNow
  const blocked = input.staffCommandCenter.summary.blocked
  const overdueFollowUps = input.parishOpsBrief.today.overdueFollowUps
  const firstContactNeeded = input.parishOpsBrief.today.firstContactNeeded
  const assignedGapCount = unassignedCount(input.staffWorkloadRows)
  const checklistGaps = openChecklistGapCount(input.requests)
  const communicationFollowUps = input.communicationCommitments.summary.repliesOwed
  const missingDates = input.parishOpsBrief.today.missingConfirmedSchedules
  const careToday = input.careCadence.summary.needsCareToday
  const duplicateCandidates = input.operatingSignals?.duplicateCandidateCount ?? 0
  const incompleteRecords = input.operatingSignals?.incompleteSacramentalRecordCount ?? 0
  const certificateReady = input.operatingSignals?.certificateReadyCount ?? 0
  const linkedRecords = input.operatingSignals?.linkedSacramentalRecordCount ?? 0
  const unlinkedRecords = input.operatingSignals?.unlinkedSacramentalRecordCount ?? 0
  const certificateActivity = input.operatingSignals?.certificateActivityCount ?? 0

  const headline =
    attentionToday > 0 || overdueFollowUps > 0
      ? `Start with ${Math.max(attentionToday, overdueFollowUps)} ${plural(
          Math.max(attentionToday, overdueFollowUps),
          'urgent item'
        )}.`
      : blocked > 0
        ? `Clear ${blocked} ${plural(blocked, 'blocker')} before routine work.`
        : 'Parish work is in good shape right now.'

  const subline =
    attentionToday > 0
      ? 'Work the highest-risk requests first, then clear ownership and follow-up gaps.'
      : overdueFollowUps > 0
        ? 'Catch up on family follow-ups first so nobody feels forgotten.'
        : blocked > 0
          ? 'Resolve what is waiting on staff, families, documents, or dates.'
          : 'Review upcoming work and keep follow-up dates current.'

  return {
    greeting: timeGreeting(input.now),
    headline,
    subline,
    firstAction: input.parishOpsBrief.firstAction,
    metrics: [
      {
        key: 'attention_today',
        label: 'Needs attention today',
        value: attentionToday,
        helper:
          attentionToday > 0
            ? `${attentionToday} ${plural(attentionToday, 'request')} should be handled first.`
            : 'No urgent command-center items are flagged.',
        tone: toneForCount(attentionToday),
      },
      {
        key: 'overdue_followups',
        label: 'Overdue follow-ups',
        value: overdueFollowUps,
        helper:
          overdueFollowUps > 0
            ? `${overdueFollowUps} family ${plural(overdueFollowUps, 'follow-up')} are past due.`
            : 'No family follow-ups are overdue.',
        tone: toneForCount(overdueFollowUps),
      },
      {
        key: 'blocked',
        label: 'Blocked work',
        value: blocked,
        helper:
          blocked > 0
            ? `${blocked} ${plural(blocked, 'request')} are waiting on a person, date, document, or staff action.`
            : 'No blockers are currently tagged.',
        tone: blocked > 0 ? 'warning' : 'steady',
      },
      {
        key: 'unassigned',
        label: 'Needs an owner',
        value: assignedGapCount,
        helper:
          assignedGapCount > 0
            ? `${assignedGapCount} open ${plural(assignedGapCount, 'request')} need a clear staff owner.`
            : 'Open requests have staff owners.',
        tone: toneForCount(assignedGapCount),
      },
    ],
    topActions: buildTopActions(input),
    watchItems: [
      {
        key: 'care_today',
        label: 'Pastoral care today',
        value: careToday,
        detail:
          careToday > 0
            ? `${careToday} ${plural(careToday, 'family')} need care cadence attention.`
            : 'No care cadence items are urgent today.',
        tone: careToday > 0 ? 'warning' : 'steady',
      },
      {
        key: 'documents_checklist',
        label: 'Documents/checklist',
        value: checklistGaps,
        detail:
          checklistGaps > 0
            ? `${checklistGaps} open checklist or document-related ${plural(checklistGaps, 'item')} need attention.`
            : 'No open checklist gaps are visible in this view.',
        tone: checklistGaps > 0 ? 'warning' : 'steady',
      },
      {
        key: 'communications',
        label: 'Communications',
        value: communicationFollowUps,
        detail:
          communicationFollowUps > 0
            ? `${communicationFollowUps} ${plural(communicationFollowUps, 'family')} are owed a staff reply or follow-up.`
            : 'No staff-owed family replies are flagged.',
        tone: communicationFollowUps > 0 ? 'warning' : 'steady',
      },
      {
        key: 'missing_dates',
        label: 'Scheduling/date gaps',
        value: missingDates,
        detail:
          missingDates > 0
            ? `${missingDates} sacramental or pastoral ${plural(missingDates, 'request')} need a confirmed date or time.`
            : 'Required request dates and times are confirmed.',
        tone: missingDates > 0 ? 'warning' : 'steady',
      },
      {
        key: 'first_contact',
        label: 'First contact',
        value: firstContactNeeded,
        detail:
          firstContactNeeded > 0
            ? `${firstContactNeeded} open ${plural(firstContactNeeded, 'request')} still need first contact logged.`
            : 'Every open request has first contact logged.',
        tone: firstContactNeeded > 0 ? 'warning' : 'steady',
      },
      workloadBalance(input.staffWorkloadRows),
    ],
    readyNextItems: [
      {
        key: 'duplicate_review',
        label: 'Duplicate review',
        value: duplicateCandidates,
        detail:
          duplicateCandidates > 0
            ? `${duplicateCandidates} possible duplicate ${plural(
                duplicateCandidates,
                'person/household match',
                'person/household matches'
              )} should be reviewed before staff rely on the directory.`
            : 'No duplicate review backlog is visible right now.',
        href: safeDashboardHrefOrFallback(
          duplicateCandidates > 0 ? '/dashboard/people/duplicates' : '/dashboard/people',
          '/dashboard/people'
        ),
        tone: duplicateCandidates > 0 ? 'warning' : 'steady',
      },
      {
        key: 'incomplete_records',
        label: 'Incomplete sacramental records',
        value: incompleteRecords,
        detail:
          incompleteRecords > 0
            ? `${incompleteRecords} sacramental ${plural(
                incompleteRecords,
                'record'
              )} need basic register fields checked.`
            : 'Sacramental records have the basic register fields visible to this dashboard.',
        href: safeDashboardHrefOrFallback('/dashboard/records', '/dashboard/records'),
        tone: incompleteRecords > 0 ? 'warning' : 'steady',
      },
      {
        key: 'certificate_ready',
        label: 'Certificate-ready review',
        value: certificateReady,
        detail:
          certificateReady > 0
            ? `${certificateReady} baptism ${plural(
                certificateReady,
                'record'
              )} look ready for staff certificate review.`
            : 'No baptism records are waiting in the certificate-ready review signal.',
        href: safeDashboardHrefOrFallback('/dashboard/records', '/dashboard/records'),
        tone: certificateReady > 0 ? 'warning' : 'steady',
      },
    ],
    requestToRecordContinuity: {
      label: 'Request-to-record continuity',
      stateLabel:
        linkedRecords + unlinkedRecords === 0
          ? 'No record signals yet'
          : unlinkedRecords > 0
            ? 'Manual review needed'
            : 'Linked records visible',
      detail:
        linkedRecords + unlinkedRecords === 0
          ? 'No sacramental records are visible in this dashboard signal yet.'
          : unlinkedRecords > 0
            ? `${unlinkedRecords} sacramental ${plural(
                unlinkedRecords,
                'record'
              )} do not show an originating Vinea request link. Open the Records continuity review queue before certificate work.`
            : `${linkedRecords} sacramental ${plural(
                linkedRecords,
                'record'
              )} show originating request links in this view. Certificate activity is still staff-reviewed.`,
      href: safeDashboardHrefOrFallback(
        '/dashboard/records?continuity=needs_review',
        '/dashboard/records'
      ),
      drilldownLabel:
        unlinkedRecords > 0
          ? 'Open records needing staff handoff'
          : 'Review continuity queue',
      drilldownDetail:
        'This opens the read-only Records continuity review queue. Staff choose any next step; Vinea does not link records or issue certificates here.',
      tone: unlinkedRecords > 0 ? 'warning' : 'steady',
      linkedRecordCount: linkedRecords,
      unlinkedRecordCount: unlinkedRecords,
      certificateActivityCount: certificateActivity,
    },
    futureSignals: [
      {
        key: 'records_certificates',
        label: 'Records/certificates',
        statusLabel: 'Live read-only signal',
        detail:
          'Duplicate backlog, incomplete record, certificate-ready, and request-to-record continuity counts now appear in the Daily Work Hub without changing records.',
      },
      {
        key: 'calendar_conflicts',
        label: 'Calendar conflicts',
        statusLabel: 'Needs evidence',
        detail:
          'Confirmed date gaps are shown today. True Google Calendar conflict detection needs a separate safe integration slice.',
      },
    ],
  }
}
