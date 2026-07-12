import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('CSP report-only evidence checker script', () => {
  it('is exposed as an npm script and checks the CSP evidence package', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-csp-report-only-evidence.mjs')

    expect(packageJson).toContain(
      '"check:csp-report-only": "node scripts/check-csp-report-only-evidence.mjs"',
    )

    for (const artifact of [
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
      'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
      'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
      'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
      'lib/server/nextSecurityHeadersConfig.test.ts',
      'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
    ]) {
      expect(script).toContain(artifact)
    }

    expect(script).toContain('CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW')
    expect(script).toContain('reportOnlyRuntimeApproved: false')
    expect(script).toContain('productionCspApproved: false')
    expect(script).toContain('enforcingCspApproved: false')
    expect(script).toContain('publicTrustClaimsApproved: false')
    expect(script).toContain('UNSAFE_SECRET_LIKE_VALUE')

    for (const smokeLabel of [
      'staffSignInVerified',
      'publicIntakeSmokeVerified',
      'familyPortalSmokeVerified',
      'googleOauthCallbackSmokeVerified',
      'documentUiSmokeVerified',
      'certificateViewSmokeVerified',
    ]) {
      expect(script).toContain(smokeLabel)
    }
  })

  it('returns a sanitized ready-for-review decision for the current CSP package', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-csp-report-only-evidence.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      reportOnlyRuntimeApproved: boolean
      productionCspApproved: boolean
      enforcingCspApproved: boolean
      publicTrustClaimsApproved: boolean
      artifactCount: number
      existingArtifactCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe('CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW')
    expect(report.reportOnlyRuntimeApproved).toBe(false)
    expect(report.productionCspApproved).toBe(false)
    expect(report.enforcingCspApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.artifactCount).toBe(8)
    expect(report.existingArtifactCount).toBe(8)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
