import {
  AI_FEATURE_REGISTRY,
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  type AiDataClassId,
} from './aiSafetyRegistry'
import type {
  RequestSummaryRetrievalDto,
  RequestSummaryRetrievalSourceType,
} from './aiRequestSummaryRetrievalDto'

export const AI_SOURCE_DISPLAY_DTO_VERSION = '2026-06-27-source-display-non-runtime-v1'

export type AiSourceDisplayFeatureId = 'request_summary' | 'email_draft'

export type AiSourceDisplayInputSource = {
  readonly id: string
  readonly type: RequestSummaryRetrievalSourceType | 'document_metadata'
  readonly dataClass: AiDataClassId
  readonly label: string
  readonly timestamp?: string | null
  readonly parishScope: string
  readonly staffOnly: boolean
  readonly familyFacingSafe: boolean
  readonly sacramentalCanonicalRestricted?: boolean
  readonly permissionCheckedSourcePath?: string | null
}

export type AiSourceDisplayInput = {
  readonly featureId: AiSourceDisplayFeatureId
  readonly target: {
    readonly objectType: 'request' | 'communication_draft'
    readonly objectId: string
    readonly safeLabel: string
  }
  readonly activeParishId: string
  readonly sources: readonly AiSourceDisplayInputSource[]
}

export type AiSourceDisplayDto = {
  readonly dtoVersion: typeof AI_SOURCE_DISPLAY_DTO_VERSION
  readonly runtimeState: 'non_runtime_source_display_only'
  readonly featureId: AiSourceDisplayFeatureId
  readonly featureLabel: string
  readonly target: AiSourceDisplayInput['target']
  readonly activeParishId: string
  readonly sourceDisplayRequirements: typeof AI_SOURCE_DISPLAY_REQUIREMENTS
  readonly blockedFamilyFacingData: typeof FAMILY_FACING_AI_EXCLUSIONS
  readonly sacramentalCanonicalRestrictions: typeof SACRAMENTAL_CANONICAL_AI_RESTRICTIONS
  readonly familyFacingOutputAllowed: false
  readonly humanApprovalRequired: true
  readonly sourceCards: readonly {
    readonly id: string
    readonly type: AiSourceDisplayInputSource['type']
    readonly dataClass: AiDataClassId
    readonly safeLabel: string
    readonly timestamp: string | null
    readonly parishScope: string
    readonly staffOnly: boolean
    readonly familyFacingSafe: boolean
    readonly sacramentalCanonicalRestricted: boolean
    readonly permissionCheckedSourcePath: string | null
    readonly displayOnly: true
  }[]
}

export type AiSourceDisplayResult =
  | { readonly ok: true; readonly dto: AiSourceDisplayDto }
  | { readonly ok: false; readonly blockedReason: string }

const unsafeDisplayPattern = /\b(token|hash|secret|password|signed url|signed-url|raw prompt|raw output)\b/i

function cleanLabel(label: string): string {
  return label.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function block(blockedReason: string): AiSourceDisplayResult {
  return { ok: false, blockedReason }
}

export function buildAiSourceDisplayDto(input: AiSourceDisplayInput): AiSourceDisplayResult {
  const feature = AI_FEATURE_REGISTRY[input.featureId]
  const activeParishId = input.activeParishId.trim()
  const targetId = input.target.objectId.trim()
  const targetLabel = cleanLabel(input.target.safeLabel)
  const allowedDataClasses = new Set<AiDataClassId>(feature.allowedDataClasses)

  if (!activeParishId || !targetId || !targetLabel) {
    return block('missing_required_source_display_scope_or_target')
  }
  if (input.sources.length === 0) {
    return block('no_safe_display_sources')
  }

  const sourceCards: Array<AiSourceDisplayDto['sourceCards'][number]> = []

  for (const source of input.sources) {
    const safeLabel = cleanLabel(source.label)
    const permissionCheckedSourcePath = source.permissionCheckedSourcePath ?? null

    if (
      !safeLabel ||
      unsafeDisplayPattern.test(safeLabel) ||
      (permissionCheckedSourcePath && unsafeDisplayPattern.test(permissionCheckedSourcePath))
    ) {
      return block('unsafe_source_display_reference')
    }
    if (!allowedDataClasses.has(source.dataClass)) {
      return block(`data_class_not_allowed_for_source_display:${source.dataClass}`)
    }
    if (source.parishScope !== activeParishId) {
      return block('source_parish_scope_does_not_match_active_parish')
    }
    if (!permissionCheckedSourcePath) {
      return block('source_display_requires_permission_checked_path')
    }

    sourceCards.push({
      id: source.id,
      type: source.type,
      dataClass: source.dataClass,
      safeLabel,
      timestamp: source.timestamp ?? null,
      parishScope: source.parishScope,
      staffOnly: source.staffOnly,
      familyFacingSafe: source.familyFacingSafe,
      sacramentalCanonicalRestricted: source.sacramentalCanonicalRestricted ?? false,
      permissionCheckedSourcePath,
      displayOnly: true,
    })
  }

  return {
    ok: true,
    dto: {
      dtoVersion: AI_SOURCE_DISPLAY_DTO_VERSION,
      runtimeState: 'non_runtime_source_display_only',
      featureId: input.featureId,
      featureLabel: feature.label,
      target: {
        objectType: input.target.objectType,
        objectId: targetId,
        safeLabel: targetLabel,
      },
      activeParishId,
      sourceDisplayRequirements: AI_SOURCE_DISPLAY_REQUIREMENTS,
      blockedFamilyFacingData: FAMILY_FACING_AI_EXCLUSIONS,
      sacramentalCanonicalRestrictions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
      sourceCards,
    },
  }
}

export function buildRequestSummarySourceDisplayDto(
  retrievalDto: RequestSummaryRetrievalDto
): AiSourceDisplayResult {
  return buildAiSourceDisplayDto({
    featureId: 'request_summary',
    target: {
      objectType: 'request',
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
