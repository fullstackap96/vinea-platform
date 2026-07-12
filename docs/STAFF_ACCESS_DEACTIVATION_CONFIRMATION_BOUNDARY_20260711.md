# Staff Access Deactivation Confirmation Boundary - 2026-07-11

Decision: `STAFF_ACCESS_DEACTIVATION_CONFIRMATION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Administrative Safeguard

Parish Settings now requires the shared accessible confirmation dialog before an admin deactivates another staff account. The dialog identifies the account, explains that parish access will stop, and states that request history and audit records remain available.

## Preserved Behavior

- Cancel performs no action.
- Confirm dispatches the existing authenticated, active-parish, admin-only Staff Access API update.
- Reactivation remains immediate and reversible.
- The API continues to block self-deactivation and removal of the final active admin.
- Roles, audit metadata, membership scope, and staff records are unchanged by this client safeguard.

## Safety Boundary

- No staff account, membership, request, or audit event was mutated during verification.
- No production/shared-QA access, credential use, migration, operational RLS change, communication, provider or Calendar call, AI call, export, storage access, signed URL, certificate action, sensitive flag change, or public trust claim occurred.
- The separately approval-gated `proxy.ts` authorization change remains untouched.

## Rollback

This is a client-only confirmation boundary. Rollback requires no data or infrastructure action.
