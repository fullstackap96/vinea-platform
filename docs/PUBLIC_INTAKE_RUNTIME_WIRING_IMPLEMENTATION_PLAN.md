# Public Intake Runtime Wiring Implementation Plan

Last Updated: 2026-06-26

## Status

Runtime wiring approved for safe QA. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.

## Purpose

This document records the approved safe QA `/api/intake` runtime routing phase and the safeguards that must remain true before production enablement.

## Explicit Non-Goals

- Do not enable runtime public intake routing in production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not touch production or shared QA data.
- Do not expose public tokens, token hashes, DNS verification values, or internal routing diagnostics.

## Current `/api/intake` Anchors

Runtime wiring must preserve these route anchors in `app/api/intake/route.ts`:

1. `const admin = createSupabaseServiceRoleClient()`
2. `const rateLimit = await checkDurableRateLimit`
3. `const parsedBody = await readBoundedJsonBody`
4. `const requestType = text(body.requestType).toLowerCase()`
5. `const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime`
6. `parish_id: parishId`
7. `createRequestWorkflowStepsFromActiveTemplate`
8. `metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }`
9. `await cleanupPartialPublicIntake(admin, ids)`

## Future Code Insertion Points

### 1. Imports

The approved safe QA runtime phase uses imports for:

- `getPublicIntakeRoutingRuntimeGate`
- `extractPublicIntakeRouteSignalsForDryRun` or its future runtime equivalent
- `resolvePublicIntakeRequestParishScopeForFutureRuntime`
- `resolvePublicIntakeParishScope`
- `createSupabasePublicIntakeParishScopeDataSource`

### 2. After Body Parse And Basic Request-Type Normalization

The parish-scope resolution must run only after:

```ts
const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
const body = parsedBody.ok ? parsedBody.value : null
const requestType = text(body.requestType).toLowerCase()
```

It must not move bounded body parsing or public request validation before durable rate limiting.

### 3. Replace The Current Parish Id Assignment

The legacy direct assignment:

```ts
const parishId = await primaryParishId(admin)
```

is replaced with a scoped result from the adapter.

When the runtime gate is off, the adapter must preserve legacy behavior by loading the same primary parish id.

When the runtime gate is on, the adapter may use token, verified domain, slug, or legacy path routing.

### 4. Parishioner Insert

Keep:

```ts
parish_id: parishId
```

but ensure `parishId` comes from the adapter result, not direct route-local routing logic.

### 5. Audit Metadata Merge

Replace:

```ts
metadata: { requestType, workflowStepsCreated }
```

with metadata that merges the current request context and adapter audit metadata:

```ts
metadata: {
  requestType,
  workflowStepsCreated,
  ...scope.auditMetadata,
}
```

Audit metadata must include:

- `publicIntakeRouteSource`
- `publicIntakeRoutingRuntimeEnabled`
- `publicIntakePublicDisplayName`
- `publicIntakeResolvedRequestType`

Audit metadata must not include:

- raw public tokens
- token hashes
- DNS verification tokens
- DNS verification values
- internal routing diagnostics
- stack traces

### 6. Failure Response Mapping

If the future adapter returns `ok: false`, the live route should return:

```ts
NextResponse.json({ ok: false, error: scope.error }, { status: scope.status })
```

The error must remain generic:

```text
Public intake form is not available.
```

### 7. Cleanup Behavior

Keep:

```ts
await cleanupPartialPublicIntake(admin, ids)
```

Partial cleanup must still run if any insert after parishioner/request creation fails.

The future routing scope should be resolved before the first insert so a routing failure does not create partial rows.

## Required Flag-Off Test Gates

Before runtime wiring is merged, automated tests must prove:

- Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` uses legacy primary parish.
- Incorrect `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` uses legacy primary parish.
- Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` uses legacy primary parish.
- Incorrect `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` uses legacy primary parish.
- Domain, token, slug, and forged staff active parish cookie signals are ignored while disabled.
- Existing public forms for Baptism, Wedding, Funeral, OCIA, and Join Parish still create requests under the legacy parish when disabled.
- Durable public intake rate limiting still runs before body parsing and database writes.

## Required Flag-On Test Gates

Before runtime routing is enabled in any shared environment, automated and manual QA must prove:

- Valid public token routes to the correct parish.
- Verified domain routes to the correct parish.
- Enabled parish slug routes to the correct parish.
- Legacy public form paths still work where intentionally allowed.
- Expired token returns generic public error.
- Unverified domain returns generic public error.
- Disabled parish returns generic public error.
- Mismatched request type returns generic public error.
- Audit events include route-source metadata.
- Audit events do not include raw public tokens or internal routing diagnostics.

## Source-Level Preflight Suite

Before the future `/api/intake` wiring commit is approved, source-level preflight tests must fail unless:

- durable rate limiting stays before body parsing.
- runtime routing stays behind the exact feature flags:
  - `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME`
  - `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK`
- route-scope resolution happens before inserts into `parishioners`, `requests`, detail tables, checklist rows, workflow steps, or audit events.
- the future route imports or calls the runtime gate, public route-scope adapter, public resolver, and Supabase public intake parish-scope data source only in the approved runtime wiring phase.
- `parish_id: parishId` uses the adapter-returned parish id, not direct route-local token/domain/slug logic.
- audit metadata merges adapter metadata using `...scope.auditMetadata`.
- cleanup remains intact through `await cleanupPartialPublicIntake(admin, ids)`.
- raw public tokens, token hashes, DNS verification values, and internal routing diagnostics are not added to responses or audit metadata.

The current preflight suite lives in:

```text
lib/server/publicIntakeRuntimeWiringPreflight.test.ts
```

Until runtime wiring is explicitly approved, that suite must also continue proving the live `/api/intake` route remains unwired from the runtime gate, future adapter, public resolver, and runtime feature flags.

## Route-Wiring Acceptance Criteria

Manual QA acceptance criteria for the future runtime wiring commit live in:

```text
docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md
```

Those criteria must pass before `/api/intake` runtime routing can be accepted. They cover flag-off public form regression, flag-on token/domain/slug routing, generic public error cases, audit-log verification, and rollback verification.

## Product-Owner Approval Packet

The final decision packet for the future safe QA route-wiring phase lives in:

```text
docs/PUBLIC_INTAKE_RUNTIME_WIRING_APPROVAL_PACKET.md
```

That packet summarizes completed schema readiness, settings QA, non-runtime planning tests, source preflight tests, acceptance criteria, remaining risks, and the exact approval decision needed before touching the live `/api/intake` route.

## Rollback Strategy

Rollback must be possible without database changes:

1. Remove or disable:
   - `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME`
   - `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK`
2. Confirm `/api/intake` uses the legacy primary parish adapter path.
3. Confirm public forms still submit for Baptism, Wedding, Funeral, OCIA, and Join Parish.
4. Confirm audit events record `publicIntakeRouteSource = legacy_fallback` and `publicIntakeRoutingRuntimeEnabled = false`.
5. If code rollback is needed, revert only the runtime route wiring commit while preserving the non-runtime tests, docs, schema, and settings UI.

## Approval Gates Before Live Wiring

Do not wire `/api/intake` until all are true:

- Product owner approves family-facing routing behavior.
- QA `/api/health` returns `checks.schema: true`.
- Staff public intake routing settings QA has passed.
- Domain verification QA has passed, including a real successful DNS TXT path if a safe domain is available.
- Flag-off public form regression has passed.
- Flag-on token/domain/slug regression has passed in a safe QA environment.
- Rollback steps have been rehearsed and documented.

## What Changed Plain English

Vinea now has a detailed map for where future parish-specific public form routing should be added. The plan says exactly where the new routing logic would fit, what tests must pass first, what audit details must be saved, and how to turn the feature back off if needed. No live public form behavior changes from this document.
