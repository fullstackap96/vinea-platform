import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Work Hub safe link boundary', () => {
  it('documents the dashboard-only action link boundary', () => {
    const doc = readRepoFile('docs/DAILY_WORK_HUB_SAFE_LINK_BOUNDARY_20260708.md')

    for (const expected of [
      'DAILY_WORK_HUB_SAFE_LINK_BOUNDARY_20260708',
      'READ-ONLY DAILY WORK HUB LINK HARDENING',
      'Daily Work Hub top action links',
      'fallback command-center action links',
      'Ready-for-staff-review links',
      'Request-to-record continuity handoff link',
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
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps Daily Work Hub model links behind the shared sanitizer', () => {
    const source = readRepoFile('lib/dailyWorkHubOverview.ts')

    for (const expected of [
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      "safeDashboardHrefOrFallback(item.href, '/dashboard/requests')",
      "safeDashboardHrefOrFallback(row.detailHref, '/dashboard/requests')",
      'safeDashboardHrefOrFallback(',
      "'/dashboard/records?continuity=needs_review'",
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

    expect(buildStatus).toContain('Daily Work Hub Safe Link Boundary')
    expect(roadmap).toContain('Daily Work Hub safe link boundary')
    expect(sourceOfTruth).toContain('Daily Work Hub safe link boundary')
  })
})
