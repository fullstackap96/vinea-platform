import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('monitoring support owner intake worksheet source', () => {
  it('keeps the readiness helper non-runtime and non-secret', () => {
    const source = read('lib/monitoringSupportOwnerReadiness.ts')

    expect(source).toContain('buildMonitoringSupportReadiness')
    expect(source).toContain('readyForOwnerReview')
    expect(source).toContain('Use human-readable labels only')
    expect(source).toContain('does not enable production monitoring')
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('writeAuditEvent')
    expect(source).not.toContain('createSupabase')
    expect(source).not.toContain('sendEmail')
  })

  it('documents owners, operational labels, validation expectations, approval gates, and claim boundaries', () => {
    const doc = read(
      'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    )

    expect(doc).toContain('Required Owner Labels')
    expect(doc).toContain('Required Operational Labels')
    expect(doc).toContain('Validation Expectations')
    expect(doc).toContain('Approval Gates After This Worksheet')
    expect(doc).toContain('Production Claim Boundary')
    expect(doc).toContain('Do not paste')
    expect(doc).toContain('does not mean production monitoring is approved')
  })

  it('keeps roadmap, build status, and SSoT current for monitoring owner intake readiness', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Monitoring And Support Owner Intake Worksheet Prepared')
    expect(roadmap).toContain('Production monitoring and support owner intake worksheet')
    expect(ssot).toContain('Production monitoring and support owner intake worksheet')
  })
})
