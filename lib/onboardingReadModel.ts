import type {
  ParishOnboardingPayload,
  ParishStaffAccessPayload,
} from './parishOnboardingReadiness'

export type OnboardingParishReadModel = ParishOnboardingPayload & {
  id: string
  name: string
  default_notification_email: string
  daily_ops_brief_enabled: boolean
  daily_ops_brief_email: string
  onboarding_completed_at: string | null
  workflow_sla_rules: Record<string, unknown>
  staff_names: string[]
  priest_names: string[]
}

export type OnboardingStaffReadModel = ParishStaffAccessPayload & {
  role: string
  active: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null
  return value.map((item) => item.trim()).filter(Boolean)
}

export function parseOnboardingSettingsResponse(value: unknown): OnboardingParishReadModel | null {
  if (!isRecord(value) || value.ok !== true || !isRecord(value.parish)) return null
  const parish = value.parish
  const staffNames = stringArray(parish.staff_names)
  const priestNames = stringArray(parish.priest_names)
  if (
    typeof parish.id !== 'string' ||
    !parish.id.trim() ||
    typeof parish.name !== 'string' ||
    !parish.name.trim() ||
    typeof parish.default_notification_email !== 'string' ||
    typeof parish.daily_ops_brief_enabled !== 'boolean' ||
    typeof parish.daily_ops_brief_email !== 'string' ||
    (parish.onboarding_completed_at !== null &&
      typeof parish.onboarding_completed_at !== 'string') ||
    !isRecord(parish.workflow_sla_rules) ||
    !staffNames ||
    !priestNames
  ) {
    return null
  }

  return {
    id: parish.id.trim(),
    name: parish.name.trim(),
    default_notification_email: parish.default_notification_email.trim(),
    daily_ops_brief_enabled: parish.daily_ops_brief_enabled,
    daily_ops_brief_email: parish.daily_ops_brief_email.trim(),
    onboarding_completed_at: parish.onboarding_completed_at,
    workflow_sla_rules: parish.workflow_sla_rules,
    staff_names: staffNames,
    priest_names: priestNames,
  }
}

export function parseOnboardingStaffResponse(value: unknown): OnboardingStaffReadModel[] | null {
  if (!isRecord(value) || value.ok !== true || !Array.isArray(value.staff)) return null
  const staff: OnboardingStaffReadModel[] = []
  for (const valueRow of value.staff) {
    if (!isRecord(valueRow) || typeof valueRow.role !== 'string' || typeof valueRow.active !== 'boolean') {
      return null
    }
    staff.push({ role: valueRow.role, active: valueRow.active })
  }
  return staff
}
