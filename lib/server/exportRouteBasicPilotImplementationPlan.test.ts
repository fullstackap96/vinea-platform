import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(process.cwd(), 'docs', 'EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md')
const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('same-parish basic export pilot implementation plan', () => {
  it('is explicitly non-runtime and preserves all safety boundaries', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime implementation plan and acceptance-criteria packet only.',
      'Production was not accessed',
      'no migrations were applied',
      'live export routes were not wired',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current state: `PLAN PREPARED, LIVE EXPORT ROUTE NOT WIRED`',
      'Completion marker: `EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('chooses request_list_basic as the first pilot and rejects riskier first surfaces', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Recommended export preset: `request_list_basic`',
      'Recommended future route candidate: `app/api/exports/requests/basic/route.ts`',
      'It is less sensitive than a people/households export, sacramental export, document export, or communication-history export.',
      'Do not use the first pilot for `people_households_basic`, sacramental/canonical records, document files, document manifests, audit logs, communication history, AI outputs, public intake routing history, support break-glass exports, or diocesan rollups.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('defines a server-owned allowlist and explicit sensitive-field exclusions', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'The first pilot should use a server-owned allowlist.',
      'Request reference.',
      'Request type.',
      'Request status.',
      'Assigned staff display label.',
      'Required workflow steps incomplete count.',
      'Internal notes.',
      'Communication history.',
      'AI summaries, prompts, drafts, provider payloads, and token material.',
      'Document storage paths.',
      'Signed URLs.',
      'Family portal tokens or token hashes.',
      'Public intake token hashes.',
      'Google OAuth tokens or Google Calendar payloads.',
      'Sacramental/canonical record details.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('requires the disabled gate, active parish scope, permission DTO, audit metadata, and preflight before exports', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Evaluate `getExportRuntimeGate` before export query work.',
      'Require authenticated staff.',
      'Resolve selected active parish context.',
      "Validate the active parish is in the staff member's `parish_memberships`.",
      'Build `buildExportPermissionEvaluationDto` with preset `request_list_basic`.',
      'Use the server-owned basic request-list field allowlist.',
      'Prepare safe audit metadata with no raw record payloads, prompts, tokens, signed URLs, or file contents.',
      'Write the audit event before query execution or file delivery.',
      'Query only same-parish request rows for the selected active parish.',
      'The route must continue to satisfy `lib/server/exportRouteRuntimeWiringPreflight.ts` before merge.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('captures flag-off, same-parish, cross-parish, family portal, blocked-field, production, QA, and rollback acceptance criteria', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'When the export runtime gate is off, the route returns a generic disabled response.',
      'An authenticated staff user with `export_same_parish_basic` can export only the selected active parish',
      'A selected active parish mismatch fails with a generic error.',
      'Family portal requests cannot access this route.',
      'Any attempt to request token material, secrets, signed URLs, raw AI material, document paths, internal notes, communications, or sacramental/canonical fields is denied.',
      'Production remains blocked by the runtime gate.',
      'Operational RLS is unchanged.',
      'No migrations are required for this first pilot plan.',
      'Source-level export route preflight passes.',
      'Rollback by disabling flags passes.',
      'Remove or disable `VINEA_EXPORT_RUNTIME`.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('links the plan from policy and trust-center readiness docs without strengthening runtime claims', () => {
    const policy = readFileSync(policyPath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(policy).toContain(
      'Status: Prepared as a non-runtime route implementation plan and acceptance-criteria packet in `docs/EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md`.'
    )
    expect(policy).toContain(
      'The original implementation plan intentionally did not wire any live export route, query Supabase, return files, write audit events, change staff UI, apply migrations, or change operational RLS.'
    )
    expect(policy).toContain(
      'Vinea has prepared a conservative export-control proposal, non-runtime export permission DTOs, a disabled-by-default export runtime gate, source-level preflight tests, and a non-runtime implementation plan for a future same-parish basic request-list export pilot.'
    )
    expect(trustCenter).toContain(
      'Same-parish basic export pilot implementation plan: `docs/EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Same-parish basic export pilot validation tests: `lib/server/exportRouteBasicPilotImplementationPlan.test.ts`'
    )
    expect(trustCenter).toContain(
      'Fill `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` and `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` with production-safe fixture labels, named monitoring owner/channel, support owner, rollback owner, rollout window, and exact product-owner approval language for the approved export production smokes.'
    )
  })

  it('does not include obvious credential or connection-string material', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(plan).not.toContain(forbidden)
    }
  })
})
