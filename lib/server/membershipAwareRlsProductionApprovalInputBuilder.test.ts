import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
)
const gatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
)

describe('membership-aware RLS production approval input builder docs', () => {
  it('documents the helper as non-runtime and production-safe', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime, label-only production-readiness helper.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Production RLS remains `NO-GO`',
      'This helper does not approve production rollout by itself.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the source helper, readiness gate, tests, and evidence index', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'lib/membershipAwareRlsProductionApprovalInput.test.ts',
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('requires all owner and fixture labels plus the exact approval phrase boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

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
      'workflow_step',
      'staff_synthetic_document',
      'family_synthetic_document',
      'family_portal_token_plan',
      'cleanup_plan',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps forbidden data and excluded runtime scopes explicit', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Database URLs.',
      'Passwords.',
      'Service-role keys or anon keys.',
      'Family portal tokens or token hashes.',
      'Staff or parishioner email addresses.',
      'Raw production ids.',
      'Private document contents, filenames, notes, audit payloads, or pastoral/canonical details.',
      'enable runtime public intake routing',
      'enable AI production flags',
      'make public trust claims',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('is linked from the production approval readiness gate', () => {
    const gate = readFileSync(gatePath, 'utf8')

    expect(gate).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
    )
    expect(gate).toContain('lib/membershipAwareRlsProductionApprovalInput.ts')
    expect(gate).toContain('buildMembershipAwareRlsProductionApprovalInput(...)')
  })
})
