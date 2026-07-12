# HOUSEHOLDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708

Status: Implemented as server-scoped Household detail/edit hardening.

## SERVER-SCOPED HOUSEHOLD DETAIL/EDIT HARDENING

The Household detail and edit routes now load the target household through an active-parish-aware server loader before rendering staff-facing UI. Household updates, household-member additions, household-member updates, and primary-contact clearing now resolve staff write parish context before touching rows.

## What Changed

- Added `lib/server/loadHouseholdDetail.ts` as the active-parish-aware server loader.
- Updated `app/dashboard/households/[id]/page.tsx` and `app/dashboard/households/[id]/edit/page.tsx` to await Next.js route params and pass loaded data into the page components.
- Replaced browser-side Household detail loading with server-provided props.
- Replaced browser-side Household edit/member option loading with server-provided props.
- Constrained `updateHousehold`, `addHouseholdMember`, `updateHouseholdMember`, and primary-contact clearing to the resolved staff write parish.

## Safety Boundary

- This does not change operational RLS.
- This does not apply migrations.
- This does not access production.
- This does not mutate records beyond existing staff-triggered Household and Household Member actions.
- This preserves explicit primary-parish fallback only through the existing staff write parish context helper when no active parish cookie exists.

## Staff Impact

Staff continue using Household detail and edit screens normally, but the server now verifies that the household and related member choices belong to the selected parish before showing or changing data.

## Verification

- Focused loader/source/action tests cover active-parish read scope and staff write parish scope.
- Full typecheck, lint, build, and test runs should remain green after this slice.
