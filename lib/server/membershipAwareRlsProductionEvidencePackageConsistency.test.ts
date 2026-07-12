import { describe, expect, it } from 'vitest'

import {
  MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS,
  checkMembershipAwareRlsProductionEvidencePackageConsistency,
} from './membershipAwareRlsProductionEvidencePackageConsistency'

describe('membership-aware RLS production evidence package consistency checker', () => {
  it('keeps the package complete while preserving the production no-go boundary', () => {
    const report = checkMembershipAwareRlsProductionEvidencePackageConsistency()

    expect(report.schemaVersion).toBe(1)
    expect(report.decision).toBe('READY_FOR_FINAL_HUMAN_REVIEW')
    expect(report.readyForProductionRollout).toBe(false)
    expect(report.indexPath).toBe(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md'
    )
    expect(report.requiredArtifactCount).toBeGreaterThanOrEqual(28)
    expect(report.helpfulArtifactCount).toBeGreaterThanOrEqual(4)
    expect(report.linkedArtifactCount).toBe(
      MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.length
    )
    expect(report.existingArtifactCount).toBe(
      MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.length
    )
    expect(report.productionBoundaryCount).toBeGreaterThanOrEqual(10)
    expect(report.reviewOrderStepCount).toBeGreaterThanOrEqual(13)
    expect(report.approvalGateCount).toBeGreaterThanOrEqual(16)
    expect(report.excludedScopeCount).toBeGreaterThanOrEqual(8)
    expect(report.hardStopCount).toBeGreaterThanOrEqual(7)
    expect(report.artifactBoundaryCount).toBeGreaterThanOrEqual(47)
    expect(report.findings).toEqual([])
  })

  it('tracks required approval artifacts separately from helpful reference artifacts', () => {
    const required = MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.filter(
      (artifact) => artifact.requiredBeforeApproval
    )
    const helpful = MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.filter(
      (artifact) => !artifact.requiredBeforeApproval
    )

    expect(required.map((artifact) => artifact.path)).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md'
    )
    expect(required.map((artifact) => artifact.path)).toContain(
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts'
    )
    expect(required.map((artifact) => artifact.path)).toContain(
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql'
    )
    expect(helpful.map((artifact) => artifact.path)).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md'
    )
  })

  it('guards the critical production approval, rollout, validator, and source artifacts', () => {
    const criticalPaths = new Set([
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
    ])

    const packagePaths = new Set(
      MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.map(
        (artifact) => artifact.path
      )
    )

    for (const criticalPath of criticalPaths) {
      expect(packagePaths.has(criticalPath)).toBe(true)
    }
  })
})
