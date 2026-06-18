import {
  buildStaffCommandCenterRows,
  type StaffCommandCenterRequest,
} from '@/lib/staffCommandCenter'
import {
  buildStaffWorkloadRows,
  STAFF_WORKLOAD_UNASSIGNED_LABEL,
} from '@/lib/dashboardStaffWorkload'

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
  items: ParishOpsBriefItem[]
  focusRequestIds: string[]
}

function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return n === 1 ? singular : pluralForm
}

function severityForCount(count: number, urgentAt = 1): ParishOpsBriefSeverity {
  if (count >= urgentAt) return 'urgent'
  return 'steady'
}

export function buildParishOpsBrief(
  requests: readonly StaffCommandCenterRequest[],
  options?: { now?: Date }
): ParishOpsBrief {
  const now = options?.now ?? new Date()
  const commandCenter = buildStaffCommandCenterRows(requests, { now, limit: 5 })
  const workload = buildStaffWorkloadRows(requests, now)

  const unassigned = workload.find(
    (row) => row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL
  )
  const unassignedCount = unassigned?.openRequests ?? 0
  const urgentCount = commandCenter.summary.actNow
  const blockedCount = commandCenter.summary.blocked
  const agingCount = commandCenter.summary.aging
  const overloadedOwner = workload
    .filter((row) => row.staffDisplay !== STAFF_WORKLOAD_UNASSIGNED_LABEL)
    .sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return b.actionRequired - a.actionRequired
      return b.openRequests - a.openRequests
    })[0]

  const headline =
    urgentCount > 0
      ? `${urgentCount} ${plural(urgentCount, 'request')} need action today`
      : blockedCount > 0
        ? `${blockedCount} ${plural(blockedCount, 'request')} are blocked`
        : agingCount > 0
          ? `${agingCount} ${plural(agingCount, 'request')} need a fresh touchpoint`
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

  return {
    headline,
    subline,
    items,
    focusRequestIds: commandCenter.rows.slice(0, 3).map((row) => row.requestId),
  }
}
