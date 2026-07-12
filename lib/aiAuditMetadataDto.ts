import {
  AI_AUDIT_METADATA_REQUIREMENTS,
  AI_FEATURE_REGISTRY,
  type AiDataClassId,
} from './aiSafetyRegistry'
import type { RequestSummaryRetrievalDto } from './aiRequestSummaryRetrievalDto'
import type { AiSourceDisplayDto } from './aiSourceDisplayDto'

export const AI_AUDIT_METADATA_DTO_VERSION = '2026-06-27-audit-metadata-non-runtime-v1'

export type AiAuditFeatureId = 'request_summary' | 'email_draft'
export type AiAuditTargetObjectType = 'request' | 'communication_draft'
export type AiAuditOutputDestination =
  | 'internal_summary'
  | 'saved_staff_note'
  | 'draft_only'
  | 'sent_communication'
export type AiStaffDisposition = 'pending_review' | 'accepted' | 'edited' | 'discarded' | 'sent' | 'blocked'

export type AiAuditMetadataInput = {
  readonly featureId: AiAuditFeatureId
  readonly staff: {
    readonly userId?: string | null
    readonly email: string
  }
  readonly parish: {
    readonly parishId: string
    readonly activeParishId: string
  }
  readonly target: {
    readonly objectType: AiAuditTargetObjectType
    readonly objectId: string
  }
  readonly inputDataClasses: readonly AiDataClassId[]
  readonly safeSourceReferences: readonly string[]
  readonly outputDestination: AiAuditOutputDestination
  readonly staffDisposition: AiStaffDisposition
  readonly modelOrProviderFamily?: string | null
  readonly blockedReason?: string | null
  readonly timestamp?: string | null
  readonly sourceDisplayDto?: AiSourceDisplayDto | null
}

export type AiAuditMetadataDto = {
  readonly dtoVersion: typeof AI_AUDIT_METADATA_DTO_VERSION
  readonly runtimeState: 'non_runtime_audit_metadata_only'
  readonly auditMetadataRequirements: typeof AI_AUDIT_METADATA_REQUIREMENTS
  readonly staffIdentity: {
    readonly userId: string | null
    readonly email: string
  }
  readonly staff_user_id_or_email: string
  readonly parish_id: string
  readonly active_parish_context: string
  readonly target_object_type: AiAuditTargetObjectType
  readonly target_object_id: string
  readonly ai_feature_id: AiAuditFeatureId
  readonly input_data_classes: readonly AiDataClassId[]
  readonly safe_source_references: readonly string[]
  readonly source_display: {
    readonly dtoVersion: string | null
    readonly sourceCardIds: readonly string[]
    readonly staffOnlySourceCount: number
    readonly familyFacingSafeSourceCount: number
    readonly sacramentalCanonicalRestrictedSourceCount: number
  }
  readonly output_destination: AiAuditOutputDestination
  readonly staff_disposition: AiStaffDisposition
  readonly model_or_provider_family: string
  readonly timestamp: string | null
  readonly blocked_reason: string | null
  readonly humanApprovalRequired: true
  readonly familyFacingOutputAllowed: false
  readonly retentionRule: string
  readonly auditStoragePolicy: {
    readonly safeReferencesOnly: true
    readonly generatedTextStoredElsewhereOnlyAfterStaffAction: true
    readonly privateProviderPayloadNotStoredHere: true
  }
}

export type AiAuditMetadataResult =
  | { readonly ok: true; readonly dto: AiAuditMetadataDto }
  | { readonly ok: false; readonly blockedReason: string }

const unsafeAuditReferencePattern =
  /\b(token|hash|secret|password|signed url|signed-url|raw prompt|raw output|provider payload|plaintext)\b/i

function block(blockedReason: string): AiAuditMetadataResult {
  return { ok: false, blockedReason }
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function sourceCardReference(card: AiSourceDisplayDto['sourceCards'][number]): string {
  return `${card.type}:${card.id}`
}

function validateSourceDisplay(
  input: AiAuditMetadataInput,
  sourceDisplayDto: AiSourceDisplayDto
): string | null {
  if (sourceDisplayDto.featureId !== input.featureId) {
    return 'source_display_feature_does_not_match_audit_feature'
  }
  if (sourceDisplayDto.activeParishId !== input.parish.activeParishId.trim()) {
    return 'source_display_active_parish_does_not_match_audit_scope'
  }
  if (sourceDisplayDto.target.objectType !== input.target.objectType) {
    return 'source_display_target_type_does_not_match_audit_target'
  }
  if (sourceDisplayDto.target.objectId !== input.target.objectId.trim()) {
    return 'source_display_target_id_does_not_match_audit_target'
  }

  const sourceReferences = new Set(input.safeSourceReferences)
  const dataClasses = new Set(input.inputDataClasses)
  for (const card of sourceDisplayDto.sourceCards) {
    if (!sourceReferences.has(sourceCardReference(card))) {
      return 'source_display_card_missing_from_safe_source_references'
    }
    if (!dataClasses.has(card.dataClass)) {
      return 'source_display_data_class_missing_from_audit_input'
    }
  }

  return null
}

export function buildAiAuditMetadataDto(input: AiAuditMetadataInput): AiAuditMetadataResult {
  const feature = AI_FEATURE_REGISTRY[input.featureId]
  const staffEmail = input.staff.email.trim().toLowerCase()
  const staffUserId = input.staff.userId?.trim() || null
  const parishId = input.parish.parishId.trim()
  const activeParishId = input.parish.activeParishId.trim()
  const targetObjectId = input.target.objectId.trim()
  const blockedReason = input.blockedReason ? cleanText(input.blockedReason) : null

  if (!feature || !staffEmail || !parishId || !activeParishId || !targetObjectId) {
    return block('missing_required_audit_metadata_scope_or_target')
  }
  if (parishId !== activeParishId) {
    return block('audit_active_parish_context_does_not_match_parish_scope')
  }
  if (input.featureId === 'request_summary' && input.target.objectType !== 'request') {
    return block('request_summary_audit_requires_request_target')
  }
  if (input.featureId === 'email_draft' && input.target.objectType !== 'communication_draft') {
    return block('email_draft_audit_requires_communication_draft_target')
  }
  const allowedOutputDestinations = feature.outputDestinations as readonly string[]
  if (!allowedOutputDestinations.includes(input.outputDestination)) {
    return block(`output_destination_not_allowed_for_ai_feature:${input.outputDestination}`)
  }
  if (input.staffDisposition === 'sent' && input.outputDestination !== 'sent_communication') {
    return block('sent_disposition_requires_sent_communication_destination')
  }
  if (input.staffDisposition === 'blocked' && !blockedReason) {
    return block('blocked_disposition_requires_blocked_reason')
  }

  const allowedDataClasses = new Set<AiDataClassId>(feature.allowedDataClasses)
  const inputDataClasses = Array.from(new Set(input.inputDataClasses))
  if (inputDataClasses.length === 0) {
    return block('audit_metadata_requires_input_data_classes')
  }
  for (const dataClass of inputDataClasses) {
    if (!allowedDataClasses.has(dataClass)) {
      return block(`data_class_not_allowed_for_ai_audit_feature:${dataClass}`)
    }
  }

  const safeSourceReferences = Array.from(new Set(input.safeSourceReferences.map(cleanText)))
  if (safeSourceReferences.length === 0) {
    return block('audit_metadata_requires_safe_source_references')
  }
  if (safeSourceReferences.some((reference) => !reference || unsafeAuditReferencePattern.test(reference))) {
    return block('unsafe_audit_source_reference')
  }

  if (input.sourceDisplayDto) {
    const sourceDisplayError = validateSourceDisplay(input, input.sourceDisplayDto)
    if (sourceDisplayError) {
      return block(sourceDisplayError)
    }
  }

  const sourceCards = input.sourceDisplayDto?.sourceCards ?? []

  return {
    ok: true,
    dto: {
      dtoVersion: AI_AUDIT_METADATA_DTO_VERSION,
      runtimeState: 'non_runtime_audit_metadata_only',
      auditMetadataRequirements: AI_AUDIT_METADATA_REQUIREMENTS,
      staffIdentity: {
        userId: staffUserId,
        email: staffEmail,
      },
      staff_user_id_or_email: staffUserId ?? staffEmail,
      parish_id: parishId,
      active_parish_context: activeParishId,
      target_object_type: input.target.objectType,
      target_object_id: targetObjectId,
      ai_feature_id: input.featureId,
      input_data_classes: inputDataClasses,
      safe_source_references: safeSourceReferences,
      source_display: {
        dtoVersion: input.sourceDisplayDto?.dtoVersion ?? null,
        sourceCardIds: sourceCards.map((card) => card.id),
        staffOnlySourceCount: sourceCards.filter((card) => card.staffOnly).length,
        familyFacingSafeSourceCount: sourceCards.filter((card) => card.familyFacingSafe).length,
        sacramentalCanonicalRestrictedSourceCount: sourceCards.filter(
          (card) => card.sacramentalCanonicalRestricted
        ).length,
      },
      output_destination: input.outputDestination,
      staff_disposition: input.staffDisposition,
      model_or_provider_family: cleanText(input.modelOrProviderFamily ?? 'not_invoked'),
      timestamp: input.timestamp ? cleanText(input.timestamp) : null,
      blocked_reason: blockedReason,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      retentionRule: feature.retentionRule,
      auditStoragePolicy: {
        safeReferencesOnly: true,
        generatedTextStoredElsewhereOnlyAfterStaffAction: true,
        privateProviderPayloadNotStoredHere: true,
      },
    },
  }
}

export function buildRequestSummaryAuditMetadataDto(
  retrievalDto: RequestSummaryRetrievalDto,
  sourceDisplayDto: AiSourceDisplayDto,
  options?: {
    readonly outputDestination?: Extract<AiAuditOutputDestination, 'internal_summary' | 'saved_staff_note'>
    readonly staffDisposition?: AiStaffDisposition
    readonly modelOrProviderFamily?: string | null
    readonly blockedReason?: string | null
    readonly timestamp?: string | null
  }
): AiAuditMetadataResult {
  return buildAiAuditMetadataDto({
    featureId: 'request_summary',
    staff: {
      userId: retrievalDto.retrievalScope.staffUserId,
      email: retrievalDto.retrievalScope.staffEmail,
    },
    parish: {
      parishId: retrievalDto.retrievalScope.requestParishId,
      activeParishId: retrievalDto.retrievalScope.activeParishId,
    },
    target: {
      objectType: 'request',
      objectId: retrievalDto.target.objectId,
    },
    inputDataClasses: retrievalDto.auditMetadataTemplate.input_data_classes,
    safeSourceReferences: retrievalDto.auditMetadataTemplate.safe_source_references,
    outputDestination: options?.outputDestination ?? retrievalDto.auditMetadataTemplate.output_destination,
    staffDisposition: options?.staffDisposition ?? retrievalDto.auditMetadataTemplate.staff_disposition,
    modelOrProviderFamily:
      options?.modelOrProviderFamily ?? retrievalDto.auditMetadataTemplate.model_or_provider_family,
    blockedReason: options?.blockedReason ?? retrievalDto.auditMetadataTemplate.blocked_reason,
    timestamp: options?.timestamp,
    sourceDisplayDto,
  })
}
