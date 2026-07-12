import { readFileSync } from 'fs'
import { join } from 'path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const doc = readFileSync(
  join(
    repoRoot,
    'docs',
    'MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
  ),
  'utf8',
)

describe('membership-aware RLS production go/no-go dry-run evidence validator doc', () => {
  it('keeps the validator framed as repository-only and production-safe', () => {
    expect(doc).toContain('repository-only validation helper')
    expect(doc).toContain('does not access production')
    expect(doc).toContain('does not make production RLS approved')
    expect(doc).toContain('readyForProductionRollout: false')
    expect(doc).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md',
    )
  })

  it('documents the required sanitized input shape and forbidden raw fields', () => {
    expect(doc).toContain('dryRunJson')
    expect(doc).toContain('ownerStatusSummary')
    expect(doc).toContain('fixtureStatusSummary')
    expect(doc).toContain('evidenceStatusSummary')
    expect(doc).toContain('noGoBoundariesConfirmed')
    expect(doc).toContain('finalApprovalPlaceholders')
    expect(doc).toContain('ownerLabels')
    expect(doc).toContain('fixtureLabels')
    expect(doc).toContain('productionTargetLabels')
    expect(doc).toContain('explicitProductionApprovalPhrase')
  })

  it('documents the hold conditions that prevent premature production rollout', () => {
    expect(doc).toContain('decision: HOLD')
    expect(doc).toContain('final approval is already recorded')
    expect(doc).toContain('approval phrase itself is pasted')
    expect(doc).toContain('raw ids')
    expect(doc).toContain('signed URL markers')
  })
})
