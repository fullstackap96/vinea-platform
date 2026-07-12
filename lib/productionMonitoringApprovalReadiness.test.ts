import { describe, expect, it } from 'vitest'

import { buildProductionMonitoringApprovalReadiness } from './productionMonitoringApprovalReadiness'
import {
  buildProductionMonitoringRedactionSmokeCases,
  type ProductionMonitoringRedactionSmokeCaseId,
} from './productionMonitoringRedactionSmokeCases'

const COMPLETE_OWNER_INTAKE = {
  roles: {
    support_owner: 'Product/support owner label',
    monitoring_owner: 'Engineering monitoring owner label',
    rollback_owner: 'Release rollback owner label',
    security_data_owner: 'Security/data owner label',
    incident_commander: 'Incident commander label',
    technical_lead: 'Technical lead label',
    customer_communications_owner: 'Customer communications owner label',
    legal_data_owner: 'Legal/data owner label',
    evidence_owner: 'Evidence storage owner label',
  },
  supportCoverageWindowLabel: 'Business-hours pilot coverage window',
  escalationChannelLabel: 'Private incident channel label',
  backupChannelLabel: 'Backup phone/text escalation label',
  monitoringToolLabel: 'Approved non-production monitoring destination label',
  rollbackMethodLabel: 'Disable monitoring runtime flags/provider config',
  evidenceStorageLabel: 'Private evidence folder label',
  productionSmokeFixtureLabel: 'Synthetic production smoke fixture label',
  approvalStatusLabel: 'Owner review ready',
}

const ALL_SMOKE_CASE_IDS = buildProductionMonitoringRedactionSmokeCases().map(
  (smokeCase) => smokeCase.id,
) satisfies ProductionMonitoringRedactionSmokeCaseId[]

function completeReadinessInput() {
  return {
    ownerIntake: COMPLETE_OWNER_INTAKE,
    ownerIntakeWorksheetStatus: 'READY' as const,
    ownerIntakeValidationStatus: 'PASSED' as const,
    runtimeImplementationPacketStatus: 'REVIEWED' as const,
    runtimeSourcePreflightStatus: 'PASSED' as const,
    redactionSmokeQaPacketStatus: 'REVIEWED' as const,
    smokeEvidenceTemplateStatus: 'APPROVED' as const,
    redactionSmokeCaseIds: ALL_SMOKE_CASE_IDS,
    productionMonitoringNoGoConfirmed: true,
    productionSmokeNoGoConfirmed: true,
    publicTrustClaimsNoGoConfirmed: true,
  }
}

describe('production monitoring approval readiness', () => {
  it('marks complete non-secret inputs ready to request runtime scaffold approval', () => {
    const result = buildProductionMonitoringApprovalReadiness(
      completeReadinessInput(),
    )

    expect(result.readyForRuntimeScaffoldApprovalRequest).toBe(true)
    expect(result.readyForRedactionSmokeApprovalRequest).toBe(false)
    expect(result.missingRequiredItems).toEqual([])
    expect(result.unsafeLabelFindings).toEqual([])
    expect(result.missingRedactionSmokeCaseIds).toEqual([])
    expect(result.requiredRedactionSmokeCaseIds).toEqual(ALL_SMOKE_CASE_IDS)
    expect(result.nextSafeAction).toContain('Request explicit product-owner approval')
    expect(result.productionNoGoBoundaries.join(' ')).toContain(
      'does not send monitoring events',
    )
  })

  it('keeps approval blocked when owners, statuses, or smoke cases are missing', () => {
    const result = buildProductionMonitoringApprovalReadiness({
      ...completeReadinessInput(),
      ownerIntake: {
        ...COMPLETE_OWNER_INTAKE,
        roles: {
          support_owner: 'Support owner label',
        },
      },
      ownerIntakeValidationStatus: 'PENDING',
      runtimeSourcePreflightStatus: 'PENDING',
      redactionSmokeCaseIds: ['authentication_failure'],
    })

    expect(result.readyForRuntimeScaffoldApprovalRequest).toBe(false)
    expect(result.missingRequiredItems).toEqual(
      expect.arrayContaining([
        'monitoring_owner',
        'rollback_owner',
        'security_data_owner',
        'owner intake validation must be PASSED',
        'runtime source preflight must be REVIEWED or PASSED',
      ]),
    )
    expect(result.missingRedactionSmokeCaseIds).toContain(
      'active_parish_rls_denial',
    )
    expect(result.nextSafeAction).toContain('Complete the missing')
  })

  it('rejects secret-like labels before runtime approval can be requested', () => {
    const result = buildProductionMonitoringApprovalReadiness({
      ...completeReadinessInput(),
      ownerIntake: {
        ...COMPLETE_OWNER_INTAKE,
        roles: {
          ...COMPLETE_OWNER_INTAKE.roles,
          monitoring_owner: 'postgresql://postgres:secret@example.test/postgres',
        },
        monitoringToolLabel: 'service_role secret pasted by mistake',
      },
    })

    expect(result.readyForRuntimeScaffoldApprovalRequest).toBe(false)
    expect(result.unsafeLabelFindings).toEqual(
      expect.arrayContaining([
        'monitoring_owner: possible database url',
        'monitoring tool label: possible api key wording',
      ]),
    )
  })

  it('requires production monitoring, smoke, and public claims to stay NO-GO', () => {
    const result = buildProductionMonitoringApprovalReadiness({
      ...completeReadinessInput(),
      productionMonitoringNoGoConfirmed: false,
      productionSmokeNoGoConfirmed: false,
      publicTrustClaimsNoGoConfirmed: false,
    })

    expect(result.readyForRuntimeScaffoldApprovalRequest).toBe(false)
    expect(result.missingRequiredItems).toEqual(
      expect.arrayContaining([
        'production monitoring NO-GO confirmation',
        'production smoke NO-GO confirmation',
        'public trust-center claims NO-GO confirmation',
      ]),
    )
  })
})
