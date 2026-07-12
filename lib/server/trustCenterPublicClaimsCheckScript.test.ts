import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('trust center public claims CLI checker', () => {
  it('is exposed as an npm script and checks public-claim boundary artifacts', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-trust-center-claims.mjs')

    expect(packageJson).toContain(
      '"check:trust-center-claims": "node scripts/check-trust-center-claims.mjs"',
    )

    for (const expected of [
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md',
      'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
      'publicTrustCenterPublishingApproved: false',
      'publicClaimsApproved: false',
      'UNSAFE_SECRET_LIKE_VALUE',
      'MISSING_STOP_CONDITION',
      'Vinea is SOC 2 certified',
      'Vinea production monitoring is live and staffed.',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('returns sanitized ready-for-review JSON for the current trust-center claims package', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-trust-center-claims.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      publicTrustCenterPublishingApproved: boolean
      publicClaimsApproved: boolean
      trustAreaCount: number
      supportingReferenceCount: number
      boundaryPhraseCount: number
      stopConditionCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe('PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW')
    expect(report.publicTrustCenterPublishingApproved).toBe(false)
    expect(report.publicClaimsApproved).toBe(false)
    expect(report.trustAreaCount).toBe(11)
    expect(report.supportingReferenceCount).toBeGreaterThanOrEqual(13)
    expect(report.boundaryPhraseCount).toBeGreaterThanOrEqual(21)
    expect(report.stopConditionCount).toBe(10)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
