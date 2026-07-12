import {
  MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
  evaluateMembershipAwareRlsProductionApprovalPacket,
  type MembershipAwareRlsProductionApprovalPacketLabels,
} from './membershipAwareRlsProductionApprovalInput'

export type MembershipAwareRlsProductionApprovalDryRunDecision =
  | 'READY_TO_REQUEST_APPROVAL'
  | 'READY_FOR_APPROVED_ROLLOUT'
  | 'NOT_READY'

export type MembershipAwareRlsProductionApprovalDryRunJson = {
  schemaVersion: 1
  dryRunName: string
  generatedFrom: readonly string[]
  scope: {
    repositoryOnly: true
    productionAccessed: false
    migrationsApplied: false
    operationalRlsChanged: false
    recordsMutated: false
    googleCalendarTouched: false
    exportsRun: false
    aiCalled: false
    storageAccessed: false
    signedUrlsCreated: false
    communicationsSent: false
    certificatesGenerated: false
    publicTrustClaimsMade: false
  }
  decision: MembershipAwareRlsProductionApprovalDryRunDecision
  pass: boolean
  safeSummary: {
    readyToRequestProductOwnerApproval: boolean
    readyForProductionRollout: boolean
    approvalPhraseRecorded: boolean
    requiredOwnerCount: number
    requiredFixtureCount: number
    requiredEvidenceCount: number
    requiredSmokeVerificationCount: number
    missingRequiredItemCount: number
    missingLabelFieldCount: number
    unsafeLabelFindingCount: number
    missingSmokeVerificationCount: number
  }
  missingRequiredItems: readonly string[]
  missingLabelFields: readonly string[]
  missingSmokeVerificationItems: readonly string[]
  unsafeLabelFindings: readonly string[]
  productionNoGoBoundaries: readonly string[]
  nextSafeAction: string
}

export function runMembershipAwareRlsProductionApprovalDryRun(
  packet: MembershipAwareRlsProductionApprovalPacketLabels,
  dryRunName = 'membership-aware-rls-production-approval-repository-dry-run',
): MembershipAwareRlsProductionApprovalDryRunJson {
  const evaluation = evaluateMembershipAwareRlsProductionApprovalPacket(packet)
  const readiness = evaluation.readiness
  const decision = readiness.readyForProductionRollout
    ? 'READY_FOR_APPROVED_ROLLOUT'
    : readiness.readyToRequestProductOwnerApproval
      ? 'READY_TO_REQUEST_APPROVAL'
      : 'NOT_READY'

  return {
    schemaVersion: 1,
    dryRunName,
    generatedFrom: [
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
    ],
    scope: {
      repositoryOnly: true,
      productionAccessed: false,
      migrationsApplied: false,
      operationalRlsChanged: false,
      recordsMutated: false,
      googleCalendarTouched: false,
      exportsRun: false,
      aiCalled: false,
      storageAccessed: false,
      signedUrlsCreated: false,
      communicationsSent: false,
      certificatesGenerated: false,
      publicTrustClaimsMade: false,
    },
    decision,
    pass: readiness.readyToRequestProductOwnerApproval,
    safeSummary: {
      readyToRequestProductOwnerApproval:
        readiness.readyToRequestProductOwnerApproval,
      readyForProductionRollout: readiness.readyForProductionRollout,
      approvalPhraseRecorded: evaluation.approvalPhraseRecorded,
      requiredOwnerCount: readiness.requiredOwners.length,
      requiredFixtureCount: readiness.requiredFixtures.length,
      requiredEvidenceCount: readiness.requiredEvidence.length,
      requiredSmokeVerificationCount:
        readiness.requiredSmokeVerificationItems.length,
      missingRequiredItemCount: readiness.missingRequiredItems.length,
      missingLabelFieldCount: evaluation.missingLabelFields.length,
      unsafeLabelFindingCount:
        evaluation.unsafeLabelFindings.length +
        readiness.unsafeLabelFindings.length,
      missingSmokeVerificationCount:
        readiness.missingSmokeVerificationItems.length,
    },
    missingRequiredItems: readiness.missingRequiredItems,
    missingLabelFields: evaluation.missingLabelFields,
    missingSmokeVerificationItems: readiness.missingSmokeVerificationItems,
    unsafeLabelFindings: [
      ...evaluation.unsafeLabelFindings,
      ...readiness.unsafeLabelFindings,
    ],
    productionNoGoBoundaries: readiness.productionNoGoBoundaries,
    nextSafeAction: readiness.nextSafeAction,
  }
}

export function buildCurrentFilledMembershipAwareRlsProductionApprovalPacket(
  includeExplicitApprovalPhrase = false,
): MembershipAwareRlsProductionApprovalPacketLabels {
  return {
    ownerLabels: {
      product_owner: 'Product Owner label from filled intake checklist',
      technical_owner: 'Technical Owner label from filled intake checklist',
      qa_owner: 'QA Owner label from filled intake checklist',
      security_data_owner:
        'Security/Data Owner label from filled intake checklist',
      rollback_owner: 'Rollback Owner label from filled intake checklist',
      monitoring_owner: 'Monitoring Owner label from filled intake checklist',
      support_owner: 'Support Owner label from filled intake checklist',
      evidence_owner: 'Evidence Owner label from filled intake checklist',
    },
    fixtureLabels: {
      staff_account: 'Production RLS smoke staff account label only',
      active_parish: 'Production RLS Smoke Parish A label',
      same_parish_request: 'Production RLS Smoke Request A non-sensitive label',
      cross_parish_denied_request:
        'Production RLS Denied Request B generic denial label',
      workflow_step: 'Production RLS Smoke Workflow Step label',
      staff_synthetic_document: 'Synthetic staff-facing document label only',
      family_synthetic_document: 'Synthetic family-facing document label only',
      family_portal_token_plan:
        'Create during smoke window, never record raw token, deactivate after smoke',
      cleanup_plan:
        'Delete synthetic documents, deactivate token, restore safe request state if changed',
    },
    evidenceStatuses: {
      disposable_forward_rollback_validation: 'PASSED',
      disposable_cross_parish_allow_deny_qa: 'PASSED',
      disposable_route_document_family_portal_qa: 'PASSED',
      nonproduction_promotion_evidence: 'PASSED',
      shared_qa_promotion_smoke: 'PASSED',
      shared_qa_active_parish_cookie_smoke: 'PASSED',
      human_intake_validation: 'PASSED',
      smoke_fixture_verification_checklist: 'REVIEWED',
      rollout_evidence_crosswalk: 'REVIEWED',
      rollout_rollback_packet: 'REVIEWED',
      support_communication_note: 'REVIEWED',
      final_go_no_go_checklist: 'GO',
      final_automated_checks: 'PASSED',
    },
    productionTargetLabels: {
      appHostLabel: 'Production app host label only',
      databaseHostLabel: 'Production Supabase database host label only',
      releaseLabel: 'Production-intended release label',
      rolloutWindowLabel:
        'Future product-owner-approved low-traffic rollout window label',
      rollbackDeadlineLabel:
        'Future product-owner-approved rollback decision deadline label',
    },
    scopeBoundaries: {
      productionAccessNotStarted: true,
      migrationsNotAppliedDuringReview: true,
      operationalRlsUnchangedDuringReview: true,
      runtimePublicIntakeOutOfScope: true,
      aiProductionFlagsOutOfScope: true,
      googleCalendarMutationOutOfScope: true,
      unrelatedDeploymentOutOfScope: true,
    },
    explicitProductionApprovalPhrase: includeExplicitApprovalPhrase
      ? MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE
      : undefined,
  }
}
