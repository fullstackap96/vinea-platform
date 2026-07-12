import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')
const planPath = join(root, 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_IMPLEMENTATION_PLAN.md')

function assertContains(source: string, expected: string): void {
  expect(source, `Expected source to contain: ${expected}`).toContain(expected)
}

function assertNotContains(source: string, forbidden: string): void {
  expect(source, `Expected source not to contain: ${forbidden}`).not.toContain(forbidden)
}

function assertBefore(source: string, earlier: string, later: string): void {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected "${earlier}" before "${later}"`).toBeLessThan(laterIndex)
}

function assertFutureIntakeRuntimeWiringPreflight(source: string): void {
  for (const required of [
    'getPublicIntakeRoutingRuntimeGate',
    'resolvePublicIntakeRequestParishScopeForFutureRuntime',
    'resolvePublicIntakeParishScope',
    'createSupabasePublicIntakeParishScopeDataSource',
    'createRequestWorkflowStepsFromActiveTemplate',
    'await cleanupPartialPublicIntake(admin, ids)',
    '...scope.auditMetadata',
  ]) {
    assertContains(source, required)
  }

  assertBefore(source, 'const rateLimit = await checkDurableRateLimit', 'const parsedBody = await readBoundedJsonBody')
  assertBefore(source, 'const parsedBody = await readBoundedJsonBody', 'const requestType = text(body.requestType).toLowerCase()')
  assertBefore(source, 'const requestType = text(body.requestType).toLowerCase()', 'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime')
  assertBefore(source, 'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime', 'const { data: parishioner')
  assertBefore(source, 'const parishId = scope.parishId', 'parish_id: parishId')
  assertBefore(source, 'const parishId = scope.parishId', "action: 'public_intake.created'")
  assertBefore(source, 'workflowStepsCreated', '...scope.auditMetadata')

  assertContains(source, 'metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }')
  assertNotContains(source, 'metadata: { requestType, fullName')
}

const approvedFutureWiringSketch = `
import {
  PUBLIC_INTAKE_ROUTING_RUNTIME_ACK,
  PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG,
  getPublicIntakeRoutingRuntimeGate,
} from '@/lib/server/publicIntakeRoutingRuntimeGate'
import {
  createSupabasePublicIntakeParishScopeDataSource,
  resolvePublicIntakeParishScope,
} from '@/lib/server/publicIntakeParishScope'
import { resolvePublicIntakeRequestParishScopeForFutureRuntime } from '@/lib/server/publicIntakeRequestParishScopeAdapter'

export async function POST(request: NextRequest) {
  const admin = createSupabaseServiceRoleClient()
  const rateLimit = await checkDurableRateLimit({ admin, key: 'public-intake:test' })
  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  const body = parsedBody.ok ? parsedBody.value : null
  const requestType = text(body.requestType).toLowerCase()
  const gate = getPublicIntakeRoutingRuntimeGate()
  const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
    gate,
    routingInput: futureRuntimeRouteSignals,
    loadLegacyPrimaryParishId: () => primaryParishId(admin),
    resolveRoutedParishScope: (input) =>
      resolvePublicIntakeParishScope(createSupabasePublicIntakeParishScopeDataSource(admin), input),
  })
  if (!scope.ok) return NextResponse.json({ ok: false, error: scope.error }, { status: scope.status })
  const parishId = scope.parishId
  const ids: { requestId?: string; parishionerId?: string } = {}
  try {
    const { data: parishioner } = await admin.from('parishioners').insert({ parish_id: parishId })
    const workflowStepsCreated = await createRequestWorkflowStepsFromActiveTemplate({ admin })
    await writeAuditEvent({
      parishId,
      action: 'public_intake.created',
      metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata },
    })
  } catch {
    await cleanupPartialPublicIntake(admin, ids)
  }
}
`

describe('public intake runtime wiring preflight', () => {
  it('accepts an approved future wiring sketch with ordering and audit safeguards', () => {
    expect(() => assertFutureIntakeRuntimeWiringPreflight(approvedFutureWiringSketch)).not.toThrow()
  })

  it('rejects future wiring that parses the body before durable rate limiting', () => {
    const unsafe = approvedFutureWiringSketch.replace(
      'const rateLimit = await checkDurableRateLimit({ admin, key: \'public-intake:test\' })\n  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)',
      'const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)\n  const rateLimit = await checkDurableRateLimit({ admin, key: \'public-intake:test\' })'
    )

    expect(() => assertFutureIntakeRuntimeWiringPreflight(unsafe)).toThrow()
  })

  it('rejects future wiring that resolves parish scope after database inserts', () => {
    const unsafe = approvedFutureWiringSketch.replace(
      'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime',
      "const { data: parishioner } = await admin.from('parishioners').insert({ parish_id: 'too-early' })\n  const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime"
    )

    expect(() => assertFutureIntakeRuntimeWiringPreflight(unsafe)).toThrow()
  })

  it('rejects future wiring that drops adapter audit metadata from public intake audit events', () => {
    const unsafe = approvedFutureWiringSketch.replace(', ...scope.auditMetadata', '')

    expect(() => assertFutureIntakeRuntimeWiringPreflight(unsafe)).toThrow()
  })

  it('documents the preflight invariants in the implementation plan', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Source-Level Preflight Suite',
      'durable rate limiting stays before body parsing',
      'runtime routing stays behind the exact feature flags',
      'route-scope resolution happens before inserts',
      'audit metadata merges adapter metadata',
      'cleanup remains intact',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('verifies the live intake route follows the approved safe QA runtime wiring safeguards', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    assertFutureIntakeRuntimeWiringPreflight(intakeRoute)
    expect(intakeRoute).toContain('const gate = getPublicIntakeRoutingRuntimeGate()')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
  })
})
