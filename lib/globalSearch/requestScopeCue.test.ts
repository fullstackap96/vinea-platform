import { describe, expect, it } from 'vitest'
import { buildGlobalSearchRequestScopeCue } from './requestScopeCue'

describe('buildGlobalSearchRequestScopeCue', () => {
  it('explains that request search follows the selected parish and linked parishioners', () => {
    const cue = buildGlobalSearchRequestScopeCue({
      activeParishName: 'St. Anne Parish',
      hasSearched: true,
      requestResultCount: 2,
    })

    expect(cue.title).toBe('Request search follows St. Anne Parish')
    expect(cue.description).toContain('linked parishioners in St. Anne Parish')
    expect(cue.description).toContain('Switch parishes')
    expect(cue.requestEmptyHint).toContain('Search by family name')
  })

  it('uses an empty-result hint when request results are missing for a searched query', () => {
    const cue = buildGlobalSearchRequestScopeCue({
      activeParishName: 'St. Anne Parish',
      hasSearched: true,
      requestResultCount: 0,
    })

    expect(cue.requestEmptyHint).toContain('If you expected to see a request')
    expect(cue.requestEmptyHint).toContain('linked to a parishioner in St. Anne Parish')
  })

  it('falls back to selected parish language and keeps the boundary read-only', () => {
    const cue = buildGlobalSearchRequestScopeCue({
      activeParishName: '',
      hasSearched: false,
      requestResultCount: 0,
    })

    expect(cue.title).toBe('Request search follows the selected parish')
    expect(cue.description).toContain('linked parishioners in the selected parish')
    expect(cue.boundaryNote).toContain('read-only')
    expect(cue.boundaryNote).toContain('does not link records')
    expect(cue.boundaryNote).toContain('change requests')
    expect(cue.boundaryNote).toContain('merge people')
    expect(cue.boundaryNote).toContain('override parish permissions')
    expect(cue.boundaryNote).toContain('make sacramental decisions')
  })
})
