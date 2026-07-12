import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
  getAiSummarySafetyRuntimeGate,
} from './aiSummaryRuntimeGate'
import {
  AI_SUMMARY_REQUIRED_PRE_OPENAI_GATES,
  AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION,
  buildAiSummaryRuntimeScaffold,
} from './aiSummaryRuntimeScaffold'
import { validateFutureAiRouteRuntimeWiringSource } from './aiRouteRuntimeWiringPreflight'

const root = process.cwd()
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const requiredEnvPath = join(root, 'lib', 'server', 'requiredEnv.ts')
const planPath = join(root, 'docs', 'AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md')

function env(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return values as NodeJS.ProcessEnv
}

const approvedFutureSummaryGateSketch = `
import { getAiSummarySafetyRuntimeGate } from '@/lib/server/aiSummaryRuntimeGate'
import { buildAiSummaryRuntimeScaffold } from '@/lib/server/aiSummaryRuntimeScaffold'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { buildRequestSummaryRetrievalDto } from '@/lib/aiRequestSummaryRetrievalDto'
import { buildRequestSummarySourceDisplayDto } from '@/lib/aiSourceDisplayDto'
import { buildRequestSummaryAuditMetadataDto } from '@/lib/aiAuditMetadataDto'
import { buildAiStaffReviewStatusDto } from '@/lib/aiStaffReviewStatusDto'
import { buildAiFutureRetrievalSafetyContract } from '@/lib/aiFutureRetrievalSafetyContract'
import { buildAiSummaryPromptAssembly } from '@/lib/server/aiSummarySafetyChainAdapter'

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response
  const gate = getAiSummarySafetyRuntimeGate()
  const scaffold = buildAiSummaryRuntimeScaffold(gate)
  if (scaffold.selectedPath === 'legacy_staff_gated_summary_route') {
    return runLegacyStaffGatedSummaryRoute(request)
  }
  const body = await request.json()
  const activeParishContext = await resolveActiveStaffParishContext(staff.supabase, {
    requestedParishId: request.cookies.get('vinea_active_parish_id')?.value,
  })
  const activeParishId = activeParishContext.activeParishId
  const requestParishId = await loadRequestParishId(body.requestId)
  const retrievalResult = buildRequestSummaryRetrievalDto({
    scope: { activeParishId, requestParishId, authorizedParishIds: activeParishContext.authorizedParishIds },
  })
  const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
  const auditMetadataResult = buildRequestSummaryAuditMetadataDto(retrievalResult.dto, sourceDisplayResult.dto)
  const staffReviewStatusResult = buildAiStaffReviewStatusDto({
    status: 'review_required',
    auditMetadataDto: auditMetadataResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  const safety = buildAiFutureRetrievalSafetyContract({
    surface: 'staff_internal',
    activeParishId,
    requestParishId,
    authorizedParishIds: activeParishContext.authorizedParishIds,
    retrievalResult,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditMetadataResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!safety.ok) return NextResponse.json({ ok: false, error: safety.dto.genericPublicBlockedReason ?? 'ai_retrieval_unavailable' }, { status: 403 })
  const promptAssemblyResult = buildAiSummaryPromptAssembly({
    retrievalDto: retrievalResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditMetadataResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!promptAssemblyResult.ok) return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' }, { status: 503 })
  const response = await openai.responses.create({ model: 'gpt-5-mini', input: promptAssemblyResult.dto.prompt })
}
`

describe('AI summary runtime gate and scaffold', () => {
  it('keeps the summary safety chain disabled by default with legacy behavior selected', () => {
    const gate = getAiSummarySafetyRuntimeGate(env())
    const scaffold = buildAiSummaryRuntimeScaffold(gate)

    expect(gate).toEqual({
      enabled: false,
      reason: `${AI_SUMMARY_SAFETY_RUNTIME_FLAG} is not enabled.`,
      mode: 'legacy_summary_prompt',
      legacyFallback: true,
      route: '/api/ai/summary',
    })
    expect(scaffold).toEqual({
      version: AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/summary',
      selectedPath: 'legacy_staff_gated_summary_route',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: false,
      shouldCallOpenAiFromSafetyChain: false,
      requiredPreOpenAiGates: [],
      genericBlockedReason: 'ai_retrieval_unavailable',
      reason: `${AI_SUMMARY_SAFETY_RUNTIME_FLAG} is not enabled.`,
    })
  })

  it('requires exact flag and exact approval acknowledgement before selecting the safety chain', () => {
    expect(
      getAiSummarySafetyRuntimeGate(env({
        [AI_SUMMARY_SAFETY_RUNTIME_FLAG]: 'enabled',
        [AI_SUMMARY_SAFETY_RUNTIME_ACK]: AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
      }))
    ).toMatchObject({ enabled: false, mode: 'legacy_summary_prompt' })

    expect(
      getAiSummarySafetyRuntimeGate(env({
        [AI_SUMMARY_SAFETY_RUNTIME_FLAG]: AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
      }))
    ).toEqual({
      enabled: false,
      reason: `${AI_SUMMARY_SAFETY_RUNTIME_ACK} approval is missing.`,
      mode: 'legacy_summary_prompt',
      legacyFallback: true,
      route: '/api/ai/summary',
    })

    const gate = getAiSummarySafetyRuntimeGate(env({
      [AI_SUMMARY_SAFETY_RUNTIME_FLAG]: AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
      [AI_SUMMARY_SAFETY_RUNTIME_ACK]: AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
    }))
    const scaffold = buildAiSummaryRuntimeScaffold(gate)

    expect(scaffold).toEqual({
      version: AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/summary',
      selectedPath: 'permission_scoped_summary_safety_chain',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: true,
      shouldCallOpenAiFromSafetyChain: true,
      requiredPreOpenAiGates: AI_SUMMARY_REQUIRED_PRE_OPENAI_GATES,
      genericBlockedReason: 'ai_retrieval_unavailable',
      reason: null,
    })
  })

  it('keeps flags out of required boot checks, leaves reply untouched, and wires summary through the gate', () => {
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')

    for (const flag of [AI_SUMMARY_SAFETY_RUNTIME_FLAG, AI_SUMMARY_SAFETY_RUNTIME_ACK]) {
      expect(requiredEnv).not.toContain(flag)
      expect(replyRoute).not.toContain(flag)
    }

    expect(summaryRoute).toContain('getAiSummarySafetyRuntimeGate')
    expect(summaryRoute).toContain('buildAiSummaryRuntimeScaffold')
    expect(summaryRoute).toContain('buildAiSummarySafetyChainAdapter')
    expect(summaryRoute).toContain("scaffold.selectedPath === 'legacy_staff_gated_summary_route'")
    expect(summaryRoute).toContain('return await runLegacyStaffGatedSummaryRoute(body)')
    expect(summaryRoute).toContain('const safetyChain = await buildAiSummarySafetyChainAdapter')
    expect(summaryRoute).toContain('error: safetyChain.genericBlockedReason')
    expect(replyRoute).not.toContain('getAiSummarySafetyRuntimeGate')
    expect(replyRoute).not.toContain('buildAiSummaryRuntimeScaffold')
    expect(replyRoute).not.toContain('buildAiSummarySafetyChainAdapter')
  })

  it('keeps the live summary route staff-gated and gate-selected before any OpenAI path', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')

    const authIndex = summaryRoute.indexOf('const staff = await requireStaffFromRequest(request)')
    const bodyIndex = summaryRoute.indexOf('const parsedBody = await readBoundedJsonBody')
    const gateIndex = summaryRoute.indexOf('const gate = getAiSummarySafetyRuntimeGate()')
    const scaffoldIndex = summaryRoute.indexOf('const scaffold = buildAiSummaryRuntimeScaffold(gate)')
    const legacySelectionIndex = summaryRoute.indexOf("scaffold.selectedPath === 'legacy_staff_gated_summary_route'")
    const legacyRunIndex = summaryRoute.indexOf('return await runLegacyStaffGatedSummaryRoute(body)')
    const adapterIndex = summaryRoute.indexOf('const safetyChain = await buildAiSummarySafetyChainAdapter')
    const closedIndex = summaryRoute.indexOf('error: safetyChain.genericBlockedReason')
    const openAiIndex = summaryRoute.indexOf('openai.responses.create')

    expect(authIndex).toBeGreaterThanOrEqual(0)
    expect(bodyIndex).toBeGreaterThan(authIndex)
    expect(gateIndex).toBeGreaterThan(bodyIndex)
    expect(scaffoldIndex).toBeGreaterThan(gateIndex)
    expect(legacySelectionIndex).toBeGreaterThan(scaffoldIndex)
    expect(legacyRunIndex).toBeGreaterThan(legacySelectionIndex)
    expect(adapterIndex).toBeGreaterThan(legacyRunIndex)
    expect(openAiIndex).toBeGreaterThan(adapterIndex)
    expect(closedIndex).toBeGreaterThan(openAiIndex)
  })

  it('proves the approved future summary sketch keeps the gate, scaffold, and safety chain before OpenAI', () => {
    const result = validateFutureAiRouteRuntimeWiringSource('summary', approvedFutureSummaryGateSketch)

    expect(result.ok).toBe(true)
    expect(approvedFutureSummaryGateSketch).toContain('const gate = getAiSummarySafetyRuntimeGate()')
    expect(approvedFutureSummaryGateSketch).toContain('const scaffold = buildAiSummaryRuntimeScaffold(gate)')
    expect(approvedFutureSummaryGateSketch).toContain("scaffold.selectedPath === 'legacy_staff_gated_summary_route'")
    expect(approvedFutureSummaryGateSketch.indexOf('const scaffold = buildAiSummaryRuntimeScaffold')).toBeLessThan(
      approvedFutureSummaryGateSketch.indexOf('openai.responses.create')
    )
  })

  it('documents the disabled-by-default summary scaffold and non-goals', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Status: Disabled-by-default runtime gate, scaffold, non-production safety-chain adapter, DTO-backed prompt assembly, runtime audit metadata preparation, guarded audit-write approval, guarded source-display/staff-review response exposure, and guarded safety-chain OpenAI generation wired behind the enabled `/api/ai/summary` gate.',
      'The live `/api/ai/summary` route now imports `getAiSummarySafetyRuntimeGate` and `buildAiSummaryRuntimeScaffold`.',
      'The enabled safety-chain path now calls `buildAiSummarySafetyChainAdapter`, assembles a prompt only from safe DTO source references, prepares audit metadata, writes the safe audit event only when the separate audit-write approval flags are exact, returns source-display/staff-review response scaffolding only when the separate safe-response exposure flags are also exact, and calls OpenAI only when the separate safety-chain generation flags are also exact.',
      'The live `/api/ai/reply` route was not changed.',
      AI_SUMMARY_SAFETY_RUNTIME_FLAG,
      AI_SUMMARY_SAFETY_RUNTIME_ACK,
      AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
      AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
      'legacy_staff_gated_summary_route',
      'permission_scoped_summary_safety_chain',
      'authentication',
      'active parish scope',
      'object-level request scope',
      'family-portal exclusion',
      'source display',
      'audit metadata',
      'staff review status',
      'DTO-backed prompt assembly',
      'runtime audit metadata preparation',
      'source-display/staff-review response scaffold',
      'generic blocked errors',
      'Prompt assembly uses safe DTO labels, source reference ids, data classes, staff/family flags, and boundary text only.',
      'Prompt assembly does not include raw request notes, communication bodies, document contents, token material, signed URLs, hashes, provider payloads, or family portal data.',
      'Runtime audit metadata preparation produces a future `audit_events` envelope with `writeStatus: not_written`.',
      'Runtime audit writes use `writeAuditEvent` only after audit-write approval and must not call `.from(\'audit_events\').insert` directly in the route.',
      'Response scaffolding includes safe source-card labels, staff review status, and private-material policy only.',
      'Response scaffolding uses `clientExposure: not_returned_while_generation_disabled` and is returned only when the safe-response exposure approval flags and audit-write approval flags are exact.',
      'Response scaffolding records `promptIncluded: false`, `generatedOutputIncluded: false`, `providerPayloadIncluded: false`, and `tokenMaterialIncluded: false`.',
      '`buildAiSummaryPromptAssembly` runs after the safety contract and before any enabled-path OpenAI generation.',
      '`buildAiSummaryAuditMetadataPreparation` runs after prompt assembly and before any enabled-path OpenAI generation.',
      '`buildAiSummaryResponseScaffold` runs after audit metadata preparation and before any enabled-path OpenAI generation.',
      'Do not enable the flags in production.',
      'Do not call OpenAI from the enabled safety-chain adapter without the separate safety-chain generation approval flags.',
      'Do not wire `/api/ai/reply` in this phase.',
      'Do not return source-display or staff-review scaffolding without the separate safe response exposure approval packet.',
      'Do not expose raw prompts, generated outputs, provider payloads, token material, internal note bodies, or document contents.',
      'Do not apply migrations.',
      'Do not import or call `writeAuditEvent` from the enabled summary safety adapter; the guarded route owns the write.',
      'Do not change operational RLS.',
    ]) {
      expect(plan).toContain(required)
    }
  })
})
