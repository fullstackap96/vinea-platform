import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring owner readiness completion worksheet', () => {
  it('maps owner readiness into the full monitoring approval chain', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
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
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    )
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
    expect(doc).toContain('lib/supportEscalationMatrix.ts')
  })

  it('requires non-secret owner, fixture, rollback, evidence, and escalation mappings', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    )

    expect(doc).toContain('Owner Label Mapping')
    expect(doc).toContain('Smoke Fixture Label Mapping')
    expect(doc).toContain('Support Escalation Label Mapping')
    expect(doc).toContain('Rollback And Evidence Mapping')
    expect(doc).toContain('Readiness Decision')
    expect(doc).toContain('Validation Checklist')
    expect(doc).toContain('Rollback owner')
    expect(doc).toContain('Evidence storage label')
    expect(doc).toContain('Customer communications owner')
  })

  it('keeps sensitive values out of the worksheet boundary', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    )

    expect(doc).toContain('Do not paste')
    expect(doc).toContain('API keys')
    expect(doc).toContain('Service-role keys')
    expect(doc).toContain('Database URLs')
    expect(doc).toContain('Signed URLs')
    expect(doc).toContain('Raw request, person, household, document, token, audit, or storage IDs')
    expect(doc).toContain('External monitoring DSNs, ingest URLs, or provider credentials')
  })

  it('preserves production no-go and public-claim boundaries', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    )

    expect(doc).toContain('Current production monitoring decision: `NO-GO`')
    expect(doc).toContain('Production monitoring remains NO-GO')
    expect(doc).toContain('Production smoke remains NO-GO')
    expect(doc).toContain('Public trust-center monitoring claims remain NO-GO')
    expect(doc).toContain('production exports')
    expect(doc).toContain('production public intake routing')
    expect(doc).toContain('production RLS promotion')
    expect(doc).toContain('customer-facing AI')
  })

  it('keeps roadmap, build status, and SSoT current for the completion worksheet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Owner Readiness Completion Worksheet Prepared')
    expect(roadmap).toContain('Production monitoring owner readiness completion worksheet')
    expect(ssot).toContain('Production monitoring owner readiness completion worksheet')
  })
})
