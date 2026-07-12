import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateFutureDailyOfficeHandoffSavedViewDashboardUiSource } from './dailyOfficeHandoffSavedViewDashboardUiPreflight'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard daily office handoff saved-view UI wiring', () => {
  it('renders read-only saved-view presets from the Daily Office Handoff saved-view DTO', () => {
    const componentSource = readRepoFile('app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx')
    const dashboardSource = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    for (const expected of [
      'DashboardDailyOfficeHandoffSavedViews',
      'buildDailyOfficeHandoffSavedViewPlan',
      ': DailyOfficeHandoffSavedViewPlan',
      'dailyOfficeHandoffDigest',
      'existing Daily Office Handoff Digest',
      'selected active parish',
      'active parish',
      'Read-only',
      'staff-reviewed',
      'No automation',
      'Front desk opening view',
      'Sacramental records handoff view',
      'Administrator closeout view',
      'recommendedQueueHref',
      'cue.href',
      'staff-reviewed queues',
      'Handoff rhythm',
      'preset.reviewRhythm',
      'preset.emptyState',
      'No handoff cue',
      'empty state',
      'plan.coverageNotes',
    ]) {
      expect(componentSource).toContain(expected)
    }

    for (const forbidden of [
      '<button',
      '<form',
      'onClick=',
      'fetch(',
      'createClient(',
      '.insert(',
      '.update(',
      '.delete(',
      'upsert(',
      'createSignedUrl',
      'getSignedUrl',
      'storage.from(',
      'OpenAI',
      '/api/ai',
      '/api/exports',
      '/api/email',
      '/api/google',
      'resend',
      'sendEmail',
      'localStorage',
      'sessionStorage',
      'cookies()',
      'router.push',
      'useRouter',
      'generateCertificate',
      'mergePeople',
      'mergeHouseholds',
      'download',
    ]) {
      expect(componentSource).not.toContain(forbidden)
    }

    const handoffIndex = dashboardSource.indexOf('<DashboardDailyOfficeHandoffDigest')
    const savedViewsIndex = dashboardSource.indexOf('<DashboardDailyOfficeHandoffSavedViews')
    const healthIndex = dashboardSource.indexOf('<DashboardParishHealthScore')

    expect(handoffIndex).toBeGreaterThan(-1)
    expect(savedViewsIndex).toBeGreaterThan(handoffIndex)
    expect(healthIndex).toBeGreaterThan(savedViewsIndex)
    expect(dashboardSource).toContain(
      "import { DashboardDailyOfficeHandoffSavedViews } from './DashboardDailyOfficeHandoffSavedViews'",
    )
    expect(dashboardSource).toContain('activeParishName={activeParishName}')
  })

  it('passes the prepared source-level preflight with complete marker coverage', () => {
    const componentSource = readRepoFile('app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx')
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource,
      dashboardSource: `
        <DashboardDailyWorkHubOverview />
        <DashboardDailyOfficeHandoffDigest />
        <DashboardDailyOfficeHandoffSavedViews />
        <DashboardParishHealthScore />
      `,
    })

    expect(result.ok).toBe(true)
    expect(result.forbiddenMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('documents implementation and keeps production-sensitive boundaries closed', () => {
    const doc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_WIRED_20260708',
      'read-only staff-facing dashboard surface',
      'Handoff rhythm',
      'does not persist saved views',
      'does not mutate records',
      'does not send communications',
      'does not call AI',
      'does not run exports',
      'does not generate certificates',
      'does not make public trust claims',
      'production-sensitive gates remain closed',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Office Handoff Saved-View Dashboard UI Wired')
    expect(roadmap).toContain('visible Daily Office Handoff saved-view dashboard UI')
    expect(sourceOfTruth).toContain('visible Daily Office Handoff saved-view dashboard UI')
  })
})
