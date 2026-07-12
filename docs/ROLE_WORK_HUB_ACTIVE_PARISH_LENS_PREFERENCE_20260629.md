# Role Work Hub Active-Parish Lens Preference

Status: Completed as a safe multi-parish tenant-readiness hardening phase on 2026-06-29.

## Scope

This change remembers the selected Role Work Hub lens per active parish in the staff member's browser. It does not access production, apply migrations, change operational RLS, touch Google Calendar routes or data, mutate request or communication records, call an API, write to Supabase, or expose secrets.

## What Changed

- `DashboardPageCore` now passes the validated active parish id into `DashboardRoleWorkHub`.
- `DashboardRoleWorkHub` stores the selected role lens in `localStorage` with a key scoped to the active parish id.
- When the active parish changes, the Role Work Hub restores that parish's saved lens when one exists.
- When no saved lens exists, the Role Work Hub still uses its existing default lens calculation.
- Invalid saved lens values are ignored.
- If browser storage is unavailable, the lens buttons still work for the current page session.

## What Changed Plain English

If a staff member prefers the Pastor lens for one parish and the Front desk lens for another parish, Vinea now remembers that choice in their browser. The preference stays separate for each parish so switching parishes does not accidentally carry over the wrong working view.

## Why This Matters

Multi-parish staff often play different roles at different parishes. Parish-scoped lens preferences make the dashboard feel more natural without changing permissions, database policy, or parish records.

## Validation

- Source validation confirms `DashboardPageCore` passes `activeParishId` into `DashboardRoleWorkHub`.
- Source validation confirms the local storage key is active-parish-scoped.
- Source validation confirms invalid saved lens ids are ignored.
- Source validation confirms the role lens selection still updates the current UI when browser storage is unavailable.
- Source validation confirms this is browser-local only and does not use APIs, Supabase writes, migrations, operational RLS, Google Calendar, or record mutations.

## Known Risks

- This preference is browser-local. It does not sync across devices or staff browsers.
- This does not promote production RLS.
- Browser QA should still verify that selecting a Role Work Hub lens persists separately for Parish A and Parish B in shared QA or another approved non-production environment.

## Recommended Next Phase

Run browser QA for active-parish-scoped Role Work Hub lens persistence, or continue safe tenant-readiness with another low-risk selected-parish/admin surface while production RLS remains `NO-GO`.
