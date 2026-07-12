# Staff Login Session Probe Recovery - 2026-07-11

Decision: `STAFF_LOGIN_SESSION_PROBE_RECOVERY_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Problem Closed

The login page performs an optional existing-session check so already authenticated staff can continue directly to their requested dashboard destination. A thrown network or auth-client failure from that probe could previously become an unhandled promise rejection even though the ordinary sign-in form was still usable.

## Recovery And Accessibility

- The optional existing-session probe now handles thrown failures locally and leaves the sign-in form available.
- Returned or thrown password-sign-in failures still use the existing curated, privacy-safe staff guidance.
- The form exposes a stable accessible name and busy state.
- Email and password controls now have stable names in addition to their existing labels and autocomplete semantics.
- A synchronous in-flight guard prevents duplicate password submissions before React renders its pending state.
- Successful sign-in and hardened dashboard destination behavior are unchanged.

## Safety Boundary

- No provider configuration, authentication policy, authorization rule, session persistence, or redirect allowlist changed.
- No production/shared-QA access, login attempt, credential use, database/cookie mutation, migration, operational RLS change, external call, production-sensitive flag change, or public trust claim occurred.
- The separately approval-gated `proxy.ts` authorization change remains untouched.

## Rollback

This is client-only recovery and accessibility behavior. Rollback requires no data, provider, or infrastructure action.
