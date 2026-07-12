import { describe, expect, it } from 'vitest'

import { buildAiAuditMetadataDto } from './aiAuditMetadataDto'
import { buildAiReplyRetrievalDto, type AiReplyRetrievalDto } from './aiReplyRetrievalDto'
import {
  AI_REPLY_AUDIT_METADATA_PREPARATION_VERSION,
  AI_REPLY_PROMPT_ASSEMBLY_VERSION,
  AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
  AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
  buildAiReplyAuditMetadataPreparation,
  buildAiReplyPromptAssembly,
  buildAiReplyResponseScaffold,
} from './aiReplySafetyChainDtos'
import { buildAiSourceDisplayDto, type AiSourceDisplayDto } from './aiSourceDisplayDto'
import { buildAiStaffReviewStatusDto } from './aiStaffReviewStatusDto'

function buildReplyRetrievalDto(): AiReplyRetrievalDto {
  const result = buildAiReplyRetrievalDto({
    staff: {
      userId: 'staff-1',
      email: 'STAFF@EXAMPLE.TEST',
    },
    scope: {
      activeParishId: 'parish-a',
      requestParishId: 'parish-a',
      authorizedParishIds: ['parish-a'],
    },
    request: {
      id: 'request-1',
      requestType: 'baptism',
      safeTitle: 'Baptism request for Ana Garcia',
      createdAt: '2026-07-07T10:00:00.000Z',
    },
    draft: {
      id: 'draft-1',
      intent: 'follow_up',
      recipientKind: 'family',
      safeLabel: 'Follow-up draft for Ana Garcia family',
    },
    sources: [
      {
        id: 'request-1',
        type: 'request',
        dataClass: 'request_core',
        label: 'Baptism request for Ana Garcia',
        timestamp: '2026-07-07T10:00:00.000Z',
        staffOnly: false,
        familyFacingSafe: true,
        sourcePath: '/dashboard/requests/request-1',
      },
      {
        id: 'request-1:workflow',
        type: 'workflow_step',
        dataClass: 'request_workflow_steps',
        label: 'Baptism preparation checklist step',
        staffOnly: true,
        familyFacingSafe: false,
        sourcePath: '/dashboard/requests/request-1',
      },
      {
        id: 'request-1:documents',
        type: 'document_metadata',
        dataClass: 'request_document_metadata',
        label: 'Birth certificate document received',
        staffOnly: true,
        familyFacingSafe: false,
        sourcePath: '/dashboard/requests/request-1',
      },
    ],
  })

  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.blockedReason)
  return result.dto
}

function buildReplyContracts() {
  const retrievalDto = buildReplyRetrievalDto()
  const sourceDisplayResult = buildAiSourceDisplayDto({
    featureId: 'email_draft',
    target: {
      objectType: 'communication_draft',
      objectId: retrievalDto.target.objectId,
      safeLabel: retrievalDto.target.safeLabel,
    },
    activeParishId: retrievalDto.retrievalScope.activeParishId,
    sources: retrievalDto.sourceReferences.map((source) => ({
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

  const sourceDisplayDto = sourceDisplayResult.dto
  const auditMetadataResult = buildAiAuditMetadataDto({
    featureId: 'email_draft',
    staff: {
      userId: retrievalDto.retrievalScope.staffUserId,
      email: retrievalDto.retrievalScope.staffEmail,
    },
    parish: {
      parishId: retrievalDto.retrievalScope.requestParishId,
      activeParishId: retrievalDto.retrievalScope.activeParishId,
    },
    target: {
      objectType: 'communication_draft',
      objectId: retrievalDto.target.objectId,
    },
    inputDataClasses: retrievalDto.auditMetadataTemplate.input_data_classes,
    safeSourceReferences: retrievalDto.auditMetadataTemplate.safe_source_references,
    outputDestination: 'draft_only',
    staffDisposition: 'pending_review',
    modelOrProviderFamily: 'not_invoked',
    sourceDisplayDto,
  })
  expect(auditMetadataResult.ok).toBe(true)
  if (!auditMetadataResult.ok) throw new Error(auditMetadataResult.blockedReason)

  const auditMetadataDto = auditMetadataResult.dto
  const staffReviewStatusResult = buildAiStaffReviewStatusDto({
    auditMetadataDto,
    sourceDisplayDto,
    status: 'review_required',
  })
  expect(staffReviewStatusResult.ok).toBe(true)
  if (!staffReviewStatusResult.ok) throw new Error(staffReviewStatusResult.blockedReason)

  return {
    retrievalDto,
    sourceDisplayDto,
    auditMetadataDto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  }
}

describe('AI reply safety-chain DTO scaffolding', () => {
  it('builds a DTO-backed reply prompt from approved safe references only', () => {
    const { retrievalDto, sourceDisplayDto, auditMetadataDto, staffReviewStatusDto } = buildReplyContracts()

    const result = buildAiReplyPromptAssembly({
      retrievalDto,
      sourceDisplayDto,
      auditMetadataDto,
      staffReviewStatusDto,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.dto).toMatchObject({
      dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
      runtimeState: 'dto_backed_reply_prompt_assembly_only',
      target: {
        objectType: 'communication_draft',
        objectId: 'draft-1',
        requestId: 'request-1',
        safeLabel: 'Follow-up draft for Ana Garcia family',
      },
      activeParishId: 'parish-a',
      requestParishId: 'parish-a',
      draftIntent: 'follow_up',
      recipientKind: 'family',
      outputDestination: 'draft_only',
      autonomousSendAllowed: false,
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
      modelOrProviderFamily: 'not_invoked',
    })
    expect(result.dto.sourceReferenceIds).toEqual([
      'request:request-1',
      'workflow_step:request-1:workflow',
      'document_metadata:request-1:documents',
    ])
    expect(result.dto.prompt).toContain('staff-reviewed reply draft')
    expect(result.dto.prompt).toContain('Autonomous send allowed: no')
    expect(result.dto.prompt).toContain('Safe source references:')
    expect(result.dto.prompt).toContain('request:request-1')
    expect(result.dto.prompt).not.toContain('raw prompt')
    expect(result.dto.prompt).not.toContain('signed url')
    expect(result.dto.prompt).not.toContain('VineaAl1996')
  })

  it('prepares reply audit metadata without storing prompt text or provider payloads', () => {
    const { retrievalDto, sourceDisplayDto, auditMetadataDto, staffReviewStatusDto } = buildReplyContracts()
    const promptAssemblyResult = buildAiReplyPromptAssembly({
      retrievalDto,
      sourceDisplayDto,
      auditMetadataDto,
      staffReviewStatusDto,
    })
    expect(promptAssemblyResult.ok).toBe(true)
    if (!promptAssemblyResult.ok) return

    const result = buildAiReplyAuditMetadataPreparation({
      auditMetadataDto,
      promptAssemblyDto: promptAssemblyResult.dto,
      staffReviewStatusDto,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.dto).toMatchObject({
      dtoVersion: AI_REPLY_AUDIT_METADATA_PREPARATION_VERSION,
      runtimeState: 'reply_audit_metadata_preparation_only',
      writeStatus: 'not_written',
      writeBlockedUntil: 'runtime_ai_reply_audit_write_approval',
      futureAuditEvent: {
        table: 'audit_events',
        action: 'ai.reply.audit_metadata_prepared',
        parishId: 'parish-a',
        actorEmail: 'staff@example.test',
        targetType: 'communication_draft',
        targetId: 'draft-1',
        metadata: {
          ai_feature_id: 'email_draft',
          request_id: 'request-1',
          output_destination: 'draft_only',
          staff_review_status: 'review_required',
          prompt_assembly: {
            dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
            promptTextIncluded: false,
            promptTextStored: false,
          },
          rawPromptStored: false,
          rawOutputStored: false,
          providerPayloadStored: false,
          tokenMaterialStored: false,
          autonomousSendAllowed: false,
          humanApprovalRequired: true,
          familyFacingOutputAllowed: false,
        },
      },
    })
    expect(JSON.stringify(result.dto)).not.toContain('You are helping Catholic parish staff')
    expect(JSON.stringify(result.dto)).not.toContain('provider payload')
    expect(JSON.stringify(result.dto)).not.toContain('signed url')
    expect(JSON.stringify(result.dto)).not.toContain('VineaAl1996')
  })

  it('builds safe response scaffolding without prompt, output, storage, or send controls', () => {
    const { retrievalDto, sourceDisplayDto, auditMetadataDto, staffReviewStatusDto } = buildReplyContracts()
    const promptAssemblyResult = buildAiReplyPromptAssembly({
      retrievalDto,
      sourceDisplayDto,
      auditMetadataDto,
      staffReviewStatusDto,
    })
    expect(promptAssemblyResult.ok).toBe(true)
    if (!promptAssemblyResult.ok) return
    const auditPreparationResult = buildAiReplyAuditMetadataPreparation({
      auditMetadataDto,
      promptAssemblyDto: promptAssemblyResult.dto,
      staffReviewStatusDto,
    })
    expect(auditPreparationResult.ok).toBe(true)
    if (!auditPreparationResult.ok) return

    const result = buildAiReplyResponseScaffold({
      sourceDisplayDto,
      staffReviewStatusDto,
      auditPreparationDto: auditPreparationResult.dto,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.dto).toMatchObject({
      dtoVersion: AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
      runtimeState: 'reply_source_display_staff_review_response_scaffold_only',
      clientExposure: 'not_returned_while_generation_disabled',
      failClosedResponse: {
        ok: false,
        error: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
        status: 503,
      },
      target: {
        objectType: 'communication_draft',
        objectId: 'draft-1',
        requestId: 'request-1',
      },
      sourceDisplay: {
        sourceCardCount: 3,
      },
      staffReview: {
        reviewStatus: 'review_required',
        displayLabel: 'Review required',
        humanApprovalRequired: true,
        familyFacingOutputAllowed: false,
      },
      privateMaterialPolicy: {
        promptIncluded: false,
        generatedOutputIncluded: false,
        providerPayloadIncluded: false,
        tokenMaterialIncluded: false,
        internalNoteBodiesIncluded: false,
        communicationBodiesIncluded: false,
        documentContentsIncluded: false,
        autonomousSendControlsIncluded: false,
      },
    })
    expect(JSON.stringify(result.dto)).not.toContain('You are helping Catholic parish staff')
    expect(JSON.stringify(result.dto)).not.toContain('generated output')
    expect(JSON.stringify(result.dto)).not.toContain('provider payload')
    expect(JSON.stringify(result.dto)).not.toContain('signed url')
    expect(JSON.stringify(result.dto)).not.toContain('VineaAl1996')
  })

  it('rejects prompt assembly when source display contains a source missing from safe DTO references', () => {
    const { retrievalDto, sourceDisplayDto, auditMetadataDto, staffReviewStatusDto } = buildReplyContracts()
    const unsafeSourceDisplayDto: AiSourceDisplayDto = {
      ...sourceDisplayDto,
      sourceCards: [
        ...sourceDisplayDto.sourceCards,
        {
          ...sourceDisplayDto.sourceCards[0],
          id: 'request-1:unsafe-extra',
          safeLabel: 'Staff note not approved by audit metadata',
        },
      ],
    }

    const result = buildAiReplyPromptAssembly({
      retrievalDto,
      sourceDisplayDto: unsafeSourceDisplayDto,
      auditMetadataDto,
      staffReviewStatusDto,
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'reply_prompt_assembly_source_reference_not_in_safe_dtos',
    })
  })

  it('rejects audit preparation when prompt references were not approved by audit metadata', () => {
    const { auditMetadataDto, staffReviewStatusDto } = buildReplyContracts()

    const result = buildAiReplyAuditMetadataPreparation({
      auditMetadataDto,
      promptAssemblyDto: {
        dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
        runtimeState: 'dto_backed_reply_prompt_assembly_only',
        prompt: 'This prompt text must never be copied into audit metadata.',
        target: {
          objectType: 'communication_draft',
          objectId: 'draft-1',
          requestId: 'request-1',
          safeLabel: 'Follow-up draft for Ana Garcia family',
        },
        activeParishId: 'parish-a',
        requestParishId: 'parish-a',
        sourceReferenceIds: ['request:request-1', 'staff_note:unsafe-extra'],
        inputDataClasses: ['request_core'],
        draftIntent: 'follow_up',
        recipientKind: 'family',
        outputDestination: 'draft_only',
        autonomousSendAllowed: false,
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
        modelOrProviderFamily: 'not_invoked',
      },
      staffReviewStatusDto,
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'reply_audit_preparation_prompt_source_not_in_safe_audit_references',
    })
  })

  it('rejects response scaffolding when audit preparation omitted a displayed source', () => {
    const { sourceDisplayDto, staffReviewStatusDto } = buildReplyContracts()

    const result = buildAiReplyResponseScaffold({
      sourceDisplayDto,
      staffReviewStatusDto,
      auditPreparationDto: {
        dtoVersion: AI_REPLY_AUDIT_METADATA_PREPARATION_VERSION,
        runtimeState: 'reply_audit_metadata_preparation_only',
        writeStatus: 'not_written',
        writeBlockedUntil: 'runtime_ai_reply_audit_write_approval',
        futureAuditEvent: {
          table: 'audit_events',
          action: 'ai.reply.audit_metadata_prepared',
          parishId: 'parish-a',
          actorEmail: 'staff@example.test',
          targetType: 'communication_draft',
          targetId: 'draft-1',
          metadata: {
            ai_feature_id: 'email_draft',
            active_parish_context: 'parish-a',
            target_object_type: 'communication_draft',
            target_object_id: 'draft-1',
            request_id: 'request-1',
            input_data_classes: ['request_core'],
            safe_source_references: ['request:request-1'],
            output_destination: 'draft_only',
            staff_disposition: 'pending_review',
            model_or_provider_family: 'not_invoked',
            blocked_reason: null,
            source_display: {
              dtoVersion: 'source-display-version',
              sourceCardIds: ['request-1'],
              staffOnlySourceCount: 0,
              familyFacingSafeSourceCount: 1,
              sacramentalCanonicalRestrictedSourceCount: 0,
            },
            staff_review_status: 'review_required',
            prompt_assembly: {
              dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
              runtimeState: 'dto_backed_reply_prompt_assembly_only',
              sourceReferenceIds: ['request:request-1'],
              inputDataClasses: ['request_core'],
              promptTextIncluded: false,
              promptTextStored: false,
            },
            rawPromptStored: false,
            rawOutputStored: false,
            providerPayloadStored: false,
            tokenMaterialStored: false,
            autonomousSendAllowed: false,
            humanApprovalRequired: true,
            familyFacingOutputAllowed: false,
          },
        },
      },
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'reply_response_scaffold_source_not_in_safe_audit_references',
    })
  })
})
