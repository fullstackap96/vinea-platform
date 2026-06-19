import {
  buildStaffCommandCenterRows,
  type StaffCommandCenterRequest,
} from '@/lib/staffCommandCenter'
import {
  buildStaffWorkloadRows,
  STAFF_WORKLOAD_UNASSIGNED_LABEL,
} from '@/lib/dashboardStaffWorkload'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { formatRequestType } from '@/lib/formatRequestType'
import { dashboardRequestScheduleRow } from '@/lib/requestWorkflowV2'
import { isMissingConfirmedSchedule } from '@/lib/requestConfirmedSchedule'
import { isNextFollowUpDueToday, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'

export type ParishOpsBriefFocusItem = {
  requestId: string
  title: string
  requestTypeLabel: string
  nextStepTitle: string
  actionLabel: string
  ownerLabel: string
  blockerLabel: string
  href: string
}

export type ParishOpsBriefSeverity = 'urgent' | 'warning' | 'steady'

export type ParishOpsBriefItem = {
  key: string
  label: string
  value: number
  detail: string
  severity: ParishOpsBriefSeverity
}

export type ParishOpsBrief = {
  headline: string
  subline: string
  firstAction: string
  huddleNote: string
  items: ParishOpsBriefItem[]
  focusItems: ParishOpsBriefFocusItem[]
  today: {
    firstContactNeeded: number
    followUpsDueToday: number
    overdueFollowUps: number
    urgentFunerals: number
    missingConfirmedSchedules: number
    blocked: number
    completed: number
  }
}

function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return n === 1 ? singular : pluralForm
}

function isOrAre(n: number) {
  return n === 1 ? 'is' : 'are'
}

function needsOrNeed(n: number) {
  return n === 1 ? 'needs' : 'need'
}

function severityForCount(count: number, urgentAt = 1): ParishOpsBriefSeverity {
  if (count >= urgentAt) return 'urgent'
  return 'steady'
}

function isOpenRequest(request: StaffCommandCenterRequest): boolean {
  return String(request.status ?? '').trim() !== 'complete'
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

function buildFirstAction(input: {
  urgentCount: number
  unassignedCount: number
  blockedCount: number
  agingCount: number
  firstFocusItem: ParishOpsBriefFocusItem | null
}): string {
  if (input.firstFocusItem) {
    return `${input.firstFocusItem.nextStepTitle}: ${input.firstFocusItem.title}`
  }
  if (input.unassignedCount > 0) return 'Assign clear owners before routine follow-up.'
  if (input.blockedCount > 0) return 'Review blockers and decide who needs a nudge.'
  if (input.agingCount > 0) return 'Send a short check-in on the stalest family thread.'
  if (input.urgentCount > 0) return 'Open the command center and work the urgent rows first.'
  return 'Review upcoming work and keep follow-up dates current.'
}

function buildHuddleNote(input: {
  headline: string
  subline: string
  items: ParishOpsBriefItem[]
  focusItems: ParishOpsBriefFocusItem[]
  firstAction: string
  today: ParishOpsBrief['today']
}): string {
  const counts = input.items
    .filter((item) => item.key !== 'owner_focus')
    .map((item) => `${item.label}: ${item.value}`)
    .join(' | ')
  const focusLines =
    input.focusItems.length > 0
      ? input.focusItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.requestTypeLabel}: ${item.title} - ${item.nextStepTitle} (${item.actionLabel}; owner: ${item.ownerLabel}; blocker: ${item.blockerLabel})`
          )
          .join('\n')
      : 'No urgent focus rows are currently flagged.'

  return [
    `Parish ops brief: ${input.headline}`,
    input.subline,
    `First action: ${input.firstAction}`,
    `Counts: ${counts}`,
    `Today: first contact ${input.today.firstContactNeeded} | due today ${input.today.followUpsDueToday} | overdue ${input.today.overdueFollowUps} | urgent funerals ${input.today.urgentFunerals} | missing schedules ${input.today.missingConfirmedSchedules} | completed ${input.today.completed}`,
    'Start here:',
    focusLines,
  ].join('\n')
}

export function buildParishOpsBrief(
  requests: readonly StaffCommandCenterRequest[],
  options?: { now?: Date }
): ParishOpsBrief {
  const now = options?.now ?? new Date()
  const commandCenter = buildStaffCommandCenterRows(requests, { now, limit: 5 })
  const allCommandCenterRows = buildStaffCommandCenterRows(requests, { now }).rows
  const workload = buildStaffWorkloadRows(requests, now)
  const openRequests = requests.filter(isOpenRequest)

  const unassigned = workload.find(
    (row) => row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL
  )
  const unassignedCount = unassigned?.openRequests ?? 0
  const urgentCount = commandCenter.summary.actNow
  const blockedCount = commandCenter.summary.blocked
  const agingCount = commandCenter.summary.aging
  const today: ParishOpsBrief['today'] = {
    firstContactNeeded: openRequests.filter((request) => isBlank(request.last_contacted_at)).length,
    followUpsDueToday: openRequests.filter((request) =>
      isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)
    ).length,
    overdueFollowUps: openRequests.filter((request) =>
      isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
    ).length,
    urgentFunerals: allCommandCenterRows.filter(
      (row) => row.requestType === 'funeral' && row.bucket === 'act_now'
    ).length,
    missingConfirmedSchedules: openRequests.filter((request) => {
      const requestType = String(request.request_type ?? '').trim()
      if (!['baptism', 'funeral', 'wedding', 'ocia'].includes(requestType)) return false
      return isMissingConfirmedSchedule(dashboardRequestScheduleRow(request))
    }).length,
    blocked: blockedCount,
    completed: requests.filter((request) => String(request.status ?? '').trim() === 'complete')
      .length,
  }
  const overloadedOwner = workload
    .filter((row) => row.staffDisplay !== STAFF_WORKLOAD_UNASSIGNED_LABEL)
    .sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return b.actionRequired - a.actionRequired
      return b.openRequests - a.openRequests
    })[0]

  const headline =
    urgentCount > 0
      ? `${urgentCount} ${plural(urgentCount, 'request')} ${needsOrNeed(urgentCount)} action today`
      : blockedCount > 0
        ? `${blockedCount} ${plural(blockedCount, 'request')} ${isOrAre(blockedCount)} blocked`
        : agingCount > 0
          ? `${agingCount} ${plural(agingCount, 'request')} ${needsOrNeed(agingCount)} a fresh touchpoint`
          : 'Parish operations are in good shape'

  const subline =
    urgentCount > 0
      ? 'Start with the command center rows marked Act now, then clear unassigned ownership.'
      : blockedCount > 0
        ? 'Review blockers and decide whether to nudge the family, documents, or internal owner.'
        : agingCount > 0
          ? 'A short check-in can keep families from feeling forgotten.'
          : 'Review upcoming work and keep follow-up dates current.'

  const items: ParishOpsBriefItem[] = [
    {
      key: 'act_now',
      label: 'Act now',
      value: urgentCount,
      detail:
        urgentCount > 0
          ? `${urgentCount} open ${plural(urgentCount, 'request')} should be handled before routine work.`
          : 'No urgent command-center items are currently flagged.',
      severity: severityForCount(urgentCount),
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      value: unassignedCount,
      detail:
        unassignedCount > 0
          ? `${unassignedCount} open ${plural(unassignedCount, 'request')} need a clear staff owner.`
          : 'Every open request has a staff owner.',
      severity: severityForCount(unassignedCount),
    },
    {
      key: 'blocked',
      label: 'Blocked',
      value: blockedCount,
      detail:
        blockedCount > 0
          ? `${blockedCount} ${plural(blockedCount, 'request')} are waiting on a person, document, date, or staff action.`
          : 'No operational blockers are currently tagged.',
      severity: blockedCount > 0 ? 'warning' : 'steady',
    },
    {
      key: 'aging',
      label: 'Aging',
      value: agingCount,
      detail:
        agingCount > 0
          ? `${agingCount} ${plural(agingCount, 'request')} have stale or missing contact.`
          : 'No stale-contact command-center rows are currently flagged.',
      severity: agingCount > 0 ? 'warning' : 'steady',
    },
    {
      key: 'first_contact',
      label: 'First contact',
      value: today.firstContactNeeded,
      detail:
        today.firstContactNeeded > 0
          ? `${today.firstContactNeeded} open ${plural(today.firstContactNeeded, 'request')} still need first contact logged.`
          : 'Every open request has a first contact logged.',
      severity: severityForCount(today.firstContactNeeded),
    },
    {
      key: 'due_today',
      label: 'Due today',
      value: today.followUpsDueToday,
      detail:
        today.followUpsDueToday > 0
          ? `${today.followUpsDueToday} ${plural(today.followUpsDueToday, 'follow-up')} should happen today.`
          : 'No follow-ups are due today.',
      severity: today.followUpsDueToday > 0 ? 'warning' : 'steady',
    },
    {
      key: 'overdue_followup',
      label: 'Overdue',
      value: today.overdueFollowUps,
      detail:
        today.overdueFollowUps > 0
          ? `${today.overdueFollowUps} ${plural(today.overdueFollowUps, 'follow-up')} are past due.`
          : 'No follow-ups are overdue.',
      severity: severityForCount(today.overdueFollowUps),
    },
    {
      key: 'missing_schedule',
      label: 'Missing dates',
      value: today.missingConfirmedSchedules,
      detail:
        today.missingConfirmedSchedules > 0
          ? `${today.missingConfirmedSchedules} sacramental or pastoral ${plural(
              today.missingConfirmedSchedules,
              'request'
            )} need a confirmed date/time.`
          : 'Required dates and times are confirmed.',
      severity: today.missingConfirmedSchedules > 0 ? 'warning' : 'steady',
    },
  ]

  if (overloadedOwner && overloadedOwner.actionRequired > 0) {
    items.push({
      key: 'owner_focus',
      label: 'Owner focus',
      value: overloadedOwner.actionRequired,
      detail: `${overloadedOwner.staffDisplay} has ${overloadedOwner.actionRequired} ${plural(
        overloadedOwner.actionRequired,
        'item'
      )} needing attention.`,
      severity: overloadedOwner.actionRequired >= 3 ? 'urgent' : 'warning',
    })
  }

  const focusItems = commandCenter.rows.slice(0, 3).map((row) => ({
    requestId: row.requestId,
    title: getRequestDetailPrimaryHeading({
      request_type: row.request.request_type,
      child_name: row.request.child_name,
      parishioner: row.request.parishioner,
      funeralDetail: row.request.funeral_detail,
      weddingDetail: row.request.wedding_detail,
    }),
    requestTypeLabel: formatRequestType(row.requestType),
    nextStepTitle: row.workflow.nextStepTitle,
    actionLabel: row.workflow.recommendedActionLabel,
    ownerLabel: row.ownerLabel,
    blockerLabel: row.blockerLabel,
    href: row.detailHref,
  }))
  const firstAction = buildFirstAction({
    urgentCount,
    unassignedCount,
    blockedCount,
    agingCount,
    firstFocusItem: focusItems[0] ?? null,
  })

  return {
    headline,
    subline,
    firstAction,
    huddleNote: buildHuddleNote({ headline, subline, items, focusItems, firstAction, today }),
    items,
    focusItems,
    today,
  }
}
