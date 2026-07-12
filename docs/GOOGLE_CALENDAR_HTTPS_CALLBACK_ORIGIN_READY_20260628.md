# Google Calendar HTTPS Callback Origin Ready - 2026-06-28

Status: `READY - REDIRECT URI MUST BE REGISTERED IN SAFE GOOGLE OAUTH CLIENT`

This evidence record captures the approved temporary HTTPS tunnel origin created for non-production Google Calendar OAuth QA. The tunnel exposes the local Vinea app on port `3000` while the tunnel process is running. Production was not accessed, migrations were not applied, operational RLS was not changed, Google credentials were not submitted, and Google Calendar data was not mutated.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Temporary HTTPS tunnel explicitly approved | `YES` |
| Production accessed | `NO` |
| Production Google OAuth client used | `NO` |
| Production Google account/calendar used | `NO` |
| Production Supabase database accessed | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth redirect URI registered by Codex | `NO` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## Approved Temporary Origin

| Field | Value |
| --- | --- |
| Origin | `https://khaki-falcons-jam.loca.lt` |
| Scheme | `https` |
| Host | `khaki-falcons-jam.loca.lt` |
| Is localhost | `NO` |
| Is private IP | `NO` |
| Is production-looking | `NO` |
| Approved for Google Calendar OAuth QA | `YES` |

## Exact Google OAuth Redirect URI

Add this exact authorized redirect URI to the safe non-production Google OAuth client:

```text
https://khaki-falcons-jam.loca.lt/api/google/oauth/callback
```

The redirect URI must match Vinea's `NEXT_PUBLIC_APP_URL`-derived callback exactly:

```text
${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback
```

## Environment Updates

The guarded callback-origin script saved:

- `NON_PRODUCTION_APP_URL`
- `NEXT_PUBLIC_APP_URL`

The script also updated the ignored local Google Calendar browser-QA env file for this workstation. No OAuth client secret, Google password, Supabase service role key, refresh token, access token, session cookie, parish id, or request id was printed into this evidence.

## Next Manual Step

Open the safe non-production Google OAuth client and add:

```text
https://khaki-falcons-jam.loca.lt/api/google/oauth/callback
```

Then rerun Google Calendar OAuth reconnect QA only through reconnect and selected-parish guard checks. Calendar event mutation remains blocked until reconnect, same-parish request detail, cross-parish denial, and selected-parish integration checks pass.

## What Changed In Plain English

Vinea now has a temporary public HTTPS address for the Google callback test. The exact callback URL is ready to paste into Google. I did not log in to Google, connect a calendar, change database permissions, or touch production.
