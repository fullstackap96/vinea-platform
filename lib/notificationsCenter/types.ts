export type NotificationItemGroup = 'overdue' | 'due_today' | 'new_requests' | 'recommended'

export type NotificationCenterItem = {
  /** Stable key for React lists — not shown in the UI. */
  key: string
  group: NotificationItemGroup
  label: string
  context: string
  href: string
}

export type NotificationCenterGroups = {
  overdue: NotificationCenterItem[]
  due_today: NotificationCenterItem[]
  new_requests: NotificationCenterItem[]
  recommended: NotificationCenterItem[]
}

export const NOTIFICATIONS_CENTER_MAX_VISIBLE = 10
export const NOTIFICATIONS_CENTER_BADGE_CAP = 9

export type NotificationsCenterBuildResult = {
  groups: NotificationCenterGroups
  totalCount: number
  visible: NotificationCenterItem[]
  hasMoreRequestItems: boolean
  hasMoreRecommended: boolean
}
