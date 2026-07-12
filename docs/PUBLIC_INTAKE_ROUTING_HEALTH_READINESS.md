# Public Intake Routing Health Readiness

Status: Runtime health checks include the promoted public intake routing schema. Do not wire runtime intake routing or change operational RLS from this document.

Related files:

- `lib/server/healthCheck.ts`
- `app/api/health/route.ts`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- `supabase/migrations/20260625193000_public_intake_parish_routing.sql`

## Purpose

This document defines the `/api/health` readiness criteria added after the public intake parish routing migration was promoted into `supabase/migrations`.

Runtime public forms still use the legacy single-parish intake path until a separate route-wiring phase is explicitly approved.

## Current Runtime Expectation

After the public intake routing migration is promoted:

- `/api/health` requires public intake routing schema.
- `/api/health` returns `checks.schema: true` only when the promoted routing schema is present.
- Runtime public intake remains unchanged.
- Missing `public_slug`, routing domain tables, or routing token tables should fail current health checks with safe `missingSchema` labels.

## `/api/health` Success Expectation

After the public intake routing migration is promoted, applied, and accepted:

```json
{
  "ok": true,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": true,
    "resend": true,
    "googleOAuth": true
  }
}
```

Pass criteria:

- `ok` is `true`.
- `checks.schema` is `true`.
- `missingSchema` is absent.
- Existing env, Supabase, parishes, Resend, and Google OAuth health semantics remain unchanged.

## `/api/health` Failure Expectation

After the public intake routing migration is promoted, applied, and accepted, a missing routing object should produce:

```json
{
  "ok": false,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": false,
    "resend": true,
    "googleOAuth": true
  },
  "error": "schema",
  "missingSchema": [
    "public intake parish routing columns"
  ]
}
```

Failure messaging rules:

- `error` must be `schema`.
- `checks.schema` must be `false`.
- `missingSchema` must contain safe labels only.
- `missingSchema` must not expose SQL text, secrets, hostnames, tokens, raw token hashes, staff data, or private parish data.

## Schema Readiness Checks

These checks are included in `REQUIRED_SCHEMA_READINESS_CHECKS` after the migration promotion.

| Label | Kind | Table | Columns |
| --- | --- | --- | --- |
| `public intake parish routing columns` | `select` | `parishes` | `public_slug, public_display_name, public_intake_enabled` |
| `public intake domain routing table` | `select` | `parish_public_intake_domains` | `id, parish_id, hostname, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, active` |
| `public intake token routing table` | `select` | `parish_public_intake_tokens` | `id, parish_id, token_hash, request_type, expires_at, active` |

Expected missing labels:

- Missing `parishes.public_slug`, `parishes.public_display_name`, or `parishes.public_intake_enabled` should return `public intake parish routing columns`.
- Missing `public.parish_public_intake_domains` should return `public intake domain routing table`.
- Missing `public.parish_public_intake_tokens` should return `public intake token routing table`.

## Health-Check Test Cases

Health tests cover:

1. `REQUIRED_SCHEMA_READINESS_CHECKS` includes the three public intake routing checks.
2. Missing parish routing columns return `missingSchema: ["public intake parish routing columns"]`.
3. Missing domain routing table returns `missingSchema: ["public intake domain routing table"]`.
4. Missing token routing table returns `missingSchema: ["public intake token routing table"]`.
5. Permission errors still throw or return generic schema failure instead of being mislabeled as missing schema.
6. Existing public intake rate-limit health checks still pass.
7. Existing multi-parish membership health checks still pass.

## Promotion Gate

These gates were required before adding the checks to live runtime health:

- The public intake parish routing migration candidate has passed disposable QA.
- The disposable QA evidence template has been completed and reviewed.
- The disposable Supabase execution packet has been followed and evidence has been captured.
- The public intake routing promotion readiness checklist has passed.
- The rollback draft has passed disposable QA.
- The migration has been moved from `docs/sql` into `supabase/migrations`.
- `/api/health` has been updated in the same implementation phase as the applied migration.
- A rollback plan exists if `/api/health` reports missing public intake routing schema after deployment.

## Non-Goals

- Do not add route-level public intake behavior in this phase.
- Do not expose token hashes or domain mappings through public health responses.
- Do not change operational RLS.
