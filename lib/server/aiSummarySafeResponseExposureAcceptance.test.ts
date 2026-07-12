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
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
  validateFutureAiSummarySafeResponseExposureSource,
} from './aiSummarySafeResponseExposureAcceptance'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from './aiSummaryGenerationApproval'
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
const acceptancePath = join(root, 'docs', 'AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md')
const planPath = join(root, 'docs', 'AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md')

const openAiCreateMock = vi.mocked(openai.responses.create)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const buildAiSummarySafetyChainAdapterMock = vi.mocked(buildAiSummarySafetyChainAdapter)

type SummaryFutureAuditEvent = AiSummaryAuditMetadataPreparationDto['futureAuditEvent']

function safeSummaryFutureAuditEvent(): SummaryFutureAuditEvent {
  return {
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
}

const approvedFutureSafeResponseExposureSketch = `
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
import { getAiSummarySafetyRuntimeGate } from '@/lib/server/aiSummaryRuntimeGate'
import { buildAiSummaryRuntimeScaffold } from '@/lib/server/aiSummaryRuntimeScaffold'
import { buildAiSummarySafetyChainAdapter } from '@/lib/server/aiSummarySafetyChainAdapter'
import { validateAiSummaryAuditEventForSafeWrite } from '@/lib/aiSummaryAuditEventSafety'
import { writeAuditEvent } from '@/lib/server/auditLog'
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
  let safeAuditMetadataWritten = false
  if (
    auditWriteGate &&
    safetyChain.ok &&
    safetyChain.auditPreparation.writeStatus === 'not_written'
  ) {
    const futureAudit = safetyChain.auditPreparation.futureAuditEvent
    const safeAuditEvent = validateAiSummaryAuditEventForSafeWrite(futureAudit)
    if (safeAuditEvent.ok) {
      await writeAuditEvent({
        parishId: safeAuditEvent.dto.event.parishId,
        actorEmail: safeAuditEvent.dto.event.actorEmail,
        action: safeAuditEvent.dto.event.action,
        targetType: safeAuditEvent.dto.event.targetType,
        targetId: safeAuditEvent.dto.event.targetId,
        metadata: safeAuditEvent.dto.event.metadata,
      })
      safeAuditMetadataWritten = true
    }
  }
  const safeResponseExposureGate =
    safeAuditMetadataWritten &&
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE &&
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE
  if (safeResponseExposureGate && safetyChain.ok) {
    return NextResponse.json({
      ok: false,
      error: 'ai_retrieval_unavailable',
      sourceDisplay: safetyChain.responseScaffold.sourceDisplay,
      staffReview: safetyChain.responseScaffold.staffReview,
    }, { status: 503 })
  }
  return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' }, { status: 503 })
}
`

describe('AI summary safe response exposure acceptance gates', () => {
  beforeEach(() => {
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_FLAG]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_ACK]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK]
    openAiCreateMock.mockReset()
    writeAuditEventMock.mockReset()
    writeAuditEventMock.mockResolvedValue(true)
    requireStaffFromRequestMock.mockReset()
    buildAiSummarySafetyChainAdapterMock.mockReset()
  })

  afterEach(() => {
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_FLAG]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_ACK]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK]
  })

  it('accepts only future sketches with base runtime approval plus a separate safe-response exposure approval', () => {
    const result = validateFutureAiSummarySafeResponseExposureSource(
      approvedFutureSafeResponseExposureSketch
    )

    expect(result).toEqual({
      ok: true,
      missingRequiredMarkers: [],
      forbiddenMarkersPresent: [],
      orderingFailures: [],
    })
  })

  it('rejects future sketches that skip the separate response-exposure acknowledgement', () => {
    const unsafeSketch = approvedFutureSafeResponseExposureSketch.replace(
      'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
      'true'
    )

    expect(validateFutureAiSummarySafeResponseExposureSource(unsafeSketch)).toMatchObject({
      ok: false,
      missingRequiredMarkers: [
        'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
      ],
    })
  })

  it('rejects future sketches that expose raw prompt, audit, provider, or token material', () => {
    const unsafeSketch = approvedFutureSafeResponseExposureSketch.replace(
      'staffReview: safetyChain.responseScaffold.staffReview,',
      [
        'staffReview: safetyChain.responseScaffold.staffReview,',
        'promptAssembly: safetyChain.promptAssembly,',
        'auditPreparation: safetyChain.auditPreparation,',
        'rawPrompt: safetyChain.promptAssembly.prompt,',
        'providerPayload: providerPayload,',
        'tokenMaterial: tokenMaterial,',
      ].join('\n')
    )

    const result = validateFutureAiSummarySafeResponseExposureSource(unsafeSketch)

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(
      expect.arrayContaining([
        'safetyChain.promptAssembly',
        'promptAssembly:',
        'auditPreparation:',
        'rawPrompt',
        'providerPayload',
        'tokenMaterial',
      ])
    )
  })

  it('returns only safe response scaffolding after audit-write and response-exposure approval', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE

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
      sourceDisplay: { sourceCards: [{ safeLabel: 'Safe request label' }] },
      staffReview: { displayLabel: 'Review required' },
    })
    expect(response.status).toBe(503)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('does not return response scaffolding when safe-response flags are set without audit approval', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] = AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE

    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: { from: vi.fn(), rpc: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_retrieval_unavailable',
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

  it('wires only the summary route to safe-response flags and keeps reply/required env untouched', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    for (const marker of [
      'AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG',
      'AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK',
      'sourceDisplay: safetyChain.responseScaffold.sourceDisplay',
      'staffReview: safetyChain.responseScaffold.staffReview',
    ]) {
      expect(summaryRoute).toContain(marker)
    }

    for (const flag of [
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
    ]) {
      expect(replyRoute).not.toContain(flag)
      expect(requiredEnv).not.toContain(flag)
    }

    expect(replyRoute).not.toContain('buildAiSummarySafetyChainAdapter')
  })

  it('documents the non-production acceptance criteria without claiming live exposure', () => {
    const acceptance = readFileSync(acceptancePath, 'utf8')
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'AI Summary Safe Response Exposure Acceptance Criteria',
      'Status: Disabled-by-default runtime safe-response exposure gate wired for `/api/ai/summary` in non-production only.',
      'Separate Approval Flags',
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
      'Do not enable these flags in production.',
      'Do not add these flags to required startup environment validation.',
      'The live `/api/ai/summary` route is changed only to support guarded safe-response scaffolding.',
      'The live `/api/ai/reply` route must remain untouched.',
      'The response may include only `sourceDisplay` and `staffReview` from `safetyChain.responseScaffold` after audit-write approval is present.',
      'The response must not include prompt assembly, audit preparation, future audit event envelopes, raw prompts, generated outputs, provider payloads, token material, internal note bodies, document contents, or private material policy details.',
      'Safe response exposure requires audit-write approval flags.',
      'No migrations are applied in this acceptance phase.',
      'Operational RLS is not changed in this acceptance phase.',
    ]) {
      expect(acceptance).toContain(required)
    }

    expect(plan).toContain(
      'Safe response exposure has a separate acceptance packet: `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`.'
    )
  })
})
