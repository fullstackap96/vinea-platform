# People Duplicates Selected-Parish Scope UX

Date: 2026-06-29

Status: Completed as a safe non-production tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, duplicate people were not loaded through browser QA, duplicate people were not merged, parish records were not mutated, records were not mutated, runtime authorization behavior was not changed, and no secrets were exposed.

## What Changed

- Updated `app/dashboard/people/duplicates/page.tsx`.
- Updated `app/dashboard/people/duplicates/PeopleDuplicatesPageClient.tsx`.
- Added a display-only `People duplicate review is scoped to ...` label on the People duplicate review page.
- Used `loadActiveStaffParishSwitcherContext()` in the server page to derive the selected parish display name from the same validated active parish context used by the parish switcher.
- Left the duplicate-detection API and merge API behavior unchanged.

## What Changed Plain English

The People duplicate review page now tells staff which parish they are reviewing before they load or merge possible duplicate profiles. Nothing about duplicate detection or merging was changed.

## Why This Matters

Duplicate review can remove a duplicate person profile after moving links. Showing the selected parish on that page gives multi-parish staff one more clear cue before they perform a sensitive cleanup action.

## Safety Scope

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Google Calendar data was not touched.
- Duplicate people were not merged.
- Parish records were not mutated.
- Records were not mutated.
- Runtime public intake routing was not enabled.
- No secrets were exposed.

## Verification

- Source validation confirms the server page derives the active parish name from `loadActiveStaffParishSwitcherContext()`.
- Source validation confirms the client renders `People duplicate review is scoped to`.
- Source validation confirms the People duplicates API still uses `resolveActiveStaffParishContext()` for reads and `resolveStaffWriteParishContext()` for merge writes.

## Known Risks

- Browser QA has not yet been run for this specific People duplicate review label.
- This phase does not change production RLS status.
- Production RLS remains `NO-GO` until explicit approval, production target details, live smoke evidence, monitoring evidence, and rollback readiness are complete.

## Recommended Next Step

Run shared-QA browser verification that the People duplicate review selected-parish label updates after switching between authorized parishes, without finding duplicates or merging records.
