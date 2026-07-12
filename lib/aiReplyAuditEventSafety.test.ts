import { describe, expect, it } from 'vitest'
import {
  AI_REPLY_AUDIT_EVENT_SAFETY_VERSION,
  validateAiReplyAuditEventForSafeWrite,
} from './aiReplyAuditEventSafety'
import type { AiReplyAuditMetadataPreparationDto } from './aiReplySafetyChainDtos'

type FutureAuditEvent = AiReplyAuditMetadataPreparationDto['futureAuditEvent']
type UnsafeFutureAuditEventOverride = Partial<Omit<FutureAuditEvent, 'metadata'>> & {
  metadata?: Record<string, unknown>
}

function safeEvent(overrides: UnsafeFutureAuditEventOverride = {}): FutureAuditEvent {
  const base: FutureAuditEvent = {
    table: 'audit_events',
    action: 'ai.reply.audit_metadata_prepared',
    parishId: 'parish-a',
    actorEmail: 'staff@example.test',
    targetType: 'communication_draft',
    targetId: 'reply-draft:request-1:follow_up',
    metadata: {
      ai_feature_id: 'email_draft',
      active_parish_context: 'parish-a',
      target_object_type: 'communication_draft',
      target_object_id: 'reply-draft:request-1:follow_up',
      request_id: 'request-1',
      input_data_classes: ['request_core', 'request_contact'],
      safe_source_references: ['request:request-1', 'person:request-1:contact'],
      output_destination: 'draft_only',
      staff_disposition: 'pending_review',
      model_or_provider_family: 'not_invoked',
      blocked_reason: null,
      source_display: {
        dtoVersion: 'source-display-v1',
        sourceCardIds: ['request-1', 'request-1:contact'],
        staffOnlySourceCount: 0,
        familyFacingSafeSourceCount: 2,
        sacramentalCanonicalRestrictedSourceCount: 0,
      },
      staff_review_status: 'review_required',
      prompt_assembly: {
        dtoVersion: '2026-07-07-ai-reply-dto-backed-prompt-assembly-v1',
        runtimeState: 'dto_backed_reply_prompt_assembly_only',
        sourceReferenceIds: ['request:request-1', 'person:request-1:contact'],
        inputDataClasses: ['request_core', 'request_contact'],
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
  }

  return {
    ...base,
    ...overrides,
    metadata: {
      ...base.metadata,
      ...(overrides.metadata ?? {}),
    } as FutureAuditEvent['metadata'],
  }
}

describe('AI reply audit event safety validator', () => {
  it('accepts only the safe prepared AI reply audit event envelope for future writes', () => {
    const result = validateAiReplyAuditEventForSafeWrite(safeEvent())

    expect(result).toEqual({
      ok: true,
      dto: {
        version: AI_REPLY_AUDIT_EVENT_SAFETY_VERSION,
        event: safeEvent(),
        storageBoundary: {
          rawPromptStored: false,
          rawOutputStored: false,
          providerPayloadStored: false,
          tokenMaterialStored: false,
          promptTextStored: false,
          autonomousSendAllowed: false,
          familyFacingOutputAllowed: false,
          safeReferencesOnly: true,
        },
      },
    })
  })

  it('rejects wrong table, action, target, and parish scope before any future writer can insert', () => {
    expect(
      validateAiReplyAuditEventForSafeWrite(safeEvent({ table: 'communications' as never }))
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_requires_audit_events_table',
    })

    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({ action: 'ai.reply.generated' as never })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_requires_prepared_metadata_action',
    })

    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({ targetType: 'request' as never })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_requires_communication_draft_target',
    })

    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({
          parishId: 'parish-a',
          metadata: {
            active_parish_context: 'parish-b',
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_active_parish_must_match_event_parish',
    })
  })

  it('rejects private AI material, prompt text, provider payload, tokens, and send/family-facing flags', () => {
    for (const [metadata, blockedReason] of [
      [{ rawPromptStored: true }, 'ai_reply_audit_write_private_ai_material_must_not_be_stored'],
      [{ rawOutputStored: true }, 'ai_reply_audit_write_private_ai_material_must_not_be_stored'],
      [{ providerPayloadStored: true }, 'ai_reply_audit_write_private_ai_material_must_not_be_stored'],
      [{ tokenMaterialStored: true }, 'ai_reply_audit_write_private_ai_material_must_not_be_stored'],
      [{ autonomousSendAllowed: true }, 'ai_reply_audit_write_autonomous_send_not_allowed'],
      [{ familyFacingOutputAllowed: true }, 'ai_reply_audit_write_family_facing_output_not_allowed'],
      [{ humanApprovalRequired: false }, 'ai_reply_audit_write_requires_human_approval'],
    ] as const) {
      expect(validateAiReplyAuditEventForSafeWrite(safeEvent({ metadata }))).toEqual({
        ok: false,
        blockedReason,
      })
    }

    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({
          metadata: {
            prompt_assembly: {
              ...safeEvent().metadata.prompt_assembly,
              promptTextStored: true,
            },
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_prompt_text_must_not_be_included_or_stored',
    })
  })

  it('rejects unsafe source references and prompt references not approved by audit metadata', () => {
    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({
          metadata: {
            safe_source_references: ['request:request-1', 'document:signed-url-token'],
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_requires_safe_source_references',
    })

    expect(
      validateAiReplyAuditEventForSafeWrite(
        safeEvent({
          metadata: {
            prompt_assembly: {
              ...safeEvent().metadata.prompt_assembly,
              sourceReferenceIds: ['request:request-1', 'staff_note:request-1:notes'],
            },
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_prompt_source_not_in_safe_audit_references',
    })
  })

  it('rejects extra raw metadata keys even when the rest of the event shape looks safe', () => {
    const unsafe = safeEvent({
      metadata: {
        ...(safeEvent().metadata as Record<string, unknown>),
        rawPrompt: 'Do not store this prompt text.',
      } as never,
    })

    expect(validateAiReplyAuditEventForSafeWrite(unsafe)).toEqual({
      ok: false,
      blockedReason: 'ai_reply_audit_write_contains_unapproved_metadata_keys',
    })
  })
})
