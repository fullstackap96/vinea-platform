# Public Intake Routing Runtime Guard Plan

Last Updated: 2026-06-26

## Status

Runtime wiring approved for safe QA. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags and is not wired into public intake pages.

## Purpose

Public intake routing can resolve the parish for a family-facing form by:

- Verified custom domain.
- Public intake token.
- Parish slug.
- Legacy primary parish fallback for current public form URLs.

Because this affects where real family requests are created, runtime routing must be guarded separately from the staff settings UI and schema readiness work.

## Feature Flag

Runtime routing must stay disabled unless both environment variables are set exactly:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

Any missing, blank, lowercase, partial, or alternate value must keep runtime routing disabled.

## Server-Side Gate

The guard lives in:

```text
lib/server/publicIntakeRoutingRuntimeGate.ts
```

Runtime wiring calls `getPublicIntakeRoutingRuntimeGate()` before resolving public parish scope from domains, tokens, or slugs.

When the gate is disabled:

- The adapter must not call the routed `resolvePublicIntakeParishScope()` path.
- Continue using the existing legacy primary parish path.
- Do not trust staff active parish cookies or staff session state.
- Do not expose routing metadata to families.

When the gate is enabled:

- Resolve explicit public route signals in this order:
  1. Public token.
  2. Verified active domain.
  3. Enabled parish slug.
  4. Legacy primary parish fallback for current public form paths only.
- Require `parishes.public_intake_enabled = true` for token, domain, and slug routes.
- Require domain rows to be active and `verified_at` to be set.
- Require token rows to be active and unexpired.
- Return generic public errors for missing, disabled, unverified, expired, or mismatched routes.

## Rollout Gates Before Production Enablement

Do not enable runtime routing outside safe QA until all are true:

- QA `/api/health` returns `checks.schema: true`.
- Staff settings metadata, domain, token, and domain verification QA have passed.
- A product owner approves family-facing runtime routing.
- A safe regression plan exists for Baptism, Wedding, Funeral, OCIA, and Join Parish.
- Legacy public form URLs are confirmed to keep working.
- Monitoring or audit evidence can distinguish route source: `token`, `domain`, `slug`, or `legacy_fallback`.
- Production enablement gates from `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md` have passed.

## Explicit Non-Goals In This Phase

- No public page route changes.
- No database migration.
- No operational RLS changes.
- No production or shared QA data changes.

## What Changed Plain English

Vinea now has a locked switch for future public intake routing. The switch is off by default, and it needs two exact settings before the app is allowed to use parish-specific domains, tokens, or slugs for family forms. This lets us prepare the next step without accidentally changing where real public requests go.
