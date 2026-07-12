# Google Calendar Active-Parish Browser QA Evidence - 2026-06-27 Partial Run

Status: `PARTIAL - HEALTH, LOGIN, SETTINGS VERIFIED; RECONNECT AND EVENT LIFECYCLE BLOCKED`

This run followed the prepared selected-parish Google Calendar browser QA plan using shared-QA fixtures and a temporary local non-production LAN URL. It did not access production, apply migrations, change operational RLS, or mutate real parish Google Calendar data.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google account/calendar used | `NO` |
| Shared QA accessed | `YES - non-production app and read-only fixture validation` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth credentials submitted | `NO` |
| Google OAuth reconnect completed | `NO` |
| Google event create/update/delete attempted | `NO` |
| Real parish Google Calendar data touched | `NO` |
| Secrets printed in evidence | `NO` |

## Environment

| Field | Result |
| --- | --- |
| App target | `Temporary local non-production LAN URL` |
| Supabase project | `gnfomgsuottcuueasfvi` |
| Browser target | `In-app browser against temporary LAN URL` |
| `/api/health` | `PASS - ok true, checks.schema true` |
| QA env variables | `PASS - present by name only in ignored local env file` |

## Fix Applied During QA

The first browser attempt uncovered a Next.js production-mode runtime error after changing the active parish:

```text
A "use server" file can only export async functions, found object.
```

Fix:

- Moved active-parish selection helper exports out of `app/dashboard/parish-context/actions.ts`.
- Added `lib/server/activeParishSelection.ts`.
- Updated `lib/server/activeParishSelectionActions.test.ts`.

This keeps the `'use server'` action file action-only, which matches the local Next.js 16 documentation.

## Browser QA Results

| Gate | Expected Result | Actual Result | Pass/Fail |
| --- | --- | --- | --- |
| Browser can open non-production app | App loads outside production | Temporary LAN URL loaded successfully | `PASS` |
| `/api/health` in browser | `checks.schema: true` | Health returned `ok: true` and `checks.schema: true` | `PASS` |
| Staff sign-in | Safe QA staff can sign in | Dashboard loaded for safe QA staff | `PASS` |
| Active parish selection | Parish A can be selected | UI selection completed and showed success in-session | `PARTIAL` |
| Settings Google status | Selected parish settings show Google Calendar status | Settings loaded and showed the existing safe QA Google connection | `PASS` |
| OAuth reconnect start | Redirects to Google with safe QA callback | Google rejected private IP callback: `device_id and device_name are required for private IP` | `BLOCKED` |
| Google credentials submitted | Only if callback is safe | Not submitted because callback was blocked | `NOT RUN` |
| Same-parish request detail | Parish A request detail loads | Server-rendered request detail still returned `Request not found` | `BLOCKED` |
| Event create/update/delete | Mutate only safe QA calendar | Not attempted because request detail did not load under server guard | `NOT RUN` |
| Cross-parish denial | Wrong parish request denied before Google mutation | Not run because same-parish server guard blocked first | `NOT RUN` |
| Mismatched calendar safety | Mismatch denied before Google mutation | Not run because same-parish server guard blocked first | `NOT RUN` |

## Read-Only Fixture Validation

Shared-QA fixture validation confirmed:

- Same-parish request exists.
- Same-parish request belongs to Parish A.
- Cross-parish request exists.
- Cross-parish request belongs to Parish B.
- Mismatched-calendar request exists.
- Mismatched-calendar request belongs to Parish A and has an existing mismatched event marker.
- QA staff has active memberships for both Parish A and Parish B.

No raw parish ids, request ids, passwords, OAuth tokens, refresh tokens, or service-role keys are recorded in this evidence file.

## Blockers

1. Google OAuth reconnect cannot be completed against a private LAN callback URL.
   - Google returned `Error 400: invalid_request`.
   - No Google credentials were submitted.
   - No integration row was changed by this QA attempt.

2. Same-parish request detail still returned `Request not found` after the active parish UI showed Parish A as selected.
   - Read-only database validation confirmed the fixture itself is valid.
   - Event create/update/delete was intentionally not attempted because the request detail guard did not load the same-parish request.

## What Changed In Plain English

Vinea can now load the shared-QA app in a browser, sign in, switch the parish selector on the page, and show the Google Calendar settings section. During that test, we found and fixed a real Next.js production-mode bug in the parish switcher code.

The full Google Calendar test still cannot be called complete. Google will not allow OAuth to return to a private computer-network URL, and the request detail page still did not open the safe same-parish request after the parish switch. I stopped before creating, updating, or deleting any Google Calendar events.

## Final Outcome

| Field | Result |
| --- | --- |
| Health green | `PASS` |
| Staff sign-in | `PASS` |
| Settings selected-parish Google status | `PASS` |
| Selected-parish OAuth reconnect | `BLOCKED BY PRIVATE IP CALLBACK` |
| Same-parish request detail | `BLOCKED BY SERVER GUARD / ACTIVE PARISH PROPAGATION` |
| Google event lifecycle | `NOT RUN` |
| Cross-parish denial | `NOT RUN` |
| Mismatched calendar safety | `NOT RUN` |
| Final decision | `PARTIAL - FOLLOW-UP REQUIRED` |

## Recommended Follow-Up

- Use a Google-authorized non-production callback URL, such as an approved staging domain or approved tunnel URL registered in the Google OAuth client.
- Re-test active-parish persistence into server-rendered request detail before attempting Google Calendar event mutation.
- Only after the same-parish request detail loads should the create/update/delete lifecycle run against the safe QA calendar.
