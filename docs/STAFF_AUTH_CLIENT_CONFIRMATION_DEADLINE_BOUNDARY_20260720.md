# Staff Auth Client Confirmation Deadline Boundary - 2026-07-20

Status: `STAFF_AUTH_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## What Changed

- Password sign-in now stops waiting after 30 seconds for Supabase Auth confirmation.
- Current-browser sign-out now stops waiting after 15 seconds for Supabase Auth confirmation.
- Both paths keep their existing synchronous single-flight locks while waiting.
- An uncertain timeout releases the local busy state and gives staff refresh-before-retry guidance.
- Confirmed sign-in still uses the existing hardened dashboard destination; confirmed sign-out still redirects to `/login` and refreshes the App Router state.

## Safety Boundary

The browser deadline does not cancel, replay, or reinterpret the provider operation. A late provider result may still have changed the local session, so timeout guidance asks staff to refresh before trying again. Raw provider details remain behind existing curated client messages.

This slice does not change staff authorization, Supabase session policy, provider configuration, password policy, MFA, active-parish membership, operational RLS, migrations, production flags, or any production-sensitive approval. It does not access production or sign in/out a real account.

## Verified Identity

- Immutable implementation commit: `d73c08f9ed9ed730696271824bd60aebf9e2c8f5`
- Tracked-head aggregate SHA-256: `054AAF1150A12148E3BC886A87E574B9E88432CCAD585764A8FEACDC995FB19B`
- Committed release-source files: `1476`
- Production approval granted: `NO`

Focused auth deadline and safe-message coverage passed `5` files / `23` tests. The first complete release run failed closed because the evidence record had the correct working-tree count only in prose instead of the canonical `Source file count` field. After that label-only evidence correction, the complete local `15`-check release contract passed in `387.4` seconds with zero secret findings across `2,848` text files, zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `838` test files / `3,589` tests, and the credential-free Next.js 16 `56`-page build.

## Rollback

Remove the two `withClientOperationDeadline(...)` wrappers and their constants. Existing provider calls, single-flight guards, safe messages, and post-confirmation navigation remain otherwise unchanged.
