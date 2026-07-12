import { describe, expect, it } from 'vitest'

import {
  PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS,
  PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH,
  checkProductionSensitiveGateBoundaryConsistency,
} from './productionSensitiveGateBoundaryConsistency'

describe('production-sensitive gate boundary consistency checker', () => {
  it('keeps high-risk production gates linked and blocked', () => {
    const report = checkProductionSensitiveGateBoundaryConsistency()

    expect(report.schemaVersion).toBe(1)
    expect(report.decision).toBe('BOUNDARIES_READY_FOR_REVIEW')
    expect(report.productionSensitiveFeaturesApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.indexPath).toBe(PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH)
    expect(report.artifactCount).toBeGreaterThanOrEqual(13)
    expect(report.ownerApprovalRequiredCount).toBe(report.artifactCount)
    expect(report.linkedArtifactCount).toBe(
      PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS.length
    )
    expect(report.existingArtifactCount).toBe(
      PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS.length
    )
    expect(report.boundaryPhraseCount).toBeGreaterThanOrEqual(10)
    expect(report.findings).toEqual([])
  })

  it('covers the currently sensitive production approval surfaces', () => {
    const gateIds = PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS.map(
      (artifact) => artifact.gateId
    )

    expect(gateIds).toEqual(
      expect.arrayContaining([
        'membership-aware-operational-rls',
        'production-monitoring',
        'content-security-policy-runtime',
        'public-intake-runtime-routing',
        'ai-summary-safety-chain',
        'ai-reply-audit-response-gates',
        'request-list-basic-export',
        'request-document-manifest-export',
        'export-audit-reviewer-dashboard',
        'backup-restore-public-claims',
        'public-trust-center-claims',
        'workflow-reminders-runtime',
        'certificate-issuance-logging',
        'sacramental-correction-notation',
        'next-proxy-staff-authorization',
      ])
    )
  })
})
