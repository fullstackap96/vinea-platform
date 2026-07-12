import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const packetPath = join(root, 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_APPROVAL_PACKET.md')
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')

describe('public intake runtime wiring approval packet', () => {
  it('states packet-only status and hard non-goals', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Safe QA route wiring approved. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.',
      'Do not enable runtime public intake routing in production.',
      'Do not apply migrations.',
      'Do not change operational RLS.',
      'Do not touch production or shared QA data.',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('names the exact product-owner decision and safe QA-only runtime flags', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Approve runtime public intake route wiring for safe QA only.',
      'Approve Safe QA Route Wiring',
      'Do Not Approve',
      'Approve After Fixes',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME',
      'It does not approve production enablement.',
      'Production enablement explicitly approved: No',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('summarizes completed evidence across schema, QA, settings, resolver, preflight, and acceptance criteria', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Schema Readiness',
      'supabase/migrations/20260625193000_public_intake_parish_routing.sql',
      'supabase/migrations/20260626103000_public_intake_domain_verification.sql',
      'Disposable App QA',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md',
      'Staff Settings QA And Management Readiness',
      'docs/PUBLIC_INTAKE_ROUTING_SETTINGS_MANUAL_QA_CHECKLIST.md',
      'Resolver And Adapter Planning',
      'docs/PUBLIC_INTAKE_REQUEST_PARISH_SCOPE_ADAPTER_PLAN.md',
      'Source Preflight Tests',
      'lib/server/publicIntakeRuntimeWiringPreflight.test.ts',
      'Acceptance Criteria',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('documents remaining risks and required implementation boundaries', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Runtime public intake routing is wired into the live `/api/intake` route behind disabled-by-default flags.',
      'Flag-on live HTTP behavior must be proven in safe QA before production enablement.',
      'A real successful DNS TXT verification path remains untested unless a safe controllable domain is available.',
      'Wire `/api/intake` to the prepared runtime gate and parish-scope adapter.',
      'Keep runtime routing disabled by default.',
      'Resolve parish scope before any database inserts.',
      'Keep durable public intake rate limiting before body parsing and database writes.',
      'Preserve partial cleanup behavior.',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('defines QA gates for flag-off, flag-on, errors, audit metadata, and rollback', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Flag-off Baptism, Wedding, Funeral, OCIA, and Join Parish public form regression passes.',
      'Flag-off token, domain, slug, and forged staff active parish cookie signals are ignored.',
      'Flag-on valid token routes to the correct parish.',
      'Flag-on verified domain routes to the correct parish.',
      'Flag-on enabled slug routes to the correct parish.',
      'Expired token returns only `Public intake form is not available.`',
      'Unverified domain returns only `Public intake form is not available.`',
      'Disabled parish returns only `Public intake form is not available.`',
      'Mismatched request type returns only `Public intake form is not available.`',
      'publicIntakeRouteSource',
      'publicIntakeRoutingRuntimeEnabled',
      'publicIntakePublicDisplayName',
      'publicIntakeResolvedRequestType',
      'Rollback by disabling `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` and `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` restores legacy behavior.',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('verifies the live intake route is wired only through the approved disabled-by-default path', () => {
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
