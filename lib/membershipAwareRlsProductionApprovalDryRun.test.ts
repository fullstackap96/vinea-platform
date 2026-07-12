import { describe, expect, it } from 'vitest'

import {
  buildCurrentFilledMembershipAwareRlsProductionApprovalPacket,
  runMembershipAwareRlsProductionApprovalDryRun,
} from './membershipAwareRlsProductionApprovalDryRun'

describe('membership-aware RLS production approval dry run', () => {
  it('produces sanitized pass JSON for the current filled packet while rollout remains unapproved', () => {
    const result = runMembershipAwareRlsProductionApprovalDryRun(
      buildCurrentFilledMembershipAwareRlsProductionApprovalPacket(),
    )

    expect(result.schemaVersion).toBe(1)
    expect(result.scope).toMatchObject({
      repositoryOnly: true,
      productionAccessed: false,
      migrationsApplied: false,
      operationalRlsChanged: false,
      recordsMutated: false,
      googleCalendarTouched: false,
      exportsRun: false,
      aiCalled: false,
      storageAccessed: false,
      signedUrlsCreated: false,
      communicationsSent: false,
      certificatesGenerated: false,
      publicTrustClaimsMade: false,
    })
    expect(result.pass).toBe(true)
    expect(result.decision).toBe('READY_TO_REQUEST_APPROVAL')
    expect(result.safeSummary.readyToRequestProductOwnerApproval).toBe(true)
    expect(result.safeSummary.readyForProductionRollout).toBe(false)
    expect(result.safeSummary.approvalPhraseRecorded).toBe(false)
    expect(result.safeSummary.requiredOwnerCount).toBe(8)
    expect(result.safeSummary.requiredFixtureCount).toBe(9)
    expect(result.safeSummary.requiredEvidenceCount).toBe(13)
    expect(result.safeSummary.requiredSmokeVerificationCount).toBe(15)
    expect(result.missingRequiredItems).toEqual([])
    expect(result.unsafeLabelFindings).toEqual([])
    expect(result.nextSafeAction).toContain(
      'Request the separate product-owner production approval prompt',
    )
  })

  it('marks rollout ready only when the separately approved exact phrase is present', () => {
    const result = runMembershipAwareRlsProductionApprovalDryRun(
      buildCurrentFilledMembershipAwareRlsProductionApprovalPacket(true),
    )

    expect(result.pass).toBe(true)
    expect(result.decision).toBe('READY_FOR_APPROVED_ROLLOUT')
    expect(result.safeSummary.readyForProductionRollout).toBe(true)
    expect(result.safeSummary.approvalPhraseRecorded).toBe(true)
  })

  it('reports missing labels without echoing filled owner or fixture labels', () => {
    const packet = buildCurrentFilledMembershipAwareRlsProductionApprovalPacket()
    const result = runMembershipAwareRlsProductionApprovalDryRun({
      ...packet,
      ownerLabels: {
        ...packet.ownerLabels,
        technical_owner: '',
      },
      fixtureLabels: {
        ...packet.fixtureLabels,
        active_parish: '',
      },
    })

    expect(result.pass).toBe(false)
    expect(result.decision).toBe('NOT_READY')
    expect(result.safeSummary.missingLabelFieldCount).toBe(2)
    expect(result.missingLabelFields).toEqual(
      expect.arrayContaining(['owner.technical_owner', 'fixture.active_parish']),
    )

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('Product Owner label from filled intake')
    expect(serialized).not.toContain('Production RLS Smoke Parish A label')
  })

  it('reports secret-like labels by category without echoing the secret-like values', () => {
    const packet = buildCurrentFilledMembershipAwareRlsProductionApprovalPacket()
    const result = runMembershipAwareRlsProductionApprovalDryRun({
      ...packet,
      ownerLabels: {
        ...packet.ownerLabels,
        support_owner: 'support@example.test',
      },
      productionTargetLabels: {
        ...packet.productionTargetLabels,
        databaseHostLabel: 'postgresql://postgres:secret@example.test/postgres',
        rollbackDeadlineLabel: 'access_token should not be here',
      },
    })

    expect(result.pass).toBe(false)
    expect(result.decision).toBe('NOT_READY')
    expect(result.safeSummary.unsafeLabelFindingCount).toBeGreaterThanOrEqual(3)
    expect(result.unsafeLabelFindings).toEqual(
      expect.arrayContaining([
        'owner.support_owner.label: possible email address',
        'production target.databaseHostLabel: possible database url',
        'production target.databaseHostLabel: possible email address',
        'production target.rollbackDeadlineLabel: possible token material',
      ]),
    )

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('postgresql://')
    expect(serialized).not.toContain('support@example.test')
    expect(serialized).not.toContain('access_token should not be here')
  })
})
