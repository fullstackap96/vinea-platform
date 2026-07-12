import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildPassingReleaseReadinessLocalEvidenceExample,
  validateReleaseReadinessLocalEvidence,
} from '../releaseReadinessLocalEvidence'

const examplePath = join(
  process.cwd(),
  'docs',
  'PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md',
)

const example = readFileSync(examplePath, 'utf8')

describe('production release-readiness local evidence validated example', () => {
  it('stays repository-only and keeps production-sensitive work blocked', () => {
    for (const expected of [
      'Status: Repository-only sanitized example.',
      'Production was not accessed',
      'production flags were not enabled',
      'no migrations were applied',
      'operational RLS was not changed',
      'no public trust-center claims were introduced',
      'Production-sensitive rollout decision: `NO-GO`',
    ]) {
      expect(example).toContain(expected)
    }
  })

  it('documents the source chain and avoids raw secret-like evidence', () => {
    for (const expected of [
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
      'lib/releaseReadinessLocalEvidence.ts',
      'scripts/check-release-readiness-handoff.mjs',
      'scripts/check-rls-production-evidence.mjs',
      'scripts/check-production-monitoring-evidence.mjs',
      'scripts/check-csp-report-only-evidence.mjs',
      'scripts/check-trust-center-claims.mjs',
      'buildPassingReleaseReadinessLocalEvidenceExample()',
      'Optional release environment cleanup guide',
      '`mutatesEnvironment: false`',
      '`secretValuesPrinted: false`',
      '`rawValuesCaptured: false`',
      'does not repeat database URLs',
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

  it('matches the current helper output for safe validator summary values', () => {
    const record = buildPassingReleaseReadinessLocalEvidenceExample()
    const validation = validateReleaseReadinessLocalEvidence(record)

    expect(validation.decision).toBe('READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(validation.productionApprovalGranted).toBe(false)
    expect(validation.findings).toEqual([])

    for (const expected of [
      `| \`decision\` | \`${validation.decision}\` |`,
      `| \`readyForHumanReleaseReview\` | \`${validation.readyForHumanReleaseReview}\` |`,
      `| \`productionApprovalGranted\` | \`${validation.productionApprovalGranted}\` |`,
      `| \`safeSummary.commandCount\` | \`${validation.safeSummary.commandCount}\` |`,
      `| \`safeSummary.passingCommandCount\` | \`${validation.safeSummary.passingCommandCount}\` |`,
      `| \`safeSummary.failedOrMissingCommandCount\` | \`${validation.safeSummary.failedOrMissingCommandCount}\` |`,
      `| \`safeSummary.releaseEnvironmentAccepted\` | \`${validation.safeSummary.releaseEnvironmentAccepted}\` |`,
      `| \`safeSummary.qaPrototypeRuntimeResidueClear\` | \`${validation.safeSummary.qaPrototypeRuntimeResidueClear}\` |`,
      `| \`safeSummary.rlsProductionEvidenceReady\` | \`${validation.safeSummary.rlsProductionEvidenceReady}\` |`,
      `| \`safeSummary.productionMonitoringEvidenceReady\` | \`${validation.safeSummary.productionMonitoringEvidenceReady}\` |`,
      `| \`safeSummary.productionGateBoundariesReady\` | \`${validation.safeSummary.productionGateBoundariesReady}\` |`,
      `| \`safeSummary.cspReportOnlyEvidenceReady\` | \`${validation.safeSummary.cspReportOnlyEvidenceReady}\` |`,
      `| \`safeSummary.trustCenterPublicClaimsReady\` | \`${validation.safeSummary.trustCenterPublicClaimsReady}\` |`,
      `| \`safeSummary.releaseHandoffReady\` | \`${validation.safeSummary.releaseHandoffReady}\` |`,
      `| \`safeSummary.safetyBoundaryConfirmed\` | \`${validation.safeSummary.safetyBoundaryConfirmed}\` |`,
      `| \`safeSummary.manualFollowUpStillRequired\` | \`${validation.safeSummary.manualFollowUpStillRequired}\` |`,
      `| \`findings.length\` | \`${validation.findings.length}\` |`,
    ]) {
      expect(example).toContain(expected)
    }
  })
})
