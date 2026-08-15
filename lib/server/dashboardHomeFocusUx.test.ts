import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard home focus UX', () => {
  it('presents a selected-parish workspace navigator with four clear destinations', () => {
    const component = readRepoFile('app/dashboard/DashboardHomeFocusNav.tsx')
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    for (const expected of [
      'Today&apos;s workspace',
      'Focus now',
      'Office handoff',
      'Parish health',
      'Team queues',
      'Viewing ${activeParishName}',
      'Home dashboard sections',
    ]) {
      expect(component).toContain(expected)
    }

    for (const destination of [
      'dashboard-focus-now',
      'dashboard-handoff',
      'dashboard-health',
      'dashboard-team',
    ]) {
      expect(component).toContain(`#${destination}`)
      expect(dashboard).toContain(`id="${destination}"`)
    }

    expect(dashboard).toContain("import { DashboardHomeFocusNav }")
    expect(dashboard).toContain('Today at ${activeParishName}')
    expect(dashboard).toContain('One calm view of the families')
  })

  it('puts immediate work before handoff and analysis', () => {
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const overview = dashboard.indexOf('<DashboardDailyWorkHubOverview')
    const today = dashboard.indexOf('<DashboardTodayView')
    const handoff = dashboard.indexOf('<DashboardDailyOfficeHandoffDigest')
    const health = dashboard.indexOf('<DashboardParishHealthScore')
    const intelligence = dashboard.indexOf('<DashboardOperationalIntelligenceBrief')
    const team = dashboard.indexOf('<DashboardRoleWorkHub')

    expect(overview).toBeGreaterThan(-1)
    expect(overview).toBeLessThan(today)
    expect(today).toBeLessThan(handoff)
    expect(handoff).toBeLessThan(health)
    expect(health).toBeLessThan(intelligence)
    expect(intelligence).toBeLessThan(team)
  })

  it('keeps the navigator read-only and removes prototype-facing clutter', () => {
    const component = readRepoFile('app/dashboard/DashboardHomeFocusNav.tsx')
    const overview = readRepoFile('app/dashboard/DashboardDailyWorkHubOverview.tsx')
    const handoff = readRepoFile('app/dashboard/DashboardDailyOfficeHandoffDigest.tsx')
    const health = readRepoFile('app/dashboard/DashboardParishHealthScore.tsx')

    for (const forbidden of [
      'fetch(',
      'onClick=',
      '<button',
      '<form',
      '.insert(',
      '.update(',
      '.delete(',
      'createSignedUrl',
      '/api/',
    ]) {
      expect(component).not.toContain(forbidden)
    }

    expect(overview).not.toContain('bg-gradient')
    expect(overview).not.toContain('overview.futureSignals.map')
    expect(handoff).toContain('<details')
    expect(handoff).toContain('How this handoff stays staff-reviewed')
    expect(health).toContain('<details')
    expect(health).toContain('How this score is calculated')
  })

  it('documents the UX boundary without changing production posture', () => {
    const doc = readRepoFile('docs/DAILY_DASHBOARD_FOCUS_NAV_UX_20260814.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const ssot = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'DAILY_DASHBOARD_FOCUS_NAV_UX_20260814',
      'Focus now',
      'Office handoff',
      'Parish health',
      'Team queues',
      'No loaders, APIs, authorization rules, database writes, or production gates changed',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Dashboard Focus Navigation UX')
    expect(roadmap).toContain('Daily Dashboard Focus Navigation UX')
    expect(ssot).toContain('Daily Dashboard Focus Navigation UX')
  })
})
