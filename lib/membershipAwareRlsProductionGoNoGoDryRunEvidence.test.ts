import { describe, expect, it } from 'vitest'

import { MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE } from './membershipAwareRlsProductionApprovalInput'
import {
  buildCurrentFilledMembershipAwareRlsProductionApprovalPacket,
  runMembershipAwareRlsProductionApprovalDryRun,
} from './membershipAwareRlsProductionApprovalDryRun'
import {
  buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
  validateMembershipAwareRlsProductionGoNoGoDryRunEvidence,
  type MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
} from './membershipAwareRlsProductionGoNoGoDryRunEvidence'

function completeEvidenceRecord(
  overrides: Partial<MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord> = {},
): MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord {
  const dryRunJson = runMembershipAwareRlsProductionApprovalDryRun(
    buildCurrentFilledMembershipAwareRlsProductionApprovalPacket(),
  )

  return {
    evidenceLabel:
      'Membership-aware RLS production go/no-go dry-run evidence label',
    dryRunJson,
    ownerStatusSummary: {
      requiredOwnerCount: dryRunJson.safeSummary.requiredOwnerCount,
      allRequiredOwnersNamed: true,
      missingOwnerLabelCount: 0,
    },
    fixtureStatusSummary: {
      requiredFixtureCount: dryRunJson.safeSummary.requiredFixtureCount,
      allRequiredFixturesSelected: true,
      missingFixtureLabelCount: 0,
    },
    evidenceStatusSummary: {
      requiredEvidenceCount: dryRunJson.safeSummary.requiredEvidenceCount,
      allRequiredEvidenceReviewed: true,
      missingEvidenceCount: 0,
    },
    noGoBoundariesConfirmed: {
      productionRlsUnapproved: true,
      productionAccessNotStarted: true,
      migrationsNotApplied: true,
      operationalRlsUnchanged: true,
      rawSecretsExcluded: true,
      rawIdsExcluded: true,
      publicTrustClaimsExcluded: true,
    },
    finalApprovalPlaceholders: {
      approvalPhraseBoundaryLabel:
        'Exact approval phrase must be provided later in a separate product-owner approval prompt',
      productionTargetLabel: 'Production target label only',
      rolloutWindowLabel: 'Future low-traffic rollout window label',
      rollbackOwnerLabel: 'Rollback owner label only',
      monitoringOwnerLabel: 'Monitoring owner/channel label only',
      evidenceOwnerLabel: 'Evidence storage owner label only',
    },
    ...overrides,
  }
}

describe('membership-aware RLS production go/no-go dry-run evidence validator', () => {
  it('builds the current filled example evidence record as sanitized pre-approval evidence', () => {
    const record =
      buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord()
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(record)

    expect(record.evidenceLabel).toContain('label-only')
    expect(record.dryRunJson.decision).toBe('READY_TO_REQUEST_APPROVAL')
    expect(record.dryRunJson.safeSummary.readyForProductionRollout).toBe(false)
    expect(record.finalApprovalPlaceholders.approvalPhraseBoundaryLabel).not.toContain(
      MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
    )
    expect(result.decision).toBe('READY_TO_REQUEST_FINAL_APPROVAL')
    expect(result.readyForProductionRollout).toBe(false)
    expect(result.findings).toEqual([])
  })

  it('accepts a sanitized pre-approval evidence record that is ready to request final approval', () => {
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(
      completeEvidenceRecord(),
    )

    expect(result.findings).toEqual([])
    expect(result.decision).toBe('READY_TO_REQUEST_FINAL_APPROVAL')
    expect(result.readyToRequestFinalApproval).toBe(true)
    expect(result.readyForProductionRollout).toBe(false)
    expect(result.safeSummary.dryRunDecision).toBe('READY_TO_REQUEST_APPROVAL')
    expect(result.safeSummary.approvalPhraseRecorded).toBe(false)
    expect(result.nextSafeAction).toContain('separate product-owner')
  })

  it('holds when the dry run has not passed or is missing required approval-readiness coverage', () => {
    const record = completeEvidenceRecord()
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence({
      ...record,
      dryRunJson: {
        ...record.dryRunJson,
        decision: 'NOT_READY',
        pass: false,
        safeSummary: {
          ...record.dryRunJson.safeSummary,
          readyToRequestProductOwnerApproval: false,
          missingRequiredItemCount: 1,
        },
      },
    })

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'dryRunJson.decision must be READY_TO_REQUEST_APPROVAL before final human approval is requested',
        'dryRunJson.pass must be true',
        'dryRunJson.safeSummary.readyToRequestProductOwnerApproval must be true',
      ]),
    )
  })

  it('rejects evidence that records the final approval phrase before the human approval step', () => {
    const record = completeEvidenceRecord()
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence({
      ...record,
      dryRunJson: {
        ...record.dryRunJson,
        decision: 'READY_FOR_APPROVED_ROLLOUT',
        safeSummary: {
          ...record.dryRunJson.safeSummary,
          readyForProductionRollout: true,
          approvalPhraseRecorded: true,
        },
      },
      finalApprovalPlaceholders: {
        ...record.finalApprovalPlaceholders,
        approvalPhraseBoundaryLabel:
          MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
      },
    })

    expect(result.decision).toBe('HOLD')
    expect(result.readyForProductionRollout).toBe(false)
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'dryRunJson.decision must be READY_TO_REQUEST_APPROVAL before final human approval is requested',
        'dryRunJson.safeSummary.readyForProductionRollout must remain false before final human approval',
        'dryRunJson.safeSummary.approvalPhraseRecorded must remain false in pre-approval evidence',
        'finalApprovalPlaceholders.approvalPhraseBoundaryLabel must describe where approval will be recorded, not contain the approval phrase itself',
      ]),
    )
  })

  it('rejects unsafe raw values and raw-label containers in the evidence payload', () => {
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence({
      ...completeEvidenceRecord(),
      // Simulates a filled evidence artifact accidentally carrying raw packet labels.
      ownerLabels: {
        technical_owner: 'technical.owner@example.test',
      },
      finalApprovalPlaceholders: {
        approvalPhraseBoundaryLabel:
          'Exact approval phrase must be provided later',
        productionTargetLabel:
          'postgresql://postgres:secret@db.example.supabase.co:5432/postgres',
        rolloutWindowLabel: 'Future low-traffic rollout window label',
        rollbackOwnerLabel: 'Rollback owner label only',
        monitoringOwnerLabel: 'Monitoring owner/channel label only',
        evidenceOwnerLabel: 'Evidence storage owner label only',
      },
    } as unknown as MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord)

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'record.ownerLabels must not be present in sanitized evidence',
        'record.ownerLabels.technical_owner contains possible email address',
        'record.finalApprovalPlaceholders.productionTargetLabel contains possible database url',
      ]),
    )
  })

  it('holds when production-safe no-go boundaries are not confirmed', () => {
    const result = validateMembershipAwareRlsProductionGoNoGoDryRunEvidence({
      ...completeEvidenceRecord(),
      noGoBoundariesConfirmed: {
        productionRlsUnapproved: true,
        productionAccessNotStarted: true,
        migrationsNotApplied: false,
        operationalRlsUnchanged: true,
        rawSecretsExcluded: true,
        rawIdsExcluded: true,
        publicTrustClaimsExcluded: true,
      },
    })

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toContain(
      'noGoBoundariesConfirmed.migrationsNotApplied must be true',
    )
  })
})
