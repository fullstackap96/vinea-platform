import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production monitoring runtime implementation approval packet', () => {
  it('ties runtime implementation approval to the full monitoring readiness chain', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
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
    expect(doc).toContain('lib/observabilityEvent.ts')
    expect(doc).toContain('lib/server/observabilityRuntimePreflight.ts')
    expect(doc).toContain('lib/supportEscalationMatrix.ts')
    expect(doc).toContain('lib/monitoringSupportOwnerReadiness.ts')
  })

  it('defines exact candidate files, gates, smoke requirements, rollback, and no-go criteria', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )

    expect(doc).toContain('Exact Candidate Implementation Files')
    expect(doc).toContain('lib/server/observabilityRuntimeGate.ts')
    expect(doc).toContain('lib/server/sendObservabilityEvent.ts')
    expect(doc).toContain('lib/server/observabilityProviderAdapter.ts')
    expect(doc).toContain('Disabled-By-Default Gates')
    expect(doc).toContain('Non-Production Redaction Smoke Requirements')
    expect(doc).toContain('Production-Safe Smoke Boundaries')
    expect(doc).toContain('Runtime Safety Requirements')
    expect(doc).toContain('Rollback / No-Op Behavior')
    expect(doc).toContain('Production NO-GO Criteria')
  })

  it('preserves redaction, forbidden-payload, owner, and customer communication boundaries', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )

    expect(doc).toContain('buildObservabilityEvent')
    expect(doc).toContain('redactObservabilityText')
    expect(doc).toContain('Forbidden payload assertions run before any external delivery')
    expect(doc).toContain('Support escalation labels are derived from `lib/supportEscalationMatrix.ts`')
    expect(doc).toContain('Runtime monitoring must not automatically contact customers')
    expect(doc).toContain('No monitoring implementation may publish public trust-center claims')
  })

  it('keeps runtime implementation unapproved and production monitoring no-go', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    )

    expect(doc).toContain('Current production monitoring decision: `NO-GO`')
    expect(doc).toContain('does not enable production monitoring')
    expect(doc).toContain('This packet does not add these gates')
    expect(doc).toContain('I approve non-production implementation of production monitoring runtime scaffolding only')
    expect(doc).toContain('I approve production-safe smoke testing for Vinea production monitoring')
    expect(doc).toContain('I approve enabling Vinea production monitoring')
  })

  it('keeps roadmap, build status, and SSoT current for the runtime implementation approval packet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring Runtime Implementation Approval Packet Prepared')
    expect(roadmap).toContain('Production monitoring runtime implementation approval packet')
    expect(ssot).toContain('Production monitoring runtime implementation approval packet')
  })
})
