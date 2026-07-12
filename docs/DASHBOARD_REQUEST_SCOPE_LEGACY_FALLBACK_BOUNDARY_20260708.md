# Dashboard Request Scope Legacy Fallback Boundary - 2026-07-08

## Status

Implemented as a source-level production-readiness guard. This does not change runtime behavior.

## Boundary

The dashboard request loader must keep this parish-scope order:

1. Use the server-validated active parish when one is selected.
2. If no active parish is selected, use the staff membership-primary parish helper.
3. Use `primary_parish_id()` only through the explicit compatibility fallback helper while legacy single-parish compatibility remains approved.

## Why This Matters

The dashboard is a high-traffic staff surface. A future edit that quietly skips the active parish or membership-primary scope could make the first screen drift back toward single-parish assumptions. This guard keeps the old fallback visible, isolated, and easier to remove when production multi-parish readiness no longer needs it.

## Non-Goals

- Does not apply migrations.
- Does not change operational RLS.
- Does not access production or shared QA.
- Does not mutate records.
- Does not enable production flags.
- Does not run exports, call AI, touch Google Calendar data, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Verification

- `lib/server/dashboardParishRequestScopeLegacyFallbackBoundary.test.ts` checks the active-parish-first, membership-primary-second, explicit-fallback-last ordering.
- Existing `lib/dashboardParishRequestScope.test.ts` continues to verify behavior for active parish, membership-primary parish, and fallback error handling.
