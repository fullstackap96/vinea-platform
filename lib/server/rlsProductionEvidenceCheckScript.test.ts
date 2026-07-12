import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('RLS production evidence check script', () => {
  it('is exposed as a safe npm script and preserves production no-go output', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-rls-production-evidence.mjs')

    expect(packageJson).toContain(
      '"check:rls-production-evidence": "node scripts/check-rls-production-evidence.mjs"',
    )
    expect(script).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    )
    expect(script).toContain(
      'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
    )
    expect(script).toContain('readyForProductionRollout: false')
    expect(script).toContain('productionRlsApproved: false')
    expect(script).toContain('appliesMigrations: false')
    expect(script).toContain('changesOperationalRls: false')
    expect(script).toContain('UNSAFE_SECRET_LIKE_VALUE')
  })

  it('returns sanitized ready-for-review JSON for the current evidence package', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-rls-production-evidence.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      readyForProductionRollout: boolean
      productionRlsApproved: boolean
      appliesMigrations: boolean
      changesOperationalRls: boolean
      artifactCount: number
      linkedArtifactCount: number
      existingArtifactCount: number
      artifactBoundaryCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe(
      'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
    )
    expect(report.readyForProductionRollout).toBe(false)
    expect(report.productionRlsApproved).toBe(false)
    expect(report.appliesMigrations).toBe(false)
    expect(report.changesOperationalRls).toBe(false)
    expect(report.artifactCount).toBeGreaterThanOrEqual(34)
    expect(report.linkedArtifactCount).toBe(report.artifactCount)
    expect(report.existingArtifactCount).toBe(report.artifactCount)
    expect(report.artifactBoundaryCount).toBeGreaterThanOrEqual(20)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
