import { describe, expect, it } from 'vitest'
import {
  AI_AUDIT_METADATA_REQUIREMENTS,
  AI_DATA_CLASS_POLICIES,
  AI_FEATURE_REGISTRY,
  AI_SAFETY_REGISTRY_VERSION,
  AI_SOURCE_DISPLAY_REQUIREMENTS,
  FAMILY_FACING_AI_EXCLUSIONS,
  SACRAMENTAL_CANONICAL_AI_RESTRICTIONS,
  getAiFeaturePolicy,
  getAllowedAiDataClasses,
  validateAiSafetyRegistry,
} from './aiSafetyRegistry'

describe('AI safety registry', () => {
  it('is a non-runtime policy contract for the approved AI safety phase', () => {
    expect(AI_SAFETY_REGISTRY_VERSION).toBe('2026-06-27-non-runtime-v1')
    expect(Object.keys(AI_FEATURE_REGISTRY).sort()).toEqual([
      'document_intelligence',
      'email_draft',
      'permission_scoped_retrieval',
      'request_summary',
    ])
    expect(AI_FEATURE_REGISTRY.request_summary.runtimeState).toBe('current_route_not_registry_wired')
    expect(AI_FEATURE_REGISTRY.email_draft.runtimeState).toBe('current_route_not_registry_wired')
    expect(AI_FEATURE_REGISTRY.permission_scoped_retrieval.runtimeState).toBe('planned_non_runtime')
  })

  it('requires permission scope, source display, human approval, audit metadata, and retention rules', () => {
    for (const feature of Object.values(AI_FEATURE_REGISTRY)) {
      expect(feature.humanApprovalRequired).toBe(true)
      expect(feature.sourceDisplayRequired).toBe(true)
      expect(feature.auditMetadataRequired).toBe(true)
      expect(feature.retentionRule.toLowerCase()).toContain('retention')
      expect(feature.retrievalScopeRequirements).toEqual(
        expect.arrayContaining([
          'authenticated_staff_identity',
          'active_staff_authorization',
          'active_parish_context_or_documented_legacy_fallback',
          'parish_membership_authorization',
          'route_level_permission',
          'object_level_parish_relationship',
          'family_facing_exclusion_rules',
          'sacramental_canonical_restriction_rules',
          'ai_audit_metadata',
        ])
      )
    }

    expect(AI_SOURCE_DISPLAY_REQUIREMENTS).toEqual(
      expect.arrayContaining([
        'source_object_type',
        'safe_source_label',
        'parish_scope',
        'staff_only_flag',
        'family_facing_safe_flag',
        'permission_checked_source_link',
      ])
    )
    expect(AI_AUDIT_METADATA_REQUIREMENTS).toEqual(
      expect.arrayContaining([
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
        'blocked_reason',
      ])
    )
  })

  it('blocks family-facing AI leakage and token exposure for every feature', () => {
    expect(FAMILY_FACING_AI_EXCLUSIONS).toEqual(
      expect.arrayContaining([
        'audit logs',
        'AI notes',
        'internal staff notes',
        'portal token hashes',
        'plaintext family portal tokens',
        'private parish data',
        'cross-parish context',
        'staff-only communication history',
      ])
    )

    for (const feature of Object.values(AI_FEATURE_REGISTRY)) {
      expect(feature.familyFacingOutputAllowed).toBe(false)
      expect(feature.blockedDataClasses).toEqual(
        expect.arrayContaining(['portal token hashes', 'plaintext family portal tokens'])
      )
    }
  })

  it('keeps sacramental and canonical decisions outside AI authority', () => {
    expect(SACRAMENTAL_CANONICAL_AI_RESTRICTIONS).toEqual(
      expect.arrayContaining([
        'determine sacramental eligibility',
        'decide certificate issuance',
        'correct sacramental registers',
        'add canonical notations',
        'interpret diocesan canonical policy as final authority',
        'decide marriage preparation readiness',
        'decide OCIA readiness or sacramental reception',
      ])
    )

    for (const feature of Object.values(AI_FEATURE_REGISTRY)) {
      expect(feature.prohibitedActions).toEqual(
        expect.arrayContaining([...SACRAMENTAL_CANONICAL_AI_RESTRICTIONS])
      )
    }
  })

  it('maps allowed data classes for summaries, drafts, retrieval, and document intelligence', () => {
    expect(getAllowedAiDataClasses('request_summary')).toEqual(
      expect.arrayContaining([
        'request_core',
        'request_contact',
        'request_status_assignment_followup',
        'request_workflow_steps',
        'request_notes_staff_only',
        'communication_history',
        'people_household_context',
        'sacramental_record_metadata',
      ])
    )
    expect(getAllowedAiDataClasses('email_draft')).toEqual(
      expect.arrayContaining([
        'request_core',
        'request_contact',
        'request_workflow_steps',
        'request_document_metadata',
        'communication_history',
      ])
    )
    expect(getAllowedAiDataClasses('permission_scoped_retrieval')).toContain('audit_event_references')
    expect(getAllowedAiDataClasses('document_intelligence')).toEqual(['request_document_metadata'])
  })

  it('marks sensitive/canonical data classes as staff-only and retention-bound', () => {
    expect(AI_DATA_CLASS_POLICIES.request_notes_staff_only.familyFacingSafe).toBe(false)
    expect(AI_DATA_CLASS_POLICIES.request_document_contents.familyFacingSafe).toBe(false)
    expect(AI_DATA_CLASS_POLICIES.sacramental_record_metadata.sacramentalCanonicalRestricted).toBe(true)
    expect(AI_DATA_CLASS_POLICIES.audit_event_references.retention).toContain('audit-log retention')
  })

  it('exposes lookup and validation helpers for future wiring gates', () => {
    expect(getAiFeaturePolicy('email_draft').label).toBe('AI email draft')
    expect(validateAiSafetyRegistry()).toEqual({ ok: true, errors: [] })
  })
})
