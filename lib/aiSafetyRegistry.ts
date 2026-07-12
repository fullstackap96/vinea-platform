export const AI_SAFETY_REGISTRY_VERSION = '2026-06-27-non-runtime-v1'

export const AI_DATA_CLASS_POLICIES = {
  request_core: {
    label: 'Request core fields',
    familyFacingSafe: true,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request retention policy when saved or sent.',
  },
  request_contact: {
    label: 'Request contact information',
    familyFacingSafe: true,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request and communication retention policy.',
  },
  request_status_assignment_followup: {
    label: 'Request status, assignment, and follow-up fields',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request retention policy.',
  },
  request_workflow_steps: {
    label: 'Request workflow steps',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request retention policy.',
  },
  request_document_metadata: {
    label: 'Request document metadata',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request document retention policy.',
  },
  request_document_contents: {
    label: 'Request document contents',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow the parent request document retention policy only after explicit approval.',
  },
  request_notes_staff_only: {
    label: 'Staff-only request notes',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow staff-only internal note retention.',
  },
  communication_history: {
    label: 'Communication history',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow communication-history retention.',
  },
  people_household_context: {
    label: 'People and household context',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow people and household retention.',
  },
  sacramental_record_metadata: {
    label: 'Sacramental record metadata',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: true,
    retention: 'Follow sacramental/canonical record retention; do not hard-delete automatically.',
  },
  audit_event_references: {
    label: 'Safe audit event references',
    familyFacingSafe: false,
    sacramentalCanonicalRestricted: false,
    retention: 'Follow audit-log retention; store references instead of private prompt/output payloads.',
  },
} as const

export const FAMILY_FACING_AI_EXCLUSIONS = [
  'audit logs',
  'AI notes',
  'internal staff notes',
  'portal token hashes',
  'plaintext family portal tokens',
  'private parish data',
  'cross-parish context',
  'staff-only communication history',
  'sacramental or canonical decision rationale',
] as const

export const SACRAMENTAL_CANONICAL_AI_RESTRICTIONS = [
  'determine sacramental eligibility',
  'decide certificate issuance',
  'correct sacramental registers',
  'add canonical notations',
  'interpret diocesan canonical policy as final authority',
  'decide marriage preparation readiness',
  'decide OCIA readiness or sacramental reception',
  'replace pastor, deacon, DRE, OCIA coordinator, or parish staff judgment',
] as const

export const AI_AUDIT_METADATA_REQUIREMENTS = [
  'staff_user_id_or_email',
  'parish_id',
  'active_parish_context',
  'target_object_type',
  'target_object_id',
  'ai_feature_id',
  'input_data_classes',
  'safe_source_references',
  'output_destination',
  'staff_disposition',
  'model_or_provider_family',
  'timestamp',
  'blocked_reason',
] as const

export const AI_SOURCE_DISPLAY_REQUIREMENTS = [
  'source_object_type',
  'safe_source_label',
  'source_timestamp',
  'parish_scope',
  'staff_only_flag',
  'family_facing_safe_flag',
  'permission_checked_source_link',
] as const

const COMMON_RETRIEVAL_SCOPE_REQUIREMENTS = [
  'authenticated_staff_identity',
  'active_staff_authorization',
  'active_parish_context_or_documented_legacy_fallback',
  'parish_membership_authorization',
  'route_level_permission',
  'object_level_parish_relationship',
  'family_facing_exclusion_rules',
  'sacramental_canonical_restriction_rules',
  'ai_audit_metadata',
] as const

export type AiDataClassId = keyof typeof AI_DATA_CLASS_POLICIES
export type AiFeatureId = keyof typeof AI_FEATURE_REGISTRY

type AiRuntimeState = 'current_route_not_registry_wired' | 'planned_non_runtime' | 'blocked_until_policy_approval'
type AiOutputDestination = 'draft_only' | 'internal_summary' | 'saved_staff_note' | 'sent_communication'

export type AiFeaturePolicy = {
  readonly id: string
  readonly label: string
  readonly runtimeState: AiRuntimeState
  readonly familyFacingOutputAllowed: boolean
  readonly humanApprovalRequired: boolean
  readonly sourceDisplayRequired: boolean
  readonly auditMetadataRequired: boolean
  readonly retentionRule: string
  readonly allowedDataClasses: readonly AiDataClassId[]
  readonly blockedDataClasses: readonly string[]
  readonly outputDestinations: readonly AiOutputDestination[]
  readonly retrievalScopeRequirements: readonly string[]
  readonly prohibitedActions: readonly string[]
}

export const AI_FEATURE_REGISTRY = {
  request_summary: {
    id: 'request_summary',
    label: 'Request AI summary',
    runtimeState: 'current_route_not_registry_wired',
    familyFacingOutputAllowed: false,
    humanApprovalRequired: true,
    sourceDisplayRequired: true,
    auditMetadataRequired: true,
    retentionRule:
      'Treat as transient unless staff saves it; saved summaries follow staff-only request note or parent request retention.',
    allowedDataClasses: [
      'request_core',
      'request_contact',
      'request_status_assignment_followup',
      'request_workflow_steps',
      'request_notes_staff_only',
      'communication_history',
      'people_household_context',
      'sacramental_record_metadata',
    ],
    blockedDataClasses: [...FAMILY_FACING_AI_EXCLUSIONS],
    outputDestinations: ['internal_summary', 'saved_staff_note'],
    retrievalScopeRequirements: COMMON_RETRIEVAL_SCOPE_REQUIREMENTS,
    prohibitedActions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  },
  email_draft: {
    id: 'email_draft',
    label: 'AI email draft',
    runtimeState: 'current_route_not_registry_wired',
    familyFacingOutputAllowed: false,
    humanApprovalRequired: true,
    sourceDisplayRequired: true,
    auditMetadataRequired: true,
    retentionRule:
      'Treat as transient unless staff sends or saves it; sent drafts follow communication-history retention.',
    allowedDataClasses: [
      'request_core',
      'request_contact',
      'request_status_assignment_followup',
      'request_workflow_steps',
      'request_document_metadata',
      'request_notes_staff_only',
      'communication_history',
      'people_household_context',
    ],
    blockedDataClasses: [...FAMILY_FACING_AI_EXCLUSIONS],
    outputDestinations: ['draft_only', 'sent_communication'],
    retrievalScopeRequirements: COMMON_RETRIEVAL_SCOPE_REQUIREMENTS,
    prohibitedActions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  },
  permission_scoped_retrieval: {
    id: 'permission_scoped_retrieval',
    label: 'Future permission-scoped AI retrieval',
    runtimeState: 'planned_non_runtime',
    familyFacingOutputAllowed: false,
    humanApprovalRequired: true,
    sourceDisplayRequired: true,
    auditMetadataRequired: true,
    retentionRule:
      'Retention rule: do not retain raw prompts or broad retrieval payloads unless approved; retain safe source references and staff dispositions.',
    allowedDataClasses: [
      'request_core',
      'request_contact',
      'request_status_assignment_followup',
      'request_workflow_steps',
      'request_document_metadata',
      'request_notes_staff_only',
      'communication_history',
      'people_household_context',
      'sacramental_record_metadata',
      'audit_event_references',
    ],
    blockedDataClasses: [...FAMILY_FACING_AI_EXCLUSIONS, 'raw audit log payloads', 'raw provider payloads'],
    outputDestinations: ['draft_only', 'internal_summary', 'saved_staff_note'],
    retrievalScopeRequirements: COMMON_RETRIEVAL_SCOPE_REQUIREMENTS,
    prohibitedActions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  },
  document_intelligence: {
    id: 'document_intelligence',
    label: 'Future request document intelligence',
    runtimeState: 'blocked_until_policy_approval',
    familyFacingOutputAllowed: false,
    humanApprovalRequired: true,
    sourceDisplayRequired: true,
    auditMetadataRequired: true,
    retentionRule:
      'Do not analyze document contents until document privacy, consent/notice, retention, and source-display gates are approved.',
    allowedDataClasses: ['request_document_metadata'],
    blockedDataClasses: [
      ...FAMILY_FACING_AI_EXCLUSIONS,
      'request document contents until explicit document-intelligence approval',
    ],
    outputDestinations: ['draft_only', 'internal_summary'],
    retrievalScopeRequirements: COMMON_RETRIEVAL_SCOPE_REQUIREMENTS,
    prohibitedActions: SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  },
} as const satisfies Record<string, AiFeaturePolicy>

export function getAiFeaturePolicy(featureId: AiFeatureId): AiFeaturePolicy {
  return AI_FEATURE_REGISTRY[featureId]
}

export function getAllowedAiDataClasses(featureId: AiFeatureId): readonly AiDataClassId[] {
  return getAiFeaturePolicy(featureId).allowedDataClasses
}

export function validateAiSafetyRegistry(): { ok: boolean; errors: string[] } {
  const errors: string[] = []

  for (const [featureId, feature] of Object.entries(AI_FEATURE_REGISTRY)) {
    if (feature.id !== featureId) {
      errors.push(`${featureId}: id must match registry key`)
    }
    if (feature.familyFacingOutputAllowed) {
      errors.push(`${featureId}: family-facing AI output must remain disabled`)
    }
    if (!feature.humanApprovalRequired) {
      errors.push(`${featureId}: human approval is required`)
    }
    if (!feature.sourceDisplayRequired) {
      errors.push(`${featureId}: source display is required`)
    }
    if (!feature.auditMetadataRequired) {
      errors.push(`${featureId}: audit metadata is required`)
    }
    if (!feature.retrievalScopeRequirements.includes('parish_membership_authorization')) {
      errors.push(`${featureId}: parish membership authorization is required`)
    }
    if (!feature.retrievalScopeRequirements.includes('object_level_parish_relationship')) {
      errors.push(`${featureId}: object-level parish relationship is required`)
    }
    if (!feature.blockedDataClasses.some((blocked) => blocked.includes('token'))) {
      errors.push(`${featureId}: token material must be blocked`)
    }
    if (!feature.prohibitedActions.includes('determine sacramental eligibility')) {
      errors.push(`${featureId}: sacramental/canonical restrictions are required`)
    }
    for (const dataClass of feature.allowedDataClasses) {
      if (!AI_DATA_CLASS_POLICIES[dataClass]) {
        errors.push(`${featureId}: unknown data class ${dataClass}`)
      }
    }
  }

  return { ok: errors.length === 0, errors }
}
