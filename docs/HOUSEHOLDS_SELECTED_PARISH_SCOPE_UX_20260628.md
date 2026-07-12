# Households Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Purpose

The Households directory already loads through the validated active parish context and applies an explicit `parish_id` filter. This phase makes that selected parish visible to staff so the household directory is easier to trust during multi-parish QA and future multi-parish staff use.

## What Changed

- `lib/server/loadHouseholdsList.ts` now returns the selected active parish display name from the same active parish context used to filter households.
- `app/dashboard/households/HouseholdsListView.tsx` now shows a small scope label that says `Households are scoped to`.
- Existing Households list loading, filtering, duplicate review links, create links, and member count loading are preserved.
- No Households route behavior, RLS policy, migration, Google Calendar route, or production setting changed.

## What Changed Plain English

Before this update, the Households page could load households for the selected parish, but staff had to infer the selected parish from the app header. Now the Households page itself says which parish the directory belongs to.

## Why This Matters

Households help staff understand families, addresses, and member relationships. A visible parish label helps staff avoid confusion when serving multiple parishes and reduces the chance that they open or add household records while thinking they are in a different parish.

## Validation

- Loader tests confirm the selected parish name follows the validated active parish context.
- Source validation confirms the Households page displays `Households are scoped to`.
- Source validation confirms the Households list still applies the explicit `parish_id` filter from active parish context.
- Source validation confirms this phase does not touch Google Calendar code, migrations, operational RLS, or production secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Manual browser verification is still useful to confirm the label updates after parish switching in shared QA or another approved non-production environment.

## Next Suggested Phase

Run browser QA for the Households selected-parish scope label, or continue safe tenant-readiness by hardening another selected-parish UX surface while production RLS remains `NO-GO`.
