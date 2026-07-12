import {
  AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
  AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
  type AiReplyResponseScaffoldDto,
} from './aiReplySafetyChainDtos'

export const AI_REPLY_SAFE_RESPONSE_EXPOSURE_VERSION =
  '2026-07-08-ai-reply-safe-response-exposure-v1'

type JsonObject = Record<string, unknown>

export type SafeAiReplyResponseExposureDto = {
  readonly version: typeof AI_REPLY_SAFE_RESPONSE_EXPOSURE_VERSION
  readonly exposureStatus: 'safe_scaffold_only'
  readonly scaffold: AiReplyResponseScaffoldDto
  readonly clientBoundary: {
    readonly generatedOutputIncluded: false
    readonly rawPromptIncluded: false
    readonly providerPayloadIncluded: false
    readonly tokenMaterialIncluded: false
    readonly storageDetailsIncluded: false
    readonly sendControlsIncluded: false
    readonly familyFacingOutputAllowed: false
    readonly humanApprovalRequired: true
  }
}

export type AiReplySafeResponseExposureResult =
  | { readonly ok: true; readonly dto: SafeAiReplyResponseExposureDto }
  | { readonly ok: false; readonly blockedReason: string }

const TOP_LEVEL_KEYS = new Set([
  'activeParishId',
  'clientExposure',
  'dtoVersion',
  'failClosedResponse',
  'privateMaterialPolicy',
  'runtimeState',
  'sourceDisplay',
  'staffReview',
  'target',
])

const FAIL_CLOSED_KEYS = new Set(['error', 'ok', 'status'])
const TARGET_KEYS = new Set(['objectId', 'objectType', 'requestId', 'safeLabel'])
const SOURCE_DISPLAY_KEYS = new Set(['dtoVersion', 'sourceCardCount', 'sourceCards'])
const SOURCE_CARD_KEYS = new Set([
  'dataClass',
  'displayOnly',
  'familyFacingSafe',
  'id',
  'reference',
  'sacramentalCanonicalRestricted',
  'safeLabel',
  'staffOnly',
  'type',
])
const STAFF_REVIEW_KEYS = new Set([
  'displayLabel',
  'dtoVersion',
  'familyFacingOutputAllowed',
  'humanApprovalRequired',
  'reviewStatus',
  'staffActionRequired',
  'staffGuidance',
])
const PRIVATE_MATERIAL_POLICY_KEYS = new Set([
  'autonomousSendControlsIncluded',
  'communicationBodiesIncluded',
  'documentContentsIncluded',
  'generatedOutputIncluded',
  'internalNoteBodiesIncluded',
  'promptIncluded',
  'providerPayloadIncluded',
  'tokenMaterialIncluded',
])

const unsafeTextPattern =
  /\b(raw prompt|raw output|provider payload|token|hash|secret|password|signed url|signed-url|storage path|document content|original filename|send now|auto-send)\b/i

function block(blockedReason: string): AiReplySafeResponseExposureResult {
  return { ok: false, blockedReason }
}

function objectKeysAllowed(value: unknown, allowedKeys: Set<string>): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.keys(value as JsonObject).every((key) => allowedKeys.has(key))
}

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isSafeText(value: unknown): boolean {
  const text = cleanText(value)
  return Boolean(text) && !unsafeTextPattern.test(text)
}

function hasSafePrivateMaterialPolicy(policy: AiReplyResponseScaffoldDto['privateMaterialPolicy']) {
  return (
    policy.promptIncluded === false &&
    policy.generatedOutputIncluded === false &&
    policy.providerPayloadIncluded === false &&
    policy.tokenMaterialIncluded === false &&
    policy.internalNoteBodiesIncluded === false &&
    policy.communicationBodiesIncluded === false &&
    policy.documentContentsIncluded === false &&
    policy.autonomousSendControlsIncluded === false
  )
}

export function validateAiReplyResponseScaffoldForSafeExposure(
  scaffold: AiReplyResponseScaffoldDto
): AiReplySafeResponseExposureResult {
  if (!objectKeysAllowed(scaffold, TOP_LEVEL_KEYS)) {
    return block('ai_reply_safe_response_contains_unapproved_top_level_keys')
  }
  if (scaffold.dtoVersion !== AI_REPLY_RESPONSE_SCAFFOLD_VERSION) {
    return block('ai_reply_safe_response_requires_reply_response_scaffold_version')
  }
  if (scaffold.runtimeState !== 'reply_source_display_staff_review_response_scaffold_only') {
    return block('ai_reply_safe_response_requires_scaffold_runtime_state')
  }
  if (scaffold.clientExposure !== 'not_returned_while_generation_disabled') {
    return block('ai_reply_safe_response_requires_disabled_generation_exposure_boundary')
  }
  if (
    !objectKeysAllowed(scaffold.failClosedResponse, FAIL_CLOSED_KEYS) ||
    scaffold.failClosedResponse.ok !== false ||
    scaffold.failClosedResponse.error !== AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON ||
    scaffold.failClosedResponse.status !== 503
  ) {
    return block('ai_reply_safe_response_requires_generic_fail_closed_response')
  }
  if (
    !objectKeysAllowed(scaffold.target, TARGET_KEYS) ||
    scaffold.target.objectType !== 'communication_draft' ||
    !isSafeText(scaffold.target.objectId) ||
    !isSafeText(scaffold.target.requestId) ||
    !isSafeText(scaffold.target.safeLabel) ||
    !isSafeText(scaffold.activeParishId)
  ) {
    return block('ai_reply_safe_response_requires_safe_target_and_parish_scope')
  }
  if (
    !objectKeysAllowed(scaffold.sourceDisplay, SOURCE_DISPLAY_KEYS) ||
    scaffold.sourceDisplay.sourceCardCount !== scaffold.sourceDisplay.sourceCards.length ||
    scaffold.sourceDisplay.sourceCards.length === 0
  ) {
    return block('ai_reply_safe_response_requires_safe_source_display_cards')
  }
  for (const card of scaffold.sourceDisplay.sourceCards) {
    if (
      !objectKeysAllowed(card, SOURCE_CARD_KEYS) ||
      card.displayOnly !== true ||
      !isSafeText(card.id) ||
      !isSafeText(card.reference) ||
      !isSafeText(card.type) ||
      !isSafeText(card.dataClass) ||
      !isSafeText(card.safeLabel)
    ) {
      return block('ai_reply_safe_response_contains_unsafe_source_card')
    }
  }
  if (
    !objectKeysAllowed(scaffold.staffReview, STAFF_REVIEW_KEYS) ||
    scaffold.staffReview.humanApprovalRequired !== true ||
    scaffold.staffReview.familyFacingOutputAllowed !== false ||
    !isSafeText(scaffold.staffReview.displayLabel) ||
    !isSafeText(scaffold.staffReview.staffGuidance)
  ) {
    return block('ai_reply_safe_response_requires_staff_review_boundary')
  }
  if (
    !objectKeysAllowed(scaffold.privateMaterialPolicy, PRIVATE_MATERIAL_POLICY_KEYS) ||
    !hasSafePrivateMaterialPolicy(scaffold.privateMaterialPolicy)
  ) {
    return block('ai_reply_safe_response_private_material_must_not_be_included')
  }

  return {
    ok: true,
    dto: {
      version: AI_REPLY_SAFE_RESPONSE_EXPOSURE_VERSION,
      exposureStatus: 'safe_scaffold_only',
      scaffold,
      clientBoundary: {
        generatedOutputIncluded: false,
        rawPromptIncluded: false,
        providerPayloadIncluded: false,
        tokenMaterialIncluded: false,
        storageDetailsIncluded: false,
        sendControlsIncluded: false,
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
      },
    },
  }
}
