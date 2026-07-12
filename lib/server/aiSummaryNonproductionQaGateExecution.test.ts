import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from './aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from './aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from './aiSummaryRuntimeGate'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from './aiSummarySafeResponseExposureAcceptance'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/openai', () => ({
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/aiSummarySafetyChainAdapter', () => ({
  buildAiSummarySafetyChainAdapter: vi.fn(),
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

import { openai } from '@/lib/openai'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { buildAiSummarySafetyChainAdapter } from '@/lib/server/aiSummarySafetyChainAdapter'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { POST } from '../../app/api/ai/summary/route'

const openAiCreateMock = vi.mocked(openai.responses.create)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const buildAiSummarySafetyChainAdapterMock = vi.mocked(buildAiSummarySafetyChainAdapter)

const allApprovalFlags = [
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
]

function clearApprovalFlags() {
  for (const flag of allApprovalFlags) {
    delete process.env[flag]
  }
}

function enableBaseSafetyRuntime() {
  process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
  process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
}

function enableAuditWrite() {
  process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
  process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
}

function enableSafeResponseExposure() {
  process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] =
    AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
  process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] =
    AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
}

function enableGeneration() {
  process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] =
    AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
  process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] =
    AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE
}

function staffOk() {
  requireStaffFromRequestMock.mockResolvedValue({
    ok: true,
    staff: { email: 'staff@example.test' },
    user: { id: 'user-1' },
    supabase: { from: vi.fn(), rpc: vi.fn() },
  } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
}

function safeChainOk() {
  buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
    ok: true,
    genericBlockedReason: 'ai_retrieval_unavailable',
    promptAssembly: {
      prompt: 'Permission-scoped DTO prompt from safe source references only.',
    },
    auditPreparation: {
      writeStatus: 'not_written',
      futureAuditEvent: {
        table: 'audit_events',
        parishId: 'parish-1',
        actorEmail: 'staff@example.test',
        action: 'ai.summary.audit_metadata_prepared',
        targetType: 'request',
        targetId: 'request-1',
        metadata: {
          ai_feature_id: 'request_summary',
          active_parish_context: 'parish-1',
          target_object_type: 'request',
          target_object_id: 'request-1',
          input_data_classes: ['request_core'],
          safe_source_references: ['request:request-1'],
          output_destination: 'internal_summary',
          staff_disposition: 'pending_review',
          model_or_provider_family: 'not_invoked',
          blocked_reason: null,
          source_display: {
            dtoVersion: 'source-display-v1',
            sourceCardIds: ['request-1'],
            staffOnlySourceCount: 0,
            familyFacingSafeSourceCount: 1,
            sacramentalCanonicalRestrictedSourceCount: 0,
          },
          staff_review_status: 'review_required',
          prompt_assembly: {
            dtoVersion: '2026-06-27-ai-summary-dto-backed-prompt-assembly-v1',
            runtimeState: 'dto_backed_prompt_assembly_only',
            sourceReferenceIds: ['request:request-1'],
            inputDataClasses: ['request_core'],
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
      },
    },
    responseScaffold: {
      sourceDisplay: {
        sourceCardCount: 1,
        sourceCards: [
          {
            id: 'request-1',
            reference: 'request:request-1',
            safeLabel: 'Baptism request for Ana Garcia',
            displayOnly: true,
          },
        ],
      },
      staffReview: {
        reviewStatus: 'review_required',
        displayLabel: 'Review required',
        humanApprovalRequired: true,
        familyFacingOutputAllowed: false,
      },
    },
  } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)
}

function safeChainDenied() {
  buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
    ok: false,
    version: '2026-06-27-ai-summary-safety-chain-adapter-v1',
    genericBlockedReason: 'ai_retrieval_unavailable',
    internalBlockedReason: 'active_parish_does_not_match_request_parish',
  } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)
}

function summaryRequest() {
  return new Request('https://vinea.test/api/ai/summary', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
    },
    body: JSON.stringify({
      requestType: 'baptism',
      requestId: 'request-1',
      fullName: 'Maria Garcia',
      childName: 'Ana Garcia',
      preferredDates: 'Next month',
      status: 'new',
    }),
  }) as never
}

describe('AI summary non-production safety-chain QA gate execution', () => {
  beforeEach(() => {
    clearApprovalFlags()
    openAiCreateMock.mockReset()
    writeAuditEventMock.mockReset()
    writeAuditEventMock.mockResolvedValue(true)
    requireStaffFromRequestMock.mockReset()
    buildAiSummarySafetyChainAdapterMock.mockReset()
  })

  afterEach(() => {
    clearApprovalFlags()
  })

  it('executes the QA gates in sequence without production flags, migrations, reply changes, or RLS changes', async () => {
    staffOk()
    openAiCreateMock.mockResolvedValueOnce({ output_text: 'Legacy summary' } as never)

    const gate0 = await POST(summaryRequest())

    await expect(gate0.json()).resolves.toEqual({ summary: 'Legacy summary' })
    expect(gate0.status).toBe(200)
    expect(buildAiSummarySafetyChainAdapterMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)

    openAiCreateMock.mockClear()
    enableBaseSafetyRuntime()
    safeChainOk()

    const gate1 = await POST(summaryRequest())

    await expect(gate1.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(gate1.status).toBe(503)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).not.toHaveBeenCalled()

    enableAuditWrite()

    const gate2 = await POST(summaryRequest())

    await expect(gate2.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(gate2.status).toBe(503)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).toHaveBeenLastCalledWith({
      parishId: 'parish-1',
      actorEmail: 'staff@example.test',
      action: 'ai.summary.audit_metadata_prepared',
      targetType: 'request',
      targetId: 'request-1',
      metadata: expect.objectContaining({
        rawPromptStored: false,
        rawOutputStored: false,
        providerPayloadStored: false,
        tokenMaterialStored: false,
        familyFacingOutputAllowed: false,
      }),
    })
    expect(openAiCreateMock).not.toHaveBeenCalled()

    enableSafeResponseExposure()

    const gate3 = await POST(summaryRequest())

    await expect(gate3.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
      sourceDisplay: expect.objectContaining({
        sourceCardCount: 1,
      }),
      staffReview: expect.objectContaining({
        displayLabel: 'Review required',
        familyFacingOutputAllowed: false,
      }),
    })
    expect(gate3.status).toBe(503)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(2)
    expect(openAiCreateMock).not.toHaveBeenCalled()

    enableGeneration()
    openAiCreateMock.mockResolvedValueOnce({ output_text: 'Generated safe summary.' } as never)

    const gate4 = await POST(summaryRequest())

    await expect(gate4.json()).resolves.toEqual({
      summary: 'Generated safe summary.',
      sourceDisplay: expect.objectContaining({
        sourceCardCount: 1,
      }),
      staffReview: expect.objectContaining({
        displayLabel: 'Review required',
        familyFacingOutputAllowed: false,
      }),
    })
    expect(gate4.status).toBe(200)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(3)
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).toHaveBeenLastCalledWith(
      {
        model: 'gpt-5-mini',
        input: 'Permission-scoped DTO prompt from safe source references only.',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('keeps cross-parish or forged active-parish denials generic before audit writes and OpenAI', async () => {
    enableBaseSafetyRuntime()
    enableAuditWrite()
    enableSafeResponseExposure()
    enableGeneration()
    staffOk()
    safeChainDenied()

    const response = await POST(summaryRequest())

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(response.status).toBe(503)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('denies family-portal or unauthenticated callers before the safety chain and provider path', async () => {
    enableBaseSafetyRuntime()
    enableAuditWrite()
    enableSafeResponseExposure()
    enableGeneration()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: false,
      response: new Response('Unauthorized', { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)

    const response = await POST(summaryRequest())

    expect(response.status).toBe(401)
    await expect(response.text()).resolves.toBe('Unauthorized')
    expect(buildAiSummarySafetyChainAdapterMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('rolls back to legacy behavior when all non-production safety-chain flags are cleared', async () => {
    enableBaseSafetyRuntime()
    enableAuditWrite()
    enableSafeResponseExposure()
    enableGeneration()
    clearApprovalFlags()
    staffOk()
    openAiCreateMock.mockResolvedValueOnce({ output_text: 'Legacy summary after rollback' } as never)

    const response = await POST(summaryRequest())

    await expect(response.json()).resolves.toEqual({
      summary: 'Legacy summary after rollback',
    })
    expect(response.status).toBe(200)
    expect(buildAiSummarySafetyChainAdapterMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)
  })
})
