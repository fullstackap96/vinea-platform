# Google Calendar Vercel Preview OAuth QA - Blocked 2026-06-28

Status: `BLOCKED - CURRENT SAFE PREVIEW DEPLOYMENT NOT AVAILABLE`

This evidence record captures the follow-up attempt to replace blocked temporary tunnel URLs with a non-production Vercel preview or staging URL for selected-parish Google Calendar OAuth reconnect QA. The run stopped before Google OAuth reconnect, Google credential submission, Google Calendar mutation, production access, migrations, operational RLS changes, or deployment-protection changes.

## Safety Boundary

| Boundary | Result |
| --- | --- |
| Production app accessed for QA | `NO` |
| Production Google OAuth client used | `NO` |
| Production deployment used as QA target | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Vercel deployment protection changed | `NO` |
| Google OAuth redirect URI registered | `NO` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted | `NO` |
| Google Calendar event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |

## What Was Found

| Check | Result |
| --- | --- |
| Local repo linked to Vercel project | `NO - .vercel/project.json is absent` |
| Vercel dashboard login | `YES - Chrome is signed into the Vercel team/workspace` |
| Vercel project found | `YES - vinea-platform` |
| Existing preview found | `YES - June 22 preview branch codex/weekly-security-audit-20260622` |
| Existing preview current enough for this QA | `NO - predates recent selected-parish Google Calendar work` |
| Existing preview root reachable in Chrome | `YES - Vinea landing page visible after Vercel team auth` |
| Existing preview `/api/health` direct navigation | `BLOCKED - browser reported ERR_BLOCKED_BY_CLIENT` |
| Existing preview in in-app browser | `BLOCKED BY VERCEL AUTH - redirected to Vercel login` |
| Vercel deployment protection | `ENABLED - visitors must log in to Vercel and be team members` |
| Vercel protection bypass created | `NO - would be an access/security change requiring explicit approval` |
| Vercel CLI token available | `NO - VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID absent` |
| Vercel CLI temporary install | `YES - installed outside repo in temp folder only` |
| Vercel CLI deploy attempted | `NO` |
| Vercel CLI auth result | `BLOCKED - login/whoami hung in non-interactive auth prompt` |
| SSH tunnel fallback | `BLOCKED - Windows security blocked reverse-tunnel command before execution` |

## Why QA Could Not Continue

The task requires a current, non-production HTTPS app URL that the browser can open and that Google can redirect back to. The available Vercel preview is not a valid QA target because:

1. It is an older deployment from June 22 and does not contain the latest selected-parish Google Calendar work.
2. It is protected by Vercel Authentication, so unauthenticated browser surfaces are redirected to Vercel login instead of Vinea.
3. Direct top-level `/api/health` navigation from Chrome was blocked by the browser with `ERR_BLOCKED_BY_CLIENT`.
4. Creating a Vercel protection bypass secret or disabling protection would change preview access/security and was not performed.
5. Creating a fresh preview deployment was blocked because the Vercel CLI is not authenticated in this shell and login hangs in a non-interactive prompt.

## Required Next Setup

Use one of these safe paths before rerunning selected-parish Google Calendar OAuth reconnect QA:

1. Provide a Vercel token scoped to the `vinea-platform` project and preview deployments, saved securely as `VERCEL_TOKEN`, plus any required `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`, so Codex can create a fresh non-production preview without printing secrets.
2. Create a fresh Vercel preview deployment manually from the current Google Calendar QA branch/code, then provide the preview URL after confirming it loads `/api/health` with `checks.schema: true`.
3. Create a staging domain, such as `staging.usevinea.com`, pointing to a non-production deployment that has the current code and safe QA environment variables.
4. Explicitly approve a Vercel deployment-protection bypass plan for non-production QA, including how the bypass secret will be created, stored, used, and revoked.

After a valid origin exists, register this exact callback in the safe non-production Google OAuth client:

```text
https://<approved-non-production-origin>/api/google/oauth/callback
```

Then rerun only:

- `/api/health`.
- Safe staff sign-in.
- Active parish selection.
- Same-parish request detail.
- OAuth reconnect callback.
- Selected parish integration status.
- No cross-parish integration change.

Google Calendar event create/update/delete remains blocked until reconnect and selected-parish guards pass.

## What Changed In Plain English

We found the Vercel project, but there is not currently a safe, current preview site we can use for this Google Calendar test. The preview that exists is old and protected. I did not turn off protection, create a bypass secret, deploy anything, register a new Google callback, enter Google credentials, or touch any calendar events.

To finish this QA, Vinea needs a fresh non-production preview or staging URL that contains the current code and can load in the browser.
