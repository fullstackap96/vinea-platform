import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Parish Care Calendar selected-parish scope UI wiring', () => {
  it('returns a display-only active parish name from the validated calendar loader context', () => {
    const loader = readRepoFile('lib/server/loadParishCareCalendar.ts')

    expect(loader).toContain('activeParishName: string | null')
    expect(loader).toContain('activeParishName: parishContext.activeParish?.name ?? null')
    expect(loader).toContain('loadDashboardRequests(supabase, {')
    expect(loader).toContain('activeParishId: parishContext.activeParishId')
    expect(loader).toContain("intentionsQuery = intentionsQuery.eq('parish_id', parishId)")
    expect(loader).toContain('.select(PARISH_CARE_CALENDAR_INTENTION_SELECT)')
    expect(loader).not.toContain(".select('*')")
  })

  it('renders the selected parish label in the calendar client without changing Google Calendar behavior', () => {
    const client = readRepoFile('app/dashboard/calendar/DashboardCalendarPageClient.tsx')

    expect(client).toContain('activeParishName?: string | null')
    expect(client).toContain('Parish care calendar is scoped to')
    expect(client).toContain('{activeParishName}')
    expect(client).not.toContain('/api/google/calendar-event')
    expect(client).not.toContain('google_calendar')
  })

  it('documents the non-production guardrails and browser-QA follow-up', () => {
    const doc = readRepoFile('docs/PARISH_CARE_CALENDAR_SELECTED_PARISH_SCOPE_UX_20260628.md')

    for (const expected of [
      'does not access production',
      'apply migrations',
      'change operational RLS',
      'touch Google Calendar routes or data',
      'expose secrets',
      'Parish care calendar is scoped to',
      'Browser QA should still verify',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
