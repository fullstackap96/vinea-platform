import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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
  validateFutureAiSummaryGenerationSource,
} from './aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from './aiSummarySafeResponseExposureAcceptance'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from './aiSummaryRuntimeGate'
import type { AiSummaryAuditMetadataPreparationDto } from './aiSummarySafetyChainAdapter'

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

const root = process.cwd()
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const requiredEnvPath = join(root, 'lib', 'server', 'requiredEnv.ts')
const approvalPath = join(root, 'docs', 'AI_SUMMARY_GENERATION_APPROVAL_20260627.md')
const planPath = join(root, 'docs', 'AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md')

const openAiCreateMock = vi.mocked(openai.responses.create)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const buildAiSummarySafetyChainAdapterMock = vi.mocked(buildAiSummarySafetyChainAdapter)

type SummaryFutureAuditEvent = AiSummaryAuditMetadataPreparationDto['futureAuditEvent']

function safeSummaryFutureAuditEvent(
  overrides: Partial<Omit<SummaryFutureAuditEvent, 'metadata'>> & {
    metadata?: Record<string, unknown>
  } = {}
): SummaryFutureAuditEvent {
  const base: SummaryFutureAuditEvent = {
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
    } as SummaryFutureAuditEvent['metadata'],
  }
}

const approvedFutureGenerationSketch = `
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from '@/lib/server/aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from '@/lib/server/aiSummarySafeResponseExposureAcceptance'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from '@/lib/server/aiSummaryGenerationApproval'
import { openai } from '@/lib/openai'
import { validateAiSummaryAuditEventForSafeWrite } from '@/lib/aiSummaryAuditEventSafety'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { getAiSummarySafetyRuntimeGate } from '@/lib/server/aiSummaryRuntimeGate'
import { buildAiSummaryRuntimeScaffold } from '@/lib/server/aiSummaryRuntimeScaffold'
import { buildAiSummarySafetyChainAdapter } from '@/lib/server/aiSummarySafetyChainAdapter'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response
  const body = await request.json()
  const gate = getAiSummarySafetyRuntimeGate()
  const scaffold = buildAiSummaryRuntimeScaffold(gate)
  if (scaffold.selectedPath === 'legacy_staff_gated_summary_route') {
    return runLegacyStaffGatedSummaryRoute(body)
  }
  const safetyChain = await buildAiSummarySafetyChainAdapter({ request, body, staff, staffSupabase: staff.supabase })
  const auditWriteGate =
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE &&
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
  const safeResponseExposureGate =
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE &&
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
  const generationGate =
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] === AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE &&
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] === AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE
  let safeAuditMetadataWritten = false
  if (
    auditWriteGate &&
    safeResponseExposureGate &&
    generationGate &&
    safetyChain.ok &&
    safetyChain.auditPreparation.writeStatus === 'not_written'
  ) {
    const futureAudit = safetyChain.auditPreparation.futureAuditEvent
    const safeAuditEvent = validateAiSummaryAuditEventForSafeWrite(futureAudit)
    if (safeAuditEvent.ok) {
      safeAuditMetadataWritten = await writeAuditEvent({
        parishId: safeAuditEvent.dto.event.parishId,
        actorEmail: safeAuditEvent.dto.event.actorEmail,
        action: safeAuditEvent.dto.event.action,
        targetType: safeAuditEvent.dto.event.targetType,
        targetId: safeAuditEvent.dto.event.targetId,
        metadata: safeAuditEvent.dto.event.metadata,
      })
      if (!safeAuditMetadataWritten) {
        return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' }, { status: 503 })
      }
      const response = await openai.responses.create({
        model: 'gpt-5-mini',
        input: safetyChain.promptAssembly.prompt,
      })
      return NextResponse.json({
        summary: response.output_text,
        sourceDisplay: safetyChain.responseScaffold.sourceDisplay,
        staffReview: safetyChain.responseScaffold.staffReview,
      })
    }
  }
  return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' }, { status: 503 })
}
`

describe('AI summary safety-chain generation approval gates', () => {
  beforeEach(() => {
    for (const flag of [
      AI_SUMMARY_SAFETY_RUNTIME_FLAG,
      AI_SUMMARY_SAFETY_RUNTIME_ACK,
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
    ]) {
      delete process.env[flag]
    }
    openAiCreateMock.mockReset()
    writeAuditEventMock.mockReset()
    writeAuditEventMock.mockResolvedValue(true)
    requireStaffFromRequestMock.mockReset()
    buildAiSummarySafetyChainAdapterMock.mockReset()
  })

  afterEach(() => {
    for (const flag of [
      AI_SUMMARY_SAFETY_RUNTIME_FLAG,
      AI_SUMMARY_SAFETY_RUNTIME_ACK,
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
    ]) {
      delete process.env[flag]
    }
  })

  it('accepts only future sketches that gate safety-chain OpenAI behind audit, response, and generation approvals', () => {
    expect(validateFutureAiSummaryGenerationSource(approvedFutureGenerationSketch)).toEqual({
      ok: true,
      missingRequiredMarkers: [],
      forbiddenMarkersPresent: [],
      orderingFailures: [],
    })
  })

  it('rejects future sketches that skip audit-write or safe-response approval before OpenAI', () => {
    const unsafeSketch = approvedFutureGenerationSketch
      .replace(
        'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
        'true'
      )
      .replace(
        'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
        'true'
      )

    expect(validateFutureAiSummaryGenerationSource(unsafeSketch)).toMatchObject({
      ok: false,
      missingRequiredMarkers: [
        'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
        'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
      ],
    })
  })

  it('rejects future sketches that call OpenAI before audit writes or use legacy body prompts', () => {
    const unsafeSketch = approvedFutureGenerationSketch
      .replace('safeAuditMetadataWritten = await writeAuditEvent({', 'const response = await openai.responses.create({ model: \'gpt-5-mini\', input: prompt })\n    safeAuditMetadataWritten = await writeAuditEvent({')
      .replace('input: safetyChain.promptAssembly.prompt,', 'input: prompt,')

    const result = validateFutureAiSummaryGenerationSource(unsafeSketch)

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(expect.arrayContaining(['input: prompt']))
    expect(result.orderingFailures).toEqual(
      expect.arrayContaining([
        'safeAuditMetadataWritten = await writeAuditEvent must appear before openai.responses.create',
      ])
    )
  })

  it('rejects future sketches that expose raw prompt, raw output, provider, token, or private material', () => {
    const unsafeSketch = approvedFutureGenerationSketch.replace(
      'staffReview: safetyChain.responseScaffold.staffReview,',
      [
        'staffReview: safetyChain.responseScaffold.staffReview,',
        'promptAssembly: safetyChain.promptAssembly,',
        'rawPrompt: safetyChain.promptAssembly.prompt,',
        'rawOutput: response,',
        'providerPayload: providerPayload,',
        'tokenMaterial: tokenMaterial,',
        'privateMaterialPolicy: safetyChain.responseScaffold.privateMaterialPolicy,',
      ].join('\n')
    )

    const result = validateFutureAiSummaryGenerationSource(unsafeSketch)

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(
      expect.arrayContaining([
        'promptAssembly:',
        'rawPrompt',
        'rawOutput',
        'providerPayload',
        'tokenMaterial',
        'privateMaterialPolicy',
      ])
    )
  })

  it('calls OpenAI through the safety chain only after audit, response, and generation approvals', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
      promptAssembly: { prompt: 'Safe DTO-backed prompt.' },
      auditPreparation: {
        writeStatus: 'not_written',
        futureAuditEvent: safeSummaryFutureAuditEvent(),
      },
      responseScaffold: {
        sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
        staffReview: { displayLabel: 'Review required' },
      },
    } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)
    openAiCreateMock.mockResolvedValue({ output_text: 'Permission-scoped summary.' } as never)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ requestType: 'baptism', requestId: 'request-1' }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({
      summary: 'Permission-scoped summary.',
      sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
      staffReview: { displayLabel: 'Review required' },
    })
    expect(response.status).toBe(200)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).toHaveBeenCalledWith({
      parishId: 'parish-1',
      actorEmail: 'staff@example.test',
      action: 'ai.summary.audit_metadata_prepared',
      targetType: 'request',
      targetId: 'request-1',
      metadata: safeSummaryFutureAuditEvent().metadata,
    })
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).toHaveBeenCalledWith({
      model: 'gpt-5-mini',
      input: 'Safe DTO-backed prompt.',
    })
  })

  it('fails closed before safe response exposure or OpenAI when audit persistence fails', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
      promptAssembly: { prompt: 'Safe DTO-backed prompt.' },
      auditPreparation: {
        writeStatus: 'not_written',
        futureAuditEvent: safeSummaryFutureAuditEvent(),
      },
      responseScaffold: {
        sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
        staffReview: { displayLabel: 'Review required' },
      },
    } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)
    writeAuditEventMock.mockResolvedValueOnce(false)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ requestType: 'baptism', requestId: 'request-1' }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(response.status).toBe(503)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('fails closed before OpenAI when generation is approved but safe DTO prompt input is missing', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
      auditPreparation: {
        writeStatus: 'not_written',
        futureAuditEvent: safeSummaryFutureAuditEvent(),
      },
      responseScaffold: {
        sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
        staffReview: { displayLabel: 'Review required' },
      },
    } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ requestType: 'baptism', requestId: 'request-1' }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(response.status).toBe(503)
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('does not call OpenAI when generation approval is present but safe-response approval is missing', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
      promptAssembly: { prompt: 'Safe DTO-backed prompt.' },
      auditPreparation: {
        writeStatus: 'not_written',
        futureAuditEvent: safeSummaryFutureAuditEvent(),
      },
      responseScaffold: {
        sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
        staffReview: { displayLabel: 'Review required' },
      },
    } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ requestType: 'baptism', requestId: 'request-1' }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(response.status).toBe(503)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('does not call OpenAI when all gates are present but audit-event validation fails', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] = AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
      promptAssembly: { prompt: 'Safe DTO-backed prompt.' },
      auditPreparation: {
        writeStatus: 'not_written',
        futureAuditEvent: safeSummaryFutureAuditEvent({
          metadata: { rawPromptStored: true },
        }),
      },
      responseScaffold: {
        sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
        staffReview: { displayLabel: 'Review required' },
      },
    } as unknown as Awaited<ReturnType<typeof buildAiSummarySafetyChainAdapter>>)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ requestType: 'baptism', requestId: 'request-1' }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'ai_retrieval_unavailable',
    })
    expect(response.status).toBe(503)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('wires only the summary route to generation flags and keeps reply/required env untouched', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    for (const marker of [
      'AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG',
      'AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK',
      'input: safetyChain.promptAssembly.prompt',
    ]) {
      expect(summaryRoute).toContain(marker)
    }

    for (const flag of [
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
    ]) {
      expect(replyRoute).not.toContain(flag)
      expect(requiredEnv).not.toContain(flag)
    }

    expect(replyRoute).not.toContain('buildAiSummarySafetyChainAdapter')
  })

  it('documents the non-production generation approval criteria without claiming live generation', () => {
    const approval = readFileSync(approvalPath, 'utf8')
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'AI Summary Safety-Chain Generation Approval Plan',
      'Status: Disabled-by-default runtime safety-chain generation gate wired for `/api/ai/summary` in non-production only.',
      'Separate Approval Flags',
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
      'Safety-chain generation also requires the audit-write approval flags and safe-response exposure flags.',
      'Do not enable these flags in production.',
      'Do not add these flags to required startup environment validation.',
      'The OpenAI call may use only `safetyChain.promptAssembly.prompt` as input.',
      'The route must write the approved safe audit event before the safety-chain OpenAI call and must positively confirm that persistence succeeded.',
      'The response may return generated summary text plus safe `sourceDisplay` and `staffReview` scaffolding.',
      'The response must not return raw prompts, raw provider responses, provider payloads, token material, audit preparation envelopes, private material policy details, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.',
      'Safety-chain OpenAI calls require the base runtime, audit-write, safe-response exposure, and generation flags.',
      'Safety-chain generation still requires an approved safe audit write before OpenAI.',
      'No migrations are applied in this approval-plan phase.',
      'Operational RLS is not changed in this approval-plan phase.',
    ]) {
      expect(approval).toContain(required)
    }

    expect(plan).toContain(
      'Safety-chain OpenAI generation has a separate approval packet: `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`.'
    )
  })
})
