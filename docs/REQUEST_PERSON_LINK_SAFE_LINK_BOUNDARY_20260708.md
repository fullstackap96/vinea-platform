# Request Person Link Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY LINK HARDENING`

This slice keeps the request-detail People directory card's linked-person profile link on the shared dashboard entity-navigation helper.

## What Changed

- Updated `app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx`.
- Reused `personDetailHref` from `lib/dashboardEntityNavigation.ts`.
- Added `lib/server/requestPersonLinkSafeLinkBoundary.test.ts`.
- Updated the Safe Dashboard Href utility documentation and current-state docs.

## What Changed In Plain English

When a request is already linked to a People profile, the “View profile” link now uses the same safety helper as other People links. If an unexpected blank person ID ever reaches the UI, the helper falls back to the People list instead of building a broken profile URL.

## Safety Boundary

This change:

- does not mutate records.
- does not link people automatically.
- does not create person profiles.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

The People directory link remains staff-reviewed navigation only.

## Verification

Focused tests cover source-level proof that the request-detail linked-person profile link uses `personDetailHref`, plus the shared entity-navigation unit tests for safe encoding and list-page fallback behavior.

Command:

```powershell
npm.cmd test -- lib\dashboardEntityNavigation.test.ts lib\server\requestPersonLinkSafeLinkBoundary.test.ts lib\server\requestRelationshipSuggestionSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
