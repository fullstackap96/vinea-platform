import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

function sourceBetween(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  expect(startIndex).toBeGreaterThanOrEqual(0)
  expect(endIndex).toBeGreaterThan(startIndex)
  return source.slice(startIndex, endIndex)
}

describe('dashboard work hub server read model source', () => {
  it('uses explicit operational detail projections instead of wildcard rows', () => {
    const source = read('lib/dashboard/loadDashboardRequests.ts')

    expect(source).toContain('DETAIL_FIELDS_BY_TYPE[type]')
    expect(source).not.toContain("select('*')")
  })

  it('explicitly constrains relationship-intelligence sources to the active parish', () => {
    const source = read('lib/relationshipIntelligence/loadDashboardIntelligence.ts')

    expect(source).toContain('activeParishId: string')
    expect(source).toContain('const parishId = activeParishId.trim()')
    expect(sourceBetween(source, ".from('parishioners')", ".from('people')")).toContain(
      ".eq('parish_id', parishId)",
    )
    expect(sourceBetween(source, ".from('people')", "requestIds.length > 0")).toContain(
      ".eq('parish_id', parishId)",
    )
    expect(source.match(/\.eq\('parish_id', parishId\)/g)?.length).toBeGreaterThanOrEqual(5)
    expect(source).toContain(".in('person_id', personIds)")
  })

  it('keeps the browser on aggregate endpoints with no raw relationship reads', () => {
    const source = read('app/dashboard/DashboardPageCore.tsx')
    const loader = read('lib/server/loadDashboardWorkHub.ts')

    expect(source).toContain("fetch('/api/dashboard/work-hub'")
    expect(source).not.toContain("fetch('/api/dashboard/daily-operating-signals'")
    expect(source).toContain('Array.isArray(payload.signals)')
    expect(loader).toContain('loadDailyOperatingSystemSignals')
    expect(loader).toContain('Promise.all([')
    expect(source).not.toContain('loadDashboardSuggestedActions')
    expect(source).not.toContain('fetchDashboardRequestParishionerScope')
    expect(source).not.toContain("from('@/lib/supabase')")
  })
})
