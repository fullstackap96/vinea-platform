import { describe, expect, it } from 'vitest'
import { buildRequestRecordContinuityEmptyStateCue } from '@/lib/requestRecordContinuityEmptyState'

describe('buildRequestRecordContinuityEmptyStateCue', () => {
  it('returns a staff-reviewed empty-state cue when no request-link review is needed', () => {
    const cue = buildRequestRecordContinuityEmptyStateCue(0)

    expect(cue).toMatchObject({
      statusLabel: 'Continuity clear',
      title: 'No records currently need request-link review',
    })
    expect(cue?.detail).toContain('selected parish')
    expect(cue?.detail).toContain('need request-to-record continuity review')
    expect(cue?.boundary).toContain('staff-reviewed')
    expect(cue?.boundary).toContain('does not link records')
    expect(cue?.boundary).toContain('generate certificates')
    expect(cue?.boundary).toContain('sacramental or canonical decisions')
  })

  it('stays hidden when continuity bottlenecks exist', () => {
    expect(buildRequestRecordContinuityEmptyStateCue(1)).toBeNull()
  })
})
