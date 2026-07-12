# Dashboard Parish Switch Thrown-Failure Recovery - 2026-07-11

Decision: `DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_IMPLEMENTED_20260711`

Status: Implemented and verified.

## Problem Closed

The dashboard selector previously updated confirmed client context optimistically. Structured Server Action failures were already handled, but an unexpected network or server exception could leave the selector displaying a parish that was never saved and produce an unhandled asynchronous rejection. The later sensitive-tool reset keeps the immediate pending selection visible without treating it as confirmed parish context.

## Recovery Behavior

- Capture the previously confirmed parish before showing the pending selection.
- Preserve the existing successful selection and structured-denial paths.
- If the Server Action throws, the shell clears the pending selection and retains the previously confirmed parish.
- Show the existing curated non-technical guidance instead of raw exception text.
- Refresh server-rendered dashboard state after success, structured denial, or thrown failure.
- Keep the selector disabled while a switch is in progress so overlapping choices cannot race.

## Safety Boundary

The Server Action remains authoritative for authentication, active membership, allowed parish selection, and cookie persistence. This client recovery does not grant access or persist parish context. It prevents a pending choice from being represented as confirmed tenant context.

## Verification Boundary

- No production access.
- No parish selection was changed during verification.
- No database, cookie, provider, communication, Calendar, AI, export, storage, signed URL, certificate, migration, operational RLS, or production-sensitive flag action.

Rollback is client-only and requires no server, database, or cookie rollback.
