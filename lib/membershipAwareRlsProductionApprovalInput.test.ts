import { describe, expect, it } from 'vitest'

import {
  MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
  buildMembershipAwareRlsProductionApprovalInput,
  evaluateMembershipAwareRlsProductionApprovalPacket,
  type MembershipAwareRlsProductionApprovalPacketLabels,
} from './membershipAwareRlsProductionApprovalInput'

function completePacket(
  overrides: Partial<MembershipAwareRlsProductionApprovalPacketLabels> = {},
): MembershipAwareRlsProductionApprovalPacketLabels {
  return {
    ownerLabels: {
      product_owner: 'Product Owner label',
      technical_owner: 'Technical Owner label',
      qa_owner: 'QA Owner label',
      security_data_owner: 'Security/Data Owner label',
      rollback_owner: 'Rollback Owner label',
      monitoring_owner: 'Monitoring Owner label',
      support_owner: 'Support Owner label',
      evidence_owner: 'Evidence Owner label',
    },
    fixtureLabels: {
      staff_account: 'Production RLS smoke staff account label only',
      active_parish: 'Production RLS smoke active parish label',
      same_parish_request: 'Production RLS smoke same-parish request label',
      cross_parish_denied_request:
        'Production RLS smoke cross-parish denied request label',
      workflow_step: 'Production RLS smoke workflow step label',
      staff_synthetic_document: 'Synthetic staff document label',
      family_synthetic_document: 'Synthetic family document label',
      family_portal_token_plan:
        'Create during smoke window, do not record raw token, deactivate after smoke',
      cleanup_plan: 'Delete synthetic docs and restore safe request state if changed',
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
    productionTargetLabels: {
      appHostLabel: 'Production app host label only',
      databaseHostLabel: 'Production Supabase database host label only',
      releaseLabel: 'Production release label',
      rolloutWindowLabel: 'Approved low-traffic rollout window label',
      rollbackDeadlineLabel: 'Approved rollback decision deadline label',
    },
    scopeBoundaries: {
      productionAccessNotStarted: true,
      migrationsNotAppliedDuringReview: true,
      operationalRlsUnchangedDuringReview: true,
      runtimePublicIntakeOutOfScope: true,
      aiProductionFlagsOutOfScope: true,
      googleCalendarMutationOutOfScope: true,
      unrelatedDeploymentOutOfScope: true,
    },
    ...overrides,
  }
}

describe('membership-aware RLS production approval input builder', () => {
  it('builds readiness input from complete non-secret owner and fixture labels', () => {
    const built = buildMembershipAwareRlsProductionApprovalInput(completePacket())

    expect(built.missingLabelFields).toEqual([])
    expect(built.unsafeLabelFindings).toEqual([])
    expect(built.approvalPhraseRecorded).toBe(false)
    expect(built.readinessInput.ownerStatuses.product_owner).toBe('COMPLETE')
    expect(built.readinessInput.fixtureStatuses.staff_account).toBe('COMPLETE')
    expect(built.readinessInput.explicitProductionApprovalPhraseRecorded).toBe(
      false,
    )
  })

  it('is ready to request approval but blocks rollout until the exact phrase is supplied separately', () => {
    const result = evaluateMembershipAwareRlsProductionApprovalPacket(
      completePacket(),
    )

    expect(result.readiness.readyToRequestProductOwnerApproval).toBe(true)
    expect(result.readiness.readyForProductionRollout).toBe(false)
    expect(result.readiness.nextSafeAction).toContain(
      'Request the separate product-owner production approval prompt',
    )
  })

  it('marks rollout ready only when the exact approval phrase is present', () => {
    const result = evaluateMembershipAwareRlsProductionApprovalPacket(
      completePacket({
        explicitProductionApprovalPhrase:
          MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
      }),
    )

    expect(result.approvalPhraseRecorded).toBe(true)
    expect(result.readiness.readyToRequestProductOwnerApproval).toBe(true)
    expect(result.readiness.readyForProductionRollout).toBe(true)
  })

  it('turns missing owner and fixture labels into pending readiness statuses', () => {
    const result = evaluateMembershipAwareRlsProductionApprovalPacket(
      completePacket({
        ownerLabels: {
          product_owner: 'Product Owner label',
        },
        fixtureLabels: {
          staff_account: 'Production RLS smoke staff account label only',
        },
      }),
    )

    expect(result.missingLabelFields).toEqual(
      expect.arrayContaining(['owner.technical_owner', 'fixture.active_parish']),
    )
    expect(result.readiness.readyToRequestProductOwnerApproval).toBe(false)
    expect(result.readiness.missingRequiredItems).toEqual(
      expect.arrayContaining([
        'technical_owner must be ready, complete, reviewed, approved, confirmed, passed, or GO',
        'active_parish must be ready, complete, reviewed, approved, confirmed, passed, or GO',
      ]),
    )
  })

  it('rejects secret-like labels anywhere in owner, fixture, or target fields', () => {
    const result = evaluateMembershipAwareRlsProductionApprovalPacket(
      completePacket({
        ownerLabels: {
          ...completePacket().ownerLabels,
          technical_owner: 'technical.owner@example.test',
        },
        fixtureLabels: {
          ...completePacket().fixtureLabels,
          family_portal_token_plan:
            'access_token should never be pasted into this label',
        },
        productionTargetLabels: {
          ...completePacket().productionTargetLabels,
          databaseHostLabel: 'postgresql://postgres:secret@example.test/postgres',
        },
      }),
    )

    expect(result.unsafeLabelFindings).toEqual(
      expect.arrayContaining([
        'owner.technical_owner.label: possible email address',
        'fixture.family_portal_token_plan.label: possible token material',
        'production target.databaseHostLabel: possible database url',
      ]),
    )
    expect(result.readiness.readyToRequestProductOwnerApproval).toBe(false)
    expect(result.readiness.unsafeLabelFindings.length).toBeGreaterThan(0)
  })
})
