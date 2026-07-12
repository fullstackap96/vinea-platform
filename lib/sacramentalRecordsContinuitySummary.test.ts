import { describe, expect, it } from 'vitest'
import {
  buildSacramentalRecordsContinuitySummary,
  filterSacramentalRecordsByContinuity,
  normalizeSacramentalRecordsContinuityFilter,
} from './sacramentalRecordsContinuitySummary'
import type { SacramentalRecordRow } from './types/sacramentalRecords'

function record(input: {
  id: string
  request_id: string | null
  person_name?: string
}): SacramentalRecordRow {
  return {
    id: input.id,
    parish_id: 'parish-1',
    request_id: input.request_id,
    person_id: null,
    record_type: 'baptism',
    person_name: input.person_name ?? input.id,
    sacrament_date: null,
    place: null,
    minister: null,
    book: null,
    page: null,
    line: null,
    notes: null,
    created_by: null,
    updated_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

const records = [
  record({ id: 'record-linked', request_id: 'request-1' }),
  record({ id: 'record-needs-review', request_id: null }),
  record({ id: 'record-certificate-no-link', request_id: '' }),
]

describe('sacramental records continuity summary', () => {
  it('counts request links, missing links, and certificate activity without changing records', () => {
    const summary = buildSacramentalRecordsContinuitySummary({
      records,
      certificateRecordIds: ['record-linked', 'record-certificate-no-link'],
    })

    expect(summary.totalRecords).toBe(3)
    expect(summary.linkedRequestCount).toBe(1)
    expect(summary.needsReviewCount).toBe(2)
    expect(summary.certificateActivityCount).toBe(2)
    expect(summary.certificateActivityWithoutRequestLinkCount).toBe(1)
    expect(summary.boundaryNote).toContain('does not decide eligibility')
    expect(summary.boundaryNote).toContain('whether a certificate should be issued')
  })

  it('filters records by continuity state', () => {
    expect(filterSacramentalRecordsByContinuity(records, 'needs_review').map((r) => r.id)).toEqual(
      ['record-needs-review', 'record-certificate-no-link']
    )
    expect(filterSacramentalRecordsByContinuity(records, 'linked_request').map((r) => r.id)).toEqual(
      ['record-linked']
    )
    expect(
      filterSacramentalRecordsByContinuity(records, 'certificate_activity', [
        'record-certificate-no-link',
      ]).map((r) => r.id)
    ).toEqual(['record-certificate-no-link'])
  })

  it('normalizes unsupported continuity filters to the unfiltered state', () => {
    expect(normalizeSacramentalRecordsContinuityFilter('needs_review')).toBe('needs_review')
    expect(normalizeSacramentalRecordsContinuityFilter(['linked_request'])).toBe('linked_request')
    expect(normalizeSacramentalRecordsContinuityFilter('generate_certificate')).toBe('')
    expect(normalizeSacramentalRecordsContinuityFilter(undefined)).toBe('')
  })
})
