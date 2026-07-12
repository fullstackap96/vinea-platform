# Public Intake Legacy Fallback Boundary - 2026-07-08

Status: Implemented as a safe production-readiness source guard.

## Summary

The live public intake route still preserves the approved legacy fallback while runtime public intake routing remains disabled by default. This phase makes that fallback explicit and source-guarded so the first-parish lookup stays isolated inside the compatibility loader.

## What Changed

- Added an inline route comment marking `primaryParishId(...)` as a deliberate legacy fallback only.
- Added source-level tests proving the first-parish `created_at` lookup appears only in the compatibility loader.
- Added tests proving the live `POST` body still routes parish scope through the disabled-by-default runtime gate and adapter.

## Safety Boundary

This does not enable production public intake routing, does not change public intake behavior, does not apply migrations, does not change operational RLS, does not access production, does not mutate records outside existing public intake behavior, does not send communications, does not call AI, does not run exports, does not touch Google Calendar data, does not access storage, does not create signed URLs, does not generate certificates, and does not make public trust claims.

## Why This Matters

Vinea is preparing for multi-parish public intake routing, but production routing is still approval-gated. Until that gate opens, the legacy fallback must remain visible, isolated, and hard to accidentally copy into new route logic.

## Verification Boundary

The source guard verifies:

- the compatibility helper contains the legacy first-parish lookup;
- the live `POST` route body does not contain direct first-parish ordering or limit logic;
- runtime route signals still flow through `resolvePublicIntakeRequestParishScopeForFutureRuntime(...)`;
- audit metadata still merges `scope.auditMetadata`;
- raw token/domain routing tables are not queried directly in the route body.

## Remaining Follow-Up

Production public intake routing remains `NO-GO` until the existing production enablement checklist, smoke evidence template, DNS/domain evidence, rollout/rollback plan, and explicit product-owner approval are complete.
