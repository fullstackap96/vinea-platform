import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production monitoring evidence check script', () => {
  it('is exposed as an npm script and checks the monitoring evidence package', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-production-monitoring-evidence.mjs')

    expect(packageJson).toContain(
      '"check:production-monitoring-evidence": "node scripts/check-production-monitoring-evidence.mjs"',
    )
    expect(script).toContain(
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
    )
    expect(script).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )
    expect(script).toContain('lib/server/productionMonitoringRuntimePreflight.ts')
    expect(script).toContain(
      'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
    )
    expect(script).toContain('productionMonitoringEnabled: false')
    expect(script).toContain('productionSmokeApproved: false')
    expect(script).toContain('publicTrustClaimsApproved: false')
    expect(script).toContain('externalMonitoringSendEnabled: false')
    expect(script).toContain('runtimeMonitoringImplemented: false')
    expect(script).toContain('UNSAFE_SECRET_LIKE_VALUE')
  })

  it('returns a sanitized ready-for-review report without approving runtime monitoring', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-production-monitoring-evidence.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      productionMonitoringEnabled: boolean
      productionSmokeApproved: boolean
      publicTrustClaimsApproved: boolean
      externalMonitoringSendEnabled: boolean
      runtimeMonitoringImplemented: boolean
      artifactCount: number
      requiredArtifactCount: number
      referenceArtifactCount: number
      linkedArtifactCount: number
      existingArtifactCount: number
      artifactBoundaryCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe(
      'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
    )
    expect(report.productionMonitoringEnabled).toBe(false)
    expect(report.productionSmokeApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.externalMonitoringSendEnabled).toBe(false)
    expect(report.runtimeMonitoringImplemented).toBe(false)
    expect(report.artifactCount).toBe(20)
    expect(report.requiredArtifactCount).toBe(17)
    expect(report.referenceArtifactCount).toBe(3)
    expect(report.linkedArtifactCount).toBe(20)
    expect(report.existingArtifactCount).toBe(20)
    expect(report.artifactBoundaryCount).toBeGreaterThanOrEqual(37)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(
      /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    )
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
