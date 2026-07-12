import { describe, expect, it } from 'vitest'

import { checkMembershipAwareRlsProductionEvidencePackageConsistency } from './membershipAwareRlsProductionEvidencePackageConsistency'
import { checkProductionCspReportOnlyEvidencePackageConsistency } from './productionCspReportOnlyEvidencePackageConsistency'
import { checkProductionMonitoringEvidencePackageConsistency } from './productionMonitoringEvidencePackageConsistency'
import { checkProductionSensitiveGateBoundaryConsistency } from './productionSensitiveGateBoundaryConsistency'
import { checkTrustCenterPublicClaimsConsistency } from './trustCenterPublicClaimsConsistency'

describe('production gate boundary check group', () => {
  it('keeps production-sensitive gates blocked and ready for human review', () => {
    const productionSensitiveGateReport =
      checkProductionSensitiveGateBoundaryConsistency()
    const rlsReport =
      checkMembershipAwareRlsProductionEvidencePackageConsistency()
    const monitoringReport = checkProductionMonitoringEvidencePackageConsistency()
    const trustCenterClaimsReport = checkTrustCenterPublicClaimsConsistency()
    const cspReport = checkProductionCspReportOnlyEvidencePackageConsistency()

    expect(productionSensitiveGateReport.findings).toEqual([])
    expect(productionSensitiveGateReport.decision).toBe(
      'BOUNDARIES_READY_FOR_REVIEW'
    )
    expect(productionSensitiveGateReport.productionSensitiveFeaturesApproved).toBe(
      false
    )
    expect(productionSensitiveGateReport.publicTrustClaimsApproved).toBe(false)

    expect(rlsReport.findings).toEqual([])
    expect(rlsReport.decision).toBe('READY_FOR_FINAL_HUMAN_REVIEW')
    expect(rlsReport.readyForProductionRollout).toBe(false)
    expect(rlsReport.artifactBoundaryCount).toBeGreaterThanOrEqual(47)

    expect(monitoringReport.findings).toEqual([])
    expect(monitoringReport.decision).toBe('READY_FOR_RUNTIME_APPROVAL_REVIEW')
    expect(monitoringReport.productionMonitoringEnabled).toBe(false)
    expect(monitoringReport.productionSmokeApproved).toBe(false)
    expect(monitoringReport.publicTrustClaimsApproved).toBe(false)
    expect(monitoringReport.artifactBoundaryCount).toBeGreaterThanOrEqual(37)

    expect(trustCenterClaimsReport.findings).toEqual([])
    expect(trustCenterClaimsReport.decision).toBe(
      'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
    )
    expect(trustCenterClaimsReport.publicTrustCenterPublishingApproved).toBe(false)
    expect(trustCenterClaimsReport.publicClaimsApproved).toBe(false)
    expect(trustCenterClaimsReport.trustAreaCount).toBeGreaterThanOrEqual(11)
    expect(trustCenterClaimsReport.stopConditionCount).toBeGreaterThanOrEqual(10)

    expect(cspReport.findings).toEqual([])
    expect(cspReport.decision).toBe('READY_FOR_RUNTIME_APPROVAL_REVIEW')
    expect(cspReport.reportOnlyRuntimeApproved).toBe(false)
    expect(cspReport.productionCspApproved).toBe(false)
    expect(cspReport.enforcingCspApproved).toBe(false)
    expect(cspReport.publicTrustClaimsApproved).toBe(false)
    expect(cspReport.packetBoundaryCount).toBeGreaterThanOrEqual(28)
    expect(cspReport.preflightBoundaryCount).toBeGreaterThanOrEqual(19)
  })
})
