# Google Calendar Active-Parish Browser QA Evidence - 2026-06-27 Blocked

Status: `BLOCKED - FIXTURES NOT AVAILABLE`

This evidence record captures the attempted selected-parish Google Calendar reconnect browser QA run. The run was stopped before browser sign-in, Google OAuth, or Google Calendar mutation because the required safe parish and request fixtures were marked `NOT_AVAILABLE`.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google account/calendar used | `NO` |
| Production Supabase database accessed | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth reconnect started | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## Environment Variable Recheck

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-google-calendar-browser-qa-env.ps1
```

Result: all required variable names were present through the repo-local ignored QA env file. Values were not printed.

| Input | Present By Name Only | Source Observed |
| --- | --- | --- |
| `NON_PRODUCTION_APP_URL` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_STAFF_EMAIL` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_STAFF_PASSWORD` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_CALENDAR_EMAIL` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_CALENDAR_PASSWORD` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_ACTIVE_PARISH_A_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_ACTIVE_PARISH_B_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_SAFE_GOOGLE_CALENDAR_ID` | `YES` | `.env.google-calendar-browser-qa.local` |
| `QA_GOOGLE_RECONNECT_ALLOWED` | `YES` | `.env.google-calendar-browser-qa.local` |

## Fixture Usability Check

The fixture check reported only whether each required fixture was usable. It did not print parish ids, request ids, passwords, Google credentials, OAuth tokens, refresh tokens, session cookies, or calendar event ids.

| Fixture | Usable | Reason |
| --- | --- | --- |
| `QA_ACTIVE_PARISH_A_ID` | `NO` | Marked `NOT_AVAILABLE` |
| `QA_ACTIVE_PARISH_B_ID` | `NO` | Marked `NOT_AVAILABLE` |
| `QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE` |
| `QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE` |
| `QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE` |

## QA Gates

| Gate | Result | Notes |
| --- | --- | --- |
| Confirm app URL is non-production | `NOT RUN` | Stopped before browser/app access because required fixtures were unavailable. |
| `/api/health` | `NOT RUN` | Stopped before browser/app access because required fixtures were unavailable. |
| Staff sign-in | `NOT RUN` | No safe active parish fixture exists for the staff account in this QA dataset. |
| Selected-parish OAuth reconnect | `NOT RUN` | Cannot prove selected parish save behavior without a valid selected parish id. |
| Same-parish event lifecycle | `NOT RUN` | Cannot create/update/delete safely without a same-parish request fixture. |
| Cross-parish/stale selection denial | `NOT RUN` | Cannot test denial without a cross-parish request fixture. |
| Mismatched calendar safety | `NOT RUN` | Fixture explicitly unavailable. |
| Cleanup | `NOT NEEDED` | No browser sign-in, OAuth reconnect, or Google event mutation occurred. |

## Final Outcome

| Field | Value |
| --- | --- |
| Selected-parish OAuth reconnect | `NOT RUN` |
| Settings status selected-parish scoped | `NOT RUN` |
| Create/update/delete selected parish event lifecycle | `NOT RUN` |
| Cross-parish/stale selection denial | `NOT RUN` |
| Mismatched calendar safety | `NOT AVAILABLE` |
| Cleanup completed | `NOT NEEDED` |
| Production touched | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Final decision | `BLOCKED` |
| Sign-off | `NOT READY` |

## Required Next Fixture Work

Before this browser QA can run, prepare a safe non-production dataset with:

- A QA staff account authorized for parish A.
- A selected active parish A id.
- A second parish B id or an explicitly approved substitute denial fixture.
- A same-parish request owned by parish A.
- A cross-parish denied request owned by parish B.
- An optional mismatched-calendar request fixture, or a documented decision to keep that gate `NOT AVAILABLE`.
- A safe Google Calendar account/calendar approved for non-production mutation.

What changed in plain English: the test setup is visible now, but the important parish and request test records do not exist yet. I stopped before touching Google because reconnecting a calendar without those records would not prove that Vinea is choosing the right parish.
