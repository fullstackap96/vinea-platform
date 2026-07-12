import type { AuditEventRow } from '@/lib/auditEvents'

export type WorkflowSlaRules = {
  firstContactDays: Record<string, number>
  ownerAssignmentDays: Record<string, number>
}

export type ParishSettingsReadModel = {
  id: string
  name: string
  default_notification_email: string
  daily_ops_brief_enabled: boolean
  daily_ops_brief_email: string
  daily_ops_brief_last_sent_on: string | null
  daily_ops_brief_last_error: string | null
  onboarding_completed_at: string | null
  workflow_sla_rules: WorkflowSlaRules
  staff_names: string[]
  priest_names: string[]
}

export type ParishGoogleIntegrationReadModel = {
  status: string | null
  last_error: string | null
  google_account_email: string | null
}

export type StaffAccessReadModel = {
  id: string
  email: string
  role: 'admin' | 'staff'
  active: boolean
}

export type PublicIntakeRoutingReadModel = {
  activeParishId: string
  source: 'membership' | 'primary_parish_fallback'
  requestedParishId: string | null
  parish: {
    id: string
    name: string | null
    public_slug: string | null
    public_display_name: string | null
    public_intake_enabled: boolean
  }
  domains: Array<{
    id: string
    hostname: string
    verified_at: string | null
    verification_dns_name: string | null
    verification_dns_value: string | null
    verification_checked_at: string | null
    verification_error: string | null
    active: boolean
    created_at: string
    updated_at: string
  }>
  tokens: Array<{
    id: string
    label: string
    request_type: string | null
    expires_at: string | null
    active: boolean
    last_used_at: string | null
    created_at: string
    updated_at: string
  }>
}

export type CreatedPublicIntakeTokenReadModel = {
  id: string
  token: string
  label: string
  request_type: string | null
  expires_at: string | null
}

type UnknownRecord = Record<string, unknown>

const REQUEST_TYPES = ['funeral', 'wedding', 'baptism', 'ocia'] as const

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function nullableString(value: unknown): string | null | undefined {
  return value === null ? null : typeof value === 'string' ? value : undefined
}

function parseDirectory(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 80) return null
  const names: string[] = []
  for (const item of value) {
    if (
      typeof item !== 'string' ||
      !item.trim() ||
      item !== item.trim() ||
      item.length > 120
    ) {
      return null
    }
    names.push(item)
  }
  return names
}

function parseSlaRules(value: unknown): WorkflowSlaRules | null {
  const source = record(value)
  const first = record(source?.firstContactDays)
  const owner = record(source?.ownerAssignmentDays)
  if (!source || !first || !owner) return null

  const firstContactDays: Record<string, number> = {}
  const ownerAssignmentDays: Record<string, number> = {}
  for (const requestType of REQUEST_TYPES) {
    const firstValue = first[requestType]
    const ownerValue = owner[requestType]
    if (
      typeof firstValue !== 'number' ||
      !Number.isInteger(firstValue) ||
      firstValue < 0 ||
      firstValue > 30 ||
      typeof ownerValue !== 'number' ||
      !Number.isInteger(ownerValue) ||
      ownerValue < 0 ||
      ownerValue > 30
    ) {
      return null
    }
    firstContactDays[requestType] = firstValue
    ownerAssignmentDays[requestType] = ownerValue
  }
  return { firstContactDays, ownerAssignmentDays }
}

function parseGoogleIntegration(value: unknown): ParishGoogleIntegrationReadModel | null | undefined {
  if (value === null) return null
  const source = record(value)
  if (!source) return undefined
  const status = nullableString(source.status)
  const lastError = nullableString(source.last_error)
  const accountEmail = nullableString(source.google_account_email)
  if (status === undefined || lastError === undefined || accountEmail === undefined) return undefined
  return {
    status,
    last_error: lastError,
    google_account_email: accountEmail,
  }
}

export function parseParishSettingsResponse(
  value: unknown,
  expectedParishId: string | null,
): { parish: ParishSettingsReadModel; googleCalendar: ParishGoogleIntegrationReadModel | null } | null {
  const source = record(value)
  const parish = record(source?.parish)
  if (!source || source.ok !== true || !parish) return null

  const id = requiredString(parish.id)
  const name = requiredString(parish.name)
  const notificationEmail = typeof parish.default_notification_email === 'string'
    ? parish.default_notification_email
    : null
  const briefEmail = typeof parish.daily_ops_brief_email === 'string'
    ? parish.daily_ops_brief_email
    : null
  const briefLastSent = nullableString(parish.daily_ops_brief_last_sent_on)
  const briefLastError = nullableString(parish.daily_ops_brief_last_error)
  const onboardingCompletedAt = nullableString(parish.onboarding_completed_at)
  const slaRules = parseSlaRules(parish.workflow_sla_rules)
  const staffNames = parseDirectory(parish.staff_names)
  const priestNames = parseDirectory(parish.priest_names)
  const googleCalendar = parseGoogleIntegration(source.googleCalendar)

  if (
    !id ||
    !name ||
    (expectedParishId && id !== expectedParishId) ||
    notificationEmail === null ||
    briefEmail === null ||
    typeof parish.daily_ops_brief_enabled !== 'boolean' ||
    briefLastSent === undefined ||
    briefLastError === undefined ||
    onboardingCompletedAt === undefined ||
    !slaRules ||
    !staffNames ||
    !priestNames ||
    googleCalendar === undefined
  ) {
    return null
  }

  return {
    parish: {
      id,
      name,
      default_notification_email: notificationEmail,
      daily_ops_brief_enabled: parish.daily_ops_brief_enabled,
      daily_ops_brief_email: briefEmail,
      daily_ops_brief_last_sent_on: briefLastSent,
      daily_ops_brief_last_error: briefLastError,
      onboarding_completed_at: onboardingCompletedAt,
      workflow_sla_rules: slaRules,
      staff_names: staffNames,
      priest_names: priestNames,
    },
    googleCalendar,
  }
}

export function parseStaffAccessResponse(
  value: unknown,
): { canManage: boolean; staff: StaffAccessReadModel[] } | null {
  const source = record(value)
  if (!source || source.ok !== true || typeof source.canManage !== 'boolean' || !Array.isArray(source.staff)) {
    return null
  }

  const staff: StaffAccessReadModel[] = []
  for (const item of source.staff) {
    const row = record(item)
    const id = requiredString(row?.id)
    const email = requiredString(row?.email)
    if (
      !row ||
      !id ||
      !email ||
      (row.role !== 'admin' && row.role !== 'staff') ||
      typeof row.active !== 'boolean'
    ) {
      return null
    }
    staff.push({ id, email, role: row.role, active: row.active })
  }
  return { canManage: source.canManage, staff }
}

export function parseRecentAuditEventsResponse(value: unknown): AuditEventRow[] | null {
  const source = record(value)
  if (!source || source.ok !== true || !Array.isArray(source.events)) return null

  const events: AuditEventRow[] = []
  for (const item of source.events) {
    const event = record(item)
    const id = requiredString(event?.id)
    const actorEmail = nullableString(event?.actor_email)
    const action = requiredString(event?.action)
    const targetType = requiredString(event?.target_type)
    const targetId = nullableString(event?.target_id)
    const createdAt = requiredString(event?.created_at)
    const metadata = event?.metadata === null ? null : record(event?.metadata)
    if (
      !event ||
      !id ||
      actorEmail === undefined ||
      !action ||
      !targetType ||
      targetId === undefined ||
      !createdAt ||
      metadata === null && event.metadata !== null
    ) {
      return null
    }
    events.push({
      id,
      actor_email: actorEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: metadata ? { ...metadata } : null,
      created_at: createdAt,
    })
  }
  return events
}

function parseRoutingDomain(value: unknown): PublicIntakeRoutingReadModel['domains'][number] | null {
  const source = record(value)
  const id = requiredString(source?.id)
  const hostname = requiredString(source?.hostname)
  const verifiedAt = nullableString(source?.verified_at)
  const dnsName = nullableString(source?.verification_dns_name)
  const dnsValue = nullableString(source?.verification_dns_value)
  const checkedAt = nullableString(source?.verification_checked_at)
  const verificationError = nullableString(source?.verification_error)
  const createdAt = requiredString(source?.created_at)
  const updatedAt = requiredString(source?.updated_at)
  if (
    !source ||
    !id ||
    !hostname ||
    verifiedAt === undefined ||
    dnsName === undefined ||
    dnsValue === undefined ||
    checkedAt === undefined ||
    verificationError === undefined ||
    typeof source.active !== 'boolean' ||
    !createdAt ||
    !updatedAt
  ) {
    return null
  }
  return {
    id,
    hostname,
    verified_at: verifiedAt,
    verification_dns_name: dnsName,
    verification_dns_value: dnsValue,
    verification_checked_at: checkedAt,
    verification_error: verificationError,
    active: source.active,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function parseRoutingToken(value: unknown): PublicIntakeRoutingReadModel['tokens'][number] | null {
  const source = record(value)
  const id = requiredString(source?.id)
  const label = requiredString(source?.label)
  const requestType = nullableString(source?.request_type)
  const expiresAt = nullableString(source?.expires_at)
  const lastUsedAt = nullableString(source?.last_used_at)
  const createdAt = requiredString(source?.created_at)
  const updatedAt = requiredString(source?.updated_at)
  if (
    !source ||
    !id ||
    !label ||
    requestType === undefined ||
    expiresAt === undefined ||
    lastUsedAt === undefined ||
    typeof source.active !== 'boolean' ||
    !createdAt ||
    !updatedAt
  ) {
    return null
  }
  return {
    id,
    label,
    request_type: requestType,
    expires_at: expiresAt,
    active: source.active,
    last_used_at: lastUsedAt,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export function parsePublicIntakeRoutingResponse(
  value: unknown,
  expectedParishId: string | null,
): PublicIntakeRoutingReadModel | null {
  const source = record(value)
  const routing = record(source?.routing)
  const parish = record(routing?.parish)
  if (!source || source.ok !== true || !routing || !parish) return null

  const activeParishId = requiredString(routing.activeParishId)
  const requestedParishId = nullableString(routing.requestedParishId)
  const parishId = requiredString(parish.id)
  const parishName = nullableString(parish.name)
  const publicSlug = nullableString(parish.public_slug)
  const publicDisplayName = nullableString(parish.public_display_name)
  if (
    !activeParishId ||
    (routing.source !== 'membership' && routing.source !== 'primary_parish_fallback') ||
    requestedParishId === undefined ||
    !parishId ||
    parishId !== activeParishId ||
    (expectedParishId && activeParishId !== expectedParishId) ||
    parishName === undefined ||
    publicSlug === undefined ||
    publicDisplayName === undefined ||
    typeof parish.public_intake_enabled !== 'boolean' ||
    !Array.isArray(routing.domains) ||
    !Array.isArray(routing.tokens)
  ) {
    return null
  }

  const domains = routing.domains.map(parseRoutingDomain)
  const tokens = routing.tokens.map(parseRoutingToken)
  if (domains.some((item) => item === null) || tokens.some((item) => item === null)) return null

  return {
    activeParishId,
    source: routing.source,
    requestedParishId,
    parish: {
      id: parishId,
      name: parishName,
      public_slug: publicSlug,
      public_display_name: publicDisplayName,
      public_intake_enabled: parish.public_intake_enabled,
    },
    domains: domains as PublicIntakeRoutingReadModel['domains'],
    tokens: tokens as PublicIntakeRoutingReadModel['tokens'],
  }
}

export function parseCreatedPublicIntakeTokenResponse(
  value: unknown,
): CreatedPublicIntakeTokenReadModel | null {
  const source = record(value)
  const token = record(source?.createdToken)
  const id = requiredString(token?.id)
  const rawToken = requiredString(token?.token)
  const label = requiredString(token?.label)
  const requestType = nullableString(token?.request_type)
  const expiresAt = nullableString(token?.expires_at)
  if (
    !source ||
    source.ok !== true ||
    !token ||
    !id ||
    !rawToken ||
    !label ||
    requestType === undefined ||
    expiresAt === undefined
  ) {
    return null
  }
  return {
    id,
    token: rawToken,
    label,
    request_type: requestType,
    expires_at: expiresAt,
  }
}

export function parsePublicIntakeDomainVerificationResponse(
  value: unknown,
): { verified: boolean; error: string | null } | null {
  const source = record(value)
  const verification = record(source?.verification)
  const error = nullableString(verification?.error)
  if (
    !source ||
    source.ok !== true ||
    !verification ||
    typeof verification.verified !== 'boolean' ||
    error === undefined
  ) {
    return null
  }
  return { verified: verification.verified, error }
}
