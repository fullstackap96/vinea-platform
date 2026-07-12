export type MembershipAwareRlsReviewStatus =
  | 'PENDING'
  | 'READY'
  | 'COMPLETE'
  | 'REVIEWED'
  | 'APPROVED'
  | 'APPROVED_WITH_CONDITIONS'
  | 'CONFIRMED'
  | 'PASSED'
  | 'GO'
  | 'HOLD'
  | 'REJECT'
  | 'FAILED'

export type MembershipAwareRlsRequiredOwner =
  | 'product_owner'
  | 'technical_owner'
  | 'qa_owner'
  | 'security_data_owner'
  | 'rollback_owner'
  | 'monitoring_owner'
  | 'support_owner'
  | 'evidence_owner'

export type MembershipAwareRlsSmokeFixture =
  | 'staff_account'
  | 'active_parish'
  | 'same_parish_request'
  | 'cross_parish_denied_request'
  | 'workflow_step'
  | 'staff_synthetic_document'
  | 'family_synthetic_document'
  | 'family_portal_token_plan'
  | 'cleanup_plan'

export type MembershipAwareRlsRequiredEvidence =
  | 'disposable_forward_rollback_validation'
  | 'disposable_cross_parish_allow_deny_qa'
  | 'disposable_route_document_family_portal_qa'
  | 'nonproduction_promotion_evidence'
  | 'shared_qa_promotion_smoke'
  | 'shared_qa_active_parish_cookie_smoke'
  | 'human_intake_validation'
  | 'smoke_fixture_verification_checklist'
  | 'rollout_evidence_crosswalk'
  | 'rollout_rollback_packet'
  | 'support_communication_note'
  | 'final_go_no_go_checklist'
  | 'final_automated_checks'

export type MembershipAwareRlsSmokeVerification =
  | 'pre_apply_health'
  | 'forward_migration_sanitized_output'
  | 'post_apply_health'
  | 'policy_shape_verification'
  | 'active_parish_request_detail'
  | 'request_documents_staff_route'
  | 'signed_url_route_authorized_only'
  | 'direct_storage_privacy_denial'
  | 'family_portal_safety'
  | 'family_portal_exclusions'
  | 'search_report_cross_parish_absence'
  | 'audit_events_redacted'
  | 'monitoring_observation'
  | 'cleanup_deactivation'
  | 'rollback_decision'

export type MembershipAwareRlsProductionApprovalReadinessInput = {
  ownerStatuses: Partial<
    Record<MembershipAwareRlsRequiredOwner, MembershipAwareRlsReviewStatus>
  >
  fixtureStatuses: Partial<
    Record<MembershipAwareRlsSmokeFixture, MembershipAwareRlsReviewStatus>
  >
  evidenceStatuses: Partial<
    Record<MembershipAwareRlsRequiredEvidence, MembershipAwareRlsReviewStatus>
  >
  smokeVerificationItems: readonly MembershipAwareRlsSmokeVerification[]
  productionTargetLabels: {
    appHostLabel: string
    databaseHostLabel: string
    releaseLabel: string
    rolloutWindowLabel: string
    rollbackDeadlineLabel: string
  }
  productionAccessNotStarted: boolean
  migrationsNotAppliedDuringReview: boolean
  operationalRlsUnchangedDuringReview: boolean
  runtimePublicIntakeOutOfScope: boolean
  aiProductionFlagsOutOfScope: boolean
  googleCalendarMutationOutOfScope: boolean
  unrelatedDeploymentOutOfScope: boolean
  explicitProductionApprovalPhraseRecorded: boolean
}

export type MembershipAwareRlsProductionApprovalReadinessResult = {
  readyToRequestProductOwnerApproval: boolean
  readyForProductionRollout: boolean
  missingRequiredItems: string[]
  unsafeLabelFindings: string[]
  requiredOwners: MembershipAwareRlsRequiredOwner[]
  requiredFixtures: MembershipAwareRlsSmokeFixture[]
  requiredEvidence: MembershipAwareRlsRequiredEvidence[]
  requiredSmokeVerificationItems: MembershipAwareRlsSmokeVerification[]
  missingSmokeVerificationItems: MembershipAwareRlsSmokeVerification[]
  productionNoGoBoundaries: string[]
  nextSafeAction: string
}

const REQUIRED_OWNERS: MembershipAwareRlsRequiredOwner[] = [
  'product_owner',
  'technical_owner',
  'qa_owner',
  'security_data_owner',
  'rollback_owner',
  'monitoring_owner',
  'support_owner',
  'evidence_owner',
]

const REQUIRED_FIXTURES: MembershipAwareRlsSmokeFixture[] = [
  'staff_account',
  'active_parish',
  'same_parish_request',
  'cross_parish_denied_request',
  'workflow_step',
  'staff_synthetic_document',
  'family_synthetic_document',
  'family_portal_token_plan',
  'cleanup_plan',
]

const REQUIRED_EVIDENCE: MembershipAwareRlsRequiredEvidence[] = [
  'disposable_forward_rollback_validation',
  'disposable_cross_parish_allow_deny_qa',
  'disposable_route_document_family_portal_qa',
  'nonproduction_promotion_evidence',
  'shared_qa_promotion_smoke',
  'shared_qa_active_parish_cookie_smoke',
  'human_intake_validation',
  'smoke_fixture_verification_checklist',
  'rollout_evidence_crosswalk',
  'rollout_rollback_packet',
  'support_communication_note',
  'final_go_no_go_checklist',
  'final_automated_checks',
]

const REQUIRED_SMOKE_VERIFICATIONS: MembershipAwareRlsSmokeVerification[] = [
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
]

const READY_STATUSES: MembershipAwareRlsReviewStatus[] = [
  'READY',
  'COMPLETE',
  'REVIEWED',
  'APPROVED',
  'APPROVED_WITH_CONDITIONS',
  'CONFIRMED',
  'PASSED',
  'GO',
]

const SECRET_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\//i, 'database url'],
  [/(?:service[_-]?role|anon)[\s_-]*key/i, 'api key wording'],
  [/bearer\s+[a-z0-9._-]+/i, 'bearer token'],
  [/sk-[a-z0-9]/i, 'api key'],
  [/x-amz-signature/i, 'signed url'],
  [/token_hash|refresh_token|access_token/i, 'token material'],
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, 'email address'],
]

export function buildMembershipAwareRlsProductionApprovalReadiness(
  input: MembershipAwareRlsProductionApprovalReadinessInput,
): MembershipAwareRlsProductionApprovalReadinessResult {
  const missingRequiredItems: string[] = []

  for (const owner of REQUIRED_OWNERS) {
    requireReadyStatus(input.ownerStatuses[owner], owner, missingRequiredItems)
  }

  for (const fixture of REQUIRED_FIXTURES) {
    requireReadyStatus(input.fixtureStatuses[fixture], fixture, missingRequiredItems)
  }

  for (const evidence of REQUIRED_EVIDENCE) {
    requireReadyStatus(input.evidenceStatuses[evidence], evidence, missingRequiredItems)
  }

  const coveredSmokeItems = [...new Set(input.smokeVerificationItems)]
  const missingSmokeVerificationItems = REQUIRED_SMOKE_VERIFICATIONS.filter(
    (item) => !coveredSmokeItems.includes(item),
  )

  if (missingSmokeVerificationItems.length > 0) {
    missingRequiredItems.push(
      `smoke verification coverage missing: ${missingSmokeVerificationItems.join(
        ', ',
      )}`,
    )
  }

  requireBoolean(
    input.productionAccessNotStarted,
    'production access has not started before approval',
    missingRequiredItems,
  )
  requireBoolean(
    input.migrationsNotAppliedDuringReview,
    'migrations were not applied during review',
    missingRequiredItems,
  )
  requireBoolean(
    input.operationalRlsUnchangedDuringReview,
    'operational RLS is unchanged during review',
    missingRequiredItems,
  )
  requireBoolean(
    input.runtimePublicIntakeOutOfScope,
    'runtime public intake routing is out of scope',
    missingRequiredItems,
  )
  requireBoolean(
    input.aiProductionFlagsOutOfScope,
    'AI production flags are out of scope',
    missingRequiredItems,
  )
  requireBoolean(
    input.googleCalendarMutationOutOfScope,
    'Google Calendar mutation is out of scope',
    missingRequiredItems,
  )
  requireBoolean(
    input.unrelatedDeploymentOutOfScope,
    'unrelated deployments are out of scope',
    missingRequiredItems,
  )

  const unsafeLabelFindings = collectUnsafeLabels(input.productionTargetLabels)

  const readyToRequestProductOwnerApproval =
    missingRequiredItems.length === 0 && unsafeLabelFindings.length === 0
  const readyForProductionRollout =
    readyToRequestProductOwnerApproval &&
    input.explicitProductionApprovalPhraseRecorded

  return {
    readyToRequestProductOwnerApproval,
    readyForProductionRollout,
    missingRequiredItems,
    unsafeLabelFindings,
    requiredOwners: REQUIRED_OWNERS,
    requiredFixtures: REQUIRED_FIXTURES,
    requiredEvidence: REQUIRED_EVIDENCE,
    requiredSmokeVerificationItems: REQUIRED_SMOKE_VERIFICATIONS,
    missingSmokeVerificationItems,
    productionNoGoBoundaries: [
      'Production RLS remains NO-GO until the exact approval phrase APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT is recorded separately.',
      'This readiness gate does not access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.',
      'Runtime public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, and production data cleanup remain out of scope.',
      'Safe labels only: no database URLs, passwords, service-role keys, raw tokens, signed URLs, private documents, audit payloads, parishioner details, or raw production ids.',
    ],
    nextSafeAction: readyForProductionRollout
      ? 'Use the approved production rollout evidence template during the named rollout window; stop if any hard-stop condition occurs.'
      : readyToRequestProductOwnerApproval
        ? 'Request the separate product-owner production approval prompt with the exact approval phrase and production-safe labels.'
        : 'Complete the missing owner, fixture, evidence, smoke-verification, scope-boundary, and safe-label items before requesting production approval.',
  }
}

function requireReadyStatus(
  status: MembershipAwareRlsReviewStatus | undefined,
  label: string,
  missingRequiredItems: string[],
) {
  if (!status || !READY_STATUSES.includes(status)) {
    missingRequiredItems.push(
      `${label} must be ready, complete, reviewed, approved, confirmed, passed, or GO`,
    )
  }
}

function requireBoolean(
  value: boolean,
  label: string,
  missingRequiredItems: string[],
) {
  if (!value) {
    missingRequiredItems.push(label)
  }
}

function collectUnsafeLabels(
  labels: MembershipAwareRlsProductionApprovalReadinessInput['productionTargetLabels'],
) {
  const findings: string[] = []

  for (const [key, value] of Object.entries(labels)) {
    if (!value.trim()) {
      findings.push(`${formatLabelKey(key)}: missing safe label`)
      continue
    }

    for (const [pattern, description] of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(`${formatLabelKey(key)}: possible ${description}`)
      }
    }
  }

  return findings
}

function formatLabelKey(key: string) {
  return key.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`)
}
