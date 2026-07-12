# Staff Authentication Session Exit Boundary - 2026-07-10

Decision: `STAFF_AUTH_SESSION_EXIT_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and verified locally without production access.

## Scope

The dashboard Logout action now ends only the current Supabase session with `signOut({ scope: 'local' })`. Vinea redirects to `/login` only after Supabase confirms the local sign-out succeeded. While the request is running, both desktop and mobile Logout controls are disabled and show `Signing out...`.

If sign-out returns an error or throws, the authorized dashboard remains visible, the user can retry, and Vinea shows a curated inline alert. Provider messages, tokens, session objects, stack traces, and raw errors are not rendered.

The staff login `next` destination now uses `safeDashboardHrefOrFallback(...)`. Only safe `/dashboard` paths may survive; external origins, protocol-relative URLs, API paths, traversal, backslashes, control characters, malformed encoding, and secret-shaped query/hash payloads fall back to `/dashboard`.

## Why Local Scope

Supabase's browser default is global sign-out, which revokes refresh tokens on every signed-in device. Vinea's ordinary Logout control now follows the expected current-session behavior. This does not change administrator-managed account revocation, password resets, or future incident-response session controls.

## Verification

- Focused session, dashboard-shell, login, safe-link, and release-evidence suite: 8 files / 28 tests passed.
- Full Vitest regression suite: 702 files / 2,796 tests passed.
- All-file TypeScript checks pass.
- ESLint passes with zero errors and zero warnings.
- Next.js `16.2.10` production build passes with all 56 static pages generated.
- Release handoff reconciles all 105 artifacts while all 15 production-sensitive gates remain locked.
- Repository secret scan checks 1,916 files with zero findings.
- No real sign-in or sign-out provider call was made during automated verification.

## Preserved Boundaries

- No production access.
- No authentication provider configuration change.
- No migration or operational RLS change.
- No record mutation, communication, AI, export, storage, signed URL, Google Calendar call, certificate generation, or automation.
- No production-sensitive flag or public trust claim.
