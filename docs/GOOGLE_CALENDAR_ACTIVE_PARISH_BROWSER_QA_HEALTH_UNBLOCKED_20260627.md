# Google Calendar Active-Parish Browser QA Health Unblocked - 2026-06-27

Status: `APP HEALTH GREEN - BROWSER QA BLOCKED BY LOCALHOST BROWSER ACCESS`

This evidence records the follow-up to `docs/GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_FIXTURES_READY_20260627.md`.

## Safety Boundaries

| Boundary | Result |
| --- | --- |
| Production accessed | `NO` |
| Production Google account/calendar used | `NO` |
| Shared QA accessed | `YES - schema health read-only checks only` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Google OAuth reconnect started | `NO` |
| Google event create/update/delete attempted | `NO` |
| Secrets printed | `NO` |

## Health Fix

The local `/api/health` blocker was caused by the schema readiness check calling `check_public_intake_rate_limit` with `p_limit: 0`.

The shared QA SQL function correctly rejects non-positive limits, so health failed even though the schema was present.

Fix:

- Updated the health readiness probe to call `check_public_intake_rate_limit` with `p_limit: 1`.
- Updated the focused health-check test to assert the valid limit.

## Verification Evidence

| Check | Result |
| --- | --- |
| Focused health unit test | `PASS` |
| Direct shared-QA schema readiness probe | `PASS` |
| Local app `/api/health` through HTTP | `PASS - HTTP 200, checks.schema: true` |
| Google Calendar browser-QA env variables | `PASS - present by name only in ignored local env file` |
| In-app browser localhost health navigation | `BLOCKED - browser reported local URL blocked before Vinea loaded` |
| Chrome localhost health navigation | `BLOCKED - browser reported local URL blocked before Vinea loaded` |

Observed healthy local route response:

```json
{
  "ok": true,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": true,
    "resend": true,
    "googleOAuth": true
  }
}
```

## Browser QA Outcome

| Gate | Result |
| --- | --- |
| `/api/health` | `PASS` |
| Staff sign-in | `NOT RUN - browser localhost navigation blocked` |
| Selected-parish OAuth reconnect | `NOT RUN` |
| Settings selected-parish status | `NOT RUN` |
| Same-parish event create/update/delete | `NOT RUN` |
| Cross-parish denial | `NOT RUN` |
| Mismatched calendar safety | `NOT RUN` |
| Final decision | `BLOCKED BY BROWSER LOCALHOST ACCESS` |

## What Changed In Plain English

Before this update, Vinea's health page said the database schema was not ready because the health check was asking the rate-limit system an invalid question. The database was not missing that piece; the test input was wrong. Now the health check uses a valid value, and the local app reports that shared QA is healthy.

The Google Calendar browser test still did not run because the browser automation could not open localhost. No Google account was connected, no event was created, and no real calendar was touched.

## Remaining Follow-Up

- Rerun the selected-parish Google Calendar browser QA from an environment where the browser can open the non-production app URL.
- Keep using the prepared shared-QA fixtures and ignored local QA env file.
- Do not mark Google Calendar selected-parish browser QA as passed until staff sign-in, selected-parish reconnect, settings status, and safe event lifecycle gates run successfully.
