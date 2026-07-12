# Dashboard Logout Single-Flight Boundary

Status: Implemented and verified locally on 2026-07-11.

## Boundary

Dashboard logout now acquires a synchronous client guard before calling Supabase Auth. Rapid repeated activation cannot dispatch a second sign-out request while the first is in flight.

Both responsive controls:

- disable during the operation;
- expose `aria-busy`;
- display `Signing out...`;
- retain curated safe retry guidance when sign-out fails.

Logout remains limited to the current browser session through `signOut({ scope: 'local' })`. The existing successful redirect to `/login`, refresh behavior, and visible session on failure remain unchanged.

## Safety Boundary

No production access, real sign-out, credential use, authentication-policy change, staff/parish/request mutation, migration, operational RLS change, provider call, communication, export, AI call, sensitive flag change, or public trust claim occurred during implementation or verification.
