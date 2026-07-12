# Staff Users Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice.

## Scope

The staff management API at `app/api/parish/staff-users/route.ts` now uses the shared `logServerError` helper for unexpected staff access list, create, current-record lookup, and update failures.

## What Changed

- Unexpected database failures now return generic staff-facing messages:
  - `Could not load staff access.`
  - `Could not add staff access.`
  - `Could not update staff access.`
- Server logs keep only sanitized troubleshooting context such as route label, requested role, active-parish cookie presence, and whether a staff-user id was present.
- The route no longer returns raw `error.message` or `currentError.message` text to staff clients for unexpected server failures.

## Preserved Behavior

- Staff authentication is unchanged.
- Active-parish read scope is unchanged.
- Staff write parish context and primary-parish fallback compatibility are unchanged.
- Parish admin checks are unchanged.
- Existing validation and business-rule messages are unchanged, including invalid email, non-admin manage denial, missing staff user id, staff user not found, self-deactivation prevention, and last-admin protection.
- Existing audit writes for staff access upsert and update are unchanged.

## Explicit Non-Goals

- No production flags were added or enabled.
- No production data was accessed.
- No migrations were applied.
- No operational RLS policies were changed.
- No staff access permissions were weakened or expanded.
- No Google Calendar, AI, export, storage, certificate, automation, public intake, or public trust-center behavior changed.

## Verification

- Focused tests: `npm.cmd test -- lib\server\staffUsersRoute.test.ts lib\server\safeErrorLogging.test.ts`
- Expected result: staff route source tests pass and confirm generic error responses, sanitized logging helper usage, active parish/write-safety wiring, and no raw server error reflection for unexpected staff access failures.

## Manual QA Recommendation

Optional non-production smoke:

1. Sign in as a safe parish admin.
2. Open Staff Access for a selected active parish.
3. Confirm staff list loads.
4. Add or update a safe test staff fixture if approved for that non-production target.
5. Simulate unexpected list/create/update failures and confirm the browser shows only the generic staff access messages.
6. Confirm server logs contain sanitized route/action context and do not contain raw staff emails, provider payloads, database URLs, tokens, or stack-adjacent private details.

## Production Readiness Impact

This removes another raw error reflection path from a security-adjacent staff administration route. It improves production hardening while preserving the existing selected-parish and parish-admin authorization model.
