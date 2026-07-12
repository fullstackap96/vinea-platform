import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(
  process.cwd(),
  'docs',
  'TRUST_CENTER_PUBLIC_CLAIMS_CONSISTENCY_CHECKER_20260707.md'
)

describe('trust center public claims consistency checker doc', () => {
  it('documents repository-only scope and public publishing no-go boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a repository-only trust-center readiness check.',
      'Production was not accessed',
      'production flags were not enabled',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'public trust-center copy was not published',
      'Current public trust-center decision: `NO-GO`',
      'This checker is not a public trust-center publishing tool.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('documents the source helper, checked artifacts, safe result, and failure behavior', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'lib/server/trustCenterPublicClaimsConsistency.ts',
      'checkTrustCenterPublicClaimsConsistency(...)',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md',
      'decision: PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
      'publicTrustCenterPublishingApproved: false',
      'publicClaimsApproved: false',
      'findings: []',
      'If the checker returns `NEEDS_ATTENTION`, stop before drafting public trust-center language.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('forbids treating consistency as approval for public or compliance claims', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'does not mean Vinea may publish public trust-center copy',
      'Public trust-center publishing remains `NO-GO`',
      'Do not use this checker to approve SOC 2',
      'production backup/restore',
      'production RPO/RTO',
      'production monitoring',
      'production RLS',
      'production exports',
      'production public intake routing',
      'production AI safety',
      'formal compliance claims',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
