# Google OAuth Safe Error Logging - 2026-07-06

Status: Implemented as a scoped Google Calendar OAuth production-readiness hardening slice.

## Scope

The Google OAuth start and callback routes now log unexpected configuration, state-signing, provider error, state validation, parish authorization, token response, userinfo fetch, integration upsert, and callback exception failures through the shared safe error logging helper.

## Staff-Facing And Redirect Boundary

OAuth start configuration failures return generic setup text:

- `Google Calendar connection is not configured.`
- `Google Calendar connection could not start.`

OAuth callback failures still use the existing safe redirect behavior:

- `/dashboard/settings?gcal=error`

Successful callbacks still redirect to:

- `/dashboard/settings?gcal=connected`

No raw OAuth provider error params, tokens, refresh tokens, authorization headers, Google account provider payloads, client secrets, OAuth state secrets, database errors, or integration upsert payloads are returned to staff clients or logged directly by the route.

## Preserved Behavior

- OAuth start still requires authenticated staff before redirecting to Google.
- OAuth start still signs the selected active parish id into the OAuth state cookie.
- OAuth callback still verifies the signed state cookie and timing-safe state comparison.
- OAuth callback still revalidates the signed parish id through membership-backed active parish authorization.
- OAuth callback still stores the Google integration for the selected parish only and now confirms the returned parish id before using the connected redirect.
- OAuth callback still clears the OAuth state cookie on success and failure.
- Google Calendar event create/update/delete behavior is unchanged.

## Non-Goals

- No production access.
- No production flags.
- No migrations.
- No operational RLS changes.
- No Google Calendar event create/update/delete changes.
- No Google OAuth credential submission or browser QA.
- No AI calls.
- No export runtime changes.
- No storage or signed URL changes.
- No certificate generation.
- No automation expansion.
- No public trust claims.

## Verification

- Focused source tests validate that OAuth start and callback import `logServerError`, use route-specific redacted logging action labels, return generic OAuth start messages, preserve callback redirect behavior, and do not use direct `console.error` or `console.warn` in the route source.
- Docs validation tests confirm this evidence file documents the generic messages, callback redirect boundary, no-go boundaries, and raw OAuth/token exclusion.
