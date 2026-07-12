import { describe, expect, it } from 'vitest'

import {
  TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH,
  TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH,
  TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH,
  checkTrustCenterPublicClaimsConsistency,
} from './trustCenterPublicClaimsConsistency'

describe('trust center public claims consistency checker', () => {
  it('keeps public trust-center publishing blocked while claims artifacts stay reviewable', () => {
    const report = checkTrustCenterPublicClaimsConsistency()

    expect(report.schemaVersion).toBe(1)
    expect(report.decision).toBe('PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW')
    expect(report.publicTrustCenterPublishingApproved).toBe(false)
    expect(report.publicClaimsApproved).toBe(false)
    expect(report.matrixPath).toBe(TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH)
    expect(report.worksheetPath).toBe(TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH)
    expect(report.filledExamplePath).toBe(
      TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH
    )
    expect(report.trustAreaCount).toBeGreaterThanOrEqual(11)
    expect(report.supportingReferenceCount).toBeGreaterThanOrEqual(13)
    expect(report.boundaryPhraseCount).toBeGreaterThanOrEqual(21)
    expect(report.stopConditionCount).toBeGreaterThanOrEqual(10)
    expect(report.findings).toEqual([])
  })

  it('covers the major trust areas that must not become public claims by accident', () => {
    const report = checkTrustCenterPublicClaimsConsistency()

    expect(report.publicClaimsApproved).toBe(false)
    expect(report.trustAreaCount).toBe(11)
    expect(report.stopConditionCount).toBe(10)
    expect(report.findings).toEqual([])
  })
})
