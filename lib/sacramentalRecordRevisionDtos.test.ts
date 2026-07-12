import { describe, expect, it } from 'vitest'
import { buildSacramentalRecordRevisionDto } from '@/lib/sacramentalRecordRevisionDtos'
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

describe('buildSacramentalRecordRevisionDto', () => {
  it('builds correction metadata without mutating a sacramental record', () => {
    const result = buildSacramentalRecordRevisionDto({
      record: baseRecord,
      kind: 'correction',
      status: 'ready_for_authorized_review',
      affectedFields: ['minister', 'place'],
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      requestLabel: 'Safe baptism request fixture',
      reasonLabel: 'Register review',
      proposedChangeSummary: 'Staff noticed a minister spelling issue.',
      now: new Date('2026-07-02T15:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.revision).toMatchObject({
      featureId: 'sacramental_record_revision_v1',
      eventAction: 'sacramental_record_correction_reviewed',
      revisionKind: 'correction',
      status: 'ready_for_authorized_review',
      affectedFields: ['minister', 'place'],
      staffReviewRequired: true,
      authorizedRecordReviewRequired: true,
      canonicalDecisionMade: false,
      pastoralDecisionMade: false,
      sacramentalEligibilityDecided: false,
      mutatesSacramentalRecord: false,
      generatesCertificateAutomatically: false,
      runtimePersistenceApproved: false,
    })
    expect(result.revision.auditMetadata).toMatchObject({
      feature_id: 'sacramental_record_revision_v1',
      event_action: 'sacramental_record_correction_reviewed',
      revision_kind: 'correction',
      affected_fields: ['minister', 'place'],
      linked_request: true,
      mutates_sacramental_record: false,
      runtime_persistence_approved: false,
      separate_correction_notation_approval_required: true,
    })
  })

  it('builds notation metadata without adding a canonical notation', () => {
    const result = buildSacramentalRecordRevisionDto({
      record: { ...baseRecord, record_type: 'marriage' },
      kind: 'notation',
      status: 'draft_for_staff_review',
      affectedFields: ['external_register_reference', 'notes'],
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      canonicalReviewerLabel: 'Pastor review pending',
      now: new Date('2026-07-02T15:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.revision).toMatchObject({
      eventAction: 'sacramental_record_notation_reviewed',
      revisionKind: 'notation',
      recordTypeLabel: 'Marriage',
      canonicalDecisionMade: false,
      pastoralDecisionMade: false,
      mutatesSacramentalRecord: false,
    })
    expect(result.revision.approvalBoundary).toEqual({
      allowsPlanningMetadata: true,
      allowsRuntimeWrite: false,
      allowsRegisterCorrection: false,
      allowsCanonicalNotation: false,
      requiresSeparateApproval: true,
      message:
        'Notation DTOs describe staff-reviewed notation metadata only; they do not add canonical notations.',
    })
  })

  it('marks missing request continuity for authorized staff review', () => {
    const result = buildSacramentalRecordRevisionDto({
      record: { ...baseRecord, request_id: null },
      kind: 'correction',
      status: 'draft_for_staff_review',
      affectedFields: ['request_link'],
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T15:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.revision.requestContinuity).toMatchObject({
      linkedToRequest: false,
      requestId: null,
      requestLabel: null,
      continuityLabel:
        'No originating request link is present; authorized staff should verify continuity manually.',
    })
  })

  it('requires at least one safe affected field', () => {
    const result = buildSacramentalRecordRevisionDto({
      record: baseRecord,
      kind: 'correction',
      status: 'draft_for_staff_review',
      affectedFields: [],
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T15:00:00.000Z'),
    })

    expect(result).toMatchObject({ ok: false })
  })

  it('blocks obvious secret material from revision metadata', () => {
    const result = buildSacramentalRecordRevisionDto({
      record: baseRecord,
      kind: 'notation',
      status: 'draft_for_staff_review',
      affectedFields: ['notes'],
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      proposedChangeSummary: 'unsafe SUPABASE_SERVICE_ROLE_KEY=value',
      now: new Date('2026-07-02T15:00:00.000Z'),
    })

    expect(result).toMatchObject({ ok: false })
  })
})
