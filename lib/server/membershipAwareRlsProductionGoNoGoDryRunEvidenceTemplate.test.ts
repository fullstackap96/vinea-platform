import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
)
const indexPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
)

describe('membership-aware RLS production go/no-go dry-run evidence template', () => {
  it('is explicitly a template only and keeps production untouched', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Template prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'records were not mutated',
      'production flags were not enabled',
      'Current template status: `TEMPLATE_ONLY_PRODUCTION_NOT_APPROVED`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the dry-run, input-builder, readiness, and evidence-package source chain', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures sanitized dry-run JSON summary fields without raw-value fields', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '`schemaVersion`',
      '`decision`',
      '`pass`',
      '`safeSummary.readyToRequestProductOwnerApproval`',
      '`safeSummary.readyForProductionRollout`',
      '`safeSummary.approvalPhraseRecorded`',
      '`safeSummary.requiredOwnerCount`',
      '`safeSummary.requiredFixtureCount`',
      '`safeSummary.requiredEvidenceCount`',
      '`safeSummary.requiredSmokeVerificationCount`',
      '`safeSummary.missingRequiredItemCount`',
      '`safeSummary.missingLabelFieldCount`',
      '`safeSummary.unsafeLabelFindingCount`',
      '`safeSummary.missingSmokeVerificationCount`',
      '`missingRequiredItems`',
      '`missingLabelFields`',
      '`missingSmokeVerificationItems`',
      '`unsafeLabelFindings`',
      '`nextSafeAction`',
    ]) {
      expect(template).toContain(expected)
    }

    for (const forbidden of [
      '`ownerLabels`',
      '`fixtureLabels`',
      '`productionTargetLabels`',
      '`explicitProductionApprovalPhrase`',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })

  it('requires owners, fixtures, evidence, no-go boundaries, and exact approval phrase placeholders', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Product owner',
      'Technical owner',
      'QA owner',
      'Security/data owner',
      'Rollback owner',
      'Monitoring owner',
      'Support owner',
      'Evidence owner',
      'Staff account',
      'Active parish',
      'Same-parish request',
      'Cross-parish denied request',
      'Workflow step',
      'Staff synthetic document',
      'Family synthetic document',
      'Family portal token plan',
      'Cleanup plan',
      'Disposable forward/rollback validation',
      'Shared QA active-parish-cookie smoke',
      'Final automated checks',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
      'DRY_RUN_READY_TO_REQUEST_PRODUCTION_APPROVAL',
      'DRY_RUN_NO_GO_UNSAFE_LABEL',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('forbids secrets, private data, and unrelated production-sensitive scopes', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Do not paste raw labels, hostnames with credentials, raw IDs, tokens, signed URLs, private document data, audit payloads, or parishioner details.',
      'Do not paste raw IDs, parishioner names, staff emails, document filenames, storage paths, signed URLs, family portal tokens, token hashes, pastoral details, funeral details, canonical details, or private document contents.',
      'Runtime public intake routing enablement.',
      'AI production flag enablement.',
      'Google Calendar data mutation.',
      'Export production flags or export UI exposure.',
      'Production monitoring runtime enablement.',
      'Storage, signed URL, or document restore claims.',
      'Public trust-center claims.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('is linked from the production evidence package index', () => {
    const index = readFileSync(indexPath, 'utf8')

    expect(index).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
    )
  })
})
