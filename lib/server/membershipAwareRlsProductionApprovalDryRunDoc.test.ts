import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const dryRunPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
)
const indexPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
)

describe('membership-aware RLS production approval dry-run doc', () => {
  it('documents repository-only non-runtime scope and production no-go boundaries', () => {
    const doc = readFileSync(dryRunPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a repository-only, non-runtime dry-run helper.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Production RLS remains `NO-GO`',
      'Do not use this dry run to access production',
      'make public trust claims',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the dry-run helper, input builder, readiness gate, tests, and evidence package', () => {
    const doc = readFileSync(dryRunPath, 'utf8')

    for (const expected of [
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'lib/membershipAwareRlsProductionApprovalDryRun.test.ts',
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('requires sanitized JSON and blocks raw labels or secret values from evidence', () => {
    const doc = readFileSync(dryRunPath, 'utf8')

    for (const expected of [
      'sanitized pass/fail JSON',
      'does not echo owner names',
      'does not return raw label values',
      'database URLs',
      'signed URLs',
      'document details',
      'private parish data',
      'unsafe labels are identified by field path and category',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps the current expected decision and approval phrase boundary explicit', () => {
    const doc = readFileSync(dryRunPath, 'utf8')

    for (const expected of [
      'READY_TO_REQUEST_APPROVAL',
      'readyForProductionRollout: false',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
      'READY_FOR_APPROVED_ROLLOUT',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('is linked from the production evidence package index', () => {
    const index = readFileSync(indexPath, 'utf8')

    expect(index).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
    )
    expect(index).toContain('lib/membershipAwareRlsProductionApprovalDryRun.ts')
    expect(index).toContain('runMembershipAwareRlsProductionApprovalDryRun(...)')
  })
})
