import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Office Handoff Digest safe link boundary', () => {
  it('documents the read-only dashboard-internal cue link boundary', () => {
    const doc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_SAFE_LINK_BOUNDARY_20260708.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_DIGEST_SAFE_LINK_BOUNDARY_20260708',
      'READ-ONLY LINK HARDENING',
      'preserves only dashboard-internal links',
      'drops external URLs',
      'API paths',
      'JavaScript URLs',
      'does not mutate records',
      'does not send communications',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not generate certificates',
      'does not apply migrations',
      'does not change operational RLS',
      'does not access production',
      'does not make public trust claims',
      'not make sacramental, canonical, pastoral, or eligibility decisions',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps the implementation source scoped to URL filtering without adding runtime side effects', () => {
    const source = readRepoFile('lib/dailyOfficeHandoffDigest.ts')
    const utilitySource = readRepoFile('lib/safeDashboardHref.ts')

    for (const expected of [
      "import { safeDashboardHref } from './safeDashboardHref'",
      'href: safeDashboardHref(factor.href)',
      'href: safeDashboardHref(insight.href)',
    ]) {
      expect(source).toContain(expected)
    }

    for (const expected of [
      'function safeDashboardHref',
      "parsed.pathname !== '/dashboard'",
      "!parsed.pathname.startsWith('/dashboard/')",
      "candidate.startsWith('//')",
      "candidate.includes('://')",
      "lowerCandidate.includes('javascript:')",
    ]) {
      expect(utilitySource).toContain(expected)
    }

    for (const forbidden of [
      'fetch(',
      'createClient(',
      '.insert(',
      '.update(',
      '.delete(',
      'createSignedUrl',
      'storage.from(',
      'OpenAI',
      '/api/exports',
      '/api/email',
      'sendEmail',
      'generateCertificate',
    ]) {
      expect(`${source}\n${utilitySource}`).not.toContain(forbidden)
    }
  })

  it('links the boundary from current state docs', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Daily Office Handoff Digest Safe Link Boundary')
    expect(roadmap).toContain('Daily Office Handoff Digest safe link boundary')
    expect(sourceOfTruth).toContain('Daily Office Handoff Digest safe link boundary')
  })
})
