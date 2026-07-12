import { describe, expect, it } from 'vitest'
import { buildSacramentalRecordContinuityHandoff } from './sacramentalRecordContinuityHandoff'

describe('buildSacramentalRecordContinuityHandoff', () => {
  it('builds search and review queue links for records without a request link', () => {
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: null,
      person_name: '  Maria   Garcia  ',
    })

    expect(handoff).not.toBeNull()
    expect(handoff?.personName).toBe('Maria Garcia')
    expect(handoff?.searchHref).toBe('/dashboard/search?q=Maria+Garcia')
    expect(handoff?.reviewQueueHref).toBe(
      '/dashboard/records?continuity=needs_review&q=Maria+Garcia'
    )
    expect(handoff?.summary).toContain('existing parish request and person records')
  })

  it('does not create a handoff for records already linked to a request', () => {
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: 'request-1',
      person_name: 'Maria Garcia',
    })

    expect(handoff).toBeNull()
  })

  it('keeps the boundary read-only and avoids certificate or eligibility claims', () => {
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: null,
      person_name: 'Joseph Lee',
    })

    expect(handoff?.boundaryNote).toContain('read-only')
    expect(handoff?.boundaryNote).toContain('does not link requests')
    expect(handoff?.boundaryNote).toContain('change records')
    expect(handoff?.boundaryNote).toContain('generate certificates')
    expect(handoff?.boundaryNote).toContain('decide whether anything should be issued')
  })

  it('does not create an empty search when the record name is missing', () => {
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: null,
      person_name: '   ',
    })

    expect(handoff).toBeNull()
  })

  it('keeps generated handoff links inside dashboard routes even with unusual names', () => {
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: null,
      person_name: 'Maria https://example.test <script>',
    })

    expect(handoff?.searchHref).toBe(
      '/dashboard/search?q=Maria+https%3A%2F%2Fexample.test+%3Cscript%3E'
    )
    expect(handoff?.reviewQueueHref).toBe(
      '/dashboard/records?continuity=needs_review&q=Maria+https%3A%2F%2Fexample.test+%3Cscript%3E'
    )
    expect(handoff?.searchHref).not.toContain('://example.test')
    expect(handoff?.reviewQueueHref).not.toContain('://example.test')
  })
})
