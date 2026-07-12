import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const surfaces = [
  {
    name: 'Audit Log',
    source: read('app/dashboard/admin/audit-log/AuditLogPage.tsx'),
    filterSetter: 'setFilter(nextFilter)',
    responseMarker: 'const data = await res.json().catch(() => ({}))',
    stateMarkers: ['setEvents(', 'setActiveParishName('],
    sameFilterGuard: 'if (nextFilter === filter) return',
  },
  {
    name: 'Export Audit Reviewer',
    source: read(
      'app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx',
    ),
    filterSetter: 'setSelectedFilter(nextFilter)',
    responseMarker: 'const body = (await response.json().catch(() => ({}))) as ReviewerResponse',
    stateMarkers: ['setData(', 'setLoadedAt('],
    sameFilterGuard: 'if (nextFilter === selectedFilter) return',
  },
] as const

describe('governance filter latest-response boundary', () => {
  for (const surface of surfaces) {
    it(`${surface.name} assigns sequence ownership to each load`, () => {
      expect(surface.source).toContain('const loadSequenceRef = useRef(0)')
      expect(surface.source).toContain('const loadSequence = ++loadSequenceRef.current')
      expect(surface.source).toContain(
        'const isLatestLoad = () => loadSequence === loadSequenceRef.current',
      )
    })

    it(`${surface.name} ignores stale successes, failures, and completion`, () => {
      const responseIndex = surface.source.indexOf(surface.responseMarker)
      const successGuardIndex = surface.source.indexOf('if (!isLatestLoad()) return', responseIndex)
      const catchIndex = surface.source.indexOf('} catch', successGuardIndex)
      const catchGuardIndex = surface.source.indexOf('if (!isLatestLoad()) return', catchIndex)
      const finallyIndex = surface.source.indexOf('} finally {', catchGuardIndex)

      expect(responseIndex).toBeGreaterThanOrEqual(0)
      expect(successGuardIndex).toBeGreaterThan(responseIndex)
      for (const marker of surface.stateMarkers) {
        expect(surface.source.indexOf(marker, responseIndex)).toBeGreaterThan(successGuardIndex)
      }
      expect(catchGuardIndex).toBeGreaterThan(catchIndex)
      expect(finallyIndex).toBeGreaterThan(catchGuardIndex)
      expect(surface.source.slice(finallyIndex)).toContain(
        'if (isLatestLoad()) setLoading(false)',
      )
    })

    it(`${surface.name} invalidates the current load as soon as its filter changes`, () => {
      const selectIndex = surface.source.indexOf('function selectFilter(nextFilter: string)')
      const sameFilterGuardIndex = surface.source.indexOf(surface.sameFilterGuard, selectIndex)
      const invalidateIndex = surface.source.indexOf('loadSequenceRef.current += 1', selectIndex)
      const setFilterIndex = surface.source.indexOf(surface.filterSetter, selectIndex)

      expect(selectIndex).toBeGreaterThanOrEqual(0)
      expect(sameFilterGuardIndex).toBeGreaterThan(selectIndex)
      expect(invalidateIndex).toBeGreaterThan(sameFilterGuardIndex)
      expect(setFilterIndex).toBeGreaterThan(invalidateIndex)
      expect(surface.source).toContain('onClick={() => selectFilter(')
    })
  }

  it('documents the read-only governance boundary', () => {
    const doc = read('docs/GOVERNANCE_FILTER_LATEST_RESPONSE_BOUNDARY_20260711.md')
    for (const phrase of [
      'GOVERNANCE_FILTER_LATEST_RESPONSE_BOUNDARY_IMPLEMENTED_20260711',
      'Audit Log',
      'Export Audit Reviewer',
      'last-request-wins',
      'read-only',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
