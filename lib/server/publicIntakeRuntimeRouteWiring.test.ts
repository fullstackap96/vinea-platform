import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const routePath = join(root, 'app', 'api', 'intake', 'route.ts')
const requiredEnvPath = join(root, 'lib', 'server', 'requiredEnv.ts')
const safeLoggingDocPath = join(root, 'docs', 'PUBLIC_INTAKE_SAFE_ERROR_LOGGING_20260706.md')

function routeSource(): string {
  return readFileSync(routePath, 'utf8')
}

function expectBefore(source: string, earlier: string, later: string): void {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('public intake runtime route wiring', () => {
  it('keeps durable rate limiting before parsing and parish-scope resolution before inserts', () => {
    const source = routeSource()

    expectBefore(source, 'const rateLimit = await checkDurableRateLimit', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(source, 'const parsedBody = await readBoundedJsonBody', 'const requestType = text(body.requestType).toLowerCase()')
    expectBefore(source, 'const requestType = text(body.requestType).toLowerCase()', 'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expectBefore(source, 'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime', 'const { data: parishioner')
    expectBefore(source, 'if (!scope.ok)', 'const parishId = scope.parishId')
    expectBefore(source, 'const parishId = scope.parishId', 'parish_id: parishId')
  })

  it('uses the disabled-by-default gate, route signals, legacy fallback, and routed resolver adapter', () => {
    const source = routeSource()

    for (const required of [
      'const gate = getPublicIntakeRoutingRuntimeGate()',
      'extractPublicIntakeRouteSignalsForDryRun({',
      'requestUrl: request.url',
      'headers: request.headers',
      'body',
      'routingInput: routeSignals.routingInput',
      'loadLegacyPrimaryParishId: () => primaryParishId(admin)',
      'resolveRoutedParishScope: (input) =>',
      'resolvePublicIntakeParishScope(',
      'createSupabasePublicIntakeParishScopeDataSource(admin)',
    ]) {
      expect(source).toContain(required)
    }
  })

  it('merges safe adapter audit metadata and preserves cleanup', () => {
    const source = routeSource()

    expect(source).toContain('metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }')
    expect(source).not.toContain('metadata: { requestType, fullName')
    expect(source).toContain('await cleanupPartialPublicIntake(admin, ids)')
    expectBefore(source, 'const workflowStepsCreated = await createRequestWorkflowStepsFromActiveTemplate', "action: 'public_intake.created'")
  })

  it('keeps public routing disabled outside explicit runtime flags and avoids raw routing tables in the route', () => {
    const source = routeSource()
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    expect(requiredEnv).not.toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME')
    expect(requiredEnv).not.toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK')
    expect(source).not.toContain('parish_public_intake_tokens')
    expect(source).not.toContain('parish_public_intake_domains')
    expect(source).not.toContain('token_hash')
    expect(source).not.toContain('verification_dns_value')
  })

  it('returns generic route-scope and server errors without exposing exception messages', () => {
    const source = routeSource()

    expect(source).toContain('return NextResponse.json({ ok: false, error: scope.error }, { status: scope.status })')
    expect(source).toContain("return NextResponse.json({ ok: false, error: 'Could not submit request.' }, { status: 500 })")
    expect(source).toContain("logServerError('[intake] public submission failed'")
    expect(source).toContain("route: '/api/intake'")
    expect(source).toContain('partialRequestCreated: Boolean(ids.requestId)')
    expect(source).toContain('partialParishionerCreated: Boolean(ids.parishionerId)')
    expect(source).not.toContain("console.error('Public intake submission failed'")
    expect(source).not.toContain('const message = error instanceof Error ? error.message')
    expect(source).not.toContain('error.message')
  })

  it('documents the public intake safe error logging boundary', () => {
    const doc = readFileSync(safeLoggingDocPath, 'utf8')

    expect(doc).toContain('Public Intake Safe Error Logging - 2026-07-06')
    expect(doc).toContain('logServerError')
    expect(doc).toContain('Preserved durable rate limiting before body parsing')
    expect(doc).toContain('checked server-only `cleanupPartialPublicIntake`')
    expect(doc).toContain('does not change public intake validation')
    expect(doc).toContain('full-suite verification')
  })
})
