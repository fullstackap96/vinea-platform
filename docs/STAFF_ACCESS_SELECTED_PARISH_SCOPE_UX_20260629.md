# Staff Access Selected-Parish Scope UX

Date: 2026-06-29

Status: Completed as a safe non-production tenant-readiness hardening phase.

## What Changed

- Added a display-only `Staff access is scoped to ...` label inside the Staff login access card on the Settings page.
- Reused the already-loaded active parish name from the Settings API response.
- Kept the existing staff access API authorization path unchanged.
- Confirmed the staff access API already uses active parish read context for GET and the staff write parish context helper for POST/PATCH.

## What Changed Plain English

The Staff Access box now clearly shows which parish the staff list belongs to. If someone works across more than one parish, they can see whether they are adding or deactivating staff for Parish A or Parish B before touching any controls.

## Why This Matters

Staff Access controls who can sign in to a parish workspace. Showing the selected parish directly in that panel reduces the risk of changing access for the wrong parish during multi-parish work.

## Safety Notes

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Runtime authorization behavior was not changed.
- Google Calendar data was not touched.
- Records were not mutated.
- No secrets were exposed.
- This does not promote production RLS.

## How To Test

1. Sign in to shared QA as a safe multi-parish staff user.
2. Open Settings.
3. Select Parish A from the active parish selector.
4. Confirm the Staff login access card shows `Staff access is scoped to Parish A`.
5. Select Parish B.
6. Confirm the Staff login access card updates to `Staff access is scoped to Parish B`.
7. Do not add, deactivate, or change staff during this display-only QA unless a separate mutation test is explicitly approved.

## Known Risks

- Browser QA has now been completed in shared QA and is recorded in `docs/STAFF_ACCESS_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md`.
- This phase does not change production RLS status.
- Production RLS remains NO-GO until explicit production approval, production-safe fixtures, monitoring, rollback readiness, and live smoke evidence are complete.
