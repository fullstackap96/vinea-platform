# Staff Access Role Downgrade Confirmation Boundary - 2026-07-11

Decision: `STAFF_ACCESS_ROLE_DOWNGRADE_CONFIRMATION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Administrative Safeguard

Changing a parish account from Admin to Staff now requires the shared accessible confirmation dialog. The controlled selector remains on Admin until confirmation, so cancellation neither changes the visible role nor sends an API request.

## Preserved Behavior

- The dialog identifies the account and explains that parish access remains while staff-management and administrator-setting permissions are removed.
- Confirm dispatches the existing authenticated, active-parish, admin-only Staff Access API update.
- Promotion from Staff to Admin remains immediate.
- The API continues to require at least one active parish administrator.
- Authentication, roles, audit metadata, membership scope, and staff records are unchanged by this client safeguard.

## Safety Boundary

- No staff role, account, membership, request, or audit event was mutated during verification.
- No production/shared-QA access, credential use, migration, operational RLS change, communication, provider or Calendar call, AI call, export, storage access, signed URL, certificate action, sensitive flag change, or public trust claim occurred.
- The separately approval-gated `proxy.ts` authorization change remains untouched.

## Rollback

This is a client-only confirmation boundary. Rollback requires no data or infrastructure action.
