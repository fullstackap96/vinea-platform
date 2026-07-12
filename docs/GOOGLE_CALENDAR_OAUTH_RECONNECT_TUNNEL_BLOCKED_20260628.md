# Google Calendar OAuth Reconnect Tunnel QA - Blocked 2026-06-28

Status: `BLOCKED - TEMPORARY HTTPS TUNNELS BLOCKED BY BROWSER`

This evidence record captures the selected-parish Google Calendar OAuth reconnect QA rerun attempt through temporary HTTPS tunnels. The local non-production Vinea app was healthy, but both temporary HTTPS tunnel hosts were blocked by the browser before Vinea could load. The run stopped before Google OAuth reconnect, Google credential submission, Google Calendar event mutation, production access, migrations, or operational RLS changes.

## Safety Boundary

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google OAuth client used | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth reconnect started | `NO` |
| Google credentials submitted | `NO` |
| Google Calendar event create/update/delete attempted | `NO` |
| Secrets printed into evidence | `NO` |
| Runtime behavior changed | `NO` |

## Environment

| Field | Value |
| --- | --- |
| Run date | `2026-06-28` |
| Local app URL checked | `http://localhost:3000/api/health` |
| Local app health | `PASS - ok true, checks.schema true` |
| Registered safe callback attempted | `https://khaki-falcons-jam.loca.lt/api/google/oauth/callback` |
| Alternate temporary tunnel attempted | `https://expansion-dealer-receptors-mortgage.trycloudflare.com/api/google/oauth/callback` |
| Chrome result | `BLOCKED - ERR_BLOCKED_BY_CLIENT` |
| In-app browser result | `BLOCKED - ERR_BLOCKED_BY_CLIENT` |
| Calendar event mutation | `NOT RUN` |

## QA Steps Attempted

| Step | Expected Result | Actual Result | Pass/Fail |
| --- | --- | --- | --- |
| Confirm local app health | `/api/health` returns `checks.schema: true` | `PASS` | `PASS` |
| Open registered `loca.lt` HTTPS tunnel in Chrome | Vinea health or app page loads | Browser blocked host with `ERR_BLOCKED_BY_CLIENT` | `FAIL` |
| Open registered `loca.lt` HTTPS tunnel in in-app browser | Vinea health or app page loads | Browser blocked host with `ERR_BLOCKED_BY_CLIENT` | `FAIL` |
| Open alternate Cloudflare HTTPS tunnel in Chrome | Vinea health or app page loads | Browser blocked host with `ERR_BLOCKED_BY_CLIENT` | `FAIL` |
| Open alternate Cloudflare HTTPS tunnel in in-app browser | Vinea health or app page loads | Browser blocked host with `ERR_BLOCKED_BY_CLIENT` | `FAIL` |
| Safe staff sign-in through HTTPS tunnel | Staff can sign in | `NOT RUN - tunnel blocked before Vinea loaded` | `BLOCKED` |
| Active parish selection | Parish A can be selected | `NOT RUN - tunnel blocked before Vinea loaded` | `BLOCKED` |
| Same-parish request detail | Request detail loads after selecting Parish A | `NOT RUN - tunnel blocked before Vinea loaded` | `BLOCKED` |
| OAuth reconnect callback | Returns to Vinea settings after Google OAuth | `NOT RUN - tunnel blocked before Vinea loaded` | `BLOCKED` |
| Selected parish integration status | Parish A integration changes, parish B unchanged | `NOT RUN - tunnel blocked before Vinea loaded` | `BLOCKED` |

## Finding

The blocker is not a Vinea route failure. The local app health endpoint returned a healthy response with `checks.schema: true`. The blocker is that the temporary public tunnel hostnames are blocked at the browser/client layer before the request reaches Vinea.

## Recommended Next Path

Use one of these approved non-production callback options before rerunning OAuth reconnect QA:

1. A Vercel preview or staging URL with HTTPS.
2. A parish-safe non-production custom domain.
3. A temporary HTTPS tunnel domain that is not blocked by the test browser/security policy.
4. A temporary relaxation/allow-list of the browser extension or security control blocking `loca.lt` and `trycloudflare.com`, if approved by the product owner.

After one of those options is ready, register:

```text
https://<approved-non-production-origin>/api/google/oauth/callback
```

in the safe non-production Google OAuth client, then rerun only the reconnect and selected-parish integration checks. Google Calendar event create/update/delete remains blocked until reconnect and selected-parish guards pass.

## What Changed In Plain English

We tried to test Google Calendar reconnect using temporary public web addresses for the local Vinea app. The app itself is healthy, but the browser blocked those temporary web addresses before Vinea could open. Nothing was changed in production, no Google password was entered, and no calendar events were created or edited.

This matters because Google login has to send the browser back to Vinea after authorization. If the browser blocks that return address, we cannot prove the reconnect flow safely. The next best step is to use a real non-production HTTPS address, like a Vercel preview or staging URL, for this QA.
