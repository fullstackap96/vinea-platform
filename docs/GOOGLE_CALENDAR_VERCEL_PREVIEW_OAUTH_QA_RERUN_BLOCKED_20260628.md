# Google Calendar Vercel Preview OAuth QA Rerun Blocked

Date: 2026-06-28

## Status

Blocked again at Google account authentication. The approved non-production preview remained healthy, staff/session/parish selection were usable, and OAuth start continued to use the registered fresh preview callback URI. Google rejected the stored safe Google Calendar QA password with a wrong-password message.

## Environment

| Field | Value |
| --- | --- |
| Preview URL | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app` |
| Health endpoint | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/health` |
| Callback URI | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/google/oauth/callback` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Google OAuth client | Safe non-production `Vinea OAuth Playground` client in project `vinea-platform` |

## Passed Gates

- `/api/health` returned HTTP `200` with:
  - `ok: true`
  - `checks.env: true`
  - `checks.supabase: true`
  - `checks.parishes: true`
  - `checks.schema: true`
  - `checks.resend: true`
  - `checks.googleOAuth: true`
- Existing safe QA staff session loaded the preview settings page.
- Active parish A and parish B fixture ids were present in the parish selector.
- Active parish A was selected.
- Parish A settings showed Google Calendar as disconnected with `Connect Google Calendar`.
- OAuth start redirected to Google with the registered preview callback URI.
- Google accepted the safe QA email and advanced to password verification.

## Blocker

Google rejected the stored safe QA Google Calendar password again with a wrong-password message.

Because of this:

- Google consent was not completed.
- Vinea did not receive a successful OAuth callback.
- `/dashboard/settings?gcal=connected` was not reached.
- Parish A connected-account status was not verified.
- Parish B non-inheritance was not verified.
- No Google Calendar event create/update/delete action was attempted.

## Safety Boundaries Confirmed

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- No production runtime behavior was changed.
- No OAuth tokens, refresh tokens, passwords, or bypass secrets were recorded in this evidence file.
- No Google Calendar event data was created, updated, or deleted.

## Required Next Step

Update `QA_GOOGLE_CALENDAR_PASSWORD` with the currently accepted password for the safe non-production Google Calendar account, or complete Google authentication manually in Chrome and leave the flow at the consent/approval step. Then rerun only the reconnect portion and stop before calendar event mutation.
