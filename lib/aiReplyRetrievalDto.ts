import {
  AI_AUDIT_METADATA_REQUIREMENTS,
  AI_DATA_CLASS_POLICIES,
  AI_FEATURE_REGISTRY,
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  type AiDataClassId,
} from './aiSafetyRegistry'

export const AI_REPLY_RETRIEVAL_DTO_VERSION = '2026-07-07-ai-reply-retrieval-non-runtime-v1'

export type AiReplyRetrievalSourceType =
  | 'request'
  | 'workflow_step'
  | 'staff_note'
  | 'communication'
  | 'person'
  | 'household'
  | 'document_metadata'

export type AiReplyDraftIntent = 'initial_reply' | 'follow_up'

export type AiReplyRecipientKind = 'family' | 'parishioner' | 'other_contact'

export type AiReplyRetrievalSourceInput = {
  readonly id: string
  readonly type: AiReplyRetrievalSourceType
  readonly dataClass: AiDataClassId
  readonly label: string
  readonly timestamp?: string | null
  readonly staffOnly?: boolean
  readonly familyFacingSafe?: boolean
  readonly sacramentalCanonicalRestricted?: boolean
  readonly sourcePath?: string | null
}

export type AiReplyRetrievalInput = {
  readonly staff: {
    readonly userId?: string | null
    readonly email: string
  }
  readonly scope: {
    readonly activeParishId: string
    readonly requestParishId: string
    readonly authorizedParishIds: readonly string[]
  }
  readonly request: {
    readonly id: string
    readonly requestType: 'baptism' | 'wedding' | 'funeral' | 'ocia' | 'join_parish' | 'other'
    readonly safeTitle: string
    readonly createdAt?: string | null
  }
  readonly draft: {
    readonly id: string
    readonly intent: AiReplyDraftIntent
    readonly recipientKind: AiReplyRecipientKind
    readonly safeLabel?: string | null
  }
  readonly sources: readonly AiReplyRetrievalSourceInput[]
}

export type AiReplyRetrievalDto = {
  readonly dtoVersion: typeof AI_REPLY_RETRIEVAL_DTO_VERSION
  readonly featureId: 'email_draft'
  readonly runtimeState: 'non_runtime_reply_retrieval_only'
  readonly target: {
    readonly objectType: 'communication_draft'
    readonly objectId: string
    readonly requestId: string
    readonly requestType: AiReplyRetrievalInput['request']['requestType']
    readonly draftIntent: AiReplyDraftIntent
    readonly recipientKind: AiReplyRecipientKind
    readonly safeLabel: string
  }
  readonly retrievalScope: {
    readonly activeParishId: string
    readonly requestParishId: string
    readonly staffEmail: string
    readonly staffUserId: string | null
    readonly membershipAuthorized: true
    readonly objectParishMatchesActiveParish: true
  }
  readonly allowedDataClasses: readonly AiDataClassId[]
  readonly blockedFamilyFacingData: typeof FAMILY_FACING_AI_EXCLUSIONS
  readonly sacramentalCanonicalRestrictions: typeof SACRAMENTAL_CANONICAL_AI_RESTRICTIONS
  readonly sourceDisplayRequirements: typeof AI_SOURCE_DISPLAY_REQUIREMENTS
  readonly auditMetadataRequirements: typeof AI_AUDIT_METADATA_REQUIREMENTS
  readonly retentionRule: string
  readonly humanApprovalRequired: true
  readonly familyFacingOutputAllowed: false
  readonly outboundCommunicationPolicy: {
    readonly staffReviewRequired: true
    readonly autonomousSendAllowed: false
    readonly generatedDraftTransientUntilStaffAction: true
  }
  readonly sourceReferences: readonly {
    readonly id: string
    readonly type: AiReplyRetrievalSourceType
    readonly dataClass: AiDataClassId
    readonly safeLabel: string
    readonly timestamp: string | null
    readonly parishScope: string
    readonly staffOnly: boolean
    readonly familyFacingSafe: boolean
    readonly sacramentalCanonicalRestricted: boolean
    readonly permissionCheckedSourcePath: string | null
  }[]
  readonly auditMetadataTemplate: {
    readonly staff_user_id_or_email: string
    readonly parish_id: string
    readonly active_parish_context: string
    readonly target_object_type: 'communication_draft'
    readonly target_object_id: string
    readonly request_id: string
    readonly ai_feature_id: 'email_draft'
    readonly input_data_classes: readonly AiDataClassId[]
    readonly safe_source_references: readonly string[]
    readonly output_destination: 'draft_only'
    readonly staff_disposition: 'pending_review'
    readonly model_or_provider_family: 'not_invoked'
    readonly blocked_reason: null
  }
}

export type AiReplyRetrievalResult =
  | { readonly ok: true; readonly dto: AiReplyRetrievalDto }
  | { readonly ok: false; readonly blockedReason: string }

const emailDraftPolicy = AI_FEATURE_REGISTRY.email_draft
const allowedEmailDraftDataClasses = new Set<AiDataClassId>(emailDraftPolicy.allowedDataClasses)

const unsafeMaterialPattern =
  /\b(token|hash|secret|password|signed url|signed-url|raw prompt|raw output|provider payload|plaintext)\b/i

function cleanLabel(label: string): string {
  return label.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function cleanId(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function block(blockedReason: string): AiReplyRetrievalResult {
  return { ok: false, blockedReason }
}

function hasUnsafeMaterial(value: string): boolean {
  return unsafeMaterialPattern.test(value)
}

export function buildAiReplyRetrievalDto(input: AiReplyRetrievalInput): AiReplyRetrievalResult {
  const staffEmail = input.staff.email.trim().toLowerCase()
  const activeParishId = input.scope.activeParishId.trim()
  const requestParishId = input.scope.requestParishId.trim()
  const requestId = cleanId(input.request.id)
  const draftId = cleanId(input.draft.id)
  const safeTitle = cleanLabel(input.request.safeTitle)
  const safeDraftLabel = cleanLabel(input.draft.safeLabel ?? `${input.draft.intent} for ${safeTitle}`)

  if (!staffEmail || !activeParishId || !requestParishId || !requestId || !draftId || !safeTitle || !safeDraftLabel) {
    return block('missing_required_reply_scope_or_target')
  }
  if (hasUnsafeMaterial(draftId) || hasUnsafeMaterial(safeDraftLabel)) {
    return block('unsafe_reply_target_reference')
  }
  if (activeParishId !== requestParishId) {
    return block('active_parish_does_not_match_reply_request_parish')
  }
  if (!input.scope.authorizedParishIds.includes(activeParishId)) {
    return block('staff_not_authorized_for_reply_active_parish')
  }
  if (input.sources.length === 0) {
    return block('no_safe_reply_sources')
  }

  const inputDataClasses = new Set<AiDataClassId>()
  const sourceReferences: Array<AiReplyRetrievalDto['sourceReferences'][number]> = []

  for (const source of input.sources) {
    const id = cleanId(source.id)
    const safeLabel = cleanLabel(source.label)
    const sourcePath = source.sourcePath ?? null

    if (!id || !safeLabel || hasUnsafeMaterial(id) || hasUnsafeMaterial(safeLabel)) {
      return block('unsafe_reply_source_reference')
    }
    if (sourcePath && hasUnsafeMaterial(sourcePath)) {
      return block('unsafe_reply_source_reference')
    }
    if (!allowedEmailDraftDataClasses.has(source.dataClass)) {
      return block(`data_class_not_allowed_for_ai_reply:${source.dataClass}`)
    }

    const policy = AI_DATA_CLASS_POLICIES[source.dataClass]
    inputDataClasses.add(source.dataClass)
    sourceReferences.push({
      id,
      type: source.type,
      dataClass: source.dataClass,
      safeLabel,
      timestamp: source.timestamp ?? null,
      parishScope: activeParishId,
      staffOnly: source.staffOnly ?? !policy.familyFacingSafe,
      familyFacingSafe: source.familyFacingSafe ?? policy.familyFacingSafe,
      sacramentalCanonicalRestricted:
        source.sacramentalCanonicalRestricted ?? policy.sacramentalCanonicalRestricted,
      permissionCheckedSourcePath: sourcePath,
    })
  }

  return {
    ok: true,
    dto: {
      dtoVersion: AI_REPLY_RETRIEVAL_DTO_VERSION,
      featureId: 'email_draft',
      runtimeState: 'non_runtime_reply_retrieval_only',
      target: {
        objectType: 'communication_draft',
        objectId: draftId,
        requestId,
        requestType: input.request.requestType,
        draftIntent: input.draft.intent,
        recipientKind: input.draft.recipientKind,
        safeLabel: safeDraftLabel,
      },
      retrievalScope: {
        activeParishId,
        requestParishId,
        staffEmail,
        staffUserId: input.staff.userId ?? null,
        membershipAuthorized: true,
        objectParishMatchesActiveParish: true,
      },
      allowedDataClasses: emailDraftPolicy.allowedDataClasses,
      blockedFamilyFacingData: FAMILY_FACING_AI_EXCLUSIONS,
      sacramentalCanonicalRestrictions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
      sourceDisplayRequirements: AI_SOURCE_DISPLAY_REQUIREMENTS,
      auditMetadataRequirements: AI_AUDIT_METADATA_REQUIREMENTS,
      retentionRule: emailDraftPolicy.retentionRule,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      outboundCommunicationPolicy: {
        staffReviewRequired: true,
        autonomousSendAllowed: false,
        generatedDraftTransientUntilStaffAction: true,
      },
      sourceReferences,
      auditMetadataTemplate: {
        staff_user_id_or_email: input.staff.userId ?? staffEmail,
        parish_id: requestParishId,
        active_parish_context: activeParishId,
        target_object_type: 'communication_draft',
        target_object_id: draftId,
        request_id: requestId,
        ai_feature_id: 'email_draft',
        input_data_classes: Array.from(inputDataClasses),
        safe_source_references: sourceReferences.map((source) => `${source.type}:${source.id}`),
        output_destination: 'draft_only',
        staff_disposition: 'pending_review',
        model_or_provider_family: 'not_invoked',
        blocked_reason: null,
      },
    },
  }
}
