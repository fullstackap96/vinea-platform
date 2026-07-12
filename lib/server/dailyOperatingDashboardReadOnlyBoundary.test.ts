import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

const guardedDashboardSurfaces = [
  'app/dashboard/DashboardDailyWorkHubOverview.tsx',
  'app/dashboard/DashboardDailyOfficeHandoffDigest.tsx',
  'app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx',
  'app/dashboard/DashboardParishHealthScore.tsx',
  'app/dashboard/DashboardOperationalIntelligenceBrief.tsx',
  'app/dashboard/DashboardWorkflowReminderPreview.tsx',
] as const

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily operating dashboard read-only boundary', () => {
  it('documents the read-only staff-facing dashboard boundary', () => {
    const doc = readRepoFile('docs/DAILY_OPERATING_DASHBOARD_READ_ONLY_BOUNDARY_20260708.md')

    for (const expected of [
      'DAILY_OPERATING_DASHBOARD_READ_ONLY_BOUNDARY_20260708',
      'READ-ONLY DASHBOARD SURFACE GUARD PREPARED',
      'Daily Work Hub',
      'Daily Office Handoff Digest',
      'Daily Office Handoff saved-view presets',
      'Parish Health Score',
      'Operational Intelligence Brief',
      'Workflow Reminder Preview',
      'mutate records',
      'send communications',
      'enable automation',
      'call AI',
      'run exports',
      'access storage',
      'create signed URLs',
      'generate certificates',
      'apply migrations',
      'change operational RLS',
      'access production',
      'make public trust claims',
      'make sacramental, canonical, pastoral, or eligibility decisions',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps the guarded dashboard components free of side-effect primitives', () => {
    for (const surface of guardedDashboardSurfaces) {
      const source = readRepoFile(surface)

      for (const forbidden of [
        'fetch(',
        'createClient(',
        'createServerClient(',
        '.insert(',
        '.update(',
        '.delete(',
        'upsert(',
        'form action=',
        '<form',
        'onSubmit=',
        'onClick=',
        'useActionState',
        'useTransition',
        'createSignedUrl',
        'storage.from(',
        'OpenAI',
        'openai.',
        '/api/exports',
        '/api/email',
        '/api/ai',
        'sendEmail',
        'generateCertificate',
        'download=',
      ]) {
        expect(source, `${surface} should not contain ${forbidden}`).not.toContain(forbidden)
      }
    }
  })

  it('keeps literal dashboard links staff-internal and review-oriented', () => {
    for (const surface of guardedDashboardSurfaces) {
      const source = readRepoFile(surface)
      const literalHrefMatches = source.matchAll(/href="([^"]+)"/g)

      for (const match of literalHrefMatches) {
        const href = match[1]
        expect(href, `${surface} literal href should stay dashboard-internal`).toMatch(
          /^\/dashboard(?:$|[/?#])/,
        )
        expect(href).not.toContain('/api')
        expect(href).not.toContain('://')
        expect(href).not.toContain('//')
      }
    }
  })

  it('keeps current state docs aware of the boundary', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Daily Operating Dashboard Read-Only Boundary')
    expect(roadmap).toContain('Daily operating dashboard read-only boundary')
    expect(sourceOfTruth).toContain('Daily operating dashboard read-only boundary')
  })
})
