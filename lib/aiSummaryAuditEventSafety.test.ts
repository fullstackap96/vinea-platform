import { describe, expect, it } from 'vitest'
import {
  AI_SUMMARY_AUDIT_EVENT_SAFETY_VERSION,
  validateAiSummaryAuditEventForSafeWrite,
} from './aiSummaryAuditEventSafety'
import type { AiSummaryAuditMetadataPreparationDto } from './server/aiSummarySafetyChainAdapter'

type FutureAuditEvent = AiSummaryAuditMetadataPreparationDto['futureAuditEvent']
type UnsafeFutureAuditEventOverride = Partial<Omit<FutureAuditEvent, 'metadata'>> & {
  metadata?: Record<string, unknown>
}

function safeEvent(overrides: UnsafeFutureAuditEventOverride = {}): FutureAuditEvent {
  const base: FutureAuditEvent = {
    table: 'audit_events',
    action: 'ai.summary.audit_metadata_prepared',
    parishId: 'parish-a',
    actorEmail: 'staff@example.test',
    targetType: 'request',
    targetId: 'request-1',
    metadata: {
      ai_feature_id: 'request_summary',
      active_parish_context: 'parish-a',
      target_object_type: 'request',
      target_object_id: 'request-1',
      input_data_classes: ['request_core', 'request_contact'],
      safe_source_references: ['request:request-1', 'person:request-1:contact'],
      output_destination: 'internal_summary',
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
        dtoVersion: '2026-06-27-ai-summary-dto-backed-prompt-assembly-v1',
        runtimeState: 'dto_backed_prompt_assembly_only',
        sourceReferenceIds: ['request:request-1', 'person:request-1:contact'],
        inputDataClasses: ['request_core', 'request_contact'],
        promptTextIncluded: false,
        promptTextStored: false,
      },
      rawPromptStored: false,
      rawOutputStored: false,
      providerPayloadStored: false,
      tokenMaterialStored: false,
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

describe('AI summary audit event safety validator', () => {
  it('accepts only the prepared safe AI summary audit event envelope for writes', () => {
    const result = validateAiSummaryAuditEventForSafeWrite(safeEvent())

    expect(result).toEqual({
      ok: true,
      dto: {
        version: AI_SUMMARY_AUDIT_EVENT_SAFETY_VERSION,
        event: safeEvent(),
        storageBoundary: {
          rawPromptStored: false,
          rawOutputStored: false,
          providerPayloadStored: false,
          tokenMaterialStored: false,
          promptTextStored: false,
          familyFacingOutputAllowed: false,
          safeReferencesOnly: true,
        },
      },
    })
  })

  it('rejects wrong table, action, target, and parish scope before insert', () => {
    expect(
      validateAiSummaryAuditEventForSafeWrite(safeEvent({ table: 'requests' as never }))
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_requires_audit_events_table',
    })

    expect(
      validateAiSummaryAuditEventForSafeWrite(
        safeEvent({ action: 'ai.summary.generated' as never })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_requires_prepared_metadata_action',
    })

    expect(
      validateAiSummaryAuditEventForSafeWrite(
        safeEvent({ targetType: 'communication_draft' as never })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_requires_request_target',
    })

    expect(
      validateAiSummaryAuditEventForSafeWrite(
        safeEvent({
          parishId: 'parish-a',
          metadata: {
            active_parish_context: 'parish-b',
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_active_parish_must_match_event_parish',
    })
  })

  it('rejects private AI material, prompt text, and family-facing flags', () => {
    for (const [metadata, blockedReason] of [
      [{ rawPromptStored: true }, 'ai_summary_audit_write_private_ai_material_must_not_be_stored'],
      [{ rawOutputStored: true }, 'ai_summary_audit_write_private_ai_material_must_not_be_stored'],
      [{ providerPayloadStored: true }, 'ai_summary_audit_write_private_ai_material_must_not_be_stored'],
      [{ tokenMaterialStored: true }, 'ai_summary_audit_write_private_ai_material_must_not_be_stored'],
      [{ familyFacingOutputAllowed: true }, 'ai_summary_audit_write_family_facing_output_not_allowed'],
      [{ humanApprovalRequired: false }, 'ai_summary_audit_write_requires_human_approval'],
    ] as const) {
      expect(validateAiSummaryAuditEventForSafeWrite(safeEvent({ metadata }))).toEqual({
        ok: false,
        blockedReason,
      })
    }

    expect(
      validateAiSummaryAuditEventForSafeWrite(
        safeEvent({
          metadata: {
            prompt_assembly: {
              ...safeEvent().metadata.prompt_assembly,
              promptTextIncluded: true,
            },
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_prompt_text_must_not_be_included_or_stored',
    })
  })

  it('rejects unsafe source references and prompt references outside safe audit metadata', () => {
    expect(
      validateAiSummaryAuditEventForSafeWrite(
        safeEvent({
          metadata: {
            safe_source_references: ['request:request-1', 'document:signed-url-token'],
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_requires_safe_source_references',
    })

    expect(
      validateAiSummaryAuditEventForSafeWrite(
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
      blockedReason: 'ai_summary_audit_write_prompt_source_not_in_safe_audit_references',
    })
  })

  it('rejects extra raw metadata keys even when the envelope otherwise looks safe', () => {
    const unsafe = safeEvent({
      metadata: {
        ...(safeEvent().metadata as Record<string, unknown>),
        rawPrompt: 'Do not store this prompt text.',
      } as never,
    })

    expect(validateAiSummaryAuditEventForSafeWrite(unsafe)).toEqual({
      ok: false,
      blockedReason: 'ai_summary_audit_write_contains_unapproved_metadata_keys',
    })
  })
})
