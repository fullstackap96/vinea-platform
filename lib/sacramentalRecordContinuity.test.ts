import { describe, expect, it } from 'vitest'
import { buildSacramentalRecordContinuityView } from './sacramentalRecordContinuity'

describe('buildSacramentalRecordContinuityView', () => {
  it('shows linked request context without claiming eligibility or canonical approval', () => {
    const result = buildSacramentalRecordContinuityView({
      record: { request_id: 'request-1', record_type: 'baptism' },
      events: [],
    })

    expect(result.state).toBe('linked_request_verified')
    expect(result.linkedRequestHref).toBe('/dashboard/requests/request-1')
    expect(result.title).toBe('Linked request present')
    expect(result.certificateState).toBe('baptism_certificate_available_for_review')
    expect(result.certificateTitle).toBe('Baptism certificate can be prepared for staff review')
    expect(result.boundaryNote).toContain('does not decide eligibility')
    expect(result.boundaryNote).toContain('canonical status')
    expect(result.boundaryNote).toContain('pastoral readiness')
  })

  it('requires manual continuity review when no request link exists', () => {
    const result = buildSacramentalRecordContinuityView({
      record: { request_id: null, record_type: 'confirmation' },
      events: [],
    })

    expect(result.state).toBe('record_without_request_manual_review')
    expect(result.linkedRequestHref).toBeNull()
    expect(result.title).toBe('No request link found')
    expect(result.summary).toContain('verify continuity manually')
    expect(result.certificateState).toBe('future_certificate_type_planned')
    expect(result.certificateTitle).toBe('Confirmation certificate planning only')
    expect(result.certificateSummary).toContain('planned but not live')
  })

  it('recognizes certificate activity without generating or mutating anything', () => {
    const result = buildSacramentalRecordContinuityView({
      record: { request_id: 'request-2', record_type: 'marriage' },
      events: [{ action: 'certificate_generated' }],
    })

    expect(result.certificateState).toBe('certificate_activity_recorded')
    expect(result.certificateTitle).toBe('Certificate activity recorded')
    expect(result.certificateSummary).toContain('generation event exists')
    expect(result.certificateSummary).toContain('review the activity history')
  })

  it('encodes linked request ids before exposing a dashboard handoff link', () => {
    const result = buildSacramentalRecordContinuityView({
      record: { request_id: '../unsafe?next=https://example.test', record_type: 'baptism' },
      events: [],
    })

    expect(result.linkedRequestHref).toBe(
      '/dashboard/requests/..%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(result.linkedRequestHref).not.toContain('://example.test')
  })
})
