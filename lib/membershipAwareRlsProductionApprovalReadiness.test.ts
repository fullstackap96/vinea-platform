import { describe, expect, it } from 'vitest'

import {
  buildMembershipAwareRlsProductionApprovalReadiness,
  type MembershipAwareRlsProductionApprovalReadinessInput,
} from './membershipAwareRlsProductionApprovalReadiness'

function completeInput(): MembershipAwareRlsProductionApprovalReadinessInput {
  return {
    ownerStatuses: {
      product_owner: 'APPROVED',
      technical_owner: 'APPROVED',
      qa_owner: 'APPROVED',
      security_data_owner: 'APPROVED',
      rollback_owner: 'CONFIRMED',
      monitoring_owner: 'CONFIRMED',
      support_owner: 'CONFIRMED',
      evidence_owner: 'CONFIRMED',
    },
    fixtureStatuses: {
      staff_account: 'COMPLETE',
      active_parish: 'COMPLETE',
      same_parish_request: 'COMPLETE',
      cross_parish_denied_request: 'COMPLETE',
      workflow_step: 'COMPLETE',
      staff_synthetic_document: 'COMPLETE',
      family_synthetic_document: 'COMPLETE',
      family_portal_token_plan: 'COMPLETE',
      cleanup_plan: 'COMPLETE',
    },
    evidenceStatuses: {
      disposable_forward_rollback_validation: 'PASSED',
      disposable_cross_parish_allow_deny_qa: 'PASSED',
      disposable_route_document_family_portal_qa: 'PASSED',
      nonproduction_promotion_evidence: 'PASSED',
      shared_qa_promotion_smoke: 'PASSED',
      shared_qa_active_parish_cookie_smoke: 'PASSED',
      human_intake_validation: 'PASSED',
      smoke_fixture_verification_checklist: 'REVIEWED',
      rollout_evidence_crosswalk: 'REVIEWED',
      rollout_rollback_packet: 'REVIEWED',
      support_communication_note: 'REVIEWED',
      final_go_no_go_checklist: 'GO',
      final_automated_checks: 'PASSED',
    },
    smokeVerificationItems: [
      'pre_apply_health',
      'forward_migration_sanitized_output',
      'post_apply_health',
      'policy_shape_verification',
      'active_parish_request_detail',
      'request_documents_staff_route',
      'signed_url_route_authorized_only',
      'direct_storage_privacy_denial',
      'family_portal_safety',
      'family_portal_exclusions',
      'search_report_cross_parish_absence',
      'audit_events_redacted',
      'monitoring_observation',
      'cleanup_deactivation',
      'rollback_decision',
    ],
    productionTargetLabels: {
      appHostLabel: 'Production app host label only',
      databaseHostLabel: 'Production Supabase database host label only',
      releaseLabel: 'Production-intended release label',
      rolloutWindowLabel: 'Approved low-traffic rollout window label',
      rollbackDeadlineLabel: 'Approved rollback decision deadline label',
    },
    productionAccessNotStarted: true,
    migrationsNotAppliedDuringReview: true,
    operationalRlsUnchangedDuringReview: true,
    runtimePublicIntakeOutOfScope: true,
    aiProductionFlagsOutOfScope: true,
    googleCalendarMutationOutOfScope: true,
    unrelatedDeploymentOutOfScope: true,
    explicitProductionApprovalPhraseRecorded: false,
  }
}

describe('membership-aware RLS production approval readiness', () => {
  it('can be ready to request approval while keeping production rollout blocked until the explicit phrase is recorded', () => {
    const result = buildMembershipAwareRlsProductionApprovalReadiness(completeInput())

    expect(result.readyToRequestProductOwnerApproval).toBe(true)
    expect(result.readyForProductionRollout).toBe(false)
    expect(result.missingRequiredItems).toEqual([])
    expect(result.unsafeLabelFindings).toEqual([])
    expect(result.missingSmokeVerificationItems).toEqual([])
    expect(result.nextSafeAction).toContain(
      'Request the separate product-owner production approval prompt',
    )
    expect(result.productionNoGoBoundaries.join(' ')).toContain(
      'Production RLS remains NO-GO',
    )
  })

  it('marks production rollout ready only after the exact explicit approval phrase is recorded', () => {
    const result = buildMembershipAwareRlsProductionApprovalReadiness({
      ...completeInput(),
      explicitProductionApprovalPhraseRecorded: true,
    })

    expect(result.readyToRequestProductOwnerApproval).toBe(true)
    expect(result.readyForProductionRollout).toBe(true)
    expect(result.nextSafeAction).toContain(
      'Use the approved production rollout evidence template',
    )
  })

  it('blocks readiness when owners, fixtures, evidence, smoke items, or scope boundaries are missing', () => {
    const result = buildMembershipAwareRlsProductionApprovalReadiness({
      ...completeInput(),
      ownerStatuses: {
        product_owner: 'APPROVED',
      },
      fixtureStatuses: {
        staff_account: 'COMPLETE',
      },
      evidenceStatuses: {
        disposable_forward_rollback_validation: 'PASSED',
      },
      smokeVerificationItems: ['pre_apply_health'],
      runtimePublicIntakeOutOfScope: false,
      googleCalendarMutationOutOfScope: false,
    })

    expect(result.readyToRequestProductOwnerApproval).toBe(false)
    expect(result.readyForProductionRollout).toBe(false)
    expect(result.missingRequiredItems).toEqual(
      expect.arrayContaining([
        'technical_owner must be ready, complete, reviewed, approved, confirmed, passed, or GO',
        'active_parish must be ready, complete, reviewed, approved, confirmed, passed, or GO',
        'human_intake_validation must be ready, complete, reviewed, approved, confirmed, passed, or GO',
        'runtime public intake routing is out of scope',
        'Google Calendar mutation is out of scope',
      ]),
    )
    expect(result.missingSmokeVerificationItems).toContain(
      'policy_shape_verification',
    )
    expect(result.nextSafeAction).toContain('Complete the missing')
  })

  it('rejects secret-like target labels before approval is requested', () => {
    const result = buildMembershipAwareRlsProductionApprovalReadiness({
      ...completeInput(),
      productionTargetLabels: {
        appHostLabel: 'https://vineaplatform.com',
        databaseHostLabel: 'postgresql://postgres:secret@example.test/postgres',
        releaseLabel: 'release label with service_role key pasted by mistake',
        rolloutWindowLabel: '2026-07-10 8:00 PM Central',
        rollbackDeadlineLabel: 'rollback token_hash abc',
      },
    })

    expect(result.readyToRequestProductOwnerApproval).toBe(false)
    expect(result.unsafeLabelFindings).toEqual(
      expect.arrayContaining([
        'database host label: possible database url',
        'release label: possible api key wording',
        'rollback deadline label: possible token material',
      ]),
    )
  })
})
