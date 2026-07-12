import type { AiSummaryAuditMetadataPreparationDto } from './server/aiSummarySafetyChainAdapter'

export const AI_SUMMARY_AUDIT_EVENT_SAFETY_VERSION =
  '2026-07-08-ai-summary-audit-event-safety-v1'

type AiSummaryFutureAuditEvent = AiSummaryAuditMetadataPreparationDto['futureAuditEvent']
type AiSummaryFutureAuditMetadata = AiSummaryFutureAuditEvent['metadata']

export type SafeAiSummaryAuditEventForWrite = {
  readonly version: typeof AI_SUMMARY_AUDIT_EVENT_SAFETY_VERSION
  readonly event: AiSummaryFutureAuditEvent
  readonly storageBoundary: {
    readonly rawPromptStored: false
    readonly rawOutputStored: false
    readonly providerPayloadStored: false
    readonly tokenMaterialStored: false
    readonly promptTextStored: false
    readonly familyFacingOutputAllowed: false
    readonly safeReferencesOnly: true
  }
}

export type AiSummaryAuditEventSafetyResult =
  | { readonly ok: true; readonly dto: SafeAiSummaryAuditEventForWrite }
  | { readonly ok: false; readonly blockedReason: string }

const ALLOWED_METADATA_KEYS = new Set<keyof AiSummaryFutureAuditMetadata>([
  'active_parish_context',
  'ai_feature_id',
  'blocked_reason',
  'familyFacingOutputAllowed',
  'humanApprovalRequired',
  'input_data_classes',
  'model_or_provider_family',
  'output_destination',
  'providerPayloadStored',
  'prompt_assembly',
  'rawOutputStored',
  'rawPromptStored',
  'safe_source_references',
  'source_display',
  'staff_disposition',
  'staff_review_status',
  'target_object_id',
  'target_object_type',
  'tokenMaterialStored',
])

const unsafeReferencePattern =
  /\b(token|hash|secret|password|signed url|signed-url|storage path|raw prompt|raw output|provider payload|plaintext|document content|original filename)\b/i

function block(blockedReason: string): AiSummaryAuditEventSafetyResult {
  return { ok: false, blockedReason }
}

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function hasOnlyAllowedMetadataKeys(metadata: Record<string, unknown>): boolean {
  return Object.keys(metadata).every((key) =>
    ALLOWED_METADATA_KEYS.has(key as keyof AiSummaryFutureAuditMetadata)
  )
}

function hasSafeStringList(values: readonly unknown[]): boolean {
  return values.every((value) => {
    const text = cleanText(value)
    return Boolean(text) && !unsafeReferencePattern.test(text)
  })
}

export function validateAiSummaryAuditEventForSafeWrite(
  event: AiSummaryFutureAuditEvent
): AiSummaryAuditEventSafetyResult {
  const metadata = event.metadata as Record<string, unknown>
  const parishId = cleanText(event.parishId)
  const actorEmail = cleanText(event.actorEmail).toLowerCase()
  const targetId = cleanText(event.targetId)
  const activeParishContext = cleanText(event.metadata.active_parish_context)

  if (event.table !== 'audit_events') {
    return block('ai_summary_audit_write_requires_audit_events_table')
  }
  if (event.action !== 'ai.summary.audit_metadata_prepared') {
    return block('ai_summary_audit_write_requires_prepared_metadata_action')
  }
  if (event.targetType !== 'request') {
    return block('ai_summary_audit_write_requires_request_target')
  }
  if (!parishId || !actorEmail || !targetId || !activeParishContext) {
    return block('ai_summary_audit_write_requires_scope_actor_and_target')
  }
  if (activeParishContext !== parishId) {
    return block('ai_summary_audit_write_active_parish_must_match_event_parish')
  }
  if (event.metadata.target_object_type !== 'request') {
    return block('ai_summary_audit_write_metadata_requires_request_target')
  }
  if (cleanText(event.metadata.target_object_id) !== targetId) {
    return block('ai_summary_audit_write_metadata_target_mismatch')
  }
  if (event.metadata.ai_feature_id !== 'request_summary') {
    return block('ai_summary_audit_write_requires_request_summary_feature')
  }
  if (event.metadata.output_destination !== 'internal_summary') {
    return block('ai_summary_audit_write_requires_internal_summary_destination')
  }
  if (event.metadata.model_or_provider_family !== 'not_invoked') {
    return block('ai_summary_audit_write_requires_not_invoked_model_family')
  }
  if (!event.metadata.humanApprovalRequired) {
    return block('ai_summary_audit_write_requires_human_approval')
  }
  if (event.metadata.familyFacingOutputAllowed) {
    return block('ai_summary_audit_write_family_facing_output_not_allowed')
  }
  if (
    event.metadata.rawPromptStored ||
    event.metadata.rawOutputStored ||
    event.metadata.providerPayloadStored ||
    event.metadata.tokenMaterialStored
  ) {
    return block('ai_summary_audit_write_private_ai_material_must_not_be_stored')
  }
  if (
    event.metadata.prompt_assembly.promptTextIncluded ||
    event.metadata.prompt_assembly.promptTextStored
  ) {
    return block('ai_summary_audit_write_prompt_text_must_not_be_included_or_stored')
  }
  if (!hasOnlyAllowedMetadataKeys(metadata)) {
    return block('ai_summary_audit_write_contains_unapproved_metadata_keys')
  }
  if (
    !Array.isArray(event.metadata.input_data_classes) ||
    event.metadata.input_data_classes.length === 0 ||
    !hasSafeStringList(event.metadata.input_data_classes)
  ) {
    return block('ai_summary_audit_write_requires_safe_input_data_classes')
  }
  if (
    !Array.isArray(event.metadata.safe_source_references) ||
    event.metadata.safe_source_references.length === 0 ||
    !hasSafeStringList(event.metadata.safe_source_references)
  ) {
    return block('ai_summary_audit_write_requires_safe_source_references')
  }
  if (
    !Array.isArray(event.metadata.prompt_assembly.sourceReferenceIds) ||
    event.metadata.prompt_assembly.sourceReferenceIds.length === 0 ||
    !hasSafeStringList(event.metadata.prompt_assembly.sourceReferenceIds)
  ) {
    return block('ai_summary_audit_write_requires_safe_prompt_source_references')
  }

  const safeAuditReferences = new Set(event.metadata.safe_source_references)
  for (const sourceReferenceId of event.metadata.prompt_assembly.sourceReferenceIds) {
    if (!safeAuditReferences.has(sourceReferenceId)) {
      return block('ai_summary_audit_write_prompt_source_not_in_safe_audit_references')
    }
  }

  return {
    ok: true,
    dto: {
      version: AI_SUMMARY_AUDIT_EVENT_SAFETY_VERSION,
      event,
      storageBoundary: {
        rawPromptStored: false,
        rawOutputStored: false,
        providerPayloadStored: false,
        tokenMaterialStored: false,
        promptTextStored: false,
        familyFacingOutputAllowed: false,
        safeReferencesOnly: true,
      },
    },
  }
}
