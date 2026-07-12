# Google Calendar OAuth Console Redirect Registration - MFA Blocked - 2026-06-28

Status: `BLOCKED - GOOGLE CLOUD MFA REQUIRED`

This evidence record captures the attempt to add the approved temporary HTTPS callback URI to the safe non-production Google OAuth client. Google Cloud Console opened in Chrome, but blocked access until 2-step verification is enabled for the signed-in Google account. The run stopped before any redirect URI was registered.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google OAuth client changed | `NO` |
| Production Google account/calendar used | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth redirect URI registered | `NO` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted by Codex | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## Intended Redirect URI

The redirect URI remains ready to add after Google Cloud Console access is restored:

```text
https://khaki-falcons-jam.loca.lt/api/google/oauth/callback
```

## Browser Observation

Google Cloud Console displayed a Google Cloud access blocker stating that 2-step verification is required before console access can continue.

The evidence intentionally does not record passwords, OAuth client secrets, refresh tokens, access tokens, session cookies, or private credential values.

## Required Human Step

Enable 2-step verification for the signed-in Google account that owns or can administer the safe non-production Google OAuth client. After enabling 2SV, Google says it may take up to 60 seconds before Cloud Console access is restored.

Then refresh the Google Cloud Console tab and add:

```text
https://khaki-falcons-jam.loca.lt/api/google/oauth/callback
```

to the safe non-production OAuth 2.0 Client ID.

## What Changed In Plain English

I reached Google Cloud Console, but Google stopped the process because the account needs two-step verification. I did not change Google settings, enter credentials, connect a calendar, or touch production. The exact callback URL is still ready once MFA is enabled.
