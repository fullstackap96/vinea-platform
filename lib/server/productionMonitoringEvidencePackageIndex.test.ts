import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring evidence package index', () => {
  it('links every required production monitoring readiness artifact', () => {
    const doc = read('docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md')

    expect(doc).toContain('docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md')
    expect(doc).toContain('lib/observabilityEvent.ts')
    expect(doc).toContain('lib/server/observabilityRuntimePreflight.ts')
    expect(doc).toContain('docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md')
    expect(doc).toContain('lib/supportEscalationMatrix.ts')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    )
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
    expect(doc).toContain('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )
    expect(doc).toContain('lib/server/productionMonitoringRuntimePreflight.ts')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    )
    expect(doc).toContain('lib/productionMonitoringApprovalReadiness.ts')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_REDACTION_SMOKE_CASE_MATRIX_20260706.md',
    )
    expect(doc).toContain('lib/productionMonitoringRedactionSmokeCases.ts')
    expect(doc).toContain('docs/PRODUCTION_MONITORING_SAFE_EVENT_CONTRACT_20260706.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
    )
    expect(doc).toContain(
      'lib/server/productionMonitoringEvidencePackageConsistency.ts',
    )
  })

  it('summarizes readiness, dependencies, missing human inputs, and review checklist', () => {
    const doc = read('docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md')

    expect(doc).toContain('Current Readiness Summary')
    expect(doc).toContain('Approval Dependency Chain')
    expect(doc).toContain('Missing Human Inputs')
    expect(doc).toContain('Review Checklist')
    expect(doc).toContain('Owner intake worksheet')
    expect(doc).toContain('Runtime implementation approval packet')
    expect(doc).toContain('Non-production redaction smoke QA packet')
    expect(doc).toContain('Smoke evidence template')
    expect(doc).toContain('Runtime scaffold approval readiness gate')
    expect(doc).toContain(
      '`lib/server/productionMonitoringEvidencePackageConsistency.ts` reports `READY_FOR_RUNTIME_APPROVAL_REVIEW`.',
    )
  })

  it('keeps production monitoring and trust claims no-go', () => {
    const doc = read('docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md')

    expect(doc).toContain('Current production monitoring decision: `NO-GO`')
    expect(doc).toContain('Production NO-GO Boundaries')
    expect(doc).toContain('Production monitoring runtime implementation')
    expect(doc).toContain('Production monitoring enablement')
    expect(doc).toContain('Production smoke testing')
    expect(doc).toContain('External provider wiring')
    expect(doc).toContain('Production exports')
    expect(doc).toContain('Production public intake routing')
    expect(doc).toContain('Production membership-aware operational RLS promotion')
    expect(doc).toContain('Customer-facing AI')
    expect(doc).toContain('Public trust-center monitoring claims')
  })

  it('keeps roadmap, build status, and SSoT current for the evidence package index', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Evidence Package Index Prepared')
    expect(roadmap).toContain('Production monitoring evidence package index')
    expect(ssot).toContain('Production monitoring evidence package index')
  })
})
