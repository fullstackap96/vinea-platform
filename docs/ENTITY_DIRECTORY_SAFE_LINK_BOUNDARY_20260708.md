# Entity Directory Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY LINK HARDENING`

This slice keeps visible People, Households, and Sacramental Records directory/detail navigation links on shared dashboard entity-navigation helpers.

## What Changed

- Extended `lib/dashboardEntityNavigation.ts` with safe detail/edit href helpers for People, Households, and Sacramental Records.
- Updated People, Households, and Sacramental Records list row links.
- Updated Person detail household/record handoffs and edit link.
- Updated Household detail member handoffs and edit/add-members links.
- Updated Sacramental Record detail edit link.
- Added focused unit and source-boundary tests.

## What Changed In Plain English

The main directory pages now use one shared helper to open People profiles, Household profiles, and Sacramental Record pages. If a page receives an unexpected blank ID, the helper sends staff back to the safe list page instead of creating a broken dashboard link.

## Safety Boundary

This change:

- does not mutate records.
- does not create or edit people, households, or records.
- does not link people or households automatically.
- does not generate certificates.
- does not make canonical, sacramental, pastoral, or eligibility decisions.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

All affected links remain staff-facing dashboard navigation only.

## Verification

Focused tests cover:

- safe detail/edit links for People, Households, and Sacramental Records.
- encoded unusual IDs.
- safe list-page fallbacks for blank IDs.
- source-level proof that the updated directory/detail components use shared helpers instead of inline dashboard URL interpolation.

Command:

```powershell
npm.cmd test -- lib\dashboardEntityNavigation.test.ts lib\server\entityDirectorySafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
