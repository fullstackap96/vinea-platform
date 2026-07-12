# Google Calendar Vercel Preview OAuth QA Partial Evidence

Date: 2026-06-28

## Status

Blocked at Google account authentication. The non-production Vercel preview was deployed with shared-QA runtime environment values, `/api/health` returned `checks.schema: true` through an approved QA-only Vercel Deployment Protection bypass, and the fresh preview callback URI was registered in the safe non-production Google OAuth client. Browser QA reached Google OAuth, but the stored safe Google QA password was rejected by Google as wrong.

## Environment

| Field | Value |
| --- | --- |
| Preview URL | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app` |
| Callback URI registered | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/google/oauth/callback` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Google OAuth client | Safe non-production `Vinea OAuth Playground` client in project `vinea-platform` |
| Vercel bypass | QA-only Protection Bypass for Automation created and used; secret not recorded in this file |

## Passed Gates

- Fresh non-production Vercel preview created.
- Preview `/api/health` returned HTTP `200` with:
  - `ok: true`
  - `checks.env: true`
  - `checks.supabase: true`
  - `checks.parishes: true`
  - `checks.schema: true`
  - `checks.resend: true`
  - `checks.googleOAuth: true`
- Google OAuth callback URI was added to the safe non-production Google OAuth client and verified present after save.
- Safe QA staff sign-in succeeded on the preview.
- Active parish selector included the prepared parish A and parish B fixture ids.
- Active parish A was selected by id.
- Same-parish request detail loaded without `Request not found`.
- Settings for parish A showed `Connect Google Calendar`.
- OAuth start redirected to Google with the fresh preview callback URI.

## Blocker

Google rejected the stored safe QA Google Calendar account password with a wrong-password message. Because of that:

- Google consent was not completed.
- Vinea did not receive the OAuth callback.
- No `parish_google_integrations` reconnect success was verified.
- No Google Calendar create/update/delete action was attempted.

## Actions Not Taken

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Production routing was not changed.
- Google Calendar event create/update/delete was not attempted.
- No OAuth tokens, refresh tokens, passwords, or bypass secrets were recorded in this evidence file.

## Follow-Up Required

Update the safe non-production Google Calendar QA password or complete Google account authentication manually in Chrome, then rerun only the Google OAuth reconnect portion:

1. Confirm preview `/api/health` still returns `checks.schema: true`.
2. Sign in with the safe QA staff account.
3. Select parish A.
4. Open Settings.
5. Start Google reconnect.
6. Complete Google authentication with the safe non-production account.
7. Verify return to `/dashboard/settings?gcal=connected`.
8. Verify parish A shows the connected Google account.
9. Switch to parish B and confirm parish B does not inherit parish A's connection.
10. Stop before any Google Calendar event create/update/delete unless separately approved.

## Cleanup Note

The QA-only Vercel Protection Bypass for Automation remains active so the browser QA can continue after the safe Google password is corrected. Revoke it after the OAuth reconnect QA run is complete.
