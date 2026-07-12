import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const gatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
)
const indexPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
)
const buildStatusPath = join(process.cwd(), 'docs', 'VINEA_BUILD_STATUS.md')

describe('membership-aware RLS production approval readiness gate doc', () => {
  it('states the gate is non-runtime and keeps production untouched', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime production-readiness gate.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'This gate does not access production',
      'Production RLS remains `NO-GO`',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('links the existing evidence package chain and source helper', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('requires owner, fixture, evidence, and smoke verification coverage', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'product_owner',
      'technical_owner',
      'qa_owner',
      'security_data_owner',
      'rollback_owner',
      'monitoring_owner',
      'support_owner',
      'evidence_owner',
      'staff_account',
      'active_parish',
      'same_parish_request',
      'cross_parish_denied_request',
      'family_portal_token_plan',
      'disposable_forward_rollback_validation',
      'shared_qa_active_parish_cookie_smoke',
      'final_go_no_go_checklist',
      'pre_apply_health',
      'policy_shape_verification',
      'direct_storage_privacy_denial',
      'family_portal_exclusions',
      'audit_events_redacted',
      'rollback_decision',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('keeps the exact approval phrase and forbidden scope boundaries explicit', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
      'Runtime public intake routing is out of scope.',
      'AI production flags are out of scope.',
      'Google Calendar mutation is out of scope.',
      'Unrelated deployments are out of scope.',
      'does not access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('is linked from the evidence package index and build status', () => {
    const index = readFileSync(indexPath, 'utf8')
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    expect(index).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
    )
    expect(index).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
    )
    expect(index).toContain('lib/membershipAwareRlsProductionApprovalInput.ts')
    expect(index).toContain(
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
    )
    expect(buildStatus).toContain(
      'Membership-Aware RLS Production Approval Readiness Gate Added - 2026-07-06',
    )
  })
})
