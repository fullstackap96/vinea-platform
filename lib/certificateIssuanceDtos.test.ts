import { describe, expect, it } from 'vitest'
import { buildCertificateIssuanceDto } from '@/lib/certificateIssuanceDtos'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

const baseRecord: SacramentalRecordRow = {
  id: 'record-safe-label',
  parish_id: 'parish-safe-label',
  request_id: 'request-safe-label',
  person_id: 'person-safe-label',
  record_type: 'baptism',
  person_name: 'Lucia Smith',
  sacrament_date: '2026-06-01',
  place: 'St. Isidore Parish',
  minister: 'Fr. Sample',
  book: 'B-1',
  page: '20',
  line: '4',
  notes: null,
  created_by: 'staff-safe-label',
  updated_by: 'staff-safe-label',
  created_at: '2026-06-01T12:00:00.000Z',
  updated_at: '2026-06-02T12:00:00.000Z',
}

describe('buildCertificateIssuanceDto', () => {
  it('builds staff-reviewed certificate issuance metadata without generating certificates', () => {
    const result = buildCertificateIssuanceDto({
      record: baseRecord,
      status: 'issued_to_requester',
      deliveryMethod: 'printed',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      requestLabel: 'Safe baptism request fixture',
      now: new Date('2026-07-02T14:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.issuance).toMatchObject({
      featureId: 'certificate_issuance_logging_v1',
      eventAction: 'certificate_issuance_reviewed',
      certificateType: 'Baptism certificate',
      status: 'issued_to_requester',
      deliveryMethod: 'printed',
      staffReviewRequired: true,
      canonicalDecisionMade: false,
      sacramentalEligibilityDecided: false,
      certificateGeneratedAutomatically: false,
      mutatesSacramentalRecord: false,
    })
    expect(result.issuance.requestContinuity).toMatchObject({
      linkedToRequest: true,
      requestId: 'request-safe-label',
      requestLabel: 'Safe baptism request fixture',
    })
    expect(result.issuance.auditMetadata).toMatchObject({
      feature_id: 'certificate_issuance_logging_v1',
      event_action: 'certificate_issuance_reviewed',
      record_type: 'baptism',
      certificate_type: 'Baptism certificate',
      linked_request: true,
      staff_review_required: true,
      canonical_decision_made: false,
      sacramental_eligibility_decided: false,
      certificate_generated_automatically: false,
      mutates_sacramental_record: false,
      correction_or_notation_requires_separate_approval: true,
    })
  })

  it('keeps correction and canonical notation outside the issuance DTO', () => {
    const result = buildCertificateIssuanceDto({
      record: baseRecord,
      status: 'generated_for_review',
      deliveryMethod: 'internal_review_only',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T14:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.issuance.correctionOrNotationBoundary).toEqual({
      allowsCorrection: false,
      allowsNotation: false,
      requiresSeparateApproval: true,
      message:
        'Certificate issuance logging does not correct sacramental registers or add canonical notations.',
    })
  })

  it('marks missing request continuity for staff review instead of pretending continuity exists', () => {
    const result = buildCertificateIssuanceDto({
      record: { ...baseRecord, request_id: null },
      status: 'ready_for_staff_review',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T14:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.issuance.requestContinuity).toMatchObject({
      linkedToRequest: false,
      requestId: null,
      requestLabel: null,
      continuityLabel: 'No originating request link is present; staff should verify continuity manually.',
    })
  })

  it('supports broader certificate types as metadata without generating PDFs', () => {
    const result = buildCertificateIssuanceDto({
      record: { ...baseRecord, record_type: 'confirmation' },
      status: 'ready_for_staff_review',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T14:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.issuance.certificateType).toBe('Confirmation certificate')
    expect(result.issuance.certificateGeneratedAutomatically).toBe(false)
  })

  it('blocks obvious secret material from certificate issuance metadata', () => {
    const result = buildCertificateIssuanceDto({
      record: baseRecord,
      status: 'issued_to_requester',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      staffNote: 'unsafe OPENAI_API_KEY=value',
      now: new Date('2026-07-02T14:00:00.000Z'),
    })

    expect(result).toMatchObject({ ok: false })
  })
})
