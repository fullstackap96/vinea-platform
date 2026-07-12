import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS,
  checkProductionCspReportOnlyEvidencePackageConsistency,
} from './productionCspReportOnlyEvidencePackageConsistency'

function readRepoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('production CSP report-only evidence package consistency checker', () => {
  it('keeps the CSP report-only package complete while preserving production no-go boundaries', () => {
    const report = checkProductionCspReportOnlyEvidencePackageConsistency()

    expect(report.schemaVersion).toBe(1)
    expect(report.findings).toEqual([])
    expect(report.decision).toBe('READY_FOR_RUNTIME_APPROVAL_REVIEW')
    expect(report.reportOnlyRuntimeApproved).toBe(false)
    expect(report.productionCspApproved).toBe(false)
    expect(report.enforcingCspApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.approvalPacketPath).toBe(
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
    )
    expect(report.requiredArtifactCount).toBe(
      PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS.length,
    )
    expect(report.existingArtifactCount).toBe(
      PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS.length,
    )
    expect(report.packetBoundaryCount).toBeGreaterThanOrEqual(28)
    expect(report.baselineBoundaryCount).toBeGreaterThanOrEqual(8)
    expect(report.preflightBoundaryCount).toBeGreaterThanOrEqual(25)
    expect(report.testBoundaryCount).toBeGreaterThanOrEqual(7)
  })

  it('tracks the critical docs, source preflight, and tests as required artifacts', () => {
    const artifactPaths =
      PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS.map(
        (artifact) => artifact.path,
      )

    for (const expectedPath of [
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
      'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
      'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
      'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
      'lib/server/nextSecurityHeadersConfig.test.ts',
      'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
    ]) {
      expect(artifactPaths).toContain(expectedPath)
    }

    expect(
      PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS.every(
        (artifact) => artifact.requiredBeforeRuntimeApproval,
      ),
    ).toBe(true)
  })

  it('requires full staff, public, family, provider, document, and certificate smoke labels before runtime approval', () => {
    const source = readRepoFile(
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
    )
    const checkerDoc = readRepoFile(
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
    )
    const approvalPacket = readRepoFile(
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
    )

    for (const label of [
      'healthSchemaTrue',
      'staffSignInVerified',
      'selectedParishSwitchingVerified',
      'publicIntakeSmokeVerified',
      'familyPortalSmokeVerified',
      'googleOauthCallbackSmokeVerified',
      'documentUiSmokeVerified',
      'certificateViewSmokeVerified',
    ]) {
      expect(source).toContain(label)
      expect(checkerDoc).toContain(label)
      expect(approvalPacket).toContain(label)
    }
  })
})
