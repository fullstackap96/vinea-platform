import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Operating Signal safe link boundary', () => {
  it('documents the dashboard-only signal link boundary', () => {
    const doc = readRepoFile('docs/DAILY_OPERATING_SIGNAL_SAFE_LINK_BOUNDARY_20260708.md')

    for (const expected of [
      'DAILY_OPERATING_SIGNAL_SAFE_LINK_BOUNDARY_20260708',
      'READ-ONLY SIGNAL LINK HARDENING',
      'Daily Operating Signal Inputs',
      'certificate-ready record review links',
      'duplicate person review links',
      'duplicate household review links',
      'start with `/dashboard`',
      'external URLs',
      'protocol-relative URLs',
      'JavaScript URLs',
      'API routes',
      'export routes',
      'email/send routes',
      'AI routes',
      'storage paths',
      'signed URLs',
      'token material',
      'raw metadata',
      'does not mutate records',
      'does not merge duplicates',
      'does not issue certificates',
      'does not send communications',
      'does not enable automation',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not apply migrations',
      'does not change operational RLS',
      'does not access production',
      'does not make sacramental, canonical, pastoral, or eligibility decisions',
      'does not make public trust claims',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps Daily Operating Signal links behind the shared sanitizer', () => {
    const source = readRepoFile('lib/dailyOperatingSystemSignals.ts')

    for (const expected of [
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      'function certificateRecordHref',
      'function duplicateReviewHref',
      "safeDashboardHrefOrFallback(",
      "'/dashboard/records'",
      "'/dashboard/people'",
      'encodeURIComponent(recordId)',
    ]) {
      expect(source).toContain(expected)
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
      expect(source).not.toContain(forbidden)
    }
  })

  it('links the boundary from current state docs', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Daily Operating Signal Safe Link Boundary')
    expect(roadmap).toContain('Daily Operating Signal safe link boundary')
    expect(sourceOfTruth).toContain('Daily Operating Signal safe link boundary')
  })
})
