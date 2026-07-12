export type MonitoringSupportOwnerRole =
  | 'support_owner'
  | 'monitoring_owner'
  | 'rollback_owner'
  | 'security_data_owner'
  | 'incident_commander'
  | 'technical_lead'
  | 'customer_communications_owner'
  | 'legal_data_owner'
  | 'evidence_owner'

export type MonitoringSupportOwnerIntake = {
  roles: Partial<Record<MonitoringSupportOwnerRole, string>>
  supportCoverageWindowLabel?: string
  escalationChannelLabel?: string
  backupChannelLabel?: string
  monitoringToolLabel?: string
  rollbackMethodLabel?: string
  evidenceStorageLabel?: string
  productionSmokeFixtureLabel?: string
  approvalStatusLabel?: string
}

export type MonitoringSupportReadinessResult = {
  readyForOwnerReview: boolean
  missingRequiredLabels: string[]
  unsafeLabelFindings: string[]
  requiredRoleLabels: Record<MonitoringSupportOwnerRole, string>
  nonSecretBoundary: string
  productionBoundary: string
}

const REQUIRED_ROLES: readonly MonitoringSupportOwnerRole[] = [
  'support_owner',
  'monitoring_owner',
  'rollback_owner',
  'security_data_owner',
  'incident_commander',
  'technical_lead',
  'customer_communications_owner',
  'legal_data_owner',
  'evidence_owner',
]

const REQUIRED_FIELDS: ReadonlyArray<{
  key: keyof Omit<MonitoringSupportOwnerIntake, 'roles'>
  label: string
}> = [
  { key: 'supportCoverageWindowLabel', label: 'support coverage window' },
  { key: 'escalationChannelLabel', label: 'escalation channel label' },
  { key: 'backupChannelLabel', label: 'backup channel label' },
  { key: 'monitoringToolLabel', label: 'monitoring tool label' },
  { key: 'rollbackMethodLabel', label: 'rollback method label' },
  { key: 'evidenceStorageLabel', label: 'evidence storage label' },
  { key: 'productionSmokeFixtureLabel', label: 'production smoke fixture label' },
  { key: 'approvalStatusLabel', label: 'approval status label' },
]

const SECRET_LIKE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'jwt token', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { label: 'database url', pattern: /\bpostgres(?:ql)?:\/\/[^\s]+/i },
  { label: 'api key wording', pattern: /\b(api[_-]?key|service[_-]?role|secret|password)\b/i },
  { label: 'signed url', pattern: /\bX-Amz-Signature=|token=|access_token=/i },
]

export function buildMonitoringSupportReadiness(
  intake: MonitoringSupportOwnerIntake,
): MonitoringSupportReadinessResult {
  const missingRequiredLabels: string[] = []
  const unsafeLabelFindings: string[] = []
  const requiredRoleLabels = {} as Record<MonitoringSupportOwnerRole, string>

  for (const role of REQUIRED_ROLES) {
    const value = normalizeLabel(intake.roles[role])
    requiredRoleLabels[role] = value || '[MISSING]'
    if (!value) {
      missingRequiredLabels.push(role)
    }
    unsafeLabelFindings.push(...findUnsafeLabelFindings(role, value))
  }

  for (const field of REQUIRED_FIELDS) {
    const value = normalizeLabel(intake[field.key])
    if (!value) {
      missingRequiredLabels.push(field.label)
    }
    unsafeLabelFindings.push(...findUnsafeLabelFindings(field.label, value))
  }

  return {
    readyForOwnerReview:
      missingRequiredLabels.length === 0 && unsafeLabelFindings.length === 0,
    missingRequiredLabels,
    unsafeLabelFindings,
    requiredRoleLabels,
    nonSecretBoundary:
      'Use human-readable labels only. Do not record credentials, database URLs, API keys, tokens, signed URLs, raw IDs, private document names, private content, or customer secrets.',
    productionBoundary:
      'Completing this intake does not enable production monitoring, production paging, customer notification, production export, production RLS, public intake routing, AI generation, backup/restore claims, or public trust-center claims.',
  }
}

function normalizeLabel(value: string | undefined): string {
  return (value ?? '').trim()
}

function findUnsafeLabelFindings(field: string, value: string): string[] {
  if (!value) return []

  return SECRET_LIKE_PATTERNS.filter(({ pattern }) => pattern.test(value)).map(
    ({ label }) => `${field}: possible ${label}`,
  )
}
