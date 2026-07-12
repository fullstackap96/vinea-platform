import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Notifications Center selected-parish scope UI wiring', () => {
  it('passes the validated active parish name from the dashboard layout into the notifications UI', () => {
    const source = readRepoFile('app/dashboard/DashboardLayoutClient.tsx')

    expect(source).toContain('parishOptions.find')
    expect(source).toContain('parish.id === activeParishId')
    expect(source).toContain('const activeParishName = useMemo')
    expect(source).toContain('DashboardNotificationsCenter activeParishName={activeParishName}')
  })

  it('renders a display-only selected parish label in the notifications dropdown', () => {
    const source = readRepoFile('app/dashboard/_components/DashboardNotificationsCenter.tsx')

    expect(source).toContain('activeParishName?: string | null')
    expect(source).toContain('Scoped to {activeParishName}')
    expect(source).toContain('Items that may need a next step.')
  })

  it('keeps notification loading scoped by active parish context', () => {
    const source = readRepoFile('lib/server/loadNotificationsCenter.ts')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('requestedParishId')
    expect(source).toContain('activeParishId: parishContext.activeParishId')
    expect(source).toContain('loadDashboardRequests')
  })

  it('documents the safe non-production guardrails for this hardening phase', () => {
    const doc = readRepoFile('docs/NOTIFICATIONS_CENTER_SELECTED_PARISH_SCOPE_UX_20260629.md')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Scoped to {activeParishName}',
      'Production RLS remains `NO-GO`',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
