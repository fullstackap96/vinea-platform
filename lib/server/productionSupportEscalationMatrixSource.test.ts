import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production support escalation matrix source', () => {
  it('connects support escalation to safe observability events without runtime side effects', () => {
    const source = read('lib/supportEscalationMatrix.ts')

    expect(source).toContain('buildSupportEscalationFromObservabilityEvent')
    expect(source).toContain('mapObservabilityEventToSupportEscalation')
    expect(source).toContain('ProductionMonitoringSupportRouting')
    expect(source).toContain('monitoringOwnerLabel')
    expect(source).toContain('supportOwnerLabel')
    expect(source).toContain('customerCommunicationAllowed: false')
    expect(source).toContain('VineaObservabilityEvent')
    expect(source).toContain('SEV-1')
    expect(source).toContain('support_owner')
    expect(source).toContain('security_data_owner')
    expect(source).toContain('non-runtime guidance only')
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('writeAuditEvent')
    expect(source).not.toContain('createSupabase')
    expect(source).not.toContain('sendEmail')
  })

  it('documents severity, owner routing, evidence rules, communications boundaries, and no-go claims', () => {
    const doc = read('docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md')

    expect(doc).toContain('Severity Matrix')
    expect(doc).toContain('Owner Routing')
    expect(doc).toContain('Evidence Rules')
    expect(doc).toContain('Customer Communication Boundary')
    expect(doc).toContain('Production Monitoring Routing Map')
    expect(doc).toContain('Production Claim Boundary')
    expect(doc).toContain('must not claim live production monitoring')
  })

  it('keeps roadmap, build status, and SSoT current for support escalation readiness', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Support Escalation Matrix Prepared')
    expect(roadmap).toContain('Production support escalation matrix')
    expect(ssot).toContain('Production support escalation matrix')
  })
})
