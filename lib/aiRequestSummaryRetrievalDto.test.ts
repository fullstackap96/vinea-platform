import { describe, expect, it } from 'vitest'
import {
  AI_AUDIT_METADATA_REQUIREMENTS,
  AI_FEATURE_REGISTRY,
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
} from './aiSafetyRegistry'
import {
  REQUEST_SUMMARY_RETRIEVAL_DTO_VERSION,
  buildRequestSummaryRetrievalDto,
  type RequestSummaryRetrievalInput,
} from './aiRequestSummaryRetrievalDto'

const baseInput = {
  staff: {
    userId: 'staff-user-1',
    email: 'Secretary@StMary.test',
  },
  scope: {
    activeParishId: 'parish-1',
    requestParishId: 'parish-1',
    authorizedParishIds: ['parish-1'],
  },
  request: {
    id: 'request-1',
    requestType: 'baptism',
    safeTitle: 'Baptism request for the Garcia family',
    createdAt: '2026-06-27T12:00:00.000Z',
  },
  sources: [
    {
      id: 'request-1',
      type: 'request',
      dataClass: 'request_core',
      label: 'Request overview',
      timestamp: '2026-06-27T12:00:00.000Z',
      familyFacingSafe: true,
      staffOnly: false,
      sourcePath: '/dashboard/requests/request-1',
    },
    {
      id: 'workflow-step-1',
      type: 'workflow_step',
      dataClass: 'request_workflow_steps',
      label: 'Required baptism prep meeting',
      timestamp: '2026-06-27T13:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sourcePath: '/dashboard/requests/request-1#workflow',
    },
    {
      id: 'note-1',
      type: 'staff_note',
      dataClass: 'request_notes_staff_only',
      label: 'Internal staff note reference',
      timestamp: '2026-06-27T14:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sourcePath: '/dashboard/requests/request-1#notes',
    },
    {
      id: 'record-1',
      type: 'sacramental_record',
      dataClass: 'sacramental_record_metadata',
      label: 'Related baptism record metadata',
      timestamp: '2026-06-27T15:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sacramentalCanonicalRestricted: true,
      sourcePath: '/dashboard/records/record-1',
    },
  ],
} satisfies RequestSummaryRetrievalInput

describe('request summary permission-scoped retrieval DTO', () => {
  it('builds a non-runtime request-summary DTO from the AI safety registry', () => {
    const result = buildRequestSummaryRetrievalDto(baseInput)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.dtoVersion).toBe(REQUEST_SUMMARY_RETRIEVAL_DTO_VERSION)
    expect(result.dto.featureId).toBe('request_summary')
    expect(result.dto.runtimeState).toBe('non_runtime_dto_only')
    expect(result.dto.allowedDataClasses).toEqual(AI_FEATURE_REGISTRY.request_summary.allowedDataClasses)
    expect(result.dto.familyFacingOutputAllowed).toBe(false)
    expect(result.dto.humanApprovalRequired).toBe(true)
    expect(result.dto.retentionRule).toContain('saved summaries follow staff-only request note')
  })

  it('preserves active parish scope, membership authorization, and object-level request scope', () => {
    const result = buildRequestSummaryRetrievalDto(baseInput)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.retrievalScope).toEqual({
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      staffEmail: 'secretary@stmary.test',
      staffUserId: 'staff-user-1',
      membershipAuthorized: true,
      objectParishMatchesActiveParish: true,
    })
    expect(result.dto.target).toMatchObject({
      objectType: 'request',
      objectId: 'request-1',
      safeLabel: 'Baptism request for the Garcia family',
    })
  })

  it('includes source display labels without exposing family-facing exclusions', () => {
    const result = buildRequestSummaryRetrievalDto(baseInput)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.sourceDisplayRequirements).toEqual(AI_SOURCE_DISPLAY_REQUIREMENTS)
    expect(result.dto.blockedFamilyFacingData).toEqual(FAMILY_FACING_AI_EXCLUSIONS)
    expect(result.dto.sourceReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'request',
          safeLabel: 'Request overview',
          parishScope: 'parish-1',
          staffOnly: false,
          familyFacingSafe: true,
          permissionCheckedSourcePath: '/dashboard/requests/request-1',
        }),
        expect.objectContaining({
          type: 'staff_note',
          safeLabel: 'Internal staff note reference',
          staffOnly: true,
          familyFacingSafe: false,
        }),
      ])
    )
    expect(JSON.stringify(result.dto.sourceReferences)).not.toMatch(
      /plaintext family portal tokens|portal token hashes/i
    )
    expect(JSON.stringify(result.dto.auditMetadataTemplate)).not.toMatch(
      /plaintext family portal tokens|portal token hashes/i
    )
  })

  it('carries sacramental/canonical restrictions and restricted source metadata', () => {
    const result = buildRequestSummaryRetrievalDto(baseInput)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.sacramentalCanonicalRestrictions).toEqual(SACRAMENTAL_CANONICAL_AI_RESTRICTIONS)
    expect(result.dto.sacramentalCanonicalRestrictions).toEqual(
      expect.arrayContaining([
        'determine sacramental eligibility',
        'decide certificate issuance',
        'correct sacramental registers',
        'add canonical notations',
      ])
    )
    expect(result.dto.sourceReferences).toContainEqual(
      expect.objectContaining({
        type: 'sacramental_record',
        dataClass: 'sacramental_record_metadata',
        sacramentalCanonicalRestricted: true,
      })
    )
  })

  it('prepares audit metadata without invoking a model or storing raw prompt/output payloads', () => {
    const result = buildRequestSummaryRetrievalDto(baseInput)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.auditMetadataRequirements).toEqual(AI_AUDIT_METADATA_REQUIREMENTS)
    expect(result.dto.auditMetadataTemplate).toEqual({
      staff_user_id_or_email: 'staff-user-1',
      parish_id: 'parish-1',
      active_parish_context: 'parish-1',
      target_object_type: 'request',
      target_object_id: 'request-1',
      ai_feature_id: 'request_summary',
      input_data_classes: [
        'request_core',
        'request_workflow_steps',
        'request_notes_staff_only',
        'sacramental_record_metadata',
      ],
      safe_source_references: [
        'request:request-1',
        'workflow_step:workflow-step-1',
        'staff_note:note-1',
        'sacramental_record:record-1',
      ],
      output_destination: 'internal_summary',
      staff_disposition: 'pending_review',
      model_or_provider_family: 'not_invoked',
      blocked_reason: null,
    })
  })

  it('fails closed for cross-parish, unauthorized, empty, unsafe, or disallowed retrieval shapes', () => {
    expect(
      buildRequestSummaryRetrievalDto({
        ...baseInput,
        scope: { ...baseInput.scope, requestParishId: 'parish-2' },
      })
    ).toEqual({ ok: false, blockedReason: 'active_parish_does_not_match_request_parish' })

    expect(
      buildRequestSummaryRetrievalDto({
        ...baseInput,
        scope: { ...baseInput.scope, authorizedParishIds: ['parish-2'] },
      })
    ).toEqual({ ok: false, blockedReason: 'staff_not_authorized_for_active_parish' })

    expect(buildRequestSummaryRetrievalDto({ ...baseInput, sources: [] })).toEqual({
      ok: false,
      blockedReason: 'no_safe_sources',
    })

    expect(
      buildRequestSummaryRetrievalDto({
        ...baseInput,
        sources: [
          {
            id: 'bad-source',
            type: 'request',
            dataClass: 'request_core',
            label: 'Plaintext portal token should never be a source label',
          },
        ],
      })
    ).toEqual({ ok: false, blockedReason: 'unsafe_source_reference' })

    expect(
      buildRequestSummaryRetrievalDto({
        ...baseInput,
        sources: [
          {
            id: 'document-contents-1',
            type: 'request',
            dataClass: 'request_document_contents',
            label: 'Uploaded birth certificate content',
          },
        ],
      })
    ).toEqual({
      ok: false,
      blockedReason: 'data_class_not_allowed_for_request_summary:request_document_contents',
    })
  })
})
