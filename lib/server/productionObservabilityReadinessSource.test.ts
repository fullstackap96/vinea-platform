import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('production observability readiness source', () => {
  it('keeps the observability DTO non-runtime and vendor-neutral', () => {
    const source = read('lib/observabilityEvent.ts')

    expect(source).toContain('buildObservabilityEvent')
    expect(source).toContain('redactObservabilityText')
    expect(source).toContain('assertNoForbiddenProductionMonitoringPayload')
    expect(source).toContain('monitoringSafety')
    expect(source).toContain('documentPayloadStored')
    expect(source).toContain('customerCommunicationAllowed')
    expect(source).toContain('No external error-reporting service is wired by this DTO.')
    expect(source).not.toContain('@sentry')
    expect(source).not.toContain('createSupabase')
    expect(source).not.toContain('writeAuditEvent')
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('OpenAI')
  })

  it('adds a non-runtime source preflight scaffold for future observability wiring', () => {
    const source = read('lib/server/observabilityRuntimePreflight.ts')

    expect(source).toContain('validateFutureObservabilityRuntimeSource')
    expect(source).toContain('buildObservabilityEvent(')
    expect(source).toContain('redactObservabilityText(')
    expect(source).toContain('allMarkersBeforeIndex')
    expect(source).toContain('Expected all of')
    expect(source).toContain('VINEA_OBSERVABILITY_RUNTIME')
    expect(source).toContain('APPROVED_PRODUCTION_OBSERVABILITY')
    expect(source).toContain('sendObservabilityEvent(')
    expect(source).toContain('Sentry.captureException(error)')
  })

  it('documents redaction requirements, owner workflow, approval gates, and no-go boundaries', () => {
    const doc = read('docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md')

    expect(doc).toContain('No external error-reporting vendor is enabled')
    expect(doc).toContain('Required Redactions')
    expect(doc).toContain('Forbidden Payloads')
    expect(doc).toContain('Owner Workflow')
    expect(doc).toContain('Source-Level Runtime Preflight Scaffold')
    expect(doc).toContain('a partial marker match is not enough')
    expect(doc).toContain('Future Runtime Approval Gates')
    expect(doc).toContain('Production Claim Boundary')
    expect(doc).toContain('Vinea must not claim that production error monitoring')
  })

  it('keeps roadmap and build status current for the observability slice', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Production Observability Readiness Plan Prepared')
    expect(roadmap).toContain('Production observability readiness plan')
    expect(ssot).toContain('Production observability readiness plan')
    expect(buildStatus).toContain('Production Monitoring Safe Event Contract Strengthened')
    expect(roadmap).toContain('Production Monitoring Safe Event Contract')
    expect(ssot).toContain('production monitoring safe event contract')
  })

  it('documents the strengthened monitoring safe event contract', () => {
    const doc = read('docs/PRODUCTION_MONITORING_SAFE_EVENT_CONTRACT_20260706.md')

    expect(doc).toContain('Status: Implemented as a non-runtime')
    expect(doc).toContain('provider payloads')
    expect(doc).toContain('signed URLs')
    expect(doc).toContain('free-form key/value payloads')
    expect(doc).toContain('encoded token parameters')
    expect(doc).toContain('AWS signed URL signature parameters')
    expect(doc).toContain('raw exports')
    expect(doc).toContain('customer communication is not automatic')
    expect(doc).toContain('Production monitoring remains `NO-GO`')
  })
})
