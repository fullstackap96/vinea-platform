export type ParishOnboardingPayload = {
  name?: unknown
  default_notification_email?: unknown
  daily_ops_brief_enabled?: unknown
  daily_ops_brief_email?: unknown
  onboarding_completed_at?: unknown
  workflow_sla_rules?: unknown
  staff_names?: unknown
  priest_names?: unknown
}

export type ParishStaffAccessPayload = {
  role?: unknown
  active?: unknown
}

export type ParishReadinessItem = {
  key: string
  label: string
  detail: string
  complete: boolean
  href: string
}

export type ParishReadinessResult = {
  completedCount: number
  totalCount: number
  percent: number
  onboardingComplete: boolean
  readyToComplete: boolean
  items: ParishReadinessItem[]
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function arrayCount(value: unknown): number {
  return Array.isArray(value) ? value.filter((item) => text(item)).length : 0
}

function hasValidEmail(value: unknown): boolean {
  const raw = text(value)
  return raw.includes('@') && !/\s/.test(raw)
}

function hasSlaTargets(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const rules = value as Record<string, unknown>
  const first = rules.firstContactDays
  const owner = rules.ownerAssignmentDays
  if (!first || !owner || typeof first !== 'object' || typeof owner !== 'object') return false
  return ['funeral', 'wedding', 'baptism', 'ocia'].every((key) => {
    const firstValue = Number((first as Record<string, unknown>)[key])
    const ownerValue = Number((owner as Record<string, unknown>)[key])
    return Number.isFinite(firstValue) && Number.isFinite(ownerValue)
  })
}

export function buildParishOnboardingReadiness(input: {
  parish: ParishOnboardingPayload | null | undefined
  staffUsers: readonly ParishStaffAccessPayload[]
}): ParishReadinessResult {
  const parish = input.parish ?? {}
  const activeStaff = input.staffUsers.filter((row) => row.active !== false)
  const activeAdmins = activeStaff.filter((row) => row.role === 'admin')
  const dailyRecipient =
    hasValidEmail(parish.daily_ops_brief_email) || hasValidEmail(parish.default_notification_email)
  const dailyBriefReady = Boolean(parish.daily_ops_brief_enabled) && dailyRecipient

  const items: ParishReadinessItem[] = [
    {
      key: 'profile',
      label: 'Parish profile',
      detail: 'Parish name is set.',
      complete: Boolean(text(parish.name)),
      href: '/dashboard/settings',
    },
    {
      key: 'notification',
      label: 'Notification inbox',
      detail: 'A parish inbox is available for new request notifications.',
      complete: hasValidEmail(parish.default_notification_email),
      href: '/dashboard/settings',
    },
    {
      key: 'admin',
      label: 'Admin access',
      detail: 'At least one active admin can manage parish setup.',
      complete: activeAdmins.length > 0,
      href: '/dashboard/settings',
    },
    {
      key: 'staff',
      label: 'Staff access',
      detail: 'At least one staff account can use the dashboard.',
      complete: activeStaff.length > 0,
      href: '/dashboard/settings',
    },
    {
      key: 'directory',
      label: 'Priest and staff lists',
      detail: 'Assignment picklists have at least one priest or staff display name.',
      complete: arrayCount(parish.staff_names) > 0 || arrayCount(parish.priest_names) > 0,
      href: '/dashboard/settings',
    },
    {
      key: 'targets',
      label: 'Response targets',
      detail: 'Funeral, wedding, baptism, and OCIA response targets are configured.',
      complete: hasSlaTargets(parish.workflow_sla_rules),
      href: '/dashboard/settings',
    },
    {
      key: 'daily-brief',
      label: 'Daily brief',
      detail: 'The daily parish operations brief is enabled and has a recipient.',
      complete: dailyBriefReady,
      href: '/dashboard/settings',
    },
  ]

  const completedCount = items.filter((item) => item.complete).length
  const totalCount = items.length
  const readyToComplete = completedCount === totalCount
  const onboardingComplete = Boolean(parish.onboarding_completed_at)

  return {
    completedCount,
    totalCount,
    percent: Math.round((completedCount / totalCount) * 100),
    onboardingComplete,
    readyToComplete,
    items,
  }
}
