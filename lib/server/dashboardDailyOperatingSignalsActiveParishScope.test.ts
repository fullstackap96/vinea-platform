import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('app/dashboard/DashboardPageCore.tsx', 'utf8')
const loader = readFileSync('lib/server/loadDashboardWorkHub.ts', 'utf8')

describe('Daily Work Hub daily operating signal active parish scope', () => {
  it('passes the server-resolved parish hint to the single authenticated Work Hub endpoint', () => {
    expect(source).toContain("fetch('/api/dashboard/work-hub'")
    expect(source).not.toContain("fetch('/api/dashboard/daily-operating-signals'")
    expect(source).toContain("credentials: 'include'")
    expect(source).toContain("cache: 'no-store'")
    expect(source).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
  })

  it('loads request and daily signal sources together with the validated parish id', () => {
    expect(loader).toContain('const [requestResult, signalResult] = await Promise.all([')
    expect(loader).toContain('loadDashboardRequests(supabase as SupabaseClient, {')
    expect(loader).toContain('activeParishId: parishId')
    expect(loader).toContain('loadDailyOperatingSystemSignals(supabase, parishId)')
    expect(loader).toContain('signals: signalResult.signals')
  })

  it('does not retain raw signal-table reads or row parsers in the browser component', () => {
    expect(source).not.toContain(".from('people')")
    expect(source).not.toContain(".from('households')")
    expect(source).not.toContain(".from('sacramental_records')")
    expect(source).not.toContain(".from('sacramental_record_events')")
    expect(source).not.toContain('parsePersonRow')
    expect(source).not.toContain('parseHouseholdRow')
    expect(source).not.toContain('parseSacramentalRecordRow')
    expect(source).not.toContain('buildDailyOperatingSystemSignals')
  })
})
