import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard daily office handoff digest UI wiring', () => {
  it('renders the handoff card as a read-only staff-reviewed dashboard surface', () => {
    const source = readRepoFile('app/dashboard/DashboardDailyOfficeHandoffDigest.tsx')

    for (const expected of [
      'Daily office handoff',
      'Staff handoff rhythm',
      'Staff-reviewed only',
      'Scoped to',
      'Open existing queue',
      'Read-only boundary',
      'They point to existing review queues and do not',
      'digest.coverageNotes',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      '<button',
      '<form',
      'onClick=',
      'fetch(',
      'supabase',
      '.insert(',
      '.update(',
      '.delete(',
      'createSignedUrl',
      'OpenAI',
      'resend',
      '/api/exports',
      '/api/ai',
      '/api/email',
      'download',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('derives the digest from already scoped dashboard DTOs and places it before deeper sections', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain("import { DashboardDailyOfficeHandoffDigest } from './DashboardDailyOfficeHandoffDigest'")
    expect(source).toContain("import { buildDailyOfficeHandoffDigest } from '@/lib/dailyOfficeHandoffDigest'")
    expect(source).toContain('const dailyOfficeHandoffDigest = useMemo(')
    expect(source).toContain('parishHealthScore,')
    expect(source).toContain('operationalIntelligence: operationalIntelligenceBrief,')
    expect(source).toContain('[parishHealthScore, operationalIntelligenceBrief]')

    const overviewIndex = source.indexOf('<DashboardDailyWorkHubOverview')
    const handoffIndex = source.indexOf('<DashboardDailyOfficeHandoffDigest')
    const healthIndex = source.indexOf('<DashboardParishHealthScore')
    const reminderIndex = source.indexOf('<DashboardWorkflowReminderPreview')
    const intelligenceIndex = source.indexOf('<DashboardOperationalIntelligenceBrief')

    expect(overviewIndex).toBeGreaterThan(-1)
    expect(handoffIndex).toBeGreaterThan(overviewIndex)
    expect(healthIndex).toBeGreaterThan(handoffIndex)
    expect(reminderIndex).toBeGreaterThan(healthIndex)
    expect(intelligenceIndex).toBeGreaterThan(reminderIndex)

    expect(source).toContain('activeParishName={activeParishName}')
  })

  it('documents the dashboard wiring and production-safe boundaries', () => {
    const doc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_20260705.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_WIRED_20260705',
      'read-only staff-facing dashboard card',
      'active parish',
      'Opening the office',
      'Midday check-in',
      'Before closing',
      'Does not send communications',
      'mutate records',
      'generate certificates',
      'call AI',
      'run exports',
      'create signed URLs',
      'public trust claims',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Office Handoff Digest Dashboard UI Wired')
    expect(roadmap).toContain('visible Daily Office Handoff Digest UI')
    expect(sourceOfTruth).toContain('visible Daily Office Handoff Digest UI')
  })
})
