# Staff Login Safe Errors And Accessible Labels - 2026-07-07

Status: Implemented as a scoped production-readiness and staff-UX hardening slice.

## Summary

The staff login form now maps Supabase Auth/provider failures to a small set of curated staff-facing messages instead of rendering raw provider text. The form also has explicit Email and Password labels connected to the inputs.

## What Changed

- Added `lib/loginAuthMessages.ts` for safe staff login error messages.
- Updated `/login` to use the safe message helper for returned auth errors and thrown sign-in exceptions.
- Added explicit labels with stable `htmlFor`/`id` pairs for the email and password controls.
- Added focused tests for the helper and login page source boundary.

## Safety Boundary

This change does not alter staff authentication semantics, staff authorization, Supabase Auth configuration, sessions, redirects, dashboard access rules, active parish scope, operational RLS, migrations, production flags, exports, AI, storage, signed URLs, communications, certificates, Google Calendar behavior, public intake routing, or public trust-center claims.

## Manual QA

In a safe non-production browser session:

1. Open `/login`.
2. Confirm the email and password fields have visible labels.
3. Submit an invalid password for a safe test account and confirm the alert uses calm generic guidance.
4. Confirm a valid safe staff account still signs in and redirects to the intended dashboard path.
5. Confirm `/login?staff=unauthorized` still shows the existing staff-access guidance.

Do not use production credentials for this manual check.
