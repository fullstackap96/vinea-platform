import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
  validateMembershipAwareRlsProductionGoNoGoDryRunEvidence,
} from '../membershipAwareRlsProductionGoNoGoDryRunEvidence'

const examplePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md',
)

const example = readFileSync(examplePath, 'utf8')

describe('membership-aware RLS production go/no-go validated example', () => {
  it('stays repository-only and keeps production rollout blocked', () => {
    for (const expected of [
      'Status: Repository-only sanitized example.',
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'production flags were not enabled',
      'no public trust claims were introduced',
      'Production rollout decision: `NO-GO`',
    ]) {
      expect(example).toContain(expected)
    }
  })

  it('documents the source chain and intentionally excludes raw labels and secrets', () => {
    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord()',
      'does not repeat owner labels, fixture labels, production target labels',
    ]) {
      expect(example).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'token_hash:',
      'signedUrl',
      'Bearer ',
      'sk-',
    ]) {
      expect(example).not.toContain(forbidden)
    }
  })

  it('matches the current helper output for safe dry-run and validator summary values', () => {
    const record =
      buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord()
    const validation =
      validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(record)

    expect(validation.decision).toBe('READY_TO_REQUEST_FINAL_APPROVAL')
    expect(validation.readyForProductionRollout).toBe(false)
    expect(validation.findings).toEqual([])

    for (const expected of [
      `| \`decision\` | \`${record.dryRunJson.decision}\` |`,
      `| \`pass\` | \`${record.dryRunJson.pass}\` |`,
      `| \`safeSummary.readyToRequestProductOwnerApproval\` | \`${record.dryRunJson.safeSummary.readyToRequestProductOwnerApproval}\` |`,
      `| \`safeSummary.readyForProductionRollout\` | \`${record.dryRunJson.safeSummary.readyForProductionRollout}\` |`,
      `| \`safeSummary.approvalPhraseRecorded\` | \`${record.dryRunJson.safeSummary.approvalPhraseRecorded}\` |`,
      `| \`safeSummary.requiredOwnerCount\` | \`${record.dryRunJson.safeSummary.requiredOwnerCount}\` |`,
      `| \`safeSummary.requiredFixtureCount\` | \`${record.dryRunJson.safeSummary.requiredFixtureCount}\` |`,
      `| \`safeSummary.requiredEvidenceCount\` | \`${record.dryRunJson.safeSummary.requiredEvidenceCount}\` |`,
      `| \`safeSummary.requiredSmokeVerificationCount\` | \`${record.dryRunJson.safeSummary.requiredSmokeVerificationCount}\` |`,
      `| \`safeSummary.missingRequiredItemCount\` | \`${record.dryRunJson.safeSummary.missingRequiredItemCount}\` |`,
      `| \`safeSummary.missingLabelFieldCount\` | \`${record.dryRunJson.safeSummary.missingLabelFieldCount}\` |`,
      `| \`safeSummary.unsafeLabelFindingCount\` | \`${record.dryRunJson.safeSummary.unsafeLabelFindingCount}\` |`,
      `| \`safeSummary.missingSmokeVerificationCount\` | \`${record.dryRunJson.safeSummary.missingSmokeVerificationCount}\` |`,
      `| \`decision\` | \`${validation.decision}\` |`,
      `| \`readyToRequestFinalApproval\` | \`${validation.readyToRequestFinalApproval}\` |`,
      `| \`readyForProductionRollout\` | \`${validation.readyForProductionRollout}\` |`,
      `| \`findings.length\` | \`${validation.findings.length}\` |`,
    ]) {
      expect(example).toContain(expected)
    }
  })
})
