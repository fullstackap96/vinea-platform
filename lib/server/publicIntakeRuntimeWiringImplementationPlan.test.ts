import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const planPath = join(root, 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_IMPLEMENTATION_PLAN.md')
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')

describe('public intake runtime wiring implementation plan', () => {
  it('documents the plan-only status and explicit non-goals', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Runtime wiring approved for safe QA. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.',
      'Do not enable runtime public intake routing in production.',
      'Do not apply migrations.',
      'Do not change operational RLS.',
      'Do not touch production or shared QA data.',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('pins the current intake route anchors and future insertion points', () => {
    const plan = readFileSync(planPath, 'utf8')
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    for (const anchor of [
      'const admin = createSupabaseServiceRoleClient()',
      'const rateLimit = await checkDurableRateLimit',
      'const parsedBody = await readBoundedJsonBody',
      'const requestType = text(body.requestType).toLowerCase()',
      'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime',
      'parish_id: parishId',
      'createRequestWorkflowStepsFromActiveTemplate',
      'metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }',
      'await cleanupPartialPublicIntake(admin, ids)',
    ]) {
      expect(plan).toContain(anchor)
      expect(intakeRoute).toContain(anchor)
    }

    for (const required of [
      'Future Code Insertion Points',
      'After Body Parse And Basic Request-Type Normalization',
      'Replace The Current Parish Id Assignment',
      'Parishioner Insert',
      'Audit Metadata Merge',
      'Failure Response Mapping',
      'Cleanup Behavior',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('documents flag-off and flag-on test gates plus rollback strategy', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Required Flag-Off Test Gates',
      'Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` uses legacy primary parish.',
      'Domain, token, slug, and forged staff active parish cookie signals are ignored while disabled.',
      'Durable public intake rate limiting still runs before body parsing and database writes.',
      'Required Flag-On Test Gates',
      'Valid public token routes to the correct parish.',
      'Verified domain routes to the correct parish.',
      'Enabled parish slug routes to the correct parish.',
      'Expired token returns generic public error.',
      'Unverified domain returns generic public error.',
      'Disabled parish returns generic public error.',
      'Mismatched request type returns generic public error.',
      'Rollback Strategy',
      'Approval Gates Before Live Wiring',
      'Product owner approves family-facing routing behavior.',
      'Route-Wiring Acceptance Criteria',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md',
      'flag-off public form regression, flag-on token/domain/slug routing, generic public error cases, audit-log verification, and rollback verification.',
      'Product-Owner Approval Packet',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_APPROVAL_PACKET.md',
      'completed schema readiness, settings QA, non-runtime planning tests, source preflight tests, acceptance criteria, remaining risks, and the exact approval decision needed before touching the live `/api/intake` route.',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('documents audit metadata merge without allowing secret routing data', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      '...scope.auditMetadata',
      'publicIntakeRouteSource',
      'publicIntakeRoutingRuntimeEnabled',
      'publicIntakePublicDisplayName',
      'publicIntakeResolvedRequestType',
      'raw public tokens',
      'token hashes',
      'DNS verification tokens',
      'DNS verification values',
      'internal routing diagnostics',
      'stack traces',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('verifies the live intake route uses runtime routing helpers only behind the approved gate', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    for (const required of [
      'getPublicIntakeRoutingRuntimeGate',
      'extractPublicIntakeRouteSignalsForDryRun',
      'resolvePublicIntakeRequestParishScopeForFutureRuntime',
      'resolvePublicIntakeParishScope',
      'createSupabasePublicIntakeParishScopeDataSource',
      'loadLegacyPrimaryParishId: () => primaryParishId(admin)',
      '...scope.auditMetadata',
    ]) {
      expect(intakeRoute).toContain(required)
    }
  })
})
