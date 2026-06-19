import {
  STAFF_WORKLOAD_UNASSIGNED_LABEL,
  buildStaffWorkloadRows,
  type StaffWorkloadRow,
} from '@/lib/dashboardStaffWorkload'
import { formatRequestType } from '@/lib/formatRequestType'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import {
  buildStaffCommandCenterRows,
  type StaffCommandCenterRequest,
  type StaffCommandCenterRow,
} from '@/lib/staffCommandCenter'

export type OwnershipHealthTone = 'urgent' | 'warning' | 'steady'

export type OwnershipHealthAction = {
  key: string
  tone: OwnershipHealthTone
  title: string
  detail: string
  href?: string
  actionLabel?: string
}

export type OwnershipHealthResult = {
  headline: string
  summary: string
  unassignedOpen: number
  unassignedUrgent: number
  overloadedOwners: number
  actions: OwnershipHealthAction[]
}

function plural(count: number, singular: string, pluralLabel = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralLabel}`
}

function isUnassigned(value: string): boolean {
  return value === STAFF_WORKLOAD_UNASSIGNED_LABEL
}

function requestTitle(row: StaffCommandCenterRow): string {
  return getRequestDetailPrimaryHeading({
    request_type: row.request.request_type,
    child_name: row.request.child_name,
    parishioner: row.request.parishioner,
    funeralDetail: row.request.funeral_detail,
    weddingDetail: row.request.wedding_detail,
  })
}

function requestTypeLabel(row: StaffCommandCenterRow): string {
  return formatRequestType(row.requestType) || 'Request'
}

function overloadedWorkloadRows(rows: StaffWorkloadRow[]): StaffWorkloadRow[] {
  return rows
    .filter((row) => !isUnassigned(row.staffDisplay))
    .filter((row) => row.openRequests >= 5 || row.actionRequired >= 3 || row.overdueFollowUps >= 2)
    .sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return b.actionRequired - a.actionRequired
      if (a.overdueFollowUps !== b.overdueFollowUps) return b.overdueFollowUps - a.overdueFollowUps
      return b.openRequests - a.openRequests
    })
}

export function buildOwnershipHealth(
  requests: readonly StaffCommandCenterRequest[],
  options?: { now?: Date; limit?: number }
): OwnershipHealthResult {
  const now = options?.now ?? new Date()
  const limit = options?.limit ?? 5
  const commandCenter = buildStaffCommandCenterRows(requests, { now, limit: 100 })
  const workloadRows = buildStaffWorkloadRows(requests, now)
  const unassignedWorkload = workloadRows.find((row) => isUnassigned(row.staffDisplay))
  const unassignedOpen = unassignedWorkload?.openRequests ?? 0
  const unassignedUrgentRows = commandCenter.rows.filter(
    (row) => isUnassigned(row.ownerLabel) && row.bucket === 'act_now'
  )
  const unassignedUrgent = unassignedUrgentRows.length
  const overloaded = overloadedWorkloadRows(workloadRows)
  const ownedUrgentRows = commandCenter.rows.filter(
    (row) =>
      !isUnassigned(row.ownerLabel) &&
      (row.workflow.urgency === 'overdue' ||
        row.workflow.urgency === 'high' ||
        row.smartFollowUp.urgency === 'critical' ||
        row.smartFollowUp.urgency === 'high')
  )

  const actions: OwnershipHealthAction[] = []

  if (unassignedUrgent > 0) {
    const first = unassignedUrgentRows[0]
    actions.push({
      key: 'unassigned-urgent',
      tone: 'urgent',
      title: `Assign ${plural(unassignedUrgent, 'urgent request')}`,
      detail: first
        ? `${requestTypeLabel(first)} for ${requestTitle(first)} needs an owner before routine work.`
        : 'Urgent requests need clear ownership before routine work.',
      href: first?.detailHref,
      actionLabel: 'Assign owner',
    })
  } else if (unassignedOpen > 0) {
    const first = commandCenter.rows.find((row) => isUnassigned(row.ownerLabel))
    actions.push({
      key: 'unassigned-open',
      tone: 'warning',
      title: `Assign ${plural(unassignedOpen, 'open request')}`,
      detail: 'Unassigned requests are the most likely to get lost during a busy parish day.',
      href: first?.detailHref,
      actionLabel: first ? 'Review assignment' : undefined,
    })
  }

  for (const owner of overloaded.slice(0, 2)) {
    actions.push({
      key: `owner-${owner.staffDisplay}`,
      tone: owner.actionRequired >= 3 || owner.overdueFollowUps >= 2 ? 'urgent' : 'warning',
      title: `${owner.staffDisplay} may need relief`,
      detail: `${owner.staffDisplay} has ${plural(owner.openRequests, 'open request')}, ${plural(
        owner.actionRequired,
        'item'
      )} needing attention, and ${plural(owner.overdueFollowUps, 'past-due follow-up')}.`,
    })
  }

  for (const row of ownedUrgentRows.slice(0, 2)) {
    actions.push({
      key: `owned-urgent-${row.requestId}`,
      tone: row.workflow.urgency === 'overdue' ? 'urgent' : 'warning',
      title: `${row.ownerLabel} has urgent follow-up`,
      detail: `${requestTypeLabel(row)} for ${requestTitle(row)}: ${row.workflow.nextStepTitle}.`,
      href: row.detailHref,
      actionLabel: row.workflow.recommendedActionLabel,
    })
  }

  const limitedActions = actions.slice(0, limit)
  const headline =
    unassignedUrgent > 0
      ? `${plural(unassignedUrgent, 'urgent request')} need ownership`
      : overloaded.length > 0
        ? `${plural(overloaded.length, 'owner')} may be overloaded`
        : unassignedOpen > 0
          ? `${plural(unassignedOpen, 'request')} need assignment`
          : 'Ownership looks balanced'

  return {
    headline,
    summary:
      limitedActions.length > 0
        ? 'Use this before routine work to decide what should be assigned or reassigned.'
        : 'No urgent ownership gaps are showing right now.',
    unassignedOpen,
    unassignedUrgent,
    overloadedOwners: overloaded.length,
    actions: limitedActions,
  }
}
