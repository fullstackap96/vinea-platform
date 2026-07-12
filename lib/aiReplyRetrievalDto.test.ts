import { describe, expect, it } from 'vitest'
import { buildAiAuditMetadataDto } from './aiAuditMetadataDto'
import { buildAiReplyRetrievalDto, type AiReplyRetrievalInput } from './aiReplyRetrievalDto'
import { buildAiSourceDisplayDto } from './aiSourceDisplayDto'
import { buildAiStaffReviewStatusDto } from './aiStaffReviewStatusDto'

function baseInput(overrides: Partial<AiReplyRetrievalInput> = {}): AiReplyRetrievalInput {
  return {
    staff: {
      userId: 'staff-123',
      email: 'Secretary@Parish.Example',
    },
    scope: {
      activeParishId: 'parish-a',
      requestParishId: 'parish-a',
      authorizedParishIds: ['parish-a', 'parish-b'],
    },
    request: {
      id: 'request-123',
      requestType: 'baptism',
      safeTitle: 'Baptism request for the Rivera family',
      createdAt: '2026-07-07T12:00:00.000Z',
    },
    draft: {
      id: 'draft-request-123-follow-up',
      intent: 'follow_up',
      recipientKind: 'family',
      safeLabel: 'Follow-up email draft for baptism paperwork',
    },
    sources: [
      {
        id: 'request-123',
        type: 'request',
        dataClass: 'request_core',
        label: 'Baptism request core fields',
        timestamp: '2026-07-07T12:00:00.000Z',
        sourcePath: '/dashboard/requests/request-123',
      },
      {
        id: 'workflow-step-1',
        type: 'workflow_step',
        dataClass: 'request_workflow_steps',
        label: 'Paperwork checklist step',
        timestamp: '2026-07-07T13:00:00.000Z',
        sourcePath: '/dashboard/requests/request-123#workflow',
      },
      {
        id: 'communication-1',
        type: 'communication',
        dataClass: 'communication_history',
        label: 'Last staff follow-up summary',
        timestamp: '2026-07-07T14:00:00.000Z',
        sourcePath: '/dashboard/requests/request-123#communications',
      },
    ],
    ...overrides,
  }
}

describe('AI reply permission-scoped retrieval DTO', () => {
  it('builds a staff-reviewed email draft retrieval DTO with active parish and request scope', () => {
    const result = buildAiReplyRetrievalDto(baseInput())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.featureId).toBe('email_draft')
    expect(result.dto.runtimeState).toBe('non_runtime_reply_retrieval_only')
    expect(result.dto.target).toMatchObject({
      objectType: 'communication_draft',
      objectId: 'draft-request-123-follow-up',
      requestId: 'request-123',
      draftIntent: 'follow_up',
      recipientKind: 'family',
    })
    expect(result.dto.retrievalScope).toMatchObject({
      activeParishId: 'parish-a',
      requestParishId: 'parish-a',
      staffEmail: 'secretary@parish.example',
      membershipAuthorized: true,
      objectParishMatchesActiveParish: true,
    })
    expect(result.dto.familyFacingOutputAllowed).toBe(false)
    expect(result.dto.humanApprovalRequired).toBe(true)
    expect(result.dto.outboundCommunicationPolicy).toEqual({
      staffReviewRequired: true,
      autonomousSendAllowed: false,
      generatedDraftTransientUntilStaffAction: true,
    })
    expect(result.dto.auditMetadataTemplate).toMatchObject({
      target_object_type: 'communication_draft',
      ai_feature_id: 'email_draft',
      output_destination: 'draft_only',
      staff_disposition: 'pending_review',
      model_or_provider_family: 'not_invoked',
    })
  })

  it('blocks cross-parish and unauthorized reply scope before any future retrieval can run', () => {
    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          scope: {
            activeParishId: 'parish-a',
            requestParishId: 'parish-b',
            authorizedParishIds: ['parish-a', 'parish-b'],
          },
        })
      )
    ).toEqual({ ok: false, blockedReason: 'active_parish_does_not_match_reply_request_parish' })

    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          scope: {
            activeParishId: 'parish-a',
            requestParishId: 'parish-a',
            authorizedParishIds: ['parish-b'],
          },
        })
      )
    ).toEqual({ ok: false, blockedReason: 'staff_not_authorized_for_reply_active_parish' })
  })

  it('blocks token-like, signed-url, and raw prompt references from reply retrieval', () => {
    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          draft: {
            id: 'draft-secret-token',
            intent: 'follow_up',
            recipientKind: 'family',
            safeLabel: 'Follow-up email draft',
          },
        })
      )
    ).toEqual({ ok: false, blockedReason: 'unsafe_reply_target_reference' })

    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          sources: [
            {
              id: 'request-123',
              type: 'request',
              dataClass: 'request_core',
              label: 'Raw prompt for reply',
              sourcePath: '/dashboard/requests/request-123',
            },
          ],
        })
      )
    ).toEqual({ ok: false, blockedReason: 'unsafe_reply_source_reference' })

    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          sources: [
            {
              id: 'document-1',
              type: 'document_metadata',
              dataClass: 'request_document_metadata',
              label: 'Document metadata',
              sourcePath: '/signed-url/document-1',
            },
          ],
        })
      )
    ).toEqual({ ok: false, blockedReason: 'unsafe_reply_source_reference' })
  })

  it('blocks data classes that are not approved for email draft replies', () => {
    expect(
      buildAiReplyRetrievalDto(
        baseInput({
          sources: [
            {
              id: 'record-1',
              type: 'request',
              dataClass: 'sacramental_record_metadata',
              label: 'Sacramental record metadata',
              sourcePath: '/dashboard/records/record-1',
            },
          ],
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'data_class_not_allowed_for_ai_reply:sacramental_record_metadata',
    })
  })

  it('chains into source display, audit metadata, and staff review DTOs without raw prompt or output material', () => {
    const retrieval = buildAiReplyRetrievalDto(baseInput())
    expect(retrieval.ok).toBe(true)
    if (!retrieval.ok) return

    const sourceDisplay = buildAiSourceDisplayDto({
      featureId: 'email_draft',
      target: {
        objectType: 'communication_draft',
        objectId: retrieval.dto.target.objectId,
        safeLabel: retrieval.dto.target.safeLabel,
      },
      activeParishId: retrieval.dto.retrievalScope.activeParishId,
      sources: retrieval.dto.sourceReferences.map((source) => ({
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
    expect(sourceDisplay.ok).toBe(true)
    if (!sourceDisplay.ok) return

    const audit = buildAiAuditMetadataDto({
      featureId: 'email_draft',
      staff: {
        userId: retrieval.dto.retrievalScope.staffUserId,
        email: retrieval.dto.retrievalScope.staffEmail,
      },
      parish: {
        parishId: retrieval.dto.retrievalScope.requestParishId,
        activeParishId: retrieval.dto.retrievalScope.activeParishId,
      },
      target: {
        objectType: 'communication_draft',
        objectId: retrieval.dto.target.objectId,
      },
      inputDataClasses: retrieval.dto.auditMetadataTemplate.input_data_classes,
      safeSourceReferences: retrieval.dto.auditMetadataTemplate.safe_source_references,
      outputDestination: retrieval.dto.auditMetadataTemplate.output_destination,
      staffDisposition: retrieval.dto.auditMetadataTemplate.staff_disposition,
      modelOrProviderFamily: retrieval.dto.auditMetadataTemplate.model_or_provider_family,
      blockedReason: retrieval.dto.auditMetadataTemplate.blocked_reason,
      sourceDisplayDto: sourceDisplay.dto,
    })
    expect(audit.ok).toBe(true)
    if (!audit.ok) return

    const review = buildAiStaffReviewStatusDto({
      auditMetadataDto: audit.dto,
      sourceDisplayDto: sourceDisplay.dto,
      status: 'review_required',
    })
    expect(review.ok).toBe(true)
    if (!review.ok) return

    expect(review.dto.featureId).toBe('email_draft')
    expect(review.dto.reviewStatus).toBe('review_required')
    expect(review.dto.familyFacingBoundary.familyFacingExcluded).toBe(true)
    expect(review.dto.privateMaterialPolicy.internalPayloadExcluded).toBe(true)

    const serialized = JSON.stringify({
      retrievalSources: retrieval.dto.sourceReferences,
      sourceCards: sourceDisplay.dto.sourceCards,
      auditReferences: audit.dto.safe_source_references,
      reviewTarget: review.dto.target,
    }).toLowerCase()
    expect(serialized).not.toContain('raw prompt')
    expect(serialized).not.toContain('raw output')
    expect(serialized).not.toContain('provider payload')
    expect(serialized).not.toContain('signed url')
    expect(serialized).not.toContain('token')
  })
})
