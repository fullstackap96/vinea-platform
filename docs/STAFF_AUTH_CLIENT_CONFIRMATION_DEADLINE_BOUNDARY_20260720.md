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

## Rollback

Remove the two `withClientOperationDeadline(...)` wrappers and their constants. Existing provider calls, single-flight guards, safe messages, and post-confirmation navigation remain otherwise unchanged.
