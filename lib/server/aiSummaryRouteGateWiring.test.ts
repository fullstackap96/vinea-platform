import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { validateCurrentLegacyAiRouteBoundarySource } from './aiRouteRuntimeWiringPreflight'
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from './aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from './aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from './aiSummarySafeResponseExposureAcceptance'
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

import { openai } from '@/lib/openai'
import { buildAiSummarySafetyChainAdapter } from '@/lib/server/aiSummarySafetyChainAdapter'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { POST } from '../../app/api/ai/summary/route'

const root = process.cwd()
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const summaryAdapterPath = join(root, 'lib', 'server', 'aiSummarySafetyChainAdapter.ts')
const openAiCreateMock = vi.mocked(openai.responses.create)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const buildAiSummarySafetyChainAdapterMock = vi.mocked(buildAiSummarySafetyChainAdapter)

function expectBefore(source: string, earlier: string, later: string): void {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('AI summary route disabled runtime gate wiring', () => {
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

  it('preserves flag-off legacy behavior by calling OpenAI with the current summary prompt', async () => {
    requireStaffFromRequestMock.mockResolvedValue({ ok: true } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    openAiCreateMock.mockResolvedValue({ output_text: 'Legacy summary' } as Awaited<ReturnType<typeof openai.responses.create>>)

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({
          requestType: 'baptism',
          fullName: 'Maria Garcia',
          email: 'maria@example.test',
          phone: '555-0100',
          childName: 'Ana Garcia',
          preferredDates: 'Next month',
          notes: 'Please call after 3 PM.',
          status: 'new',
        }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({ summary: 'Legacy summary' })
    expect(response.status).toBe(200)
    expect(requireStaffFromRequestMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-mini',
        input: expect.stringContaining('You are helping Catholic parish staff review a baptism request.'),
      })
    )
    expect(openAiCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.stringContaining('Child Name: Ana Garcia'),
      })
    )
    expect(buildAiSummarySafetyChainAdapterMock).not.toHaveBeenCalled()
  })

  it('runs the enabled safety-chain adapter and still fails closed before OpenAI', async () => {
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: staffSupabase,
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    buildAiSummarySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      version: '2026-06-27-ai-summary-safety-chain-adapter-v1',
      genericBlockedReason: 'ai_retrieval_unavailable',
      internalBlockedReason: 'generation_disabled_until_runtime_openai_approval',
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
      requestId: 'request-1',
      sourceCardCount: 3,
      staffReviewStatus: 'review_required',
      promptAssembly: {
        dtoVersion: '2026-06-27-ai-summary-dto-backed-prompt-assembly-v1',
        runtimeState: 'dto_backed_prompt_assembly_only',
        prompt: 'Safe DTO-backed prompt assembly only.',
        target: {
          objectType: 'request',
          objectId: 'request-1',
          safeLabel: 'Baptism request for Ana Garcia',
        },
        activeParishId: 'parish-1',
        requestParishId: 'parish-1',
        sourceReferenceIds: ['request:request-1'],
        inputDataClasses: ['request_core'],
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
        modelOrProviderFamily: 'not_invoked',
      },
      auditPreparation: {
        dtoVersion: '2026-06-27-ai-summary-runtime-audit-metadata-preparation-v1',
        runtimeState: 'audit_metadata_preparation_only',
        writeStatus: 'not_written',
        writeBlockedUntil: 'runtime_audit_write_approval',
        futureAuditEvent: {
          table: 'audit_events',
          action: 'ai.summary.audit_metadata_prepared',
          parishId: 'parish-1',
          actorEmail: 'staff@example.test',
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
              dtoVersion: 'source-display-version',
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
        dtoVersion: '2026-06-27-ai-summary-source-review-response-scaffold-v1',
        runtimeState: 'source_display_staff_review_response_scaffold_only',
        clientExposure: 'not_returned_while_generation_disabled',
        failClosedResponse: {
          ok: false,
          error: 'ai_retrieval_unavailable',
          status: 503,
        },
        target: {
          objectType: 'request',
          objectId: 'request-1',
          safeLabel: 'Baptism request for Ana Garcia',
        },
        activeParishId: 'parish-1',
        sourceDisplay: {
          dtoVersion: 'source-display-version',
          sourceCardCount: 1,
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
          ],
        },
        staffReview: {
          dtoVersion: 'review-status-version',
          reviewStatus: 'review_required',
          displayLabel: 'Review required',
          staffGuidance: 'Staff must review generated text.',
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
          documentContentsIncluded: false,
        },
      },
    })

    const response = await POST(
      new Request('https://vinea.test/api/ai/summary', {
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
        }),
      }) as never
    )

    await expect(response.json()).resolves.toEqual({ ok: false, error: 'ai_retrieval_unavailable' })
    expect(response.status).toBe(503)
    expect(buildAiSummarySafetyChainAdapterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ requestId: 'request-1' }),
        staff: { email: 'staff@example.test', userId: 'user-1' },
        staffSupabase,
      })
    )
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('wires summary through the disabled-by-default gate while preserving the legacy OpenAI helper path', () => {
    const source = readFileSync(summaryRoutePath, 'utf8')

    for (const required of [
      'getAiSummarySafetyRuntimeGate',
      'buildAiSummaryRuntimeScaffold',
      'buildAiSummarySafetyChainAdapter',
      'runLegacyStaffGatedSummaryRoute',
      'buildLegacySummaryPrompt',
      "scaffold.selectedPath === 'legacy_staff_gated_summary_route'",
      'const safetyChain = await buildAiSummarySafetyChainAdapter',
      'error: safetyChain.genericBlockedReason',
      'openai.responses.create',
      "model: 'gpt-5-mini'",
    ]) {
      expect(source).toContain(required)
    }

    expectBefore(source, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(source, 'const parsedBody = await readBoundedJsonBody', 'const gate = getAiSummarySafetyRuntimeGate()')
    expectBefore(source, 'const gate = getAiSummarySafetyRuntimeGate()', 'const scaffold = buildAiSummaryRuntimeScaffold(gate)')
    expectBefore(
      source,
      'const scaffold = buildAiSummaryRuntimeScaffold(gate)',
      "scaffold.selectedPath === 'legacy_staff_gated_summary_route'"
    )
    expectBefore(source, "scaffold.selectedPath === 'legacy_staff_gated_summary_route'", 'return await runLegacyStaffGatedSummaryRoute(body)')
    expectBefore(
      source,
      'const safetyChain = await buildAiSummarySafetyChainAdapter',
      'openai.responses.create'
    )
    expectBefore(source, 'const safetyChain = await buildAiSummarySafetyChainAdapter', 'error: safetyChain.genericBlockedReason')
  })

  it('keeps the current route boundary legacy-staff-gated and not safety-DTO-wired yet', () => {
    const source = readFileSync(summaryRoutePath, 'utf8')
    const result = validateCurrentLegacyAiRouteBoundarySource('summary', source)

    expect(result).toMatchObject({
      ok: true,
      runtimeState: 'legacy_staff_gated_not_ai_safety_wired',
      authMarkersBeforeOpenAi: ['requireStaffFromRequest'],
      forbiddenRuntimeWiringMarkersPresent: [],
    })
  })

  it('keeps the enabled safety-chain adapter scoped, non-generative, and preflighted before approval', () => {
    const source = readFileSync(summaryAdapterPath, 'utf8')

    for (const required of [
      'resolveActiveStaffParishContext(',
      'requestedActiveParishId(input.request)',
      'requestIdFromBody(input.body)',
      'loadRequestAndParishioner',
      'buildRequestSummaryRetrievalDto(',
      'buildRequestSummarySourceDisplayDto(',
      'buildRequestSummaryAuditMetadataDto(',
      'buildAiStaffReviewStatusDto(',
      'buildAiFutureRetrievalSafetyContract(',
      'buildAiSummaryPromptAssembly(',
      'buildAiSummaryAuditMetadataPreparation(',
      'buildAiSummaryResponseScaffold(',
      'dto_backed_prompt_assembly_only',
      'audit_metadata_preparation_only',
      'source_display_staff_review_response_scaffold_only',
      'not_returned_while_generation_disabled',
      'runtime_audit_write_approval',
      'generation_disabled_until_runtime_openai_approval',
      'runtime_gate_must_not_run_in_production',
      'AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON',
    ]) {
      expect(source).toContain(required)
    }

    expect(source).not.toContain('openai.responses.create')
    expect(source).not.toContain('writeAuditEvent')
    expect(source).not.toContain(".from('audit_events').insert")
    expectBefore(source, 'const requestId = requestIdFromBody(input.body)', 'const activeParishContext = await resolveActiveStaffParishContext')
    expectBefore(source, 'const activeParishContext = await resolveActiveStaffParishContext', 'const loaded = await loadRequestAndParishioner')
    expectBefore(source, 'const loaded = await loadRequestAndParishioner', 'const retrievalResult = buildRequestSummaryRetrievalDto(')
    expectBefore(source, 'buildRequestSummaryRetrievalDto(', 'buildRequestSummarySourceDisplayDto(')
    expectBefore(source, 'buildRequestSummarySourceDisplayDto(', 'buildRequestSummaryAuditMetadataDto(')
    expectBefore(source, 'buildRequestSummaryAuditMetadataDto(', 'buildAiStaffReviewStatusDto(')
    expectBefore(source, 'buildAiStaffReviewStatusDto(', 'buildAiFutureRetrievalSafetyContract(')
    expectBefore(source, 'buildAiFutureRetrievalSafetyContract(', 'const promptAssemblyResult = buildAiSummaryPromptAssembly')
    expectBefore(source, 'const promptAssemblyResult = buildAiSummaryPromptAssembly', 'const auditPreparationResult = buildAiSummaryAuditMetadataPreparation')
    expectBefore(source, 'const auditPreparationResult = buildAiSummaryAuditMetadataPreparation', 'const responseScaffoldResult = buildAiSummaryResponseScaffold')
    expectBefore(source, 'const responseScaffoldResult = buildAiSummaryResponseScaffold', 'promptAssembly: promptAssemblyResult.dto')
    expectBefore(source, 'const responseScaffoldResult = buildAiSummaryResponseScaffold', 'auditPreparation: auditPreparationResult.dto')
    expectBefore(source, 'const responseScaffoldResult = buildAiSummaryResponseScaffold', 'responseScaffold: responseScaffoldResult.dto')
  })

  it('does not wire the AI reply route through the summary gate', () => {
    const replySource = readFileSync(replyRoutePath, 'utf8')

    expect(replySource).not.toContain('getAiSummarySafetyRuntimeGate')
    expect(replySource).not.toContain('buildAiSummaryRuntimeScaffold')
    expect(replySource).not.toContain('legacy_staff_gated_summary_route')
    expect(replySource).not.toContain('permission_scoped_summary_safety_chain')
  })
})
