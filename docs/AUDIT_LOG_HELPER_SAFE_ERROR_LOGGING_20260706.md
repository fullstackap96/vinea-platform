# Audit Log Helper Safe Error Logging - 2026-07-06

Status: `IMPLEMENTED - CENTRAL AUDIT WRITE ERROR REDACTION`

Current persistence result: the helper returns `true` only when Supabase accepts the audit insert and `false` for returned or thrown failures.

## Scope

This slice hardens the server-only `writeAuditEvent` helper in `lib/server/auditLog.ts`.

## What Changed

- Audit write failures now use `logServerError('[audit] write failed', ...)`.
- Supabase `{ error }` results are treated as failures even when the client does not throw.
- The failure log includes only safe labels:
  - `action`
  - `targetType`
  - `hasParishId`
  - `hasActorEmail`
  - `hasTargetId`
  - `hasMetadata`
- The helper still contains audit-write failures so existing route behavior is unchanged; callers may inspect the returned boolean when a future reviewed flow requires stricter handling.
- The helper still writes the requested audit event payload when the insert succeeds.

## Safety Boundaries

- No audit table schema changed.
- No migrations were applied.
- No operational RLS changes were made.
- No production access, production flags, exports, storage, signed URLs, Google Calendar data, AI calls, public intake behavior, certificate generation, automations, or public trust claims were changed.
- Raw actor emails, parish IDs, target IDs, audit metadata, database URLs, provider payloads, and token-like values are not added to failure log metadata.

## Why This Matters

`writeAuditEvent` is used by many staff, export, AI, public intake, document, and admin flows. If an audit insert fails, the server should record enough context for troubleshooting without dumping raw database errors or sensitive operational metadata into logs.

## Verification

- Focused audit helper, shared redaction, and audit events route tests passed:
  - `npm.cmd test -- lib\server\auditLogSafeErrors.test.ts lib\server\safeErrorLogging.test.ts lib\server\auditEventsRoute.test.ts`
  - Result: 3 test files, 15 tests.

## Manual Testing Needed

- Optional non-production smoke: force a safe audit insert failure in a non-production route that calls `writeAuditEvent` and confirm the server log uses the `[audit] write failed` safe envelope while staff-facing route behavior remains unchanged.
