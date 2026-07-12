import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

import { buildAiAuditMetadataDto } from '@/lib/aiAuditMetadataDto'
import { buildAiFutureRetrievalSafetyContract } from '@/lib/aiFutureRetrievalSafetyContract'
import {
  buildAiReplyRetrievalDto,
  type AiReplyDraftIntent,
  type AiReplyRecipientKind,
  type AiReplyRetrievalDto,
  type AiReplyRetrievalInput,
} from '@/lib/aiReplyRetrievalDto'
import {
  AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
  buildAiReplyAuditMetadataPreparation,
  buildAiReplyPromptAssembly,
  buildAiReplyResponseScaffold,
  type AiReplyAuditMetadataPreparationDto,
  type AiReplyPromptAssemblyDto,
  type AiReplyResponseScaffoldDto,
} from '@/lib/aiReplySafetyChainDtos'
import { buildAiSourceDisplayDto, type AiSourceDisplayDto } from '@/lib/aiSourceDisplayDto'
import { buildAiStaffReviewStatusDto } from '@/lib/aiStaffReviewStatusDto'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requestDetailHref } from '@/lib/dashboardRequestNavigation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type MinimalStaffSupabaseClient = Pick<SupabaseClient, 'from' | 'rpc'>
type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

export const AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION =
  '2026-07-07-ai-reply-safety-chain-adapter-v1'

export type AiReplySafetyChainAdapterStaff = {
  readonly email: string
  readonly userId?: string | null
}

export type AiReplySafetyChainAdapterInput = {
  readonly request: NextRequest
  readonly body: Record<string, unknown>
  readonly staff: AiReplySafetyChainAdapterStaff
  readonly staffSupabase: MinimalStaffSupabaseClient
  readonly admin?: AdminClient
  readonly env?: NodeJS.ProcessEnv
}

export type AiReplySafetyChainAdapterBlocked = {
  readonly ok: false
  readonly version: typeof AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION
  readonly genericBlockedReason: typeof AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON
  readonly internalBlockedReason: string
}

export type AiReplySafetyChainAdapterReady = {
  readonly ok: true
  readonly version: typeof AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION
  readonly genericBlockedReason: typeof AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON
  readonly internalBlockedReason: 'generation_disabled_until_runtime_openai_approval'
  readonly activeParishId: string
  readonly requestParishId: string
  readonly requestId: string
  readonly draftId: string
  readonly sourceCardCount: number
  readonly staffReviewStatus: 'review_required'
  readonly promptAssembly: AiReplyPromptAssemblyDto
  readonly auditPreparation: AiReplyAuditMetadataPreparationDto
  readonly responseScaffold: AiReplyResponseScaffoldDto
}

export type AiReplySafetyChainAdapterResult =
  | AiReplySafetyChainAdapterReady
  | AiReplySafetyChainAdapterBlocked

type RequestRow = {
  readonly id?: unknown
  readonly request_type?: unknown
  readonly child_name?: unknown
  readonly created_at?: unknown
  readonly parishioner_id?: unknown
  readonly status?: unknown
  readonly notes?: unknown
}

type ParishionerRow = {
  readonly parish_id?: unknown
  readonly full_name?: unknown
  readonly email?: unknown
}

type QueryResponse<T> = {
  readonly data: T | null
  readonly error: { readonly message?: string } | null
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim()
}

function isProductionRuntime(env: NodeJS.ProcessEnv): boolean {
  return (
    normalizeText(env.VERCEL_ENV).toLowerCase() === 'production' ||
    normalizeText(env.VINEA_ENV).toLowerCase() === 'production'
  )
}

function block(internalBlockedReason: string): AiReplySafetyChainAdapterBlocked {
  return {
    ok: false,
    version: AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION,
    genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
    internalBlockedReason,
  }
}

function requestedActiveParishId(request: NextRequest): string | null {
  return normalizeText(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value) || null
}

function requestIdFromBody(body: Record<string, unknown>): string | null {
  return normalizeText(body.requestId ?? body.id) || null
}

function normalizeRequestType(
  value: unknown
): AiReplyRetrievalInput['request']['requestType'] {
  const requestType = normalizeText(value)
  if (
    requestType === 'baptism' ||
    requestType === 'wedding' ||
    requestType === 'funeral' ||
    requestType === 'ocia' ||
    requestType === 'join_parish'
  ) {
    return requestType
  }

  return 'other'
}

function draftIntentFromBody(body: Record<string, unknown>): AiReplyDraftIntent {
  const intent = normalizeText(body.intent).toLowerCase()
  if (intent === 'followup' || intent === 'follow_up') return 'follow_up'
  return 'initial_reply'
}

function recipientKindFromBody(body: Record<string, unknown>): AiReplyRecipientKind {
  const recipientKind = normalizeText(body.recipientKind).toLowerCase()
  if (recipientKind === 'parishioner' || recipientKind === 'other_contact') {
    return recipientKind
  }
  return 'family'
}

function draftIdFromBody(body: Record<string, unknown>, requestId: string): string {
  const supplied = normalizeText(body.draftId)
  if (supplied) return supplied
  return `reply-draft:${requestId}:${draftIntentFromBody(body)}`
}

function safeRequestTitle(requestRow: RequestRow, parishioner: ParishionerRow): string {
  const requestType = normalizeRequestType(requestRow.request_type)
  const contactName = normalizeText(parishioner.full_name)
  const childName = normalizeText(requestRow.child_name)

  if (requestType === 'baptism' && childName) return `Baptism request for ${childName}`
  if (contactName) return `${requestType.replace('_', ' ')} request for ${contactName}`
  return `${requestType.replace('_', ' ')} request`
}

function safeDraftLabel(input: {
  readonly body: Record<string, unknown>
  readonly requestRow: RequestRow
  readonly parishioner: ParishionerRow
}): string {
  const supplied = normalizeText(input.body.draftLabel ?? input.body.safeDraftLabel)
  if (supplied) return supplied

  const intent = draftIntentFromBody(input.body)
  const title = safeRequestTitle(input.requestRow, input.parishioner)
  return intent === 'follow_up' ? `Follow-up draft for ${title}` : `Initial reply draft for ${title}`
}

function buildSources(input: {
  readonly requestRow: RequestRow
  readonly parishioner: ParishionerRow
  readonly requestId: string
}): AiReplyRetrievalInput['sources'] {
  const requestType = normalizeRequestType(input.requestRow.request_type)
  const requestSourcePath = requestDetailHref(input.requestId)
  const sources: AiReplyRetrievalInput['sources'][number][] = [
    {
      id: input.requestId,
      type: 'request',
      dataClass: 'request_core',
      label: safeRequestTitle(input.requestRow, input.parishioner),
      timestamp: normalizeText(input.requestRow.created_at) || null,
      staffOnly: false,
      familyFacingSafe: true,
      sacramentalCanonicalRestricted: requestType === 'ocia',
      sourcePath: requestSourcePath,
    },
  ]

  const contactName = normalizeText(input.parishioner.full_name)
  const contactEmail = normalizeText(input.parishioner.email)
  if (contactName || contactEmail) {
    sources.push({
      id: `${input.requestId}:contact`,
      type: 'person',
      dataClass: 'request_contact',
      label: `Request contact: ${contactName || 'contact on file'}`,
      timestamp: null,
      staffOnly: false,
      familyFacingSafe: true,
      sacramentalCanonicalRestricted: false,
      sourcePath: requestSourcePath,
    })
  }

  const status = normalizeText(input.requestRow.status)
  if (status) {
    sources.push({
      id: `${input.requestId}:status`,
      type: 'request',
      dataClass: 'request_status_assignment_followup',
      label: `Request status: ${status}`,
      timestamp: null,
      staffOnly: true,
      familyFacingSafe: false,
      sacramentalCanonicalRestricted: false,
      sourcePath: requestSourcePath,
    })
  }

  if (normalizeText(input.requestRow.notes)) {
    sources.push({
      id: `${input.requestId}:staff-notes`,
      type: 'staff_note',
      dataClass: 'request_notes_staff_only',
      label: 'Staff request notes on file',
      timestamp: null,
      staffOnly: true,
      familyFacingSafe: false,
      sacramentalCanonicalRestricted: false,
      sourcePath: requestSourcePath,
    })
  }

  return sources
}

async function loadRequestAndParishioner(
  admin: AdminClient,
  input: { readonly requestId: string; readonly activeParishId: string }
) {
  const requestResponse = (await admin
    .from('requests')
    .select('id, request_type, child_name, created_at, parishioner_id, status, notes')
    .eq('id', input.requestId)
    .maybeSingle()) as QueryResponse<RequestRow>

  if (requestResponse.error) {
    return { ok: false as const, blockedReason: 'reply_request_lookup_failed' }
  }

  const requestRow = requestResponse.data
  const parishionerId = normalizeText(requestRow?.parishioner_id)
  if (!requestRow?.id || !parishionerId) {
    return { ok: false as const, blockedReason: 'reply_request_not_found_or_missing_parishioner' }
  }

  const parishionerResponse = (await admin
    .from('parishioners')
    .select('parish_id, full_name, email')
    .eq('id', parishionerId)
    .eq('parish_id', input.activeParishId)
    .maybeSingle()) as QueryResponse<ParishionerRow>

  if (parishionerResponse.error) {
    return { ok: false as const, blockedReason: 'reply_request_parishioner_lookup_failed' }
  }

  const parishioner = parishionerResponse.data
  const requestParishId = normalizeText(parishioner?.parish_id)
  if (!parishioner || !requestParishId) {
    return { ok: false as const, blockedReason: 'reply_request_not_found_in_active_parish_scope' }
  }

  return {
    ok: true as const,
    requestRow,
    parishioner,
    requestParishId,
  }
}

function buildReplySourceDisplayDto(retrievalDto: AiReplyRetrievalDto) {
  return buildAiSourceDisplayDto({
    featureId: 'email_draft',
    target: {
      objectType: 'communication_draft',
      objectId: retrievalDto.target.objectId,
      safeLabel: retrievalDto.target.safeLabel,
    },
    activeParishId: retrievalDto.retrievalScope.activeParishId,
    sources: retrievalDto.sourceReferences.map((source) => ({
      id: source.id,
      type: source.type,
      dataClass: source.dataClass,
      label: source.safeLabel,
      timestamp: source.timestamp,
      parishScope: source.parishScope,
      staffOnly: source.staffOnly,
      familyFacingSafe: source.familyFacingSafe,
      sacramentalCanonicalRestricted: source.sacramentalCanonicalRestricted,
      permissionCheckedSourcePath: source.permissionCheckedSourcePath,
    })),
  })
}

function buildReplyAuditMetadataDto(
  retrievalDto: Parameters<typeof buildReplySourceDisplayDto>[0],
  sourceDisplayDto: AiSourceDisplayDto
) {
  return buildAiAuditMetadataDto({
    featureId: 'email_draft',
    staff: {
      userId: retrievalDto.retrievalScope.staffUserId,
      email: retrievalDto.retrievalScope.staffEmail,
    },
    parish: {
      parishId: retrievalDto.retrievalScope.requestParishId,
      activeParishId: retrievalDto.retrievalScope.activeParishId,
    },
    target: {
      objectType: 'communication_draft',
      objectId: retrievalDto.target.objectId,
    },
    inputDataClasses: retrievalDto.auditMetadataTemplate.input_data_classes,
    safeSourceReferences: retrievalDto.auditMetadataTemplate.safe_source_references,
    outputDestination: 'draft_only',
    staffDisposition: 'pending_review',
    modelOrProviderFamily: 'not_invoked',
    sourceDisplayDto,
  })
}

/**
 * Builds the prepared AI safety DTO chain for `/api/ai/reply`.
 *
 * This adapter is intentionally non-generative. Even when every scope check
 * passes, the route still fails closed before OpenAI until separate approval
 * enables audit writes, safe response exposure, and generation.
 */
export async function buildAiReplySafetyChainAdapter(
  input: AiReplySafetyChainAdapterInput
): Promise<AiReplySafetyChainAdapterResult> {
  if (isProductionRuntime(input.env ?? process.env)) {
    return block('runtime_gate_must_not_run_in_production')
  }

  const requestId = requestIdFromBody(input.body)
  if (!requestId) {
    return block('missing_request_id_for_reply_object_scope')
  }

  const requestedParishId = requestedActiveParishId(input.request)
  const activeParishContext = await resolveActiveStaffParishContext(input.staffSupabase, {
    requestedParishId,
  })

  if (!activeParishContext.ok) {
    return block('active_parish_scope_unavailable')
  }
  if (requestedParishId && activeParishContext.source !== 'membership') {
    return block('active_parish_cookie_requires_membership_context')
  }
  if (requestedParishId && activeParishContext.ignoredRequestedParishReason) {
    return block('active_parish_cookie_not_authorized')
  }

  const loaded = await loadRequestAndParishioner(input.admin ?? createSupabaseServiceRoleClient(), {
    requestId,
    activeParishId: activeParishContext.activeParishId,
  })
  if (!loaded.ok) {
    return block(loaded.blockedReason)
  }

  const retrievalResult = buildAiReplyRetrievalDto({
    staff: input.staff,
    scope: {
      activeParishId: activeParishContext.activeParishId,
      requestParishId: loaded.requestParishId,
      authorizedParishIds: activeParishContext.parishIds,
    },
    request: {
      id: requestId,
      requestType: normalizeRequestType(loaded.requestRow.request_type),
      safeTitle: safeRequestTitle(loaded.requestRow, loaded.parishioner),
      createdAt: normalizeText(loaded.requestRow.created_at) || null,
    },
    draft: {
      id: draftIdFromBody(input.body, requestId),
      intent: draftIntentFromBody(input.body),
      recipientKind: recipientKindFromBody(input.body),
      safeLabel: safeDraftLabel({
        body: input.body,
        requestRow: loaded.requestRow,
        parishioner: loaded.parishioner,
      }),
    },
    sources: buildSources({
      requestRow: loaded.requestRow,
      parishioner: loaded.parishioner,
      requestId,
    }),
  })

  if (!retrievalResult.ok) {
    return block(retrievalResult.blockedReason)
  }

  const sourceDisplayResult = buildReplySourceDisplayDto(retrievalResult.dto)
  if (!sourceDisplayResult.ok) {
    return block(sourceDisplayResult.blockedReason)
  }

  const auditMetadataResult = buildReplyAuditMetadataDto(
    retrievalResult.dto,
    sourceDisplayResult.dto
  )
  if (!auditMetadataResult.ok) {
    return block(auditMetadataResult.blockedReason)
  }

  const staffReviewStatusResult = buildAiStaffReviewStatusDto({
    status: 'review_required',
    auditMetadataDto: auditMetadataResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  if (!staffReviewStatusResult.ok) {
    return block(staffReviewStatusResult.blockedReason)
  }

  const safety = buildAiFutureRetrievalSafetyContract({
    surface: 'staff_internal',
    activeParishId: activeParishContext.activeParishId,
    requestParishId: loaded.requestParishId,
    authorizedParishIds: activeParishContext.parishIds,
    retrievalResult,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditMetadataResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!safety.ok) {
    return block(safety.dto.internalBlockedReason ?? safety.dto.genericPublicBlockedReason ?? 'safety_contract_blocked')
  }

  const promptAssemblyResult = buildAiReplyPromptAssembly({
    retrievalDto: retrievalResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
    auditMetadataDto: auditMetadataResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!promptAssemblyResult.ok) {
    return block(promptAssemblyResult.blockedReason)
  }

  const auditPreparationResult = buildAiReplyAuditMetadataPreparation({
    auditMetadataDto: auditMetadataResult.dto,
    promptAssemblyDto: promptAssemblyResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
  })
  if (!auditPreparationResult.ok) {
    return block(auditPreparationResult.blockedReason)
  }

  const responseScaffoldResult = buildAiReplyResponseScaffold({
    sourceDisplayDto: sourceDisplayResult.dto,
    staffReviewStatusDto: staffReviewStatusResult.dto,
    auditPreparationDto: auditPreparationResult.dto,
  })
  if (!responseScaffoldResult.ok) {
    return block(responseScaffoldResult.blockedReason)
  }

  return {
    ok: true,
    version: AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION,
    genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
    internalBlockedReason: 'generation_disabled_until_runtime_openai_approval',
    activeParishId: activeParishContext.activeParishId,
    requestParishId: loaded.requestParishId,
    requestId,
    draftId: retrievalResult.dto.target.objectId,
    sourceCardCount: sourceDisplayResult.dto.sourceCards.length,
    staffReviewStatus: 'review_required',
    promptAssembly: promptAssemblyResult.dto,
    auditPreparation: auditPreparationResult.dto,
    responseScaffold: responseScaffoldResult.dto,
  }
}

export const aiReplySafetyChainAdapterTestInternals = {
  buildSources,
  draftIdFromBody,
  draftIntentFromBody,
  isProductionRuntime,
  normalizeRequestType,
  recipientKindFromBody,
  requestIdFromBody,
  safeDraftLabel,
}
