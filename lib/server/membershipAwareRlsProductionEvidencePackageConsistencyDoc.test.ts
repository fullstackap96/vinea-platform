import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md'
)

describe('membership-aware RLS production evidence package consistency checker doc', () => {
  it('documents the repository-only scope and production no-go boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a repository-only production-readiness check.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'exports were not run',
      'AI was not called',
      'storage was not accessed',
      'signed URLs were not created',
      'communications were not sent',
      'certificates were not generated',
      'production flags were not enabled',
      'public trust claims were not made',
      'This checker is not a production rollout tool.',
      'Production membership-aware operational RLS remains `NO-GO`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines the source helper, safe result, failure behavior, and approval phrase boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts',
      'checkMembershipAwareRlsProductionEvidencePackageConsistency(...)',
      'decision: READY_FOR_FINAL_HUMAN_REVIEW',
      'readyForProductionRollout: false',
      'artifactBoundaryCount',
      'findings: []',
      '`READY_FOR_FINAL_HUMAN_REVIEW` only means the repository evidence package is internally consistent enough to review.',
      'If the checker returns `NEEDS_ATTENTION`, stop before preparing a final approval prompt.',
      'missing critical artifact boundary',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('documents critical artifact-boundary coverage', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Critical artifact-boundary checks currently cover:',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('forbids secrets and private production evidence in the checker path', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Do not paste passwords',
      'database URLs',
      'service-role keys',
      'anon keys',
      'OAuth secrets',
      'access tokens',
      'refresh tokens',
      'OpenAI keys',
      'raw family portal tokens',
      'token hashes',
      'signed document URLs',
      'private document contents',
      'AI prompts',
      'AI outputs',
      'parishioner names',
      'funeral details',
      'pastoral details',
      'canonical details',
      'real private documents',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
