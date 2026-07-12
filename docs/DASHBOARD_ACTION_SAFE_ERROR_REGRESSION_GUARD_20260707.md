# Dashboard Action Safe Error Regression Guard - 2026-07-07

## Status

Implemented as a source-level production-readiness regression guard.

## Scope

The guard scans all `app/dashboard/**/actions.ts` files and fails the test suite if a staff-facing Server Action returns likely raw database, provider, or exception `.message` text in `{ ok: false, error: ... }` responses.

## Why This Matters

Dashboard Server Actions are reachable through staff-triggered POST requests and often sit behind everyday parish-office workflows. Returning raw backend error text can expose technical details, provider payloads, database wording, or confusing messages to staff. The guard keeps future action changes aligned with the safe-error boundary.

## Allowed Behavior

- Existing validation messages may remain plain and staff-friendly.
- Expected authentication and authorization messages may remain stable.
- Action-specific staff-safe failure messages should be returned for unexpected database/provider failures.
- Private technical details should be logged only through redacted server logging helpers.

## Safety Boundary

This slice does not change runtime action behavior, access production, apply migrations, change operational RLS, enable production flags, mutate records, send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, generate certificates, enable automation, or make public trust claims.

## Verification

- `lib/server/dashboardActionSafeErrorRegressionGuard.test.ts` verifies dashboard `actions.ts` files do not return raw `.message` values or `messageFromError(...)` helper output from failed action responses.
