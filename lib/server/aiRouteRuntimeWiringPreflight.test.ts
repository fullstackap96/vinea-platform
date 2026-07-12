import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  validateCurrentLegacyAiRouteBoundarySource,
  validateFutureAiRouteRuntimeWiringSource,
} from './aiRouteRuntimeWiringPreflight'

const root = process.cwd()
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const planPath = join(root, 'docs', 'AI_RUNTIME_ROUTE_WIRING_PLAN_20260627.md')

const approvedFutureSummaryWiringSketch = `
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

const approvedFutureReplyWiringSketch = `
import { authorizeStaffUser } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { buildAiReplyRetrievalDto } from '@/lib/aiReplyRetrievalDto'
import { buildAiSourceDisplayDto } from '@/lib/aiSourceDisplayDto'
import { buildAiAuditMetadataDto } from '@/lib/aiAuditMetadataDto'
import { buildAiStaffReviewStatusDto } from '@/lib/aiStaffReviewStatusDto'
import { buildAiFutureRetrievalSafetyContract } from '@/lib/aiFutureRetrievalSafetyContract'
import { buildAiReplyPromptAssembly } from '@/lib/aiReplySafetyChainDtos'

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  const staff = await authorizeStaffUser(user)
  if (!staff.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 })
  const body = await request.json()
  const activeParishContext = await resolveActiveStaffParishContext(supabase, {
    requestedParishId: request.cookies.get('vinea_active_parish_id')?.value,
  })
  const activeParishId = activeParishContext.activeParishId
  const requestParishId = await loadRequestParishId(body.requestId)
  const retrievalResult = buildAiReplyRetrievalDto({
    scope: { activeParishId, requestParishId, authorizedParishIds: activeParishContext.authorizedParishIds },
    draft: { id: body.draftId, intent: 'follow_up', recipientKind: 'family' },
  })
  const sourceDisplayResult = buildAiSourceDisplayDto({
    featureId: 'email_draft',
    target: { objectType: 'communication_draft', objectId: retrievalResult.dto.target.objectId, safeLabel: retrievalResult.dto.target.safeLabel },
  })
  const auditMetadataResult = buildAiAuditMetadataDto({
    featureId: 'email_draft',
    target: { objectType: 'communication_draft', objectId: retrievalResult.dto.target.objectId },
    parish: { parishId: requestParishId, activeParishId },
    inputDataClasses: retrievalResult.dto.auditMetadataTemplate.input_data_classes,
    safeSourceReferences: retrievalResult.dto.auditMetadataTemplate.safe_source_references,
    outputDestination: 'draft_only',
    staffDisposition: 'pending_review',
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  const staffReviewStatusResult = buildAiStaffReviewStatusDto({
    status: 'draft',
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
  const promptAssemblyResult = buildAiReplyPromptAssembly({
    retrievalDto: retrievalResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditMetadataResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!promptAssemblyResult.ok) return NextResponse.json({ ok: false, error: 'ai_reply_unavailable' }, { status: 503 })
  const aiResponse = await openai.responses.create({ model: 'gpt-5-mini', input: promptAssemblyResult.dto.prompt })
}
`

describe('AI route runtime wiring preflight', () => {
  it('confirms current live AI routes remain staff-gated legacy routes before OpenAI calls', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')

    const summaryResult = validateCurrentLegacyAiRouteBoundarySource('summary', summaryRoute)
    const replyResult = validateCurrentLegacyAiRouteBoundarySource('reply', replyRoute)

    expect(summaryResult).toMatchObject({
      ok: true,
      runtimeState: 'legacy_staff_gated_not_ai_safety_wired',
      authMarkersBeforeOpenAi: ['requireStaffFromRequest'],
      forbiddenRuntimeWiringMarkersPresent: [],
    })
    expect(replyResult).toMatchObject({
      ok: true,
      runtimeState: 'legacy_staff_gated_not_ai_safety_wired',
      authMarkersBeforeOpenAi: ['supabase.auth.getUser', 'authorizeStaffUser'],
      forbiddenRuntimeWiringMarkersPresent: [],
    })
  })

  it('accepts future summary wiring only when every safety gate appears before OpenAI', () => {
    const result = validateFutureAiRouteRuntimeWiringSource('summary', approvedFutureSummaryWiringSketch)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.gates.map((gate) => gate.id)).toEqual([
      'authentication',
      'active_parish_scope',
      'object_level_request_scope',
      'family_portal_exclusion',
      'source_display',
      'audit_metadata',
      'staff_review_status',
      'prompt_assembly',
      'generic_blocked_errors',
    ])
    expect(result.gates.every((gate) => gate.ok && gate.markerIndex < result.firstOpenAiCallIndex)).toBe(true)
  })

  it('accepts future reply wiring only when every safety gate appears before OpenAI', () => {
    const result = validateFutureAiRouteRuntimeWiringSource('reply', approvedFutureReplyWiringSketch)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.gates.every((gate) => gate.ok && gate.markerIndex < result.firstOpenAiCallIndex)).toBe(true)
  })

  it('rejects future wiring that includes only partial route-specific marker sets before OpenAI', () => {
    const result = validateFutureAiRouteRuntimeWiringSource(
      'summary',
      `
      const staff = await requireStaffFromRequest(request)
      const activeParishContext = await resolveActiveStaffParishContext(staff.supabase)
      const retrievalResult = buildRequestSummaryRetrievalDto({})
      const safety = buildAiFutureRetrievalSafetyContract({})
      const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
      const auditMetadataResult = buildRequestSummaryAuditMetadataDto(retrievalResult.dto, sourceDisplayResult.dto)
      const staffReviewStatusResult = buildAiStaffReviewStatusDto({})
      const promptAssemblyResult = buildAiSummaryPromptAssembly({})
      return NextResponse.json({ ok: false, error: 'ai_retrieval_unavailable' })
      const response = await openai.responses.create({ model: 'gpt-5-mini', input: promptAssemblyResult.dto.prompt })
      `
    )

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('active_parish_scope'),
        expect.stringContaining('object_level_request_scope'),
        expect.stringContaining('family_portal_exclusion'),
        expect.stringContaining('generic_blocked_errors'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all markers from one summary marker set')
  })

  it('rejects future wiring when OpenAI is called before source, audit, and review safeguards', () => {
    const unsafe = approvedFutureSummaryWiringSketch.replace(
      "const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)",
      "const response = await openai.responses.create({ model: 'gpt-5-mini', input: prompt })\n  const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)"
    )

    const result = validateFutureAiRouteRuntimeWiringSource('summary', unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('source_display must appear before openai.responses.create'),
        expect.stringContaining('audit_metadata must appear before openai.responses.create'),
        expect.stringContaining('staff_review_status must appear before openai.responses.create'),
      ])
    )
  })

  it('rejects future wiring when blocked errors are not generic before OpenAI', () => {
    const unsafe = approvedFutureReplyWiringSketch
      .replace(
        "safety.dto.genericPublicBlockedReason ?? 'ai_retrieval_unavailable'",
        "'request_parish_scope_failed_with_internal_detail'"
      )
      .replace(
        "'ai_reply_unavailable'",
        "'reply_prompt_assembly_failed_with_internal_detail'"
      )

    const result = validateFutureAiRouteRuntimeWiringSource('reply', unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('generic_blocked_errors must appear before openai.responses.create')])
    )
  })

  it('documents the plan-only status, insertion order, and route preflight gates', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Status: Runtime wiring plan plus source preflight record.',
      'The live `/api/ai/summary` route is now behind a disabled-by-default gate and calls a fail-closed safety-chain adapter only when the gate is explicitly enabled.',
      'The live `/api/ai/reply` route now has a disabled-by-default fail-closed gate scaffold',
      'Do not call OpenAI until all preflight gates pass.',
      'Current route state: `SUMMARY ROUTE GATED WITH FAIL-CLOSED ADAPTER, REPLY ROUTE DISABLED GATE SCAFFOLD WITH LEGACY STAFF-GATED FALLBACK`',
      'Source-Level Preflight Tests',
      'complete route-specific marker set',
      'A single partial marker is not enough',
      'authentication',
      'active parish scope',
      'object-level request scope',
      'family-portal exclusion',
      'source display',
      'audit metadata',
      'staff review status',
      'prompt assembly',
      'generic blocked errors',
      'openai.responses.create',
      'lib/server/aiRouteRuntimeWiringPreflight.test.ts',
    ]) {
      expect(plan).toContain(required)
    }
  })
})
