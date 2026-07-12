import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import type {
  StaffCommandCenterResult,
  StaffCommandCenterRow,
} from '@/lib/staffCommandCenter'

export type DashboardRoleLensId =
  | 'administrator'
  | 'receptionist'
  | 'pastor'
  | 'ocia'
  | 'sacramental'

export type DashboardRoleWorkHubItem = {
  requestId: string
  requestType: string
  personLabel: string
  detailHref: string
  signalLabel: string
  reason: string
  actionLabel: string
  ownerLabel: string
  urgency: StaffCommandCenterRow['workflow']['urgency']
}

export type DashboardRoleWorkHubLens = {
  id: DashboardRoleLensId
  title: string
  shortLabel: string
  description: string
  emptyTitle: string
  emptyBody: string
  totalCount: number
  actNowCount: number
  blockedCount: number
  items: DashboardRoleWorkHubItem[]
}

export type DashboardRoleWorkHubResult = {
  lenses: DashboardRoleWorkHubLens[]
  defaultLensId: DashboardRoleLensId
}

type RoleDefinition = {
  id: DashboardRoleLensId
  title: string
  shortLabel: string
  description: string
  emptyTitle: string
  emptyBody: string
  matches: (row: StaffCommandCenterRow) => boolean
}

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'administrator',
    title: 'Administrator',
    shortLabel: 'Admin',
    description: 'Office-wide ownership, blockers, aging requests, and urgent follow-up.',
    emptyTitle: 'No administrator-level work is open',
    emptyBody: 'Requests with ownership, blocker, or overdue signals will appear here.',
    matches: () => true,
  },
  {
    id: 'receptionist',
    title: 'Receptionist',
    shortLabel: 'Front desk',
    description: 'Unassigned requests, first-contact gaps, and family replies to work first.',
    emptyTitle: 'No front-desk triage is waiting',
    emptyBody: 'New, unassigned, or stale-contact requests will appear here.',
    matches: (row) =>
      row.ownerLabel === 'Unassigned' ||
      row.daysSinceContact === null ||
      (row.daysSinceContact ?? 0) >= 7 ||
      row.workflow.sectionAnchor === 'communication',
  },
  {
    id: 'pastor',
    title: 'Pastor',
    shortLabel: 'Pastor',
    description: 'Pastoral care, urgent funerals, weddings, and items needing clergy attention.',
    emptyTitle: 'No pastor-priority items are open',
    emptyBody: 'Urgent funerals, weddings, and clergy-availability blockers will appear here.',
    matches: (row) =>
      row.requestType === 'funeral' ||
      row.requestType === 'wedding' ||
      row.blockerLabel.toLowerCase().includes('priest') ||
      String(row.request.assigned_priest_name ?? '').trim().length > 0,
  },
  {
    id: 'ocia',
    title: 'OCIA Coordinator',
    shortLabel: 'OCIA',
    description: 'Inquirer follow-up, sponsor gaps, first meetings, and OCIA blockers.',
    emptyTitle: 'No OCIA follow-up is waiting',
    emptyBody: 'OCIA inquiries will appear here when they need a next staff action.',
    matches: (row) => row.requestType === 'ocia',
  },
  {
    id: 'sacramental',
    title: 'Sacramental Coordinator',
    shortLabel: 'Records',
    description: 'Schedule confirmation, documents, checklists, and record-ready sacramental work.',
    emptyTitle: 'No sacramental coordination gaps are open',
    emptyBody: 'Missing schedules, open checklists, and document blockers will appear here.',
    matches: (row) =>
      ['baptism', 'wedding', 'ocia'].includes(row.requestType) &&
      (row.missingConfirmedSchedule ||
        row.openChecklistCount > 0 ||
        row.workflow.sectionAnchor === 'checklist' ||
        row.blockerLabel.toLowerCase().includes('document') ||
        row.blockerLabel.toLowerCase().includes('paperwork')),
  },
]

function itemReason(row: StaffCommandCenterRow): string {
  if (row.atRisk.riskReasons[0]) return row.atRisk.riskReasons[0]
  if (row.smartFollowUp.description) return row.smartFollowUp.description
  return row.workflow.reason
}

function signalLabel(row: StaffCommandCenterRow): string {
  if (row.bucket === 'act_now') return row.smartFollowUp.label
  if (row.bucket === 'blocked') return `Waiting on ${row.blockerLabel.toLowerCase()}`
  if (row.bucket === 'aging') return 'Needs contact'
  return row.workflow.nextStepTitle
}

function toItem(row: StaffCommandCenterRow): DashboardRoleWorkHubItem {
  return {
    requestId: row.requestId,
    requestType: row.requestType,
    personLabel: getRequestDetailPrimaryHeading({
      request_type: row.request.request_type,
      child_name: row.request.child_name,
      parishioner: row.request.parishioner,
      funeralDetail: row.request.funeral_detail,
      weddingDetail: row.request.wedding_detail,
    }),
    detailHref: row.detailHref,
    signalLabel: signalLabel(row),
    reason: itemReason(row),
    actionLabel: row.workflow.recommendedActionLabel,
    ownerLabel: row.ownerLabel,
    urgency: row.workflow.urgency,
  }
}

export function buildDashboardRoleWorkHub(
  commandCenter: StaffCommandCenterResult,
  options?: { limitPerLens?: number }
): DashboardRoleWorkHubResult {
  const limit = options?.limitPerLens ?? 4
  const lenses = ROLE_DEFINITIONS.map((definition) => {
    const matchingRows = commandCenter.rows.filter(definition.matches)
    return {
      id: definition.id,
      title: definition.title,
      shortLabel: definition.shortLabel,
      description: definition.description,
      emptyTitle: definition.emptyTitle,
      emptyBody: definition.emptyBody,
      totalCount: matchingRows.length,
      actNowCount: matchingRows.filter((row) => row.bucket === 'act_now').length,
      blockedCount: matchingRows.filter((row) => row.bucket === 'blocked').length,
      items: matchingRows.slice(0, limit).map(toItem),
    }
  })

  const firstLensWithWork = lenses.find((lens) => lens.totalCount > 0)
  return {
    lenses,
    defaultLensId: firstLensWithWork?.id ?? 'administrator',
  }
}
