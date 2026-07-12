import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring smoke evidence template', () => {
  it('ties smoke evidence to monitoring readiness, support, owner intake, and approval artifacts', () => {
    const doc = read('docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md')

    expect(doc).toContain('docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md')
    expect(doc).toContain('docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md')
    expect(doc).toContain(
      'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    )
    expect(doc).toContain('docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md')
    expect(doc).toContain('lib/observabilityEvent.ts')
    expect(doc).toContain('lib/server/observabilityRuntimePreflight.ts')
    expect(doc).toContain('lib/supportEscalationMatrix.ts')
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
  })

  it('captures required smoke evidence sections and owner-review fields', () => {
    const doc = read('docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md')

    expect(doc).toContain('Environment Identity')
    expect(doc).toContain('Owner Labels')
    expect(doc).toContain('Flag States')
    expect(doc).toContain('Safe Fixture Labels')
    expect(doc).toContain('Redaction Checks')
    expect(doc).toContain('External Event Evidence')
    expect(doc).toContain('Rollback Verification')
    expect(doc).toContain('Customer Communication Boundary Confirmation')
    expect(doc).toContain('Unresolved Risks')
    expect(doc).toContain('Final Sign-Off')
    expect(doc).toContain('Production Claim Boundary')
  })

  it('keeps smoke evidence redaction-focused and forbids sensitive payloads', () => {
    const doc = read('docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md')

    expect(doc).toContain('no database URL, service-role key, or raw project secret')
    expect(doc).toContain('Do not paste secrets')
    expect(doc).toContain('Signed URL, storage path, original filename, document content')
    expect(doc).toContain('Portal token, token hash, internal notes, staff-only fields, AI material')
    expect(doc).toContain('Prompt, generated output, provider payload, source body, token material')
    expect(doc).toContain('Secret values, database URLs, service-role key, raw env dump')
    expect(doc).toContain('No automatic customer communication sent')
  })

  it('preserves no-go boundaries and avoids public readiness claims', () => {
    const doc = read('docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md')

    expect(doc).toContain('does not enable production monitoring')
    expect(doc).toContain('does not approve public trust-center claims')
    expect(doc).toContain('Production exports')
    expect(doc).toContain('Production public intake routing')
    expect(doc).toContain('Production membership-aware operational RLS promotion')
    expect(doc).toContain('Customer-facing AI')
    expect(doc).toContain('Backup/restore public claims')
    expect(doc).toContain('Public trust-center publishing')
  })

  it('keeps roadmap, build status, and SSoT current for the smoke evidence template', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Smoke Evidence Template Prepared')
    expect(roadmap).toContain('Production monitoring smoke evidence template')
    expect(ssot).toContain('Production monitoring smoke evidence template')
  })
})
