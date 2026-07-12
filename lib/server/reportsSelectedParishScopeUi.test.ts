import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const reportsPagePath = join(process.cwd(), 'app', 'dashboard', 'reports', 'page.tsx')
const reportsClientPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'reports',
  'DashboardReportsPage.tsx'
)
const evidencePath = join(process.cwd(), 'docs', 'REPORTS_SELECTED_PARISH_SCOPE_UX_20260628.md')

describe('reports selected parish scope UX', () => {
  it('passes the active parish name from the server page into the reports client', () => {
    const page = readFileSync(reportsPagePath, 'utf8')

    expect(page).toContain('loadActiveStaffParishSwitcherContext')
    expect(page).toContain('parishSwitcher.parishes.find')
    expect(page).toContain('parish.id === parishSwitcher.activeParishId')
    expect(page).toContain('activeParishName={activeParishName}')
  })

  it('keeps reports data scoped by active parish id and shows a visible staff-facing label', () => {
    const client = readFileSync(reportsClientPath, 'utf8')

    expect(client).toContain('activeParishName')
    expect(client).toContain('Reports are scoped to')
    expect(client).toContain("fetch('/api/dashboard/reports-summary'")
    expect(client).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(client).not.toContain('loadDashboardRequests')
    expect(client).not.toContain("from('requests')")
  })

  it('documents the non-production-safe scope and avoids unrelated surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar was not touched',
      'no secrets were exposed',
      'Reports are scoped to',
      'does not promote production RLS',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
