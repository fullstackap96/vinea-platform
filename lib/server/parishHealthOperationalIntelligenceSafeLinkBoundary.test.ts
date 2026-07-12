import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Parish Health and Operational Intelligence safe link boundary', () => {
  it('documents the read-only dashboard-internal recommendation link boundary', () => {
    const doc = readRepoFile(
      'docs/PARISH_HEALTH_OPERATIONAL_INTELLIGENCE_SAFE_LINK_BOUNDARY_20260708.md',
    )

    for (const expected of [
      'PARISH_HEALTH_OPERATIONAL_INTELLIGENCE_SAFE_LINK_BOUNDARY_20260708',
      'READ-ONLY DASHBOARD LINK HARDENING',
      'preserve only links that normalize under `/dashboard`',
      'drop external URLs',
      'API paths',
      'JavaScript URLs',
      'dashboard-lookalike paths',
      'dot-segment traversal',
      'raw or encoded backslashes',
      'recommendations, factors, insights, or next actions',
      'does not mutate records',
      'does not send communications',
      'does not enable automation',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not generate certificates',
      'does not apply migrations',
      'does not change operational RLS',
      'does not access production',
      'does not make public trust claims',
      'do not make sacramental, canonical, pastoral, or eligibility decisions',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps Parish Health Score links behind the sanitizer before recommendations emit', () => {
    const source = readRepoFile('lib/parishHealthScore.ts')
    const utilitySource = readRepoFile('lib/safeDashboardHref.ts')

    for (const expected of [
      "import { safeDashboardHref } from '@/lib/safeDashboardHref'",
      'href: safeDashboardHref(input.href)',
      'href: safeDashboardHref(factor.href)',
    ]) {
      expect(source).toContain(expected)
    }

    for (const expected of [
      'function safeDashboardHref',
      "parsed.pathname !== '/dashboard'",
      "!parsed.pathname.startsWith('/dashboard/')",
      "decodeURIComponent(segment)",
      "decodedSegment === '.' || decodedSegment === '..'",
      "decodedSegment.includes('\\\\')",
      "candidate.startsWith('//')",
      "candidate.includes('://')",
      "lowerCandidate.includes('javascript:')",
    ]) {
      expect(utilitySource).toContain(expected)
    }
  })

  it('keeps Operational Intelligence links behind the sanitizer before next actions emit', () => {
    const source = readRepoFile('lib/operationalIntelligenceBrief.ts')

    for (const expected of [
      "import { safeDashboardHref } from '@/lib/safeDashboardHref'",
      'href: safeDashboardHref(href)',
      'href: safeDashboardHref(insight.href)',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('does not introduce runtime side effects into the read-only DTO builders', () => {
    const combinedSource = `${readRepoFile('lib/parishHealthScore.ts')}\n${readRepoFile(
      'lib/operationalIntelligenceBrief.ts',
    )}\n${readRepoFile('lib/safeDashboardHref.ts')}`

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
      expect(combinedSource).not.toContain(forbidden)
    }
  })

  it('links the boundary from current state docs', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Parish Health And Operational Intelligence Safe Link Boundary')
    expect(roadmap).toContain('Parish Health and Operational Intelligence safe link boundary')
    expect(sourceOfTruth).toContain(
      'Parish Health and Operational Intelligence safe link boundary',
    )
  })
})
