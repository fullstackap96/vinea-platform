# Server Warning Safe Logging - 2026-07-06

Status: Implemented as a scoped production-readiness hardening slice.

## Summary

Vinea now routes remaining runtime server warning logs through the shared safe logging helper instead of direct `console.warn` calls in route/helper code. This keeps warning logs useful for operators while applying the same redaction path used by safe error logging.

## What Changed

- Added `logServerWarning` to `lib/server/safeErrorLogging.ts`.
- Updated `app/api/demo-request/route.ts` configuration warnings to use `logServerWarning`.
- Updated `app/api/request-notifications/route.ts` configuration warnings to use `logServerWarning`.
- Updated `lib/server/requestWorkflowTemplates.ts` missing-RPC fallback warning to use `logServerWarning`.
- Added focused tests proving warning logs redact emails/tokens and that hardened runtime source files no longer contain direct `console.warn` calls.

## Boundary

This does not change staff-facing or public-facing behavior, email delivery behavior, request notification verification, demo request validation, workflow-template fallback behavior, production flags, monitoring runtime, migrations, operational RLS, exports, AI, storage, signed URLs, Google Calendar behavior, certificate generation, automation, or public trust claims.

## Manual QA

Optional non-production smoke:

1. Submit a demo request with safe non-production email settings intentionally missing.
2. Submit a request notification with a safe missing notification inbox or app URL.
3. Create a safe public intake request in a database where the workflow-template RPC is intentionally unavailable.
4. Confirm user-facing behavior remains unchanged and logs contain only safe route/helper labels, setting labels, and booleans.

## Verification

- Focused tests should include `lib/server/safeErrorLogging.test.ts`, `lib/server/demoRequestRouteSafeErrors.test.ts`, `lib/server/requestNotificationsRouteSafeErrors.test.ts`, and `lib/server/requestWorkflowTemplates.test.ts`.
- Full test, lint, and build evidence is recorded in `docs/VINEA_BUILD_STATUS.md`.
