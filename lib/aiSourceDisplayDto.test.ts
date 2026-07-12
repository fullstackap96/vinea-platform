import { describe, expect, it } from 'vitest'
import {
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
} from './aiSafetyRegistry'
import { buildRequestSummaryRetrievalDto, type RequestSummaryRetrievalInput } from './aiRequestSummaryRetrievalDto'
import {
  AI_SOURCE_DISPLAY_DTO_VERSION,
  buildAiSourceDisplayDto,
  buildRequestSummarySourceDisplayDto,
} from './aiSourceDisplayDto'

const requestSummaryInput = {
  staff: {
    userId: 'staff-user-1',
    email: 'secretary@stmary.test',
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
  },
  sources: [
    {
      id: 'request-1',
      type: 'request',
      dataClass: 'request_core',
      label: 'Request overview',
      timestamp: '2026-06-27T12:00:00.000Z',
      staffOnly: false,
      familyFacingSafe: true,
      sourcePath: '/dashboard/requests/request-1',
    },
    {
      id: 'note-1',
      type: 'staff_note',
      dataClass: 'request_notes_staff_only',
      label: 'Staff note reference',
      timestamp: '2026-06-27T13:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sourcePath: '/dashboard/requests/request-1#notes',
    },
    {
      id: 'record-1',
      type: 'sacramental_record',
      dataClass: 'sacramental_record_metadata',
      label: 'Related sacramental record metadata',
      timestamp: '2026-06-27T14:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sacramentalCanonicalRestricted: true,
      sourcePath: '/dashboard/records/record-1',
    },
  ],
} satisfies RequestSummaryRetrievalInput

describe('AI source display DTO', () => {
  it('builds request-summary source cards from the permission-scoped retrieval DTO', () => {
    const retrievalResult = buildRequestSummaryRetrievalDto(requestSummaryInput)
    expect(retrievalResult.ok).toBe(true)
    if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

    const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
    expect(sourceDisplayResult.ok).toBe(true)
    if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

    expect(sourceDisplayResult.dto).toMatchObject({
      dtoVersion: AI_SOURCE_DISPLAY_DTO_VERSION,
      runtimeState: 'non_runtime_source_display_only',
      featureId: 'request_summary',
      featureLabel: 'Request AI summary',
      activeParishId: 'parish-1',
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
    })
    expect(sourceDisplayResult.dto.sourceDisplayRequirements).toEqual(AI_SOURCE_DISPLAY_REQUIREMENTS)
    expect(sourceDisplayResult.dto.sourceCards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'request-1',
          safeLabel: 'Request overview',
          parishScope: 'parish-1',
          staffOnly: false,
          familyFacingSafe: true,
          permissionCheckedSourcePath: '/dashboard/requests/request-1',
          displayOnly: true,
        }),
      ])
    )
  })

  it('preserves staff-only, family-facing, and sacramental/canonical flags', () => {
    const retrievalResult = buildRequestSummaryRetrievalDto(requestSummaryInput)
    if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

    const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
    if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

    expect(sourceDisplayResult.dto.blockedFamilyFacingData).toEqual(FAMILY_FACING_AI_EXCLUSIONS)
    expect(sourceDisplayResult.dto.sacramentalCanonicalRestrictions).toEqual(
      SACRAMENTAL_CANONICAL_AI_RESTRICTIONS
    )
    expect(sourceDisplayResult.dto.sourceCards).toContainEqual(
      expect.objectContaining({
        id: 'note-1',
        staffOnly: true,
        familyFacingSafe: false,
        sacramentalCanonicalRestricted: false,
      })
    )
    expect(sourceDisplayResult.dto.sourceCards).toContainEqual(
      expect.objectContaining({
        id: 'record-1',
        staffOnly: true,
        familyFacingSafe: false,
        sacramentalCanonicalRestricted: true,
      })
    )
  })

  it('builds email-draft source cards without exposing internal content', () => {
    const result = buildAiSourceDisplayDto({
      featureId: 'email_draft',
      target: {
        objectType: 'communication_draft',
        objectId: 'draft-1',
        safeLabel: 'Follow-up email draft',
      },
      activeParishId: 'parish-1',
      sources: [
        {
          id: 'request-1',
          type: 'request',
          dataClass: 'request_core',
          label: 'Request overview',
          timestamp: '2026-06-27T12:00:00.000Z',
          parishScope: 'parish-1',
          staffOnly: false,
          familyFacingSafe: true,
          permissionCheckedSourcePath: '/dashboard/requests/request-1',
        },
        {
          id: 'communication-1',
          type: 'communication',
          dataClass: 'communication_history',
          label: 'Prior family email reference',
          timestamp: '2026-06-27T13:00:00.000Z',
          parishScope: 'parish-1',
          staffOnly: true,
          familyFacingSafe: false,
          permissionCheckedSourcePath: '/dashboard/communications?request=request-1',
        },
      ],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.blockedReason)

    expect(result.dto.featureId).toBe('email_draft')
    expect(result.dto.featureLabel).toBe('AI email draft')
    expect(result.dto.sourceCards).toHaveLength(2)
    expect(JSON.stringify(result.dto.sourceCards)).not.toMatch(/raw|body|content|plaintext token|token hash/i)
  })

  it('fails closed for unsafe labels, missing permission checks, mismatched parish scope, and disallowed data classes', () => {
    const baseInput = {
      featureId: 'email_draft' as const,
      target: {
        objectType: 'communication_draft' as const,
        objectId: 'draft-1',
        safeLabel: 'Follow-up email draft',
      },
      activeParishId: 'parish-1',
      sources: [
        {
          id: 'request-1',
          type: 'request' as const,
          dataClass: 'request_core' as const,
          label: 'Request overview',
          parishScope: 'parish-1',
          staffOnly: false,
          familyFacingSafe: true,
          permissionCheckedSourcePath: '/dashboard/requests/request-1',
        },
      ],
    }

    expect(
      buildAiSourceDisplayDto({
        ...baseInput,
        sources: [{ ...baseInput.sources[0], label: 'Plaintext token for family portal' }],
      })
    ).toEqual({ ok: false, blockedReason: 'unsafe_source_display_reference' })

    expect(
      buildAiSourceDisplayDto({
        ...baseInput,
        sources: [{ ...baseInput.sources[0], permissionCheckedSourcePath: null }],
      })
    ).toEqual({ ok: false, blockedReason: 'source_display_requires_permission_checked_path' })

    expect(
      buildAiSourceDisplayDto({
        ...baseInput,
        sources: [{ ...baseInput.sources[0], parishScope: 'parish-2' }],
      })
    ).toEqual({ ok: false, blockedReason: 'source_parish_scope_does_not_match_active_parish' })

    expect(
      buildAiSourceDisplayDto({
        ...baseInput,
        sources: [{ ...baseInput.sources[0], dataClass: 'sacramental_record_metadata' }],
      })
    ).toEqual({
      ok: false,
      blockedReason: 'data_class_not_allowed_for_source_display:sacramental_record_metadata',
    })
  })
})
