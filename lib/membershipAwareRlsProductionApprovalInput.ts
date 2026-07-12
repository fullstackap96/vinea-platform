import {
  buildMembershipAwareRlsProductionApprovalReadiness,
  type MembershipAwareRlsProductionApprovalReadinessInput,
  type MembershipAwareRlsProductionApprovalReadinessResult,
  type MembershipAwareRlsRequiredEvidence,
  type MembershipAwareRlsRequiredOwner,
  type MembershipAwareRlsReviewStatus,
  type MembershipAwareRlsSmokeFixture,
  type MembershipAwareRlsSmokeVerification,
} from './membershipAwareRlsProductionApprovalReadiness'

export const MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE =
  'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT'

const REQUIRED_OWNERS = [
  'product_owner',
  'technical_owner',
  'qa_owner',
  'security_data_owner',
  'rollback_owner',
  'monitoring_owner',
  'support_owner',
  'evidence_owner',
] as const satisfies readonly MembershipAwareRlsRequiredOwner[]

const REQUIRED_FIXTURES = [
  'staff_account',
  'active_parish',
  'same_parish_request',
  'cross_parish_denied_request',
  'workflow_step',
  'staff_synthetic_document',
  'family_synthetic_document',
  'family_portal_token_plan',
  'cleanup_plan',
] as const satisfies readonly MembershipAwareRlsSmokeFixture[]

const DEFAULT_SMOKE_VERIFICATION_ITEMS = [
  'pre_apply_health',
  'forward_migration_sanitized_output',
  'post_apply_health',
  'policy_shape_verification',
  'active_parish_request_detail',
  'request_documents_staff_route',
  'signed_url_route_authorized_only',
  'direct_storage_privacy_denial',
  'family_portal_safety',
  'family_portal_exclusions',
  'search_report_cross_parish_absence',
  'audit_events_redacted',
  'monitoring_observation',
  'cleanup_deactivation',
  'rollback_decision',
] as const satisfies readonly MembershipAwareRlsSmokeVerification[]

const SECRET_LIKE_LABEL_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\//i, 'database url'],
  [/(?:password|pwd)\s*[:=]/i, 'password material'],
  [/(?:service[_-]?role|anon)[\s_-]*key/i, 'api key wording'],
  [/bearer\s+[a-z0-9._-]+/i, 'bearer token'],
  [/sk-[a-z0-9]/i, 'api key'],
  [/x-amz-signature/i, 'signed url'],
  [/token_hash|refresh_token|access_token/i, 'token material'],
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, 'email address'],
]

export type MembershipAwareRlsProductionApprovalPacketLabels = {
  ownerLabels: Partial<Record<MembershipAwareRlsRequiredOwner, string>>
  fixtureLabels: Partial<Record<MembershipAwareRlsSmokeFixture, string>>
  evidenceStatuses: Partial<
    Record<MembershipAwareRlsRequiredEvidence, MembershipAwareRlsReviewStatus>
  >
  smokeVerificationItems?: readonly MembershipAwareRlsSmokeVerification[]
  productionTargetLabels: MembershipAwareRlsProductionApprovalReadinessInput['productionTargetLabels']
  scopeBoundaries: Pick<
    MembershipAwareRlsProductionApprovalReadinessInput,
    | 'productionAccessNotStarted'
    | 'migrationsNotAppliedDuringReview'
    | 'operationalRlsUnchangedDuringReview'
    | 'runtimePublicIntakeOutOfScope'
    | 'aiProductionFlagsOutOfScope'
    | 'googleCalendarMutationOutOfScope'
    | 'unrelatedDeploymentOutOfScope'
  >
  explicitProductionApprovalPhrase?: string
}

export type MembershipAwareRlsProductionApprovalInputBuildResult = {
  readinessInput: MembershipAwareRlsProductionApprovalReadinessInput
  missingLabelFields: string[]
  unsafeLabelFindings: string[]
  approvalPhraseRecorded: boolean
}

export type MembershipAwareRlsProductionApprovalEvaluationResult =
  MembershipAwareRlsProductionApprovalInputBuildResult & {
    readiness: MembershipAwareRlsProductionApprovalReadinessResult
  }

export function buildMembershipAwareRlsProductionApprovalInput(
  packet: MembershipAwareRlsProductionApprovalPacketLabels,
): MembershipAwareRlsProductionApprovalInputBuildResult {
  const missingLabelFields: string[] = []
  const unsafeLabelFindings: string[] = []
  const ownerStatuses: MembershipAwareRlsProductionApprovalReadinessInput['ownerStatuses'] =
    {}
  const fixtureStatuses: MembershipAwareRlsProductionApprovalReadinessInput['fixtureStatuses'] =
    {}

  for (const owner of REQUIRED_OWNERS) {
    ownerStatuses[owner] = deriveLabelStatus(
      `owner.${owner}`,
      packet.ownerLabels[owner],
      missingLabelFields,
      unsafeLabelFindings,
    )
  }

  for (const fixture of REQUIRED_FIXTURES) {
    fixtureStatuses[fixture] = deriveLabelStatus(
      `fixture.${fixture}`,
      packet.fixtureLabels[fixture],
      missingLabelFields,
      unsafeLabelFindings,
    )
  }

  collectUnsafeLabels(
    'production target',
    packet.productionTargetLabels,
    unsafeLabelFindings,
  )

  const approvalPhraseRecorded =
    packet.explicitProductionApprovalPhrase ===
    MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE

  return {
    readinessInput: {
      ownerStatuses,
      fixtureStatuses,
      evidenceStatuses: packet.evidenceStatuses,
      smokeVerificationItems:
        packet.smokeVerificationItems ?? DEFAULT_SMOKE_VERIFICATION_ITEMS,
      productionTargetLabels: packet.productionTargetLabels,
      ...packet.scopeBoundaries,
      explicitProductionApprovalPhraseRecorded: approvalPhraseRecorded,
    },
    missingLabelFields,
    unsafeLabelFindings,
    approvalPhraseRecorded,
  }
}

export function evaluateMembershipAwareRlsProductionApprovalPacket(
  packet: MembershipAwareRlsProductionApprovalPacketLabels,
): MembershipAwareRlsProductionApprovalEvaluationResult {
  const builtInput = buildMembershipAwareRlsProductionApprovalInput(packet)
  const readiness = buildMembershipAwareRlsProductionApprovalReadiness({
    ...builtInput.readinessInput,
    productionTargetLabels: withUnsafeLabelSentinel(
      builtInput.readinessInput.productionTargetLabels,
      builtInput.unsafeLabelFindings,
    ),
  })

  return {
    ...builtInput,
    readiness,
  }
}

function deriveLabelStatus(
  field: string,
  value: string | undefined,
  missingLabelFields: string[],
  unsafeLabelFindings: string[],
): MembershipAwareRlsReviewStatus {
  const trimmed = value?.trim()

  if (!trimmed) {
    missingLabelFields.push(field)
    return 'PENDING'
  }

  collectUnsafeLabels(field, { label: trimmed }, unsafeLabelFindings)
  return 'COMPLETE'
}

function collectUnsafeLabels(
  scope: string,
  labels: Record<string, string>,
  unsafeLabelFindings: string[],
) {
  for (const [key, value] of Object.entries(labels)) {
    const trimmed = value.trim()

    if (!trimmed) {
      unsafeLabelFindings.push(`${scope}.${key}: missing safe label`)
      continue
    }

    for (const [pattern, description] of SECRET_LIKE_LABEL_PATTERNS) {
      if (pattern.test(trimmed)) {
        unsafeLabelFindings.push(`${scope}.${key}: possible ${description}`)
      }
    }
  }
}

function withUnsafeLabelSentinel(
  labels: MembershipAwareRlsProductionApprovalReadinessInput['productionTargetLabels'],
  unsafeLabelFindings: string[],
): MembershipAwareRlsProductionApprovalReadinessInput['productionTargetLabels'] {
  if (unsafeLabelFindings.length === 0) {
    return labels
  }

  return {
    ...labels,
    releaseLabel: `${labels.releaseLabel} service_role key withheld by approval input builder`,
  }
}
