import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Requests selected-parish scope UI wiring', () => {
  it('passes the validated active parish name from the requests server page into the dashboard UI', () => {
    const source = readRepoFile('app/dashboard/requests/page.tsx')

    expect(source).toContain('loadActiveStaffParishSwitcherContext')
    expect(source).toContain('parishSwitcher.parishes.find')
    expect(source).toContain('parish.id === parishSwitcher.activeParishId')
    expect(source).toContain('activeParishName={activeParishName}')
  })

  it('renders a display-only selected parish label while preserving the active parish request loader scope', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain('activeParishName?: string | null')
    expect(source).toContain('!isHome && activeParishName')
    expect(source).toContain('Requests are scoped to')
    expect(source).toContain("fetch('/api/dashboard/work-hub'")
    expect(source).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(source).not.toContain('fetchDashboardRequestParishionerScope')
    expect(source).toContain('activeParishId is the server-validated parish scope trigger')
  })

  it('documents the safe non-production guardrails for this hardening phase', () => {
    const doc = readRepoFile('docs/REQUESTS_SELECTED_PARISH_SCOPE_UX_20260628.md')

    expect(doc).toContain('does not access production')
    expect(doc).toContain('apply migrations')
    expect(doc).toContain('change operational RLS')
    expect(doc).toContain('touch Google Calendar data')
    expect(doc).toContain('expose secrets')
    expect(doc).toContain('Requests are scoped to')
  })
})
