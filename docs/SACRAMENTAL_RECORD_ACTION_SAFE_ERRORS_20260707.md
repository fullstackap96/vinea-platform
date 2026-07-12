# Sacramental Record Action Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice.

## Scope

The staff-facing Sacramental Records dashboard Server Actions now log unexpected create, update, person lookup, and person-link update failures through the shared safe server logging helper and return stable staff-safe messages instead of raw Supabase/database `.message` text.

## Staff-Safe Messages

- `Could not create record.`
- `Could not update record.`
- `Could not verify selected person.`
- `Could not update person link. Refresh and try again.`

## Preserved Behavior

- Existing staff authentication checks are unchanged.
- Existing active-parish write context for record creation is unchanged.
- Existing primary-parish fallback remains only where no active parish cookie exists.
- Existing sacramental record validation messages remain unchanged.
- Existing person-not-found guidance remains unchanged.
- Existing record creation, record update, and staff-triggered person-link update behavior remain unchanged.

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, enable production flags, mutate records beyond the already-existing staff-triggered actions, generate certificates, enable correction or notation workflows, make canonical or sacramental eligibility decisions, change exports, call AI, touch Google Calendar data, access storage, create signed URLs, send communications, enable automation, or make public trust claims.

## Verification

- `lib/server/sacramentalRecordActionSafeErrors.test.ts` verifies these actions import `logServerError`, keep stable staff-safe messages, and do not return raw database/provider `.message` text in mutation failure responses.
