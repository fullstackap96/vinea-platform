# Google Calendar Active-Parish Browser QA Fixtures Ready - 2026-06-27

Status: `FIXTURES READY - BROWSER QA BLOCKED BY LOCAL APP HEALTH`

This evidence record captures the safe non-production fixture preparation for selected-parish Google Calendar reconnect QA. Synthetic shared-QA data was created or reused, the ignored local browser-QA env file was updated with fixture ids, and the browser QA run was stopped because the local app did not provide a stable healthy `/api/health` response.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google account/calendar used | `NO` |
| Real parish Google Calendar data touched | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth reconnect started | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |
| Shared QA data mutation | `YES - synthetic fixture records only` |

## Target

| Field | Value |
| --- | --- |
| Supabase project | `gnfomgsuottcuueasfvi` |
| App host under test | `localhost` |
| Fixture script | `scripts/create-google-calendar-shared-qa-fixtures.mjs` |
| Confirmation required | `VINEA_GOOGLE_CALENDAR_QA_FIXTURES_CONFIRM=CREATE_GOOGLE_CALENDAR_SHARED_QA_FIXTURES` |

## Fixture Creation Evidence

Sanitized script output showed:

- `ok: true`
- Shared QA project ref: `gnfomgsuottcuueasfvi`
- App host: `localhost`
- Parish A present.
- Parish B present.
- Staff memberships present.
- Same-parish request present.
- Cross-parish request present.
- Mismatched-calendar request present.
- Local ignored QA env file updated.
- Secrets printed: `false`

The script intentionally does not print staff email, passwords, service-role key, parish ids, request ids, Google credentials, OAuth tokens, refresh tokens, session cookies, or event ids.

## Fixture Usability Check

The follow-up check reported the fixture variables as present and usable:

| Fixture | Present | Usable | Marked `NOT_AVAILABLE` |
| --- | --- | --- | --- |
| `QA_ACTIVE_PARISH_A_ID` | `YES` | `YES` | `NO` |
| `QA_ACTIVE_PARISH_B_ID` | `YES` | `YES` | `NO` |
| `QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `YES` | `YES` | `NO` |
| `QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `YES` | `YES` | `NO` |
| `QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `YES` | `YES` | `NO` |

## Local App Health Attempt

The local app was started with `npm.cmd run dev` and `npm.cmd run start` attempts. The app reported ready in logs, but it did not maintain a stable listener/healthy response long enough for browser QA. Observed outcomes:

- One `next dev` launch reported ready, then repeated `/api/health` responses returned `503`.
- Later detached dev/start attempts reported ready in logs but did not leave a stable listener on port `3000`.
- A production `next start` attempt briefly listened on port `3000`, then `/api/health` returned `503`/no stable body and the listener disappeared.

Because `/api/health` did not return `checks.schema: true`, browser sign-in and Google reconnect were not attempted.

## Browser QA Gates

| Gate | Result | Notes |
| --- | --- | --- |
| Name-only environment check | `PASS` | Required variables visible through `.env.google-calendar-browser-qa.local`. |
| Fixture usability | `PASS` | Required parish and request fixture ids are no longer `NOT_AVAILABLE`. |
| `/api/health` | `FAIL/BLOCKED` | Local app did not provide stable `checks.schema: true`. |
| Staff sign-in | `NOT RUN` | Blocked by app health. |
| Selected-parish OAuth reconnect | `NOT RUN` | Blocked by app health. |
| Same-parish event lifecycle | `NOT RUN` | Blocked by app health; no Google mutation attempted. |
| Cross-parish/stale selection denial | `NOT RUN` | Blocked by app health. |
| Mismatched calendar safety | `NOT RUN` | Blocked by app health. |
| Cleanup | `NOT NEEDED FOR GOOGLE` | No Google OAuth or event mutation occurred. Synthetic shared-QA fixtures remain for the next QA attempt. |

## Final Outcome

| Field | Value |
| --- | --- |
| Fixtures ready | `YES` |
| Local QA env updated | `YES` |
| Selected-parish OAuth reconnect | `NOT RUN` |
| Settings status selected-parish scoped | `NOT RUN` |
| Create/update/delete selected parish event lifecycle | `NOT RUN` |
| Cross-parish/stale selection denial | `NOT RUN` |
| Mismatched calendar safety | `NOT RUN` |
| Production touched | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Final decision | `BLOCKED BY LOCAL APP HEALTH` |

## Next Required Step

Before rerunning browser QA, get the non-production app to a stable `/api/health` response with `checks.schema: true`. Then rerun `docs/GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_TEMPLATE_20260627.md` using the now-populated `.env.google-calendar-browser-qa.local` fixture ids.

What changed in plain English: Vinea now has the safe fake parish and request records needed for the Google Calendar test. The test itself still could not run because the local app did not stay healthy enough to sign in and click through the workflow. No real Google Calendar was touched.
