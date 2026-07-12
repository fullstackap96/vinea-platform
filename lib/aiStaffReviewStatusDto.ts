import { AI_FEATURE_REGISTRY } from './aiSafetyRegistry'
import type { AiAuditMetadataDto } from './aiAuditMetadataDto'
import type { AiSourceDisplayDto } from './aiSourceDisplayDto'

export const AI_STAFF_REVIEW_STATUS_DTO_VERSION = '2026-06-27-staff-review-status-non-runtime-v1'

export type AiStaffReviewStatus = 'draft' | 'review_required' | 'saved' | 'sent' | 'discarded' | 'blocked'

export type AiStaffReviewStatusInput = {
  readonly auditMetadataDto: AiAuditMetadataDto
  readonly sourceDisplayDto: AiSourceDisplayDto
  readonly status: AiStaffReviewStatus
}

export type AiStaffReviewStatusDto = {
  readonly dtoVersion: typeof AI_STAFF_REVIEW_STATUS_DTO_VERSION
  readonly runtimeState: 'non_runtime_staff_review_status_only'
  readonly featureId: AiAuditMetadataDto['ai_feature_id']
  readonly featureLabel: string
  readonly target: {
    readonly objectType: AiAuditMetadataDto['target_object_type']
    readonly objectId: string
    readonly safeLabel: string
  }
  readonly parishScope: {
    readonly parishId: string
    readonly activeParishId: string
  }
  readonly reviewStatus: AiStaffReviewStatus
  readonly displayLabel: string
  readonly staffGuidance: string
  readonly staffActionRequired: boolean
  readonly humanApprovalRequired: true
  readonly familyFacingOutputAllowed: false
  readonly sourceDisplayRequired: true
  readonly auditMetadataRequired: true
  readonly outputDestination: AiAuditMetadataDto['output_destination']
  readonly staffDisposition: AiAuditMetadataDto['staff_disposition']
  readonly blockedReason: string | null
  readonly safeSourceSummary: {
    readonly sourceCardCount: number
    readonly staffOnlySourceCount: number
    readonly familyFacingSafeSourceCount: number
    readonly sacramentalCanonicalRestrictedSourceCount: number
  }
  readonly familyFacingBoundary: {
    readonly familyFacingExcluded: true
    readonly explanation: string
  }
  readonly sacramentalCanonicalBoundary: {
    readonly restrictionsVisible: true
    readonly restrictedSourcePresent: boolean
    readonly explanation: string
  }
  readonly privateMaterialPolicy: {
    readonly safeReferencesOnly: true
    readonly generatedTextStoredElsewhereOnlyAfterStaffAction: true
    readonly internalPayloadExcluded: true
  }
}

export type AiStaffReviewStatusResult =
  | { readonly ok: true; readonly dto: AiStaffReviewStatusDto }
  | { readonly ok: false; readonly blockedReason: string }

const STATUS_CONTENT = {
  draft: {
    displayLabel: 'Draft',
    staffGuidance: 'AI-assisted text is still a staff-reviewed draft and should not be treated as final.',
    staffActionRequired: true,
  },
  review_required: {
    displayLabel: 'Review required',
    staffGuidance: 'Staff must review the AI-assisted text before saving, sending, or using it.',
    staffActionRequired: true,
  },
  saved: {
    displayLabel: 'Saved',
    staffGuidance: 'Staff has saved the AI-assisted content to an approved internal destination.',
    staffActionRequired: false,
  },
  sent: {
    displayLabel: 'Sent',
    staffGuidance: 'Staff has sent the AI-assisted communication after review.',
    staffActionRequired: false,
  },
  discarded: {
    displayLabel: 'Discarded',
    staffGuidance: 'Staff discarded the AI-assisted text and it should not be used.',
    staffActionRequired: false,
  },
  blocked: {
    displayLabel: 'Blocked',
    staffGuidance: 'AI assistance was denied and staff should resolve the listed safety or permission reason.',
    staffActionRequired: true,
  },
} as const satisfies Record<
  AiStaffReviewStatus,
  { readonly displayLabel: string; readonly staffGuidance: string; readonly staffActionRequired: boolean }
>

function block(blockedReason: string): AiStaffReviewStatusResult {
  return { ok: false, blockedReason }
}

function validateStatusAgainstAudit(input: AiStaffReviewStatusInput): string | null {
  const { auditMetadataDto, status } = input

  if (status === 'review_required' && auditMetadataDto.staff_disposition !== 'pending_review') {
    return 'review_required_status_requires_pending_review_disposition'
  }
  if (
    status === 'draft' &&
    (auditMetadataDto.staff_disposition === 'sent' ||
      auditMetadataDto.staff_disposition === 'discarded' ||
      auditMetadataDto.staff_disposition === 'blocked')
  ) {
    return 'draft_status_requires_unsent_unblocked_disposition'
  }
  if (status === 'saved' && auditMetadataDto.output_destination !== 'saved_staff_note') {
    return 'saved_status_requires_saved_staff_note_destination'
  }
  if (status === 'sent' && auditMetadataDto.output_destination !== 'sent_communication') {
    return 'sent_status_requires_sent_communication_destination'
  }
  if (status === 'sent' && auditMetadataDto.staff_disposition !== 'sent') {
    return 'sent_status_requires_sent_disposition'
  }
  if (status === 'discarded' && auditMetadataDto.staff_disposition !== 'discarded') {
    return 'discarded_status_requires_discarded_disposition'
  }
  if (status === 'blocked' && auditMetadataDto.staff_disposition !== 'blocked') {
    return 'blocked_status_requires_blocked_disposition'
  }
  if (status === 'blocked' && !auditMetadataDto.blocked_reason) {
    return 'blocked_status_requires_blocked_reason'
  }

  return null
}

function validateSourceDisplay(input: AiStaffReviewStatusInput): string | null {
  const { auditMetadataDto, sourceDisplayDto } = input

  if (sourceDisplayDto.featureId !== auditMetadataDto.ai_feature_id) {
    return 'source_display_feature_does_not_match_review_status_feature'
  }
  if (sourceDisplayDto.activeParishId !== auditMetadataDto.active_parish_context) {
    return 'source_display_active_parish_does_not_match_review_status_scope'
  }
  if (sourceDisplayDto.target.objectType !== auditMetadataDto.target_object_type) {
    return 'source_display_target_type_does_not_match_review_status_target'
  }
  if (sourceDisplayDto.target.objectId !== auditMetadataDto.target_object_id) {
    return 'source_display_target_id_does_not_match_review_status_target'
  }

  return null
}

export function buildAiStaffReviewStatusDto(
  input: AiStaffReviewStatusInput
): AiStaffReviewStatusResult {
  const { auditMetadataDto, sourceDisplayDto, status } = input
  const feature = AI_FEATURE_REGISTRY[auditMetadataDto.ai_feature_id]
  if (!feature) {
    return block('unknown_ai_feature_for_staff_review_status')
  }

  const statusError = validateStatusAgainstAudit(input)
  if (statusError) return block(statusError)

  const sourceDisplayError = validateSourceDisplay(input)
  if (sourceDisplayError) return block(sourceDisplayError)

  const statusContent = STATUS_CONTENT[status]
  const restrictedSourcePresent = sourceDisplayDto.sourceCards.some(
    (card) => card.sacramentalCanonicalRestricted
  )

  return {
    ok: true,
    dto: {
      dtoVersion: AI_STAFF_REVIEW_STATUS_DTO_VERSION,
      runtimeState: 'non_runtime_staff_review_status_only',
      featureId: auditMetadataDto.ai_feature_id,
      featureLabel: feature.label,
      target: {
        objectType: auditMetadataDto.target_object_type,
        objectId: auditMetadataDto.target_object_id,
        safeLabel: sourceDisplayDto.target.safeLabel,
      },
      parishScope: {
        parishId: auditMetadataDto.parish_id,
        activeParishId: auditMetadataDto.active_parish_context,
      },
      reviewStatus: status,
      displayLabel: statusContent.displayLabel,
      staffGuidance: statusContent.staffGuidance,
      staffActionRequired: statusContent.staffActionRequired,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      sourceDisplayRequired: true,
      auditMetadataRequired: true,
      outputDestination: auditMetadataDto.output_destination,
      staffDisposition: auditMetadataDto.staff_disposition,
      blockedReason: auditMetadataDto.blocked_reason,
      safeSourceSummary: {
        sourceCardCount: sourceDisplayDto.sourceCards.length,
        staffOnlySourceCount: sourceDisplayDto.sourceCards.filter((card) => card.staffOnly).length,
        familyFacingSafeSourceCount: sourceDisplayDto.sourceCards.filter((card) => card.familyFacingSafe).length,
        sacramentalCanonicalRestrictedSourceCount: sourceDisplayDto.sourceCards.filter(
          (card) => card.sacramentalCanonicalRestricted
        ).length,
      },
      familyFacingBoundary: {
        familyFacingExcluded: true,
        explanation: 'AI-assisted staff review labels are internal only and are not approved for family-facing pages.',
      },
      sacramentalCanonicalBoundary: {
        restrictionsVisible: true,
        restrictedSourcePresent,
        explanation:
          'AI assistance cannot decide sacramental eligibility, certificate issuance, canonical notation, or pastoral readiness.',
      },
      privateMaterialPolicy: {
        safeReferencesOnly: true,
        generatedTextStoredElsewhereOnlyAfterStaffAction: true,
        internalPayloadExcluded: true,
      },
    },
  }
}
