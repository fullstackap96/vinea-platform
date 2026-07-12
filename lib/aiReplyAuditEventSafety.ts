import type { AiReplyAuditMetadataPreparationDto } from './aiReplySafetyChainDtos'

export const AI_REPLY_AUDIT_EVENT_SAFETY_VERSION =
  '2026-07-08-ai-reply-audit-event-safety-v1'

type AiReplyFutureAuditEvent = AiReplyAuditMetadataPreparationDto['futureAuditEvent']
type AiReplyFutureAuditMetadata = AiReplyFutureAuditEvent['metadata']

export type SafeAiReplyAuditEventForWrite = {
  readonly version: typeof AI_REPLY_AUDIT_EVENT_SAFETY_VERSION
  readonly event: AiReplyFutureAuditEvent
  readonly storageBoundary: {
    readonly rawPromptStored: false
    readonly rawOutputStored: false
    readonly providerPayloadStored: false
    readonly tokenMaterialStored: false
    readonly promptTextStored: false
    readonly autonomousSendAllowed: false
    readonly familyFacingOutputAllowed: false
    readonly safeReferencesOnly: true
  }
}

export type AiReplyAuditEventSafetyResult =
  | { readonly ok: true; readonly dto: SafeAiReplyAuditEventForWrite }
  | { readonly ok: false; readonly blockedReason: string }

const ALLOWED_METADATA_KEYS = new Set<keyof AiReplyFutureAuditMetadata>([
  'active_parish_context',
  'ai_feature_id',
  'autonomousSendAllowed',
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
  'request_id',
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

function block(blockedReason: string): AiReplyAuditEventSafetyResult {
  return { ok: false, blockedReason }
}

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function hasOnlyAllowedMetadataKeys(metadata: Record<string, unknown>): boolean {
  return Object.keys(metadata).every((key) =>
    ALLOWED_METADATA_KEYS.has(key as keyof AiReplyFutureAuditMetadata)
  )
}

function hasSafeStringList(values: readonly unknown[]): boolean {
  return values.every((value) => {
    const text = cleanText(value)
    return Boolean(text) && !unsafeReferencePattern.test(text)
  })
}

export function validateAiReplyAuditEventForSafeWrite(
  event: AiReplyFutureAuditEvent
): AiReplyAuditEventSafetyResult {
  const metadata = event.metadata as Record<string, unknown>
  const parishId = cleanText(event.parishId)
  const actorEmail = cleanText(event.actorEmail).toLowerCase()
  const targetId = cleanText(event.targetId)
  const requestId = cleanText(event.metadata.request_id)
  const activeParishContext = cleanText(event.metadata.active_parish_context)

  if (event.table !== 'audit_events') {
    return block('ai_reply_audit_write_requires_audit_events_table')
  }
  if (event.action !== 'ai.reply.audit_metadata_prepared') {
    return block('ai_reply_audit_write_requires_prepared_metadata_action')
  }
  if (event.targetType !== 'communication_draft') {
    return block('ai_reply_audit_write_requires_communication_draft_target')
  }
  if (!parishId || !actorEmail || !targetId || !requestId || !activeParishContext) {
    return block('ai_reply_audit_write_requires_scope_actor_target_and_request')
  }
  if (activeParishContext !== parishId) {
    return block('ai_reply_audit_write_active_parish_must_match_event_parish')
  }
  if (event.metadata.target_object_type !== 'communication_draft') {
    return block('ai_reply_audit_write_metadata_requires_communication_draft_target')
  }
  if (cleanText(event.metadata.target_object_id) !== targetId) {
    return block('ai_reply_audit_write_metadata_target_mismatch')
  }
  if (event.metadata.ai_feature_id !== 'email_draft') {
    return block('ai_reply_audit_write_requires_email_draft_feature')
  }
  if (event.metadata.output_destination !== 'draft_only') {
    return block('ai_reply_audit_write_requires_draft_only_destination')
  }
  if (event.metadata.model_or_provider_family !== 'not_invoked') {
    return block('ai_reply_audit_write_requires_not_invoked_model_family')
  }
  if (event.metadata.autonomousSendAllowed) {
    return block('ai_reply_audit_write_autonomous_send_not_allowed')
  }
  if (!event.metadata.humanApprovalRequired) {
    return block('ai_reply_audit_write_requires_human_approval')
  }
  if (event.metadata.familyFacingOutputAllowed) {
    return block('ai_reply_audit_write_family_facing_output_not_allowed')
  }
  if (
    event.metadata.rawPromptStored ||
    event.metadata.rawOutputStored ||
    event.metadata.providerPayloadStored ||
    event.metadata.tokenMaterialStored
  ) {
    return block('ai_reply_audit_write_private_ai_material_must_not_be_stored')
  }
  if (
    event.metadata.prompt_assembly.promptTextIncluded ||
    event.metadata.prompt_assembly.promptTextStored
  ) {
    return block('ai_reply_audit_write_prompt_text_must_not_be_included_or_stored')
  }
  if (!hasOnlyAllowedMetadataKeys(metadata)) {
    return block('ai_reply_audit_write_contains_unapproved_metadata_keys')
  }
  if (
    !Array.isArray(event.metadata.input_data_classes) ||
    event.metadata.input_data_classes.length === 0 ||
    !hasSafeStringList(event.metadata.input_data_classes)
  ) {
    return block('ai_reply_audit_write_requires_safe_input_data_classes')
  }
  if (
    !Array.isArray(event.metadata.safe_source_references) ||
    event.metadata.safe_source_references.length === 0 ||
    !hasSafeStringList(event.metadata.safe_source_references)
  ) {
    return block('ai_reply_audit_write_requires_safe_source_references')
  }
  if (
    !Array.isArray(event.metadata.prompt_assembly.sourceReferenceIds) ||
    event.metadata.prompt_assembly.sourceReferenceIds.length === 0 ||
    !hasSafeStringList(event.metadata.prompt_assembly.sourceReferenceIds)
  ) {
    return block('ai_reply_audit_write_requires_safe_prompt_source_references')
  }

  const safeAuditReferences = new Set(event.metadata.safe_source_references)
  for (const sourceReferenceId of event.metadata.prompt_assembly.sourceReferenceIds) {
    if (!safeAuditReferences.has(sourceReferenceId)) {
      return block('ai_reply_audit_write_prompt_source_not_in_safe_audit_references')
    }
  }

  return {
    ok: true,
    dto: {
      version: AI_REPLY_AUDIT_EVENT_SAFETY_VERSION,
      event,
      storageBoundary: {
        rawPromptStored: false,
        rawOutputStored: false,
        providerPayloadStored: false,
        tokenMaterialStored: false,
        promptTextStored: false,
        autonomousSendAllowed: false,
        familyFacingOutputAllowed: false,
        safeReferencesOnly: true,
      },
    },
  }
}
