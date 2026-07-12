import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring approval packet', () => {
  it('ties together observability, support escalation, and owner intake artifacts', () => {
    const doc = read('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')

    expect(doc).toContain('docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md')
    expect(doc).toContain('docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    )
    expect(doc).toContain('lib/observabilityEvent.ts')
    expect(doc).toContain('lib/server/observabilityRuntimePreflight.ts')
    expect(doc).toContain('lib/supportEscalationMatrix.ts')
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
  })

  it('defines owner approvals, smoke gates, rollback, coverage, customer communication, and exact approval language', () => {
    const doc = read('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')

    expect(doc).toContain('Current production monitoring decision: `NO-GO`')
    expect(doc).toContain('Required Owner Approvals')
    expect(doc).toContain('Non-Production Redaction Smoke Tests')
    expect(doc).toContain('Production-Safe Smoke Fixture Requirements')
    expect(doc).toContain('Rollback Behavior')
    expect(doc).toContain('Monitoring Coverage Expectations')
    expect(doc).toContain('Customer Communication Boundaries')
    expect(doc).toContain('Exact Approval Language For Future Use')
    expect(doc).toContain('I approve non-production implementation of production monitoring runtime wiring only')
    expect(doc).toContain('I approve production smoke testing for Vinea production monitoring')
    expect(doc).toContain('I approve enabling Vinea production monitoring')
  })

  it('preserves production-sensitive no-go boundaries and forbids overbroad claims', () => {
    const doc = read('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')

    expect(doc).toContain('does not enable production monitoring')
    expect(doc).toContain('Do not expand monitoring scope')
    expect(doc).toContain('Production exports')
    expect(doc).toContain('Production public-intake routing')
    expect(doc).toContain('Production membership-aware operational RLS promotion')
    expect(doc).toContain('Customer-facing AI')
    expect(doc).toContain('Backup/restore public claims')
    expect(doc).toContain('Public trust-center publishing')
  })

  it('keeps roadmap, build status, and SSoT current for the monitoring approval packet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Approval Packet Prepared')
    expect(roadmap).toContain('Production monitoring approval packet')
    expect(ssot).toContain('Production monitoring approval packet')
  })
})
