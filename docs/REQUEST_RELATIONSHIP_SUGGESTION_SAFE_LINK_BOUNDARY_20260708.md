# Request Relationship Suggestion Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY LINK HARDENING`

This slice keeps the request-detail Suggested Connections card on shared dashboard-only link helpers for person and household suggestion links.

## What Changed

- Added `lib/dashboardEntityNavigation.ts`.
- Updated `app/dashboard/requests/[id]/_components/RequestRelationshipSuggestions.tsx`.
- Added focused unit and source-boundary tests.
- Updated the Safe Dashboard Href utility documentation and current-state docs.

## What Changed In Plain English

When staff review suggested people or households from a request detail page, Vinea now builds those links through a shared safety helper. If an unexpected blank ID appears, the link falls back to the People or Households list instead of constructing a broken detail URL.

## Safety Boundary

This change:

- does not mutate records.
- does not link people automatically.
- does not merge households.
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

Suggested connections remain staff-reviewed and do not make canonical, sacramental, pastoral, or eligibility decisions.

## Verification

Focused tests cover:

- safe person detail links.
- safe household detail links.
- encoded unusual IDs.
- list-page fallback behavior for blank IDs.
- source-level proof that request-detail relationship suggestions use shared helpers instead of inline dashboard URL interpolation.

Command:

```powershell
npm.cmd test -- lib\dashboardEntityNavigation.test.ts lib\server\requestRelationshipSuggestionSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
