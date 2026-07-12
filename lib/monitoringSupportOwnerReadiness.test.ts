import { describe, expect, it } from 'vitest'

import { buildMonitoringSupportReadiness } from './monitoringSupportOwnerReadiness'

const COMPLETE_INTAKE = {
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
  monitoringToolLabel: 'Future approved monitoring tool label',
  rollbackMethodLabel: 'Disable observability runtime flags',
  evidenceStorageLabel: 'Private evidence folder label',
  productionSmokeFixtureLabel: 'Synthetic production smoke fixture label',
  approvalStatusLabel: 'Owner review pending',
}

describe('monitoring support owner readiness', () => {
  it('marks a complete non-secret intake ready for owner review', () => {
    const result = buildMonitoringSupportReadiness(COMPLETE_INTAKE)

    expect(result.readyForOwnerReview).toBe(true)
    expect(result.missingRequiredLabels).toEqual([])
    expect(result.unsafeLabelFindings).toEqual([])
    expect(result.requiredRoleLabels.support_owner).toBe('Product/support owner label')
    expect(result.nonSecretBoundary).toContain('Use human-readable labels only')
    expect(result.productionBoundary).toContain('does not enable production monitoring')
  })

  it('reports missing owners and operational labels', () => {
    const result = buildMonitoringSupportReadiness({
      roles: {
        support_owner: 'Support owner label',
      },
      escalationChannelLabel: 'Incident channel label',
    })

    expect(result.readyForOwnerReview).toBe(false)
    expect(result.missingRequiredLabels).toEqual(
      expect.arrayContaining([
        'monitoring_owner',
        'rollback_owner',
        'security_data_owner',
        'support coverage window',
        'monitoring tool label',
        'production smoke fixture label',
      ]),
    )
    expect(result.requiredRoleLabels.monitoring_owner).toBe('[MISSING]')
  })

  it('rejects secret-like labels before owner review', () => {
    const result = buildMonitoringSupportReadiness({
      ...COMPLETE_INTAKE,
      roles: {
        ...COMPLETE_INTAKE.roles,
        monitoring_owner: 'postgresql://postgres:secret@example.test/postgres',
      },
      monitoringToolLabel: 'service_role secret pasted by mistake',
      backupChannelLabel: 'https://example.test/callback?token=abc',
    })

    expect(result.readyForOwnerReview).toBe(false)
    expect(result.unsafeLabelFindings).toEqual(
      expect.arrayContaining([
        'monitoring_owner: possible database url',
        'monitoring tool label: possible api key wording',
        'backup channel label: possible signed url',
      ]),
    )
  })
})
