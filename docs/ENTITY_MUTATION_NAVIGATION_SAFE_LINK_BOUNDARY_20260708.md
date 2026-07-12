# Entity Mutation Navigation Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - NAVIGATION HARDENING`

This slice keeps People, Households, and Sacramental Records create/edit page success redirects, back links, and cancel callbacks on shared safe dashboard entity-navigation helpers.

## What Changed

- Updated `app/dashboard/people/new/NewPersonPage.tsx`.
- Updated `app/dashboard/people/[id]/edit/EditPersonPage.tsx`.
- Updated `app/dashboard/households/new/NewHouseholdPage.tsx`.
- Updated `app/dashboard/households/[id]/edit/EditHouseholdPage.tsx`.
- Updated `app/dashboard/records/new/NewSacramentalRecordPage.tsx`.
- Updated `app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx`.
- Added `lib/server/entityMutationNavigationSafeLinkBoundary.test.ts`.
- Updated the Safe Dashboard Href utility documentation and current-state docs.

## What Changed In Plain English

After staff save a person, household, or sacramental record, Vinea now sends them to the next page using the same safe dashboard link helper used by visible directory links. Cancel and back links on edit pages use the helper too.

## Why This Matters

The current Next.js `useRouter` documentation warns that `router.push` should not receive unsanitized URLs. These routes already use server-returned IDs and local route params, but centralizing the destination builder keeps the safety rule consistent across both clickable links and programmatic navigation.

## Safety Boundary

This change:

- does not mutate records beyond existing form submissions.
- does not change create/edit form behavior.
- does not add new fields or validation rules.
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

## Verification

Focused tests cover source-level proof that entity create/edit success redirects, back links, and cancel callbacks use shared helpers instead of inline dashboard URL interpolation.

Command:

```powershell
npm.cmd test -- lib\dashboardEntityNavigation.test.ts lib\server\entityMutationNavigationSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
