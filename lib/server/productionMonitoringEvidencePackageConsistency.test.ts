import { describe, expect, it } from 'vitest'

import {
  PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS,
  checkProductionMonitoringEvidencePackageConsistency,
} from './productionMonitoringEvidencePackageConsistency'

describe('production monitoring evidence package consistency checker', () => {
  it('keeps the monitoring package complete while preserving production no-go boundaries', () => {
    const report = checkProductionMonitoringEvidencePackageConsistency()

    expect(report.schemaVersion).toBe(1)
    expect(report.findings).toEqual([])
    expect(report.decision).toBe('READY_FOR_RUNTIME_APPROVAL_REVIEW')
    expect(report.productionMonitoringEnabled).toBe(false)
    expect(report.productionSmokeApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.indexPath).toBe(
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md'
    )
    expect(report.requiredArtifactCount).toBeGreaterThanOrEqual(17)
    expect(report.referenceArtifactCount).toBeGreaterThanOrEqual(3)
    expect(report.linkedArtifactCount).toBe(
      PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.length
    )
    expect(report.existingArtifactCount).toBe(
      PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.length
    )
    expect(report.boundaryCount).toBeGreaterThanOrEqual(16)
    expect(report.dependencyStepCount).toBeGreaterThanOrEqual(11)
    expect(report.noGoBoundaryCount).toBeGreaterThanOrEqual(14)
    expect(report.reviewCheckCount).toBeGreaterThanOrEqual(9)
    expect(report.humanInputCount).toBeGreaterThanOrEqual(18)
    expect(report.artifactBoundaryCount).toBeGreaterThanOrEqual(37)
  })

  it('tracks required approval artifacts separately from supporting references', () => {
    const required = PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.filter(
      (artifact) => artifact.requiredBeforeRuntimeApproval
    )
    const reference = PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.filter(
      (artifact) => !artifact.requiredBeforeRuntimeApproval
    )

    expect(required.map((artifact) => artifact.path)).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md'
    )
    expect(required.map((artifact) => artifact.path)).toContain(
      'lib/server/productionMonitoringRuntimePreflight.ts'
    )
    expect(required.map((artifact) => artifact.path)).toContain(
      'lib/server/productionMonitoringEvidencePackageConsistency.ts'
    )
    expect(reference.map((artifact) => artifact.path)).toContain(
      'docs/PRODUCTION_MONITORING_REDACTION_SMOKE_CASE_MATRIX_20260706.md'
    )
    expect(reference.map((artifact) => artifact.path)).toContain(
      'lib/productionMonitoringRedactionSmokeCases.ts'
    )
  })

  it('guards the critical runtime approval, smoke, evidence, and source preflight artifacts', () => {
    const artifactPaths = PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.map(
      (artifact) => artifact.path
    )

    for (const criticalArtifact of [
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
      'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
      'lib/server/productionMonitoringRuntimePreflight.ts',
    ]) {
      expect(artifactPaths).toContain(criticalArtifact)
    }
  })
})
