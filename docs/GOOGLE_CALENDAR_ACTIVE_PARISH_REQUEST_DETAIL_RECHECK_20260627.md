# Google Calendar Active-Parish Request Detail Recheck - 2026-06-27

Status: `PASSED - SAME-PARISH REQUEST DETAIL LOADS`

This run rechecked the selected-parish Google Calendar browser-QA blocker after the active-parish cookie scope fix. It intentionally stopped before Google OAuth credential submission and before any Google Calendar create/update/delete action.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
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

## Browser QA Results

| Gate | Expected Result | Actual Result | Pass/Fail |
| --- | --- | --- | --- |
| Browser can open non-production app | App loads outside production | Temporary LAN URL loaded successfully | `PASS` |
| `/api/health` in browser target | `checks.schema: true` | Health returned `ok: true` and `checks.schema: true` | `PASS` |
| Staff sign-in | Safe QA staff can sign in | Dashboard loaded with the active parish selector visible | `PASS` |
| Active parish selection | Parish A can be selected | The active parish selector value matched Parish A | `PASS` |
| Same-parish request detail | Parish A request detail loads | Request detail page loaded, did not show `Request not found`, and showed request detail/Google Calendar page signals | `PASS` |
| Google OAuth credentials submitted | Must not happen in this gate | Not submitted | `NOT RUN` |
| Google event create/update/delete | Must not happen until request detail guard passes and OAuth callback is approved | Not attempted | `NOT RUN` |

## Request Detail Guard Interpretation

The request detail page calls `/api/requests/[id]/detail-access` before loading the request row. During this recheck, the page loaded the request detail surface and did not render `Request not found`. That means the active parish cookie was available to the request-detail guard in the same browser session and the prepared same-parish fixture passed the application-layer selected-parish access check.

## What Changed In Plain English

The previous test failed because the browser was not sending Vinea's selected-parish cookie back to the app during local HTTP testing. After the cookie fix, the browser can send that parish selection during approved non-production QA, and the safe same-parish request now opens correctly.

## Final Outcome

| Field | Result |
| --- | --- |
| Health green | `PASS` |
| Staff sign-in | `PASS` |
| Active Parish A selected | `PASS` |
| Same-parish request detail | `PASS` |
| OAuth reconnect | `NOT RUN - still requires approved HTTPS callback` |
| Google event lifecycle | `NOT RUN - intentionally stopped before mutation` |
| Final decision | `REQUEST DETAIL BLOCKER RESOLVED; OAUTH CALLBACK STILL BLOCKED` |

## Remaining Follow-Up

- Use a Google-authorized non-production HTTPS callback URL, such as an approved staging domain or approved tunnel URL registered in the Google OAuth client.
- After callback approval, rerun the selected-parish Google Calendar reconnect QA.
- Only after OAuth reconnect is safe should create/update/delete run against the safe QA calendar.
