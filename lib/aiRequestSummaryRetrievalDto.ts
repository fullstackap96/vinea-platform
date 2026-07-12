import {
  AI_AUDIT_METADATA_REQUIREMENTS,
  AI_DATA_CLASS_POLICIES,
  AI_FEATURE_REGISTRY,
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  type AiDataClassId,
} from './aiSafetyRegistry'

export const REQUEST_SUMMARY_RETRIEVAL_DTO_VERSION = '2026-06-27-request-summary-non-runtime-v1'

export type RequestSummaryRetrievalSourceType =
  | 'request'
  | 'workflow_step'
  | 'staff_note'
  | 'communication'
  | 'person'
  | 'household'
  | 'sacramental_record'

export type RequestSummaryRetrievalSourceInput = {
  readonly id: string
  readonly type: RequestSummaryRetrievalSourceType
  readonly dataClass: AiDataClassId
  readonly label: string
  readonly timestamp?: string | null
  readonly staffOnly?: boolean
  readonly familyFacingSafe?: boolean
  readonly sacramentalCanonicalRestricted?: boolean
  readonly sourcePath?: string | null
}

export type RequestSummaryRetrievalInput = {
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
  readonly sources: readonly RequestSummaryRetrievalSourceInput[]
}

export type RequestSummaryRetrievalDto = {
  readonly dtoVersion: typeof REQUEST_SUMMARY_RETRIEVAL_DTO_VERSION
  readonly featureId: 'request_summary'
  readonly runtimeState: 'non_runtime_dto_only'
  readonly target: {
    readonly objectType: 'request'
    readonly objectId: string
    readonly requestType: RequestSummaryRetrievalInput['request']['requestType']
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
  readonly sourceReferences: readonly {
    readonly id: string
    readonly type: RequestSummaryRetrievalSourceType
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
    readonly target_object_type: 'request'
    readonly target_object_id: string
    readonly ai_feature_id: 'request_summary'
    readonly input_data_classes: readonly AiDataClassId[]
    readonly safe_source_references: readonly string[]
    readonly output_destination: 'internal_summary'
    readonly staff_disposition: 'pending_review'
    readonly model_or_provider_family: 'not_invoked'
    readonly blocked_reason: null
  }
}

export type RequestSummaryRetrievalBlocked = {
  readonly ok: false
  readonly blockedReason: string
}

export type RequestSummaryRetrievalResult =
  | { readonly ok: true; readonly dto: RequestSummaryRetrievalDto }
  | RequestSummaryRetrievalBlocked

const requestSummaryPolicy = AI_FEATURE_REGISTRY.request_summary
const allowedRequestSummaryDataClasses = new Set<AiDataClassId>(requestSummaryPolicy.allowedDataClasses)

function cleanLabel(label: string): string {
  return label.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function hasTokenLikeMaterial(value: string): boolean {
  return /\b(token|hash|secret|password|signed url|signed-url)\b/i.test(value)
}

function block(reason: string): RequestSummaryRetrievalBlocked {
  return { ok: false, blockedReason: reason }
}

export function buildRequestSummaryRetrievalDto(
  input: RequestSummaryRetrievalInput
): RequestSummaryRetrievalResult {
  const staffEmail = input.staff.email.trim().toLowerCase()
  const activeParishId = input.scope.activeParishId.trim()
  const requestParishId = input.scope.requestParishId.trim()
  const requestId = input.request.id.trim()
  const safeTitle = cleanLabel(input.request.safeTitle)

  if (!staffEmail || !activeParishId || !requestParishId || !requestId || !safeTitle) {
    return block('missing_required_scope_or_target')
  }
  if (activeParishId !== requestParishId) {
    return block('active_parish_does_not_match_request_parish')
  }
  if (!input.scope.authorizedParishIds.includes(activeParishId)) {
    return block('staff_not_authorized_for_active_parish')
  }

  const sourceReferences: Array<RequestSummaryRetrievalDto['sourceReferences'][number]> = []
  const inputDataClasses = new Set<AiDataClassId>()

  for (const source of input.sources) {
    const label = cleanLabel(source.label)
    if (!label || hasTokenLikeMaterial(label) || (source.sourcePath && hasTokenLikeMaterial(source.sourcePath))) {
      return block('unsafe_source_reference')
    }
    if (!allowedRequestSummaryDataClasses.has(source.dataClass)) {
      return block(`data_class_not_allowed_for_request_summary:${source.dataClass}`)
    }

    const policy = AI_DATA_CLASS_POLICIES[source.dataClass]
    inputDataClasses.add(source.dataClass)
    sourceReferences.push({
      id: source.id,
      type: source.type,
      dataClass: source.dataClass,
      safeLabel: label,
      timestamp: source.timestamp ?? null,
      parishScope: activeParishId,
      staffOnly: source.staffOnly ?? !policy.familyFacingSafe,
      familyFacingSafe: source.familyFacingSafe ?? policy.familyFacingSafe,
      sacramentalCanonicalRestricted:
        source.sacramentalCanonicalRestricted ?? policy.sacramentalCanonicalRestricted,
      permissionCheckedSourcePath: source.sourcePath ?? null,
    })
  }

  if (sourceReferences.length === 0) {
    return block('no_safe_sources')
  }

  const safeSourceReferences = sourceReferences.map((source) => `${source.type}:${source.id}`)

  return {
    ok: true,
    dto: {
      dtoVersion: REQUEST_SUMMARY_RETRIEVAL_DTO_VERSION,
      featureId: 'request_summary',
      runtimeState: 'non_runtime_dto_only',
      target: {
        objectType: 'request',
        objectId: requestId,
        requestType: input.request.requestType,
        safeLabel: safeTitle,
      },
      retrievalScope: {
        activeParishId,
        requestParishId,
        staffEmail,
        staffUserId: input.staff.userId ?? null,
        membershipAuthorized: true,
        objectParishMatchesActiveParish: true,
      },
      allowedDataClasses: requestSummaryPolicy.allowedDataClasses,
      blockedFamilyFacingData: FAMILY_FACING_AI_EXCLUSIONS,
      sacramentalCanonicalRestrictions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
      sourceDisplayRequirements: AI_SOURCE_DISPLAY_REQUIREMENTS,
      auditMetadataRequirements: AI_AUDIT_METADATA_REQUIREMENTS,
      retentionRule: requestSummaryPolicy.retentionRule,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      sourceReferences,
      auditMetadataTemplate: {
        staff_user_id_or_email: input.staff.userId ?? staffEmail,
        parish_id: requestParishId,
        active_parish_context: activeParishId,
        target_object_type: 'request',
        target_object_id: requestId,
        ai_feature_id: 'request_summary',
        input_data_classes: Array.from(inputDataClasses),
        safe_source_references: safeSourceReferences,
        output_destination: 'internal_summary',
        staff_disposition: 'pending_review',
        model_or_provider_family: 'not_invoked',
        blocked_reason: null,
      },
    },
  }
}
