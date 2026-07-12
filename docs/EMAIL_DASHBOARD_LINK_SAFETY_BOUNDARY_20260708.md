# Email Dashboard Link Safety Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY GENERATED EMAIL LINK HARDENING`

Completion marker: `EMAIL_DASHBOARD_LINK_SAFETY_BOUNDARY_20260708`

This slice hardens generated staff-facing email links without sending any email.

## What Changed

- Request notification emails now build their request dashboard path through the shared `requestDetailHref` helper.
- Request notification `dashboardUrl` values are only created when the configured app base URL is `http` or `https`.
- Daily Parish Brief focus links now accept only dashboard-internal hrefs before turning them into absolute Vinea links.
- Unsafe or malformed Daily Parish Brief focus links fall back to the dashboard.

## Why This Matters

Email links leave the immediate dashboard context. Staff should never receive generated Vinea emails that point to malformed request paths, external URLs, API routes, exports, storage, signed URLs, or JavaScript-style destinations.

## Safety Boundary

This change:

- does not send communications.
- does not mutate records.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

The email renderers remain pure string builders in this slice.

## Verification

Focused tests prove:

- unsafe-shaped request ids are encoded in request notification links.
- invalid app origins do not become absolute email links.
- blank request ids fall back to the Requests dashboard.
- Daily Parish Brief focus links stay under the configured Vinea app origin.
- unsafe Daily Parish Brief focus links fall back to the dashboard.
- source-level guard tests keep generated email links on safe dashboard helpers.

Command:

```powershell
npm.cmd test -- lib/email/requestNotificationEmail.test.ts lib/email/parishDailyBriefEmail.test.ts lib/server/emailDashboardLinkSafetyBoundary.test.ts
```

Expected result: pass.
