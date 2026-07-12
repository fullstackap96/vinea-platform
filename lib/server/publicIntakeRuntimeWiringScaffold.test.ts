import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')
const checklistPath = join(root, 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_CHECKLIST.md')

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('public intake runtime wiring scaffold', () => {
  it('wires the live intake route through the approved disabled-by-default runtime gate', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    for (const required of [
      'getPublicIntakeRoutingRuntimeGate',
      'resolvePublicIntakeRequestParishScopeForFutureRuntime',
      'resolvePublicIntakeParishScope',
      'createSupabasePublicIntakeParishScopeDataSource',
      'extractPublicIntakeRouteSignalsForDryRun',
      'loadLegacyPrimaryParishId: () => primaryParishId(admin)',
    ]) {
      expect(intakeRoute).toContain(required)
    }
  })

  it('pins current legacy request creation behavior behind the flag-off adapter path', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    expect(intakeRoute).toContain('async function primaryParishId')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
    expect(intakeRoute).toContain('const parishId = scope.parishId')
    expect(intakeRoute).toContain('parish_id: parishId')
    expect(intakeRoute).toContain('parishioner_id: ids.parishionerId')
    expect(intakeRoute).toContain('createRequestWorkflowStepsFromActiveTemplate')
    expect(intakeRoute).toContain('await cleanupPartialPublicIntake(admin, ids)')
    expect(intakeRoute).toContain("action: 'public_intake.created'")
    expect(intakeRoute).toContain('metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }')
    expect(intakeRoute).not.toContain('metadata: { requestType, fullName')
  })

  it('keeps durable rate limiting before public request body processing and database writes', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    const rateLimitIndex = intakeRoute.indexOf('const rateLimit = await checkDurableRateLimit')
    const bodyIndex = intakeRoute.indexOf('const parsedBody = await readBoundedJsonBody')
    const parishInsertIndex = intakeRoute.indexOf(".from('parishioners')", bodyIndex)

    expect(rateLimitIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(rateLimitIndex)
    expect(parishInsertIndex).toBeGreaterThan(bodyIndex)
  })

  it('documents the disabled-by-default wiring checklist and regression matrix', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Runtime wiring approved for safe QA',
      'Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_IMPLEMENTATION_PLAN.md',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md',
      'Current Legacy Behavior That Must Stay True With The Flag Off',
      'Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` keeps legacy behavior',
      'Domain, token, and slug signals are ignored while the gate is disabled',
      'Forged staff active parish cookie',
      'Baptism public form',
      'Wedding public form',
      'Funeral public form',
      'OCIA public form',
      'Join Parish public form',
      'No operational RLS changes',
      'publicIntakePublicDisplayName',
      'publicIntakeResolvedRequestType',
      'Keep raw public tokens, token hashes, DNS verification tokens',
      'Dry-Run Route-Signal Extraction Contract',
      'lib/server/publicIntakeRouteSignalDryRun.ts',
      '`resolverWouldRun` must be `false`',
      'must not include the raw token value',
      'Flag-Off End-To-End Planning Contract',
      'dry-run route signals',
      'future parish-scope adapter',
      '`routeSource` must remain `legacy_fallback`',
      'Routed parish-scope resolver must not be called',
      'Switch-On Non-Runtime Planning Contract',
      'Mocked successful token, domain, and slug resolver responses',
      '`publicIntakeRouteSource` must match the mocked resolver route source',
      '`publicIntakeRoutingRuntimeEnabled` must be `true`',
      'The legacy primary parish loader must not be called',
      'Switch-On Failure Planning Contract',
      'expired token',
      'unverified domain',
      'disabled parish',
      'mismatched request type',
      'Public intake form is not available.',
      'Raw public tokens, token hashes, DNS verification values',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('uses the prepared adapter and guard through the approved live intake route wiring', () => {
    const adapter = source('lib/server/publicIntakeRequestParishScopeAdapter.ts')
    const gate = source('lib/server/publicIntakeRoutingRuntimeGate.ts')
    const dryRun = source('lib/server/publicIntakeRouteSignalDryRun.ts')
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    expect(adapter).toContain('resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expect(gate).toContain('getPublicIntakeRoutingRuntimeGate')
    expect(dryRun).toContain('extractPublicIntakeRouteSignalsForDryRun')
    expect(intakeRoute).toContain('publicIntakeRequestParishScopeAdapter')
    expect(intakeRoute).toContain('publicIntakeRoutingRuntimeGate')
    expect(intakeRoute).toContain('publicIntakeRouteSignalDryRun')
  })
})
