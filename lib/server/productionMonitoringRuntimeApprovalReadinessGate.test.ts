import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring runtime approval readiness gate docs', () => {
  it('documents the non-runtime readiness gate and source artifacts', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    )

    expect(doc).toContain('Status: Implemented as a non-runtime')
    expect(doc).toContain('lib/productionMonitoringApprovalReadiness.ts')
    expect(doc).toContain('lib/productionMonitoringApprovalReadiness.test.ts')
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
    expect(doc).toContain('lib/productionMonitoringRedactionSmokeCases.ts')
  })

  it('requires all redaction-smoke cases and NO-GO confirmations', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    )

    for (const caseId of [
      'authentication_failure',
      'active_parish_rls_denial',
      'document_portal_denial',
      'family_portal_denial',
      'export_denial',
      'ai_failure',
      'google_calendar_failure',
      'email_failure',
      'health_check_failure',
    ]) {
      expect(doc).toContain(caseId)
    }

    expect(doc).toContain('Production monitoring remains `NO-GO`')
    expect(doc).toContain('Production smoke remains `NO-GO`')
    expect(doc).toContain('Public trust-center monitoring claims remain `NO-GO`')
  })

  it('keeps runtime implementation, provider wiring, and public claims out of scope', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    )

    expect(doc).toContain('does not implement runtime monitoring')
    expect(doc).toContain('does not approve')
    expect(doc).toContain('External provider wiring')
    expect(doc).toContain('Public trust-center monitoring claims')
    expect(doc).toContain('Migrations or operational RLS changes')
  })

  it('is linked from the monitoring evidence package and core state docs', () => {
    const index = read('docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(index).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    )
    expect(index).toContain('lib/productionMonitoringApprovalReadiness.ts')
    expect(buildStatus).toContain(
      'Production Monitoring Runtime Approval Readiness Gate Added',
    )
    expect(roadmap.toLowerCase()).toContain(
      'production monitoring runtime approval readiness gate',
    )
    expect(ssot.toLowerCase()).toContain(
      'production monitoring runtime approval readiness gate',
    )
  })
})
