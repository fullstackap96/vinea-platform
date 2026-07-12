# Google Calendar Vercel Preview Deployed, Health Blocked

Date: 2026-06-28

## Status

Blocked before Google OAuth redirect registration. A fresh non-production Vercel preview deployment was created, but the required preview `/api/health` confirmation could not be completed because `/api/health` is not currently reachable as JSON from the available QA surfaces.

## Fresh Preview

```text
https://vinea-platform-bc4zrrpb4-vinea.vercel.app
```

Candidate callback URI that would be registered only after health is confirmed:

```text
https://vinea-platform-bc4zrrpb4-vinea.vercel.app/api/google/oauth/callback
```

## Evidence

- Vercel preview deployment completed successfully using a project-scoped Vercel token.
- The preview root loaded in Chrome with title `Vinea Platform`.
- Shell request to `/api/health` returned HTTP `200` with `text/html` and title `Login – Vercel`, which indicates Vercel Authentication is in front of the endpoint for unauthenticated requests.
- Chrome top-level navigation to `/api/health` failed with `net::ERR_BLOCKED_BY_CLIENT`.
- The browser runtime could not use same-origin `fetch` or `XMLHttpRequest` from the preview root because those APIs are not exposed in the constrained read-only page scope.

## Actions Not Taken

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Vercel Deployment Protection was not changed.
- No Vercel protection bypass secret was created or used.
- The Google OAuth redirect URI was not registered.
- Google OAuth reconnect was not started.
- Google credentials were not submitted.
- Google Calendar event create/update/delete was not attempted.

## Recommended Next Gate

Choose one explicitly approved health-verification path:

1. Create an approved non-production Vercel Deployment Protection bypass for QA health and OAuth callback testing.
2. Use an approved staging/custom domain that is not browser-blocked and is configured for non-production.
3. Temporarily authenticate the browser path in a way that allows `/api/health` to return JSON and preserve evidence without changing production.

After `/api/health` returns JSON with `checks.schema: true`, register the preview callback URI in the safe non-production Google OAuth client and rerun selected-parish Google Calendar OAuth reconnect QA, stopping before calendar event mutation.
