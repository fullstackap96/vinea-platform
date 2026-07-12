# Request Detail Active-Parish Cookie Scope Fix - 2026-06-27

Status: `FIXED - READY FOR BROWSER RECHECK`

This follow-up addresses the selected-parish Google Calendar browser-QA blocker where the prepared same-parish request detail rendered `Request not found` after Parish A was selected.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google Calendar data mutated | `NO` |
| Real parish Google Calendar data touched | `NO` |

## Root Cause

The active parish selector stores the selected parish id in the `vinea_active_parish_id` cookie. During browser QA, the app was served with `next start` over an approved temporary HTTP non-production URL.

The cookie helper previously set `secure: true` whenever `NODE_ENV` was `production`. In a production build served over HTTP for local/shared-QA browser testing, browsers do not send `Secure` cookies back to the app. That meant the request-detail access API did not receive the selected parish cookie, so it fell back to the primary parish and denied the valid same-parish fixture.

## What Changed

- `lib/server/activeParishSelection.ts` now decides the active-parish cookie `secure` flag from the configured app origin.
- HTTPS production origins still use `secure: true`.
- HTTP non-production QA origins use `secure: false` so the active-parish cookie can round-trip during approved local browser QA.
- If no app origin is configured in production, the helper still defaults to `secure: true`.
- Focused tests now prove the HTTPS production, HTTP non-production QA, and no-origin production cases.

## Request Detail Scope Impact

The request detail access route already reads `vinea_active_parish_id`, validates it against the authenticated staff membership context, and refuses unauthorized or stale selected parish ids.

This fix allows that existing scoped authorization to receive the selected parish cookie in the approved HTTP non-production browser-QA setup. It does not broaden request visibility and does not change operational RLS.

## What Changed In Plain English

The parish selector was saving the selected parish in a browser cookie, but the browser was refusing to send that cookie back during local testing because the app was using an HTTP test address. Now Vinea keeps the cookie extra-secure on real HTTPS production sites, while still allowing the cookie to work during approved non-production HTTP testing.

That should let the request detail page recognize the selected parish and open the safe same-parish request during the next Google Calendar QA run.

## Testing

- `npm.cmd test -- lib/server/activeParishSelectionActions.test.ts lib/server/requestDetailAccess.test.ts lib/server/requestDetailAccessRouteWiring.test.ts`

## Remaining Follow-Up

- Rerun the selected-parish Google Calendar browser QA.
- Confirm the same-parish request detail now loads after selecting Parish A.
- Continue to avoid Google Calendar create/update/delete until the request detail page loads under the selected parish.
- OAuth reconnect still requires an approved Google-authorized HTTPS non-production callback URL.
