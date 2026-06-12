import { formatRequestType } from '@/lib/formatRequestType'
import {
  formatNextFollowUpDateCompact,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import {
  notificationLabelForSuggestedAction,
  suggestedActionHref,
} from '@/lib/relationshipIntelligence/suggestedActionPresentation'
import type { DashboardSuggestedAction } from '@/lib/relationshipIntelligence/types'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import {
  NOTIFICATIONS_CENTER_MAX_VISIBLE,
  type NotificationCenterGroups,
  type NotificationCenterItem,
  type NotificationItemGroup,
  type NotificationsCenterBuildResult,
} from './types'

export type NotificationsCenterRequest = {
  id?: unknown
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  created_at?: unknown
  next_follow_up_date?: unknown
  parishioner?: { full_name?: unknown; email?: unknown } | null
  funeral_detail?: { deceased_name?: unknown } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
  } | null
}

function trimOrEmpty(value: unknown): string {
  return String(value ?? '').trim()
}

function createdAtTime(value: unknown): number {
  const t = new Date(String(value ?? '')).getTime()
  return Number.isNaN(t) ? 0 : t
}

function followUpDateSortKey(value: unknown): string {
  return parseFollowUpCalendarDate(value) ?? '9999-99-99'
}

function contactNameForFollowUp(request: NotificationsCenterRequest): string {
  const parishionerName = trimOrEmpty(request.parishioner?.full_name)
  if (parishionerName) return parishionerName
  return getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
}

function requestTypeLabel(request: NotificationsCenterRequest): string {
  return formatRequestType(requestTypeFromRow({ request_type: request.request_type }))
}

function buildRequestItem(
  request: NotificationsCenterRequest,
  group: Exclude<NotificationItemGroup, 'recommended'>,
  now: Date
): NotificationCenterItem | null {
  const requestId = trimOrEmpty(request.id)
  if (!requestId) return null
  if (trimOrEmpty(request.status) === 'complete') return null

  const typeLabel = requestTypeLabel(request)
  const name = contactNameForFollowUp(request)

  if (group === 'overdue') {
    if (!isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) return null
    const pastDue = formatNextFollowUpDateCompact(request.next_follow_up_date)
    return {
      key: `overdue-${requestId}`,
      group,
      label: `Follow up with ${name}`,
      context: pastDue
        ? `${typeLabel} request · Past due ${pastDue}`
        : `${typeLabel} request · Follow-up is past due`,
      href: `/dashboard/requests/${requestId}`,
    }
  }

  if (group === 'due_today') {
    if (!isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)) return null
    return {
      key: `due-today-${requestId}`,
      group,
      label: `Follow up today with ${name}`,
      context: `${typeLabel} request · Due today`,
      href: `/dashboard/requests/${requestId}`,
    }
  }

  if (trimOrEmpty(request.status) !== 'new') return null
  const subject = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
  return {
    key: `new-${requestId}`,
    group,
    label: `New ${typeLabel} request needs review`,
    context: subject ? `${typeLabel} request · ${subject}` : `${typeLabel} request`,
    href: `/dashboard/requests/${requestId}`,
  }
}

function classifyRequestGroup(
  request: NotificationsCenterRequest,
  now: Date
): Exclude<NotificationItemGroup, 'recommended'> | null {
  if (trimOrEmpty(request.status) === 'complete') return null
  if (isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)) return 'overdue'
  if (isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)) return 'due_today'
  if (trimOrEmpty(request.status) === 'new') return 'new_requests'
  return null
}

function buildRecommendedItem(
  action: DashboardSuggestedAction,
  index: number
): NotificationCenterItem {
  const { label, context } = notificationLabelForSuggestedAction(action)
  const key =
    action.kind === 'record_creation'
      ? `recommended-record-${action.requestId}`
      : action.kind === 'certificate'
        ? `recommended-cert-${action.recordId}`
        : `recommended-person-${action.requestId}-${action.personId}-${index}`

  return {
    key,
    group: 'recommended',
    label,
    context,
    href: suggestedActionHref(action),
  }
}

function sortRequestsForGroup(
  requestIds: string[],
  requestsById: Map<string, NotificationsCenterRequest>,
  group: Exclude<NotificationItemGroup, 'recommended'>
): string[] {
  return [...requestIds].sort((idA, idB) => {
    const reqA = requestsById.get(idA)
    const reqB = requestsById.get(idB)
    if (group === 'overdue') {
      const dateA = followUpDateSortKey(reqA?.next_follow_up_date)
      const dateB = followUpDateSortKey(reqB?.next_follow_up_date)
      if (dateA !== dateB) return dateA.localeCompare(dateB)
    } else {
      const createdDiff = createdAtTime(reqB?.created_at) - createdAtTime(reqA?.created_at)
      if (createdDiff !== 0) return createdDiff
    }
    return idA.localeCompare(idB)
  })
}

const GROUP_FILL_ORDER: NotificationItemGroup[] = [
  'overdue',
  'due_today',
  'new_requests',
  'recommended',
]

export function buildNotificationsCenter(input: {
  requests: readonly unknown[]
  suggestedActions: readonly DashboardSuggestedAction[]
  now?: Date
}): NotificationsCenterBuildResult {
  const now = input.now ?? new Date()
  const requests = input.requests as NotificationsCenterRequest[]
  const requestsById = new Map<string, NotificationsCenterRequest>()

  for (const request of requests) {
    const id = trimOrEmpty(request.id)
    if (id) requestsById.set(id, request)
  }

  const overdueIds: string[] = []
  const dueTodayIds: string[] = []
  const newRequestIds: string[] = []
  const assignedRequestIds = new Set<string>()

  for (const request of requests) {
    const group = classifyRequestGroup(request, now)
    if (!group) continue

    const requestId = trimOrEmpty(request.id)
    if (!requestId || assignedRequestIds.has(requestId)) continue

    assignedRequestIds.add(requestId)
    if (group === 'overdue') overdueIds.push(requestId)
    else if (group === 'due_today') dueTodayIds.push(requestId)
    else newRequestIds.push(requestId)
  }

  const buildItemsForIds = (
    ids: string[],
    group: Exclude<NotificationItemGroup, 'recommended'>
  ): NotificationCenterItem[] => {
    const sortedIds = sortRequestsForGroup(ids, requestsById, group)
    const items: NotificationCenterItem[] = []
    for (const requestId of sortedIds) {
      const request = requestsById.get(requestId)
      if (!request) continue
      const item = buildRequestItem(request, group, now)
      if (item) items.push(item)
    }
    return items
  }

  const sortedOverdue = buildItemsForIds(overdueIds, 'overdue')
  const sortedDueToday = buildItemsForIds(dueTodayIds, 'due_today')
  const sortedNew = buildItemsForIds(newRequestIds, 'new_requests')

  const recommended = input.suggestedActions.map((action, index) =>
    buildRecommendedItem(action, index)
  )

  const groups: NotificationCenterGroups = {
    overdue: sortedOverdue,
    due_today: sortedDueToday,
    new_requests: sortedNew,
    recommended,
  }

  const totalCount =
    sortedOverdue.length + sortedDueToday.length + sortedNew.length + recommended.length

  const visible: NotificationCenterItem[] = []
  for (const group of GROUP_FILL_ORDER) {
    for (const item of groups[group]) {
      if (visible.length >= NOTIFICATIONS_CENTER_MAX_VISIBLE) break
      visible.push(item)
    }
    if (visible.length >= NOTIFICATIONS_CENTER_MAX_VISIBLE) break
  }

  const totalRequestItems = sortedOverdue.length + sortedDueToday.length + sortedNew.length
  const visibleRequestItems = visible.filter((item) => item.group !== 'recommended').length
  const visibleRecommendedItems = visible.filter((item) => item.group === 'recommended').length

  return {
    groups,
    totalCount,
    visible,
    hasMoreRequestItems: totalRequestItems > visibleRequestItems,
    hasMoreRecommended: recommended.length > visibleRecommendedItems,
  }
}

export function formatNotificationsBadgeCount(totalCount: number): string | null {
  if (totalCount <= 0) return null
  if (totalCount > 9) return '9+'
  return String(totalCount)
}
