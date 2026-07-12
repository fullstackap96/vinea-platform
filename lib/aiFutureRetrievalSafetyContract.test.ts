import { describe, expect, it } from 'vitest'
import { buildAiAuditMetadataDto, buildRequestSummaryAuditMetadataDto } from './aiAuditMetadataDto'
import {
  buildAiFutureRetrievalSafetyContract,
  AI_FUTURE_RETRIEVAL_SAFETY_CONTRACT_VERSION,
} from './aiFutureRetrievalSafetyContract'
import { buildAiReplyRetrievalDto, type AiReplyRetrievalInput } from './aiReplyRetrievalDto'
import { buildRequestSummaryRetrievalDto, type RequestSummaryRetrievalInput } from './aiRequestSummaryRetrievalDto'
import { buildAiSourceDisplayDto, buildRequestSummarySourceDisplayDto } from './aiSourceDisplayDto'
import { buildAiStaffReviewStatusDto } from './aiStaffReviewStatusDto'

const baseRequestSummaryInput = {
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

function buildSafeStaffChain(input: RequestSummaryRetrievalInput = baseRequestSummaryInput) {
  const retrievalResult = buildRequestSummaryRetrievalDto(input)
  expect(retrievalResult.ok).toBe(true)
  if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

  const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
  expect(sourceDisplayResult.ok).toBe(true)
  if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

  const auditResult = buildRequestSummaryAuditMetadataDto(retrievalResult.dto, sourceDisplayResult.dto)
  expect(auditResult.ok).toBe(true)
  if (!auditResult.ok) throw new Error(auditResult.blockedReason)

  const reviewStatusResult = buildAiStaffReviewStatusDto({
    status: 'review_required',
    auditMetadataDto: auditResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  expect(reviewStatusResult.ok).toBe(true)
  if (!reviewStatusResult.ok) throw new Error(reviewStatusResult.blockedReason)

  return {
    retrievalResult,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditResult.dto,
    staffReviewStatusDto: reviewStatusResult.dto,
  }
}

const baseReplyInput = {
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
  },
  draft: {
    id: 'draft-request-1-follow-up',
    intent: 'follow_up',
    recipientKind: 'family',
    safeLabel: 'Follow-up email draft',
  },
  sources: [
    {
      id: 'request-1',
      type: 'request',
      dataClass: 'request_core',
      label: 'Request overview',
      timestamp: '2026-06-27T12:00:00.000Z',
      sourcePath: '/dashboard/requests/request-1',
    },
    {
      id: 'communication-1',
      type: 'communication',
      dataClass: 'communication_history',
      label: 'Prior staff follow-up summary',
      timestamp: '2026-06-27T13:00:00.000Z',
      sourcePath: '/dashboard/requests/request-1#communications',
    },
  ],
} satisfies AiReplyRetrievalInput

function buildSafeReplyChain(input: AiReplyRetrievalInput = baseReplyInput) {
  const retrievalResult = buildAiReplyRetrievalDto(input)
  expect(retrievalResult.ok).toBe(true)
  if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

  const sourceDisplayResult = buildAiSourceDisplayDto({
    featureId: 'email_draft',
    target: {
      objectType: 'communication_draft',
      objectId: retrievalResult.dto.target.objectId,
      safeLabel: retrievalResult.dto.target.safeLabel,
    },
    activeParishId: retrievalResult.dto.retrievalScope.activeParishId,
    sources: retrievalResult.dto.sourceReferences.map((source) => ({
      id: source.id,
      type: source.type,
      dataClass: source.dataClass,
      label: source.safeLabel,
      timestamp: source.timestamp,
      parishScope: source.parishScope,
      staffOnly: source.staffOnly,
      familyFacingSafe: source.familyFacingSafe,
      sacramentalCanonicalRestricted: source.sacramentalCanonicalRestricted,
      permissionCheckedSourcePath: source.permissionCheckedSourcePath,
    })),
  })
  expect(sourceDisplayResult.ok).toBe(true)
  if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

  const auditResult = buildAiAuditMetadataDto({
    featureId: 'email_draft',
    staff: {
      userId: retrievalResult.dto.retrievalScope.staffUserId,
      email: retrievalResult.dto.retrievalScope.staffEmail,
    },
    parish: {
      parishId: retrievalResult.dto.retrievalScope.requestParishId,
      activeParishId: retrievalResult.dto.retrievalScope.activeParishId,
    },
    target: {
      objectType: 'communication_draft',
      objectId: retrievalResult.dto.target.objectId,
    },
    inputDataClasses: retrievalResult.dto.auditMetadataTemplate.input_data_classes,
    safeSourceReferences: retrievalResult.dto.auditMetadataTemplate.safe_source_references,
    outputDestination: retrievalResult.dto.auditMetadataTemplate.output_destination,
    staffDisposition: retrievalResult.dto.auditMetadataTemplate.staff_disposition,
    modelOrProviderFamily: retrievalResult.dto.auditMetadataTemplate.model_or_provider_family,
    blockedReason: retrievalResult.dto.auditMetadataTemplate.blocked_reason,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  expect(auditResult.ok).toBe(true)
  if (!auditResult.ok) throw new Error(auditResult.blockedReason)

  const reviewStatusResult = buildAiStaffReviewStatusDto({
    status: 'review_required',
    auditMetadataDto: auditResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  expect(reviewStatusResult.ok).toBe(true)
  if (!reviewStatusResult.ok) throw new Error(reviewStatusResult.blockedReason)

  return {
    retrievalResult,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditResult.dto,
    staffReviewStatusDto: reviewStatusResult.dto,
  }
}

describe('future AI retrieval family-portal and cross-parish safety contract', () => {
  it('allows the full DTO chain only for staff-internal future retrieval', () => {
    const chain = buildSafeStaffChain()

    const result = buildAiFutureRetrievalSafetyContract({
      surface: 'staff_internal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      ...chain,
    })

    expect(result.ok).toBe(true)
    expect(result.dto).toMatchObject({
      dtoVersion: AI_FUTURE_RETRIEVAL_SAFETY_CONTRACT_VERSION,
      runtimeState: 'non_runtime_future_retrieval_safety_contract_only',
      surface: 'staff_internal',
      allowedForRetrieval: true,
      allowedForFamilyFacingDisplay: false,
      genericPublicBlockedReason: null,
      internalBlockedReason: null,
      parishScopeAuthorized: true,
      objectParishMatchesActiveParish: true,
      dtoChain: {
        retrievalDtoPresent: true,
        sourceDisplayDtoPresent: true,
        auditMetadataDtoPresent: true,
        staffReviewStatusDtoPresent: true,
        sourceDisplayMatchesRetrieval: true,
        auditMatchesRetrieval: true,
        staffReviewMatchesAudit: true,
      },
    })
  })

  it('allows the AI reply DTO chain only for staff-internal future email draft retrieval', () => {
    const chain = buildSafeReplyChain()

    const result = buildAiFutureRetrievalSafetyContract({
      surface: 'staff_internal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      ...chain,
    })

    expect(result.ok).toBe(true)
    expect(result.dto).toMatchObject({
      surface: 'staff_internal',
      allowedForRetrieval: true,
      allowedForFamilyFacingDisplay: false,
      genericPublicBlockedReason: null,
      internalBlockedReason: null,
      dtoChain: {
        retrievalDtoPresent: true,
        sourceDisplayDtoPresent: true,
        auditMetadataDtoPresent: true,
        staffReviewStatusDtoPresent: true,
        sourceDisplayMatchesRetrieval: true,
        auditMatchesRetrieval: true,
        staffReviewMatchesAudit: true,
      },
    })

    const familyResult = buildAiFutureRetrievalSafetyContract({
      surface: 'family_portal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      ...chain,
    })

    expect(familyResult.ok).toBe(false)
    expect(familyResult.dto).toMatchObject({
      allowedForRetrieval: false,
      allowedForFamilyFacingDisplay: false,
      genericPublicBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'family_facing_ai_retrieval_not_enabled',
    })
  })

  it('blocks family-portal surfaces even when a staff-safe DTO chain exists', () => {
    const chain = buildSafeStaffChain()

    const result = buildAiFutureRetrievalSafetyContract({
      surface: 'family_portal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      ...chain,
    })

    expect(result.ok).toBe(false)
    expect(result.dto).toMatchObject({
      surface: 'family_portal',
      allowedForRetrieval: false,
      allowedForFamilyFacingDisplay: false,
      genericPublicBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'family_facing_ai_retrieval_not_enabled',
      familyFacingBoundary: {
        familyPortalAiUnavailable: true,
        staffOnlySourceCount: 2,
        familyFacingSafeSourceCount: 1,
      },
    })
    expect(result.dto.familyFacingBoundary.excludedData).toEqual(
      expect.arrayContaining([
        'internal staff notes',
        'AI notes',
        'portal token hashes',
        'plaintext family portal tokens',
        'cross-parish context',
      ])
    )
  })

  it('blocks cross-parish and unauthorized scope with generic public reasons', () => {
    const crossParishRetrieval = buildRequestSummaryRetrievalDto({
      ...baseRequestSummaryInput,
      scope: {
        activeParishId: 'parish-1',
        requestParishId: 'parish-2',
        authorizedParishIds: ['parish-1', 'parish-2'],
      },
    })

    const crossParishResult = buildAiFutureRetrievalSafetyContract({
      surface: 'staff_internal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-2',
      authorizedParishIds: ['parish-1', 'parish-2'],
      retrievalResult: crossParishRetrieval,
    })

    expect(crossParishResult.ok).toBe(false)
    expect(crossParishResult.dto).toMatchObject({
      allowedForRetrieval: false,
      genericPublicBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'active_parish_does_not_match_request_parish',
      parishScopeAuthorized: true,
      objectParishMatchesActiveParish: false,
    })

    const unauthorizedRetrieval = buildRequestSummaryRetrievalDto({
      ...baseRequestSummaryInput,
      scope: {
        activeParishId: 'parish-1',
        requestParishId: 'parish-1',
        authorizedParishIds: ['parish-2'],
      },
    })

    const unauthorizedResult = buildAiFutureRetrievalSafetyContract({
      surface: 'staff_internal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-2'],
      retrievalResult: unauthorizedRetrieval,
    })

    expect(unauthorizedResult.ok).toBe(false)
    expect(unauthorizedResult.dto).toMatchObject({
      allowedForRetrieval: false,
      genericPublicBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'staff_not_authorized_for_active_parish',
      parishScopeAuthorized: false,
      objectParishMatchesActiveParish: true,
    })
  })

  it('blocks incomplete or mismatched DTO chains before future retrieval can proceed', () => {
    const chain = buildSafeStaffChain()

    const missingAuditResult = buildAiFutureRetrievalSafetyContract({
      surface: 'staff_internal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      retrievalResult: chain.retrievalResult,
      sourceDisplayDto: chain.sourceDisplayDto,
      staffReviewStatusDto: chain.staffReviewStatusDto,
    })

    expect(missingAuditResult.ok).toBe(false)
    expect(missingAuditResult.dto).toMatchObject({
      genericPublicBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'audit_metadata_does_not_match_retrieval_scope',
      dtoChain: {
        retrievalDtoPresent: true,
        sourceDisplayDtoPresent: true,
        auditMetadataDtoPresent: false,
        staffReviewStatusDtoPresent: true,
        sourceDisplayMatchesRetrieval: true,
        auditMatchesRetrieval: false,
        staffReviewMatchesAudit: false,
      },
    })
  })

  it('excludes raw prompt, output, token, and provider material from blocked contract output', () => {
    const retrievalResult = buildRequestSummaryRetrievalDto({
      ...baseRequestSummaryInput,
      sources: [
        {
          id: 'unsafe-source',
          type: 'request',
          dataClass: 'request_core',
          label: 'RAW_PROMPT_SHOULD_NOT_STORE plaintext portal token',
          sourcePath: '/dashboard/requests/request-1',
        },
      ],
    })

    const result = buildAiFutureRetrievalSafetyContract({
      surface: 'family_portal',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      authorizedParishIds: ['parish-1'],
      retrievalResult,
    })

    expect(result.ok).toBe(false)
    expect(result.dto.genericPublicBlockedReason).toBe('ai_retrieval_unavailable')
    expect(JSON.stringify(result.dto)).not.toMatch(
      /RAW_PROMPT_SHOULD_NOT_STORE|RAW_OUTPUT_SHOULD_NOT_STORE|PLAINTEXT_PORTAL_TOKEN|TOKEN_HASH|provider payload/i
    )
    expect(result.dto.privateMaterialPolicy).toEqual({
      safeReferencesOnly: true,
      internalPayloadExcluded: true,
      publicBlockedReasonsAreGeneric: true,
    })
  })
})
