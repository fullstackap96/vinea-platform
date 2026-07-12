# Google Calendar HTTPS Callback QA Evidence - 2026-06-28 Blocked

Status: `BLOCKED - APPROVED HTTPS ORIGIN NOT AVAILABLE`

This evidence record captures the attempted selected-parish Google Calendar OAuth reconnect QA gate after the HTTPS callback packet was prepared. The run was stopped before app startup, Google OAuth, Google credential submission, or Google Calendar mutation because the currently saved QA app origin is still local HTTP, not an approved public HTTPS non-production origin.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google OAuth client used | `NO` |
| Production Google account/calendar used | `NO` |
| Production Supabase database accessed | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth redirect URI registered | `NO` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## Environment Variable Recheck

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-google-calendar-browser-qa-env.ps1
```

Result: all required Google Calendar browser QA variable names were present. Values were not printed.

| Input | Present By Name Only |
| --- | --- |
| `NON_PRODUCTION_APP_URL` | `YES` |
| `QA_STAFF_EMAIL` | `YES` |
| `QA_STAFF_PASSWORD` | `YES` |
| `QA_GOOGLE_CALENDAR_EMAIL` | `YES` |
| `QA_GOOGLE_CALENDAR_PASSWORD` | `YES` |
| `QA_ACTIVE_PARISH_A_ID` | `YES` |
| `QA_ACTIVE_PARISH_B_ID` | `YES` |
| `QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `YES` |
| `QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `YES` |
| `QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `YES` |
| `QA_SAFE_GOOGLE_CALENDAR_ID` | `YES` |
| `QA_GOOGLE_RECONNECT_ALLOWED` | `YES` |

## HTTPS Origin Gate

The saved app origin was checked by scheme and host only. No passwords, OAuth client secrets, session cookies, tokens, parish ids, request ids, or Google account passwords were printed.

| Check | Result |
| --- | --- |
| Saved origin scheme | `http` |
| Saved origin host | `localhost` |
| Is HTTPS | `NO` |
| Is localhost/private local origin | `YES` |
| Approved for Google OAuth callback QA | `NO` |

Vinea's callback URI shape remains:

```text
${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback
```

Because the current saved origin is `http://localhost`, it would produce a localhost callback and fail the approved HTTPS callback requirement. The run therefore stopped before setting `NEXT_PUBLIC_APP_URL` for OAuth QA or registering any redirect URI in Google Cloud Console.

## QA Gates

| Gate | Result | Notes |
| --- | --- | --- |
| Approved HTTPS non-production origin | `FAILED` | Current saved origin is local HTTP. |
| Google Cloud Console redirect registration | `NOT RUN` | No approved HTTPS origin exists to register. |
| Non-production app startup with HTTPS origin | `NOT RUN` | Stopped before app startup. |
| `/api/health` | `NOT RUN` | Stopped before app startup. |
| Staff sign-in | `NOT RUN` | Stopped before browser/app access. |
| Same-parish request detail | `NOT RUN` | Stopped before browser/app access. |
| OAuth reconnect | `NOT RUN` | Stopped before Google OAuth. |
| Google credential submission | `NOT RUN` | Explicitly blocked until callback is approved and registered. |
| Event mutation | `NOT RUN` | Still blocked until reconnect and selected-parish guards pass. |
| Cleanup | `NOT NEEDED` | No app session, OAuth flow, or Google mutation occurred. |

## Required Next Work

Before this QA can continue, provide one approved HTTPS non-production app origin:

- A staging URL, such as `https://staging.<non-production-domain>`.
- A Vercel preview URL configured only with shared-QA or approved non-production Supabase credentials.
- A temporary HTTPS tunnel URL mapped to the local app port for the entire OAuth flow.

Then register this exact redirect URI in the safe non-production Google OAuth client:

```text
https://<approved-non-production-origin>/api/google/oauth/callback
```

After that, rerun the selected-parish Google Calendar reconnect QA through OAuth only, still stopping before calendar event mutation unless reconnect and selected-parish guards pass.

## What Changed In Plain English

The Google Calendar QA settings are present, but the app URL is still `localhost`. Google will not use that as a safe callback for this OAuth test. I stopped before opening Google or changing anything so we do not accidentally connect the wrong app, client, or calendar.
