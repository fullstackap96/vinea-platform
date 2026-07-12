import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
  validateFutureAiSummaryAuditWriteSource,
} from './aiSummaryAuditWriteApproval'
import type { AiSummaryAuditMetadataPreparationDto } from './aiSummarySafetyChainAdapter'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from './aiSummaryRuntimeGate'

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
const acceptancePath = join(root, 'docs', 'AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md')
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

const approvedFutureAuditWriteSketch = `
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from '@/lib/server/aiSummaryAuditWriteApproval'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { validateAiSummaryAuditEventForSafeWrite } from '@/lib/aiSummaryAuditEventSafety'
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
  if (
    auditWriteGate &&
    safetyChain.ok &&
    safetyChain.auditPreparation.writeStatus === 'not_written'
  ) {
    const safeAuditEvent = validateAiSummaryAuditEventForSafeWrite(safetyChain.auditPreparation.futureAuditEvent)
    if (safeAuditEvent.ok) {
      await writeAuditEvent({
        parishId: safeAuditEvent.dto.event.parishId,
        actorEmail: safeAuditEvent.dto.event.actorEmail,
        action: safeAuditEvent.dto.event.action,
        targetType: safeAuditEvent.dto.event.targetType,
        targetId: safeAuditEvent.dto.event.targetId,
        metadata: safeAuditEvent.dto.event.metadata,
      })
    }
  }
  return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' }, { status: 503 })
}
`

describe('AI summary audit write approval gates', () => {
  beforeEach(() => {
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_FLAG]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_ACK]
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
  })

  it('accepts only future sketches with base runtime approval plus a separate audit-write approval', () => {
    expect(validateFutureAiSummaryAuditWriteSource(approvedFutureAuditWriteSketch)).toEqual({
      ok: true,
      missingRequiredMarkers: [],
      forbiddenMarkersPresent: [],
      orderingFailures: [],
    })
  })

  it('rejects future sketches that skip the separate audit-write acknowledgement', () => {
    const unsafeSketch = approvedFutureAuditWriteSketch.replace(
      'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
      'true'
    )

    expect(validateFutureAiSummaryAuditWriteSource(unsafeSketch)).toMatchObject({
      ok: false,
      missingRequiredMarkers: [
        'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
      ],
    })
  })

  it('rejects future sketches that write raw prompt, generated output, provider, or token material', () => {
    const unsafeSketch = approvedFutureAuditWriteSketch.replace(
      'metadata: safeAuditEvent.dto.event.metadata,',
      [
        'metadata: safeAuditEvent.dto.event.metadata,',
        'promptAssembly: safetyChain.promptAssembly,',
        'rawPrompt: safetyChain.promptAssembly.prompt,',
        'generatedOutput: generatedOutput,',
        'providerPayload: providerPayload,',
        'tokenMaterial: tokenMaterial,',
      ].join('\n')
    )

    const result = validateFutureAiSummaryAuditWriteSource(unsafeSketch)

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(
      expect.arrayContaining([
        'safetyChain.promptAssembly.prompt',
        'promptAssembly:',
        'rawPrompt',
        'generatedOutput',
        'providerPayload',
        'tokenMaterial',
      ])
    )
  })

  it('writes approved safe audit metadata and still fails closed before OpenAI', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE

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
    expect(writeAuditEventMock).toHaveBeenCalledWith({
      parishId: 'parish-1',
      actorEmail: 'staff@example.test',
      action: 'ai.summary.audit_metadata_prepared',
      targetType: 'request',
      targetId: 'request-1',
      metadata: safeSummaryFutureAuditEvent().metadata,
    })
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('does not write audit metadata when the prepared event fails safe validation', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] = AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE
    process.env[AI_SUMMARY_AUDIT_WRITE_ACK] = AI_SUMMARY_AUDIT_WRITE_ACK_VALUE

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
        futureAuditEvent: safeSummaryFutureAuditEvent({
          metadata: { rawPromptStored: true },
        }),
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

  it('wires only the summary route to audit-write flags and keeps reply/required env untouched', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    for (const marker of [
      'AI_SUMMARY_AUDIT_WRITE_FLAG',
      'AI_SUMMARY_AUDIT_WRITE_ACK',
      'validateAiSummaryAuditEventForSafeWrite',
      'writeAuditEvent',
    ]) {
      expect(summaryRoute).toContain(marker)
    }

    expect(summaryRoute).not.toContain(".from('audit_events').insert")

    for (const marker of [
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      'writeAuditEvent',
      ".from('audit_events').insert",
    ]) {
      expect(replyRoute).not.toContain(marker)
    }

    for (const flag of [AI_SUMMARY_AUDIT_WRITE_FLAG, AI_SUMMARY_AUDIT_WRITE_ACK]) {
      expect(requiredEnv).not.toContain(flag)
    }
  })

  it('documents the non-production audit-write runtime gate without claiming generation', () => {
    const acceptance = readFileSync(acceptancePath, 'utf8')
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'AI Summary Audit Write Approval Plan',
      'Status: Disabled-by-default runtime audit-write gate wired for `/api/ai/summary` in non-production only.',
      'Separate Approval Flags',
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
      AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
      'Do not enable these flags in production.',
      'Do not add these flags to required startup environment validation.',
      'The live `/api/ai/summary` route is changed only to support the guarded audit-write path.',
      'The future write may use only `safetyChain.auditPreparation.futureAuditEvent`.',
      'The future write must keep `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false`.',
      'The future write must not store raw prompts, generated outputs, provider payloads, token material, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.',
      'The route must still return `{ ok: false, error: \'ai_retrieval_unavailable\' }` with HTTP `503` until OpenAI generation is separately approved.',
      'Audit events are written only when the base safety runtime gate and the separate audit-write approval flags are all exact.',
      'No migrations are applied in this approval-plan phase.',
      'Operational RLS is not changed in this approval-plan phase.',
    ]) {
      expect(acceptance).toContain(required)
    }

    expect(plan).toContain(
      'Runtime AI audit-event writes have a separate approval packet: `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`.'
    )
  })
})
