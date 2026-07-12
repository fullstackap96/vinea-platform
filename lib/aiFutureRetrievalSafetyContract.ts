import { FAMILY_FACING_AI_EXCLUSIONS } from './aiSafetyRegistry'
import type { AiAuditMetadataDto } from './aiAuditMetadataDto'
import type { AiReplyRetrievalDto, AiReplyRetrievalResult } from './aiReplyRetrievalDto'
import type {
  RequestSummaryRetrievalDto,
  RequestSummaryRetrievalResult,
} from './aiRequestSummaryRetrievalDto'
import type { AiSourceDisplayDto } from './aiSourceDisplayDto'
import type { AiStaffReviewStatusDto } from './aiStaffReviewStatusDto'

export const AI_FUTURE_RETRIEVAL_SAFETY_CONTRACT_VERSION =
  '2026-06-27-family-cross-parish-non-runtime-v1'

export type AiRetrievalSurface = 'staff_internal' | 'family_portal'

type SupportedAiRetrievalDto = RequestSummaryRetrievalDto | AiReplyRetrievalDto
type SupportedAiRetrievalResult = RequestSummaryRetrievalResult | AiReplyRetrievalResult

export type AiFutureRetrievalSafetyContractInput = {
  readonly surface: AiRetrievalSurface
  readonly activeParishId: string
  readonly requestParishId: string
  readonly authorizedParishIds: readonly string[]
  readonly retrievalResult: SupportedAiRetrievalResult
  readonly sourceDisplayDto?: AiSourceDisplayDto | null
  readonly auditMetadataDto?: AiAuditMetadataDto | null
  readonly staffReviewStatusDto?: AiStaffReviewStatusDto | null
}

export type AiFutureRetrievalSafetyContractDto = {
  readonly dtoVersion: typeof AI_FUTURE_RETRIEVAL_SAFETY_CONTRACT_VERSION
  readonly runtimeState: 'non_runtime_future_retrieval_safety_contract_only'
  readonly surface: AiRetrievalSurface
  readonly allowedForRetrieval: boolean
  readonly allowedForFamilyFacingDisplay: false
  readonly genericPublicBlockedReason: string | null
  readonly internalBlockedReason: string | null
  readonly activeParishContext: string
  readonly requestParishScope: string
  readonly parishScopeAuthorized: boolean
  readonly objectParishMatchesActiveParish: boolean
  readonly familyFacingBoundary: {
    readonly familyPortalAiUnavailable: boolean
    readonly excludedData: typeof FAMILY_FACING_AI_EXCLUSIONS
    readonly staffOnlySourceCount: number
    readonly familyFacingSafeSourceCount: number
  }
  readonly dtoChain: {
    readonly retrievalDtoPresent: boolean
    readonly sourceDisplayDtoPresent: boolean
    readonly auditMetadataDtoPresent: boolean
    readonly staffReviewStatusDtoPresent: boolean
    readonly sourceDisplayMatchesRetrieval: boolean
    readonly auditMatchesRetrieval: boolean
    readonly staffReviewMatchesAudit: boolean
  }
  readonly privateMaterialPolicy: {
    readonly safeReferencesOnly: true
    readonly internalPayloadExcluded: true
    readonly publicBlockedReasonsAreGeneric: true
  }
}

export type AiFutureRetrievalSafetyContractResult =
  | { readonly ok: true; readonly dto: AiFutureRetrievalSafetyContractDto }
  | { readonly ok: false; readonly dto: AiFutureRetrievalSafetyContractDto }

const unsafeMaterialPattern =
  /\b(token|hash|secret|password|signed url|signed-url|raw prompt|raw output|provider payload|plaintext)\b/i

const GENERIC_PUBLIC_BLOCKED_REASON = 'ai_retrieval_unavailable'

function cleanReason(reason: string | null): string | null {
  if (!reason) return null
  return unsafeMaterialPattern.test(reason) ? 'unsafe_private_material_blocked' : reason.replace(/\s+/g, ' ').trim()
}

function retrievalDto(input: AiFutureRetrievalSafetyContractInput): SupportedAiRetrievalDto | null {
  return input.retrievalResult.ok ? input.retrievalResult.dto : null
}

function sourceDisplayMatchesRetrieval(
  retrieval: SupportedAiRetrievalDto | null,
  sourceDisplay: AiSourceDisplayDto | null | undefined
): boolean {
  if (!retrieval || !sourceDisplay) return false

  return (
    sourceDisplay.featureId === retrieval.featureId &&
    sourceDisplay.activeParishId === retrieval.retrievalScope.activeParishId &&
    sourceDisplay.target.objectType === retrieval.target.objectType &&
    sourceDisplay.target.objectId === retrieval.target.objectId
  )
}

function auditMatchesRetrieval(
  retrieval: SupportedAiRetrievalDto | null,
  audit: AiAuditMetadataDto | null | undefined
): boolean {
  if (!retrieval || !audit) return false

  return (
    audit.ai_feature_id === retrieval.featureId &&
    audit.active_parish_context === retrieval.retrievalScope.activeParishId &&
    audit.parish_id === retrieval.retrievalScope.requestParishId &&
    audit.target_object_type === retrieval.target.objectType &&
    audit.target_object_id === retrieval.target.objectId
  )
}

function staffReviewMatchesAudit(
  audit: AiAuditMetadataDto | null | undefined,
  staffReview: AiStaffReviewStatusDto | null | undefined
): boolean {
  if (!audit || !staffReview) return false

  return (
    staffReview.featureId === audit.ai_feature_id &&
    staffReview.parishScope.activeParishId === audit.active_parish_context &&
    staffReview.parishScope.parishId === audit.parish_id &&
    staffReview.target.objectType === audit.target_object_type &&
    staffReview.target.objectId === audit.target_object_id &&
    staffReview.outputDestination === audit.output_destination &&
    staffReview.staffDisposition === audit.staff_disposition
  )
}

export function buildAiFutureRetrievalSafetyContract(
  input: AiFutureRetrievalSafetyContractInput
): AiFutureRetrievalSafetyContractResult {
  const activeParishId = input.activeParishId.trim()
  const requestParishId = input.requestParishId.trim()
  const retrieval = retrievalDto(input)
  const parishScopeAuthorized = input.authorizedParishIds.includes(activeParishId)
  const objectParishMatchesActiveParish = activeParishId === requestParishId
  const sourceDisplay = input.sourceDisplayDto ?? null
  const audit = input.auditMetadataDto ?? null
  const staffReview = input.staffReviewStatusDto ?? null
  const sourceDisplayMatches = sourceDisplayMatchesRetrieval(retrieval, sourceDisplay)
  const auditMatches = auditMatchesRetrieval(retrieval, audit)
  const staffReviewMatches = staffReviewMatchesAudit(audit, staffReview)
  const staffOnlySourceCount = sourceDisplay?.sourceCards.filter((source) => source.staffOnly).length ?? 0
  const familyFacingSafeSourceCount =
    sourceDisplay?.sourceCards.filter((source) => source.familyFacingSafe).length ?? 0

  let internalBlockedReason: string | null = null
  if (!activeParishId || !requestParishId) {
    internalBlockedReason = 'missing_required_parish_scope'
  } else if (input.surface === 'family_portal') {
    internalBlockedReason = 'family_facing_ai_retrieval_not_enabled'
  } else if (!objectParishMatchesActiveParish) {
    internalBlockedReason = 'active_parish_does_not_match_request_parish'
  } else if (!parishScopeAuthorized) {
    internalBlockedReason = 'staff_not_authorized_for_active_parish'
  } else if (!input.retrievalResult.ok) {
    internalBlockedReason = input.retrievalResult.blockedReason
  } else if (!sourceDisplayMatches) {
    internalBlockedReason = 'source_display_does_not_match_retrieval_scope'
  } else if (!auditMatches) {
    internalBlockedReason = 'audit_metadata_does_not_match_retrieval_scope'
  } else if (!staffReviewMatches) {
    internalBlockedReason = 'staff_review_status_does_not_match_audit_scope'
  }

  const safeInternalBlockedReason = cleanReason(internalBlockedReason)
  const allowedForRetrieval = input.surface === 'staff_internal' && safeInternalBlockedReason === null
  const genericPublicBlockedReason = allowedForRetrieval ? null : GENERIC_PUBLIC_BLOCKED_REASON

  const dto: AiFutureRetrievalSafetyContractDto = {
    dtoVersion: AI_FUTURE_RETRIEVAL_SAFETY_CONTRACT_VERSION,
    runtimeState: 'non_runtime_future_retrieval_safety_contract_only',
    surface: input.surface,
    allowedForRetrieval,
    allowedForFamilyFacingDisplay: false,
    genericPublicBlockedReason,
    internalBlockedReason: safeInternalBlockedReason,
    activeParishContext: activeParishId,
    requestParishScope: requestParishId,
    parishScopeAuthorized,
    objectParishMatchesActiveParish,
    familyFacingBoundary: {
      familyPortalAiUnavailable: input.surface === 'family_portal',
      excludedData: FAMILY_FACING_AI_EXCLUSIONS,
      staffOnlySourceCount,
      familyFacingSafeSourceCount,
    },
    dtoChain: {
      retrievalDtoPresent: Boolean(retrieval),
      sourceDisplayDtoPresent: Boolean(sourceDisplay),
      auditMetadataDtoPresent: Boolean(audit),
      staffReviewStatusDtoPresent: Boolean(staffReview),
      sourceDisplayMatchesRetrieval: sourceDisplayMatches,
      auditMatchesRetrieval: auditMatches,
      staffReviewMatchesAudit: staffReviewMatches,
    },
    privateMaterialPolicy: {
      safeReferencesOnly: true,
      internalPayloadExcluded: true,
      publicBlockedReasonsAreGeneric: true,
    },
  }

  return allowedForRetrieval ? { ok: true, dto } : { ok: false, dto }
}
