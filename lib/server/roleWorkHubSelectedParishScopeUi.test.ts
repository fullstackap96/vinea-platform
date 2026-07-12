import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Role Work Hub selected-parish scope UI wiring', () => {
  it('passes the validated active parish name from the dashboard home page into the dashboard UI', () => {
    const source = readRepoFile('app/dashboard/page.tsx')

    expect(source).toContain('loadActiveStaffParishSwitcherContext')
    expect(source).toContain('parishSwitcher.parishes.find')
    expect(source).toContain('parish.id === parishSwitcher.activeParishId')
    expect(source).toContain('view="home"')
    expect(source).toContain('activeParishId={activeParishId}')
    expect(source).toContain('activeParishName={activeParishName}')
  })

  it('passes the validated active parish name from the dashboard UI into the role work hub', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain('activeParishName?: string | null')
    expect(source).toContain('<DashboardRoleWorkHub')
    expect(source).toContain('activeParishName={activeParishName}')
    expect(source).toContain("fetch('/api/dashboard/work-hub'")
    expect(source).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(source).not.toContain('fetchDashboardRequestParishionerScope')
    expect(source).toContain('activeParishId is the server-validated parish scope trigger')
  })

  it('renders a display-only selected parish label in the role work hub', () => {
    const source = readRepoFile('app/dashboard/DashboardRoleWorkHub.tsx')

    expect(source).toContain('activeParishName?: string | null')
    expect(source).toContain('activeParishName = null')
    expect(source).toContain('Role work hub is scoped to')
    expect(source).toContain('{activeParishName}')
    expect(source).toContain('buildDashboardRoleWorkHub(commandCenter, { limitPerLens: 4 })')
    expect(source).not.toContain('/api/google/calendar-event')
    expect(source).not.toContain('google_calendar')
  })

  it('documents the non-production guardrails and browser-QA follow-up', () => {
    const doc = readRepoFile('docs/ROLE_WORK_HUB_SELECTED_PARISH_SCOPE_UX_20260629.md')

    for (const expected of [
      'does not access production',
      'apply migrations',
      'change operational RLS',
      'touch Google Calendar routes or data',
      'mutate request or communication records',
      'expose secrets',
      'Role work hub is scoped to',
      'Browser QA should still verify',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
