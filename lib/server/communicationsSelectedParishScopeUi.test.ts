import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Communications selected-parish scope UI wiring', () => {
  it('returns a display-only active parish name from the validated Communications loader context', () => {
    const loader = readRepoFile('lib/server/loadParishCommunicationCenter.ts')

    expect(loader).toContain('activeParishName: string | null')
    expect(loader).toContain('activeParishName: parishContext.activeParish?.name ?? null')
    expect(loader).toContain('loadDashboardRequests(supabase, {')
    expect(loader).toContain('activeParishId: parishContext.activeParishId')
    expect(loader).toContain("activeParishName: null")
  })

  it('renders the selected parish label in the Communications client without changing write actions', () => {
    const client = readRepoFile('app/dashboard/communications/DashboardCommunicationsPageClient.tsx')

    expect(client).toContain('activeParishName?: string | null')
    expect(client).toContain('Communications are scoped to')
    expect(client).toContain('{activeParishName}')
    expect(client).toContain('logCommunicationTouchpoint')
    expect(client).toContain('updateCommunicationFollowUp')
    expect(client).not.toContain('/api/google/calendar-event')
    expect(client).not.toContain('google_calendar')
  })

  it('documents the non-production guardrails and browser-QA follow-up', () => {
    const doc = readRepoFile('docs/COMMUNICATIONS_SELECTED_PARISH_SCOPE_UX_20260629.md')

    for (const expected of [
      'does not access production',
      'apply migrations',
      'change operational RLS',
      'touch Google Calendar routes or data',
      'mutate communication records',
      'expose secrets',
      'Communications are scoped to',
      'Browser QA should still verify',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
