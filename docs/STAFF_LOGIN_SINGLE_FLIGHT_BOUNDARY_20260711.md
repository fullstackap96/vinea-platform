# Staff Login Single-Flight Boundary

Decision: `STAFF_LOGIN_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without using credentials or calling the authentication provider.

## Protection

The staff sign-in form now acquires a synchronous browser in-flight lock before calling `signInWithPassword`. A rapid second submit is ignored even before React renders the visible disabled and `Signing in...` states.

Returned and thrown authentication failures release the lock and visible busy state so staff can correct their credentials or retry. A successful attempt keeps the existing busy state through the hardened dashboard redirect, preventing another authentication attempt while navigation completes.

## Preserved Boundaries

The Supabase Auth provider call, email/password payload, current-browser session behavior, optional existing-session probe, curated safe errors, dashboard destination allowlist, authentication policy, authorization policy, and separately approval-gated `proxy.ts` boundary are unchanged.

No production or shared-QA access, credential use, sign-in attempt, provider call, session mutation, migration, operational RLS change, production-sensitive flag, or public trust claim occurred.

## Verification

`lib/server/staffLoginSafeErrorAndLabelsSource.test.ts` now requires synchronous lock acquisition before `signInWithPassword`, failure release, accessible busy semantics, curated errors, and hardened destinations.
