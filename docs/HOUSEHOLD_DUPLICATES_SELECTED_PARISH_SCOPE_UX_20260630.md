# Household Duplicates Selected-Parish Scope UX

Status: Completed as a safe non-production tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, duplicate households were not loaded through browser QA, duplicate households were not merged, parish records were not mutated, records were not mutated, runtime authorization behavior was not changed, and no secrets were exposed.

## What Changed

- Updated `app/dashboard/households/duplicates/page.tsx`.
- Updated `app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx`.
- Added `lib/server/householdDuplicatesSelectedParishScopeUi.test.ts`.
- Added a display-only `Household duplicate review is scoped to ...` label on the Household duplicate review page.
- Used the validated active parish switcher context to pass the selected parish name from the server page into the client component.
- Confirmed the Household duplicates API still uses the existing active parish read context and staff write parish context helper.

## What Changed Plain English

The Household duplicate review page now tells staff which parish they are reviewing before they load or merge possible duplicate household records. Nothing about duplicate detection or merging was changed.

## Why This Matters

Household duplicate merging can move household members and remove the duplicate household record. Showing the selected parish on that page helps multi-parish staff avoid cleaning up records in the wrong parish.

## How To Test

1. Sign in to shared QA with a safe multi-parish staff account.
2. Open `/dashboard/households/duplicates`.
3. Confirm the page shows `Household duplicate review is scoped to Vinea QA Google Calendar Parish A.` when Parish A is selected.
4. Switch to Parish B.
5. Confirm the page shows `Household duplicate review is scoped to Vinea QA Google Calendar Parish B.`.
6. Do not click `Find duplicates`.
7. Do not merge households.
8. Confirm no production, migration, operational RLS, Google Calendar, parish-record, record mutation, or secret exposure occurred.

## Verification

- Source validation confirms the server page loads the validated active parish switcher context.
- Source validation confirms the client label appears before the `Find duplicates` action.
- Source validation confirms duplicate reads and merge writes remain scoped through the existing active parish helpers.

## Known Risks

- Browser QA has not yet been run for this specific Household duplicate review label.
- This phase does not change duplicate detection or merge behavior.
- This phase does not change production RLS status.
- Production RLS remains `NO-GO` until explicit approval, production target details, live smoke evidence, monitoring evidence, and rollback readiness are complete.

## Project Completion Estimate

Estimated total project completion remains **73%**. This improves tenant-readiness clarity on another sensitive merge surface, but production RLS, live production smoke evidence, tenant-security promotion, and broader customer-readiness work are still incomplete.
