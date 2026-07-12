import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const acceptancePath = join(root, 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md')
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')

describe('public intake runtime wiring acceptance criteria', () => {
  it('documents non-runtime status and hard safety boundaries', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'Acceptance criteria for safe QA runtime wiring. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.',
      'Do not enable runtime public intake routing in production.',
      'Do not apply migrations.',
      'Do not change operational RLS.',
      'Do not touch production data.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('pins exact runtime flag states for flag-off and flag-on QA', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME unset or any value other than ENABLED',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK unset or any value other than APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME',
      '`/api/intake` must use the legacy primary parish behavior.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('covers flag-off public form regression for every public intake form and ignored signals', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'Flag-Off Public Form Regression',
      '/baptism-request',
      '/wedding-request',
      '/funeral-request',
      '/ocia-request',
      '/join-parish-request',
      'fake token signal',
      'fake slug signal',
      'host/domain signal',
      'forged staff active parish cookie',
      'normal public intake rate limiting',
      '`429` rate-limit response',
      'All created records use the legacy primary parish id.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('covers flag-on token, domain, and slug routing acceptance criteria', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'Flag-On Token Routing',
      "Confirm the request is created under the token's parish.",
      'Deactivated token returns only the generic public error.',
      'Flag-On Domain Routing',
      "Confirm the request is created under the verified domain's parish.",
      'Verified active domain creates the request under the expected parish.',
      'Flag-On Slug Routing',
      "Confirm the request is created under the slug's parish.",
      'Enabled slug creates the request under the expected parish.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('covers generic public errors without secret or diagnostic exposure', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'Generic Error Cases',
      'Expired public token',
      'Unverified domain',
      'Disabled parish',
      'Mismatched request type',
      'Public intake form is not available.',
      'Public failures do not create parishioners, requests, details, checklist rows, workflow steps, documents, or audit events for a request.',
      'raw public tokens',
      'token hashes',
      'DNS verification values',
      'stack traces',
      'internal routing diagnostics',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('covers audit-log metadata and rollback verification', () => {
    const doc = readFileSync(acceptancePath, 'utf8')

    for (const required of [
      'Audit-Log Verification',
      'publicIntakeRouteSource = legacy_fallback',
      'publicIntakeRoutingRuntimeEnabled = false',
      'publicIntakeRouteSource',
      'publicIntakeRoutingRuntimeEnabled = true',
      'publicIntakePublicDisplayName',
      'publicIntakeResolvedRequestType',
      'requestType',
      'fullName',
      'workflowStepsCreated',
      'Rollback Verification',
      'Runtime routing can be turned off using environment configuration only.',
      'No database rollback is required for the runtime feature toggle rollback.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('verifies the live intake route uses the approved disabled-by-default runtime path', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    for (const required of [
      'getPublicIntakeRoutingRuntimeGate',
      'extractPublicIntakeRouteSignalsForDryRun',
      'resolvePublicIntakeRequestParishScopeForFutureRuntime',
      'resolvePublicIntakeParishScope',
      'createSupabasePublicIntakeParishScopeDataSource',
      '...scope.auditMetadata',
    ]) {
      expect(intakeRoute).toContain(required)
    }
  })
})
