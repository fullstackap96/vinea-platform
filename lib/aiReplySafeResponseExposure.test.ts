import { describe, expect, it } from 'vitest'
import {
  AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
  AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
  type AiReplyResponseScaffoldDto,
} from './aiReplySafetyChainDtos'
import {
  AI_REPLY_SAFE_RESPONSE_EXPOSURE_VERSION,
  validateAiReplyResponseScaffoldForSafeExposure,
} from './aiReplySafeResponseExposure'

type UnsafeScaffoldOverride = Partial<Omit<AiReplyResponseScaffoldDto, 'sourceDisplay' | 'staffReview' | 'privateMaterialPolicy'>> & {
  sourceDisplay?: Record<string, unknown>
  staffReview?: Record<string, unknown>
  privateMaterialPolicy?: Record<string, unknown>
}

function safeScaffold(overrides: UnsafeScaffoldOverride = {}): AiReplyResponseScaffoldDto {
  const base: AiReplyResponseScaffoldDto = {
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
      safeLabel: 'Follow-up draft for Ana Garcia family',
    },
    activeParishId: 'parish-a',
    sourceDisplay: {
      dtoVersion: '2026-06-27-source-display-non-runtime-v1',
      sourceCardCount: 2,
      sourceCards: [
        {
          id: 'request-1',
          reference: 'request:request-1',
          type: 'request',
          dataClass: 'request_core',
          safeLabel: 'Baptism request for Ana Garcia',
          staffOnly: false,
          familyFacingSafe: true,
          sacramentalCanonicalRestricted: false,
          displayOnly: true,
        },
        {
          id: 'request-1:workflow',
          reference: 'workflow_step:request-1:workflow',
          type: 'workflow_step',
          dataClass: 'request_workflow_steps',
          safeLabel: 'Baptism preparation checklist step',
          staffOnly: true,
          familyFacingSafe: false,
          sacramentalCanonicalRestricted: false,
          displayOnly: true,
        },
      ],
    },
    staffReview: {
      dtoVersion: '2026-06-27-staff-review-status-non-runtime-v1',
      reviewStatus: 'review_required',
      displayLabel: 'Review required',
      staffGuidance: 'Staff must review the AI-assisted text before saving, sending, or using it.',
      staffActionRequired: true,
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
  }

  return {
    ...base,
    ...overrides,
    sourceDisplay: {
      ...base.sourceDisplay,
      ...(overrides.sourceDisplay ?? {}),
    } as AiReplyResponseScaffoldDto['sourceDisplay'],
    staffReview: {
      ...base.staffReview,
      ...(overrides.staffReview ?? {}),
    } as AiReplyResponseScaffoldDto['staffReview'],
    privateMaterialPolicy: {
      ...base.privateMaterialPolicy,
      ...(overrides.privateMaterialPolicy ?? {}),
    } as AiReplyResponseScaffoldDto['privateMaterialPolicy'],
  }
}

describe('AI reply safe response exposure validator', () => {
  it('accepts only the safe source-display and staff-review scaffold boundary', () => {
    const scaffold = safeScaffold()
    const result = validateAiReplyResponseScaffoldForSafeExposure(scaffold)

    expect(result).toEqual({
      ok: true,
      dto: {
        version: AI_REPLY_SAFE_RESPONSE_EXPOSURE_VERSION,
        exposureStatus: 'safe_scaffold_only',
        scaffold,
        clientBoundary: {
          generatedOutputIncluded: false,
          rawPromptIncluded: false,
          providerPayloadIncluded: false,
          tokenMaterialIncluded: false,
          storageDetailsIncluded: false,
          sendControlsIncluded: false,
          familyFacingOutputAllowed: false,
          humanApprovalRequired: true,
        },
      },
    })
  })

  it('rejects extra top-level keys that could smuggle raw output or metadata', () => {
    const scaffold = {
      ...safeScaffold(),
      generatedReply: 'This generated output must not be returned by this scaffold.',
    } as never

    expect(validateAiReplyResponseScaffoldForSafeExposure(scaffold)).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_contains_unapproved_top_level_keys',
    })
  })

  it('requires the generic fail-closed response and disabled generation exposure boundary', () => {
    expect(
      validateAiReplyResponseScaffoldForSafeExposure(
        safeScaffold({
          clientExposure: 'returned_to_client' as never,
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_requires_disabled_generation_exposure_boundary',
    })

    expect(
      validateAiReplyResponseScaffoldForSafeExposure(
        safeScaffold({
          failClosedResponse: {
            ok: false,
            error: 'raw_openai_error' as never,
            status: 500 as never,
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_requires_generic_fail_closed_response',
    })
  })

  it('rejects unsafe source card labels or references', () => {
    const scaffold = safeScaffold({
      sourceDisplay: {
        sourceCards: [
          {
            ...safeScaffold().sourceDisplay.sourceCards[0],
            reference: 'document_metadata:signed-url-token',
          },
        ],
        sourceCardCount: 1,
      },
    })

    expect(validateAiReplyResponseScaffoldForSafeExposure(scaffold)).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_contains_unsafe_source_card',
    })
  })

  it('rejects family-facing output, missing human review, and private material exposure', () => {
    expect(
      validateAiReplyResponseScaffoldForSafeExposure(
        safeScaffold({
          staffReview: {
            familyFacingOutputAllowed: true,
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_requires_staff_review_boundary',
    })

    expect(
      validateAiReplyResponseScaffoldForSafeExposure(
        safeScaffold({
          privateMaterialPolicy: {
            providerPayloadIncluded: true,
          },
        })
      )
    ).toEqual({
      ok: false,
      blockedReason: 'ai_reply_safe_response_private_material_must_not_be_included',
    })
  })
})
