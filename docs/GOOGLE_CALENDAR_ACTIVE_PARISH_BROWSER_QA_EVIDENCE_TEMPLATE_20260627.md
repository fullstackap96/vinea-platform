# Google Calendar Active-Parish Browser QA Evidence Template - 2026-06-27

Status: Evidence template only. This document is for a future safe non-production browser QA run. Do not access production, do not apply migrations, do not change operational RLS, and do not use a real parish calendar unless it has been explicitly approved for QA.

Related materials:

- `docs/GOOGLE_CALENDAR_ACTIVE_PARISH_QA_CHECKLIST_20260627.md`
- `docs/MULTI_PARISH_REMAINING_PATHS_INVENTORY.md`
- `docs/VINEA_BUILD_STATUS.md`
- `scripts/set-google-calendar-browser-qa-env.ps1`
- `scripts/check-google-calendar-browser-qa-env.ps1`
- `app/api/google/oauth/start/route.ts`
- `app/api/google/oauth/callback/route.ts`
- `app/api/google/calendar-event/create/route.ts`
- `app/api/google/calendar-event/update/route.ts`
- `app/api/google/calendar-event/delete/route.ts`

## Required Safety Boundaries

- Production access: `NO`
- Production Google account/calendar: `NO`
- Production Supabase database: `NO`
- Migrations applied: `NO`
- Operational RLS changed: `NO`
- Runtime public intake routing changed: `NO`
- Google event create/update/delete code changed during this QA run: `NO`
- Safe non-production Google Calendar credentials approved: `PENDING`
- Safe non-production Vinea staff credentials approved: `PENDING`
- Cleanup owner assigned: `PENDING`

## Secure Local Setup Helper

If the safe non-production browser-QA inputs are not visible to the active Codex process, use the repo-owned helper scripts. The setter prompts for secrets without echoing them, writes only to Windows user/process scope, and can optionally write a repo-local ignored `.env.google-calendar-browser-qa.local` file for Codex visibility.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\set-google-calendar-browser-qa-env.ps1 -WriteLocalEnvFile
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-google-calendar-browser-qa-env.ps1
```

Required approval phrases:

- `APPROVED_NON_PRODUCTION_GOOGLE_CALENDAR_QA`
- `APPROVED_GOOGLE_CALENDAR_RECONNECT_QA`

The check script reports presence by variable name only. It must not print passwords, OAuth tokens, refresh tokens, session cookies, event ids, or raw secrets.

## Required Local Inputs

Record only whether each value is present. Do not paste passwords, OAuth tokens, refresh tokens, session cookies, event ids, or raw secrets into this file unless the evidence store is explicitly approved for that data.

| Input | Present By Name Only | Notes |
| --- | --- | --- |
| `NON_PRODUCTION_APP_URL` | `PENDING` | Must not be production. |
| `QA_STAFF_EMAIL` | `PENDING` | Safe non-production staff account. |
| `QA_STAFF_PASSWORD` | `PENDING` | Do not record the value. |
| `QA_GOOGLE_CALENDAR_EMAIL` | `PENDING` | Safe non-production Google account. |
| `QA_GOOGLE_CALENDAR_PASSWORD` | `PENDING` | Do not record the value. Prefer interactive entry. |
| `QA_ACTIVE_PARISH_A_ID` | `PENDING` | Selected parish expected to receive reconnect. |
| `QA_ACTIVE_PARISH_B_ID` | `PENDING` | Denied/cross-parish fixture parish. |
| `QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `PENDING` | Future-dated request owned by parish A. |
| `QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `PENDING` | Request owned by parish B. |
| `QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `PENDING` | Request with stored calendar id mismatch, if available. |
| `QA_SAFE_GOOGLE_CALENDAR_ID` | `PENDING` | Safe calendar id or `primary` for the test Google account. |
| `QA_GOOGLE_RECONNECT_ALLOWED` | `PENDING` | Explicit approval for OAuth reconnect in non-production. |

## Environment Identity

| Field | Value |
| --- | --- |
| Run date/time | `PENDING` |
| Tester | `PENDING` |
| Non-production app URL | `PENDING` |
| Supabase project/ref, if known | `PENDING` |
| Browser used | `PENDING` |
| Monitoring owner/channel | `PENDING` |
| Cleanup owner | `PENDING` |
| Evidence storage location | `PENDING` |

## Preflight Checks

| Check | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Confirm app URL is not production | Non-production hostname | `PENDING` | `PENDING` | `PENDING` |
| `/api/health` | HTTP 200 and `checks.schema: true` | `PENDING` | `PENDING` | `PENDING` |
| Staff sign-in | Safe QA staff signs in successfully | `PENDING` | `PENDING` | `PENDING` |
| Parish switcher shows parish A and parish B | Both available to QA staff | `PENDING` | `PENDING` | `PENDING` |
| Settings opens for parish A | Parish A settings visible | `PENDING` | `PENDING` | `PENDING` |
| Settings opens for parish B | Parish B settings visible or known denied case | `PENDING` | `PENDING` | `PENDING` |
| Same-parish request fixture | Request belongs to parish A | `PENDING` | `PENDING` | `PENDING` |
| Cross-parish request fixture | Request belongs to parish B | `PENDING` | `PENDING` | `PENDING` |
| Safe Google Calendar is empty for test summary | No stale matching event exists | `PENDING` | `PENDING` | `PENDING` |

## Gate 1 - Selected-Parish Google Reconnect

Goal: prove OAuth reconnect saves `parish_google_integrations` to the selected parish, not the oldest parish row.

| Step | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Select active parish A | Parish switcher shows parish A active | `PENDING` | `PENDING` | `PENDING` |
| Open Settings | Google Calendar status shown for parish A | `PENDING` | `PENDING` | `PENDING` |
| Start Google reconnect | Redirects to Google from `/api/google/oauth/start` | `PENDING` | `PENDING` | `PENDING` |
| Complete Google OAuth with safe account | Returns to `/dashboard/settings?gcal=connected` | `PENDING` | `PENDING` | `PENDING` |
| Settings status after reconnect | Connected account shown for parish A | `PENDING` | `PENDING` | `PENDING` |
| Switch to parish B and refresh Settings | Parish B does not inherit parish A connection unless intentionally connected | `PENDING` | `PENDING` | `PENDING` |
| Audit/log observation, if available | No secrets exposed; only safe status visible | `PENDING` | `PENDING` | `PENDING` |

## Gate 2 - Same-Parish Event Lifecycle

Goal: prove create/update/delete target the selected parish calendar after reconnect.

| Step | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Select active parish A | Parish A active | `PENDING` | `PENDING` | `PENDING` |
| Open same-parish request fixture | Request detail loads | `PENDING` | `PENDING` | `PENDING` |
| Create Google Calendar event | Success; request stores event id, calendar id, and link | `PENDING` | `PENDING` | `PENDING` |
| Direct Google Calendar check | Event appears only in safe parish A calendar | `PENDING` | `PENDING` | `PENDING` |
| Update request/calendar event | Success; event changes in safe parish A calendar | `PENDING` | `PENDING` | `PENDING` |
| Delete Google Calendar event | Success; request calendar fields clear | `PENDING` | `PENDING` | `PENDING` |
| Direct Google Calendar cleanup check | No active matching QA event remains | `PENDING` | `PENDING` | `PENDING` |

## Gate 3 - Cross-Parish And Stale Selection Denials

Goal: prove wrong-parish requests and stale/forged selected parish context fail before Google mutation.

| Step | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Select active parish A and target parish B request | Request action denied generically | `PENDING` | `PENDING` | `PENDING` |
| Attempt create on cross-parish request | No Google event created | `PENDING` | `PENDING` | `PENDING` |
| Attempt update on cross-parish request | No Google event patched | `PENDING` | `PENDING` | `PENDING` |
| Attempt delete on cross-parish request | No Google event deleted or cleared | `PENDING` | `PENDING` | `PENDING` |
| Use stale/forged active parish cookie, if safely scriptable | Denied before Google mutation | `PENDING` | `PENDING` | `PENDING` |
| Check response/error content | No OAuth tokens, refresh tokens, membership internals, or private parish data | `PENDING` | `PENDING` | `PENDING` |

## Gate 4 - Mismatched Calendar Safety

Goal: prove update/delete do not mutate a request linked to a different parish calendar.

| Step | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Open mismatched calendar request fixture | Fixture available or explicitly not available | `PENDING` | `PENDING` | `PENDING` |
| Attempt update | Conflict/mismatch response; no patch | `PENDING` | `PENDING` | `PENDING` |
| Attempt delete | Conflict/mismatch response; no deletion or field clearing | `PENDING` | `PENDING` | `PENDING` |
| Confirm request fields unchanged | Stored calendar fields remain unchanged | `PENDING` | `PENDING` | `PENDING` |

## Gate 5 - Rollback / Cleanup

Goal: leave the non-production environment clean and document what remains.

| Step | Expected Result | Actual Result | Pass/Fail | Evidence |
| --- | --- | --- | --- | --- |
| Delete all QA Google Calendar events | No stale matching QA events remain | `PENDING` | `PENDING` | `PENDING` |
| Clear or archive disposable request links, if approved | Non-production records are tidy | `PENDING` | `PENDING` | `PENDING` |
| Revoke safe Google test OAuth, if required by owner | Connection status and owner decision recorded | `PENDING` | `PENDING` | `PENDING` |
| Verify Settings after cleanup | Expected connected/revoked state shown for selected parish | `PENDING` | `PENDING` | `PENDING` |
| Record unresolved risks | All remaining issues documented | `PENDING` | `PENDING` | `PENDING` |

## Final Outcome

| Field | Value |
| --- | --- |
| Selected-parish OAuth reconnect | `PASS / FAIL / NOT RUN` |
| Settings status selected-parish scoped | `PASS / FAIL / NOT RUN` |
| Create/update/delete selected parish event lifecycle | `PASS / FAIL / NOT RUN` |
| Cross-parish/stale selection denial | `PASS / FAIL / NOT RUN` |
| Mismatched calendar safety | `PASS / FAIL / NOT RUN / NOT AVAILABLE` |
| Cleanup completed | `PASS / FAIL / NOT RUN` |
| Production touched | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Final decision | `PASS / FAIL / BLOCKED` |
| Sign-off | `PENDING` |

## Current Blocked Status

As of this template creation, the live browser QA run is blocked unless the active Codex/browser session has safe non-production app credentials, safe staff credentials, safe Google Calendar credentials, request fixtures, and explicit reconnect approval. On 2026-06-27, the active Codex session rechecked the required variable names without printing secrets and did not find the required inputs in process, user, or machine scope. The template can be completed later without changing production, applying migrations, or changing operational RLS.
