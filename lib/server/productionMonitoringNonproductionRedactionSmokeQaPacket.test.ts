import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring non-production redaction smoke QA packet', () => {
  it('ties the QA packet to the monitoring readiness and runtime-preflight chain', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )

    expect(doc).toContain('docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md')
    expect(doc).toContain('docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    )
    expect(doc).toContain('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )
    expect(doc).toContain('lib/productionMonitoringRedactionSmokeCases.ts')
    expect(doc).toContain('lib/server/productionMonitoringRuntimePreflight.ts')
  })

  it('defines preconditions, labels, QA sequence, stop conditions, and evidence requirements', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )

    expect(doc).toContain('Run Preconditions')
    expect(doc).toContain('Required Environment Labels')
    expect(doc).toContain('Required Owner Labels')
    expect(doc).toContain('Smoke Fixture Labels')
    expect(doc).toContain('QA Sequence')
    expect(doc).toContain('Flag-Off Baseline')
    expect(doc).toContain('Redaction Cases')
    expect(doc).toContain('executable pre-smoke coverage')
    expect(doc).toContain('Owner Routing Check')
    expect(doc).toContain('Rollback Check')
    expect(doc).toContain('Stop Conditions')
    expect(doc).toContain('Evidence Requirements')
  })

  it('covers required redaction cases and forbidden evidence boundaries', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )

    expect(doc).toContain('Authentication failure')
    expect(doc).toContain('Active-parish/RLS denial')
    expect(doc).toContain('Document portal denial')
    expect(doc).toContain('Family portal denial')
    expect(doc).toContain('Export denial')
    expect(doc).toContain('AI failure')
    expect(doc).toContain('Google Calendar failure')
    expect(doc).toContain('Email failure')
    expect(doc).toContain('/api/health')
    expect(doc).toContain('Signed URLs, storage paths, original filenames, document contents')
    expect(doc).toContain('Prompts, generated outputs, provider payloads')
    expect(doc).toContain('Database URLs, service-role keys, raw env dumps')
  })

  it('preserves production no-go boundaries and exact approval language', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )

    expect(doc).toContain('Current production monitoring decision: `NO-GO`')
    expect(doc).toContain('Passing this non-production redaction smoke does not approve')
    expect(doc).toContain('production exports')
    expect(doc).toContain('public intake routing')
    expect(doc).toContain('production membership-aware operational RLS promotion')
    expect(doc).toContain('customer-facing AI')
    expect(doc).toContain('backup/restore public claims')
    expect(doc).toContain('I approve running the non-production production-monitoring redaction smoke QA packet only')
  })

  it('keeps roadmap, build status, and SSoT current for the non-production redaction smoke packet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Non-Production Redaction Smoke QA Packet Prepared')
    expect(roadmap).toContain('Production monitoring non-production redaction smoke QA packet')
    expect(ssot).toContain('Production monitoring non-production redaction smoke QA packet')
  })
})
