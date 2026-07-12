# Google Calendar OAuth Redirect Registered - 2026-06-28

Status: `COMPLETED - SAFE NON-PRODUCTION OAUTH CLIENT UPDATED`

This evidence record captures the successful registration of the approved temporary HTTPS callback URI in the safe non-production Google OAuth client. Production was not accessed, migrations were not applied, operational RLS was not changed, Google OAuth reconnect was not started, Google credentials were not submitted by Codex, and Google Calendar data was not mutated.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google OAuth client changed | `NO` |
| Production Google account/calendar used | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth redirect URI registered | `YES - safe non-production client only` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted by Codex | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## Google Cloud Target

| Field | Value |
| --- | --- |
| Google Cloud project | `Vinea Platform` |
| Project id observed in URL | `vinea-platform` |
| OAuth client name | `Vinea OAuth Playground` |
| OAuth client type | `Web application` |
| Registration result | `Verified present after save` |

## Redirect URI Registered

The following redirect URI was added to the safe non-production OAuth client:

```text
https://khaki-falcons-jam.loca.lt/api/google/oauth/callback
```

The client already had the prior local QA callback:

```text
http://localhost:3000/api/google/oauth/callback
```

The new HTTPS callback was added without removing existing entries.

## Verification

After saving, Google Cloud Console returned to the credentials list. The same OAuth client was reopened, and the new redirect URI was verified as present on the client detail page.

Google's page notes that OAuth client changes may take 5 minutes to a few hours to take effect.

## What Changed In Plain English

The safe Google test client now knows where to send users after Google Calendar login during this temporary tunnel QA run. I only added the callback URL. I did not connect a calendar, type any Google password, change production, or touch any calendar events.
