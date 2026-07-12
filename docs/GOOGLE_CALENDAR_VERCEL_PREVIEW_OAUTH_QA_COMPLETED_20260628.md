# Google Calendar Vercel Preview OAuth QA Completed

Date: 2026-06-28

## Status

Completed for selected-parish Google Calendar reconnect. The non-production Vercel preview was healthy, Google OAuth returned to Vinea successfully, parish A showed the connected Google account, and parish B did not inherit parish A's connection. The run stopped before Google Calendar event create/update/delete.

## Environment

| Field | Value |
| --- | --- |
| Preview URL | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app` |
| Health endpoint | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/health` |
| OAuth callback URI | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/google/oauth/callback` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Google OAuth client | Safe non-production `Vinea OAuth Playground` client in project `vinea-platform` |

## Passed Gates

- `/api/health` returned HTTP `200` with `ok: true` and `checks.schema: true`.
- The browser returned to Vinea at `/dashboard/settings?gcal=connected`.
- Parish A was active after reconnect.
- Parish A settings showed Google Calendar connected.
- Parish A settings showed the safe QA Google account as connected.
- Parish B was selected from the active parish selector.
- Parish B settings, after reloading without the success query parameter, showed Google Calendar disconnected.
- Parish B did not show the connected-account line from parish A.
- Parish B showed `Connect Google Calendar`, not `Reconnect Google Calendar`.

## Actions Not Taken

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- No Google Calendar event was created, updated, or deleted.
- No OAuth tokens, refresh tokens, passwords, or Vercel bypass secrets were recorded.

## Remaining Follow-Up

- The QA-only Vercel Protection Bypass for Automation remains active. Revoke it after any separately approved Google Calendar event lifecycle QA is complete.
- Google Calendar event create/update/delete selected-parish behavior remains untested in browser QA because this run was explicitly scoped to reconnect only.
