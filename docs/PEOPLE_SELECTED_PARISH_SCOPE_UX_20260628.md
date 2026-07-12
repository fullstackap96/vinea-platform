# People Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Purpose

The People directory already loads through the validated active parish context and applies an explicit `parish_id` filter. This phase makes that selected parish visible to staff so the directory is easier to trust during multi-parish QA and future multi-parish staff use.

## What Changed

- `lib/server/loadPeopleList.ts` now returns the selected active parish display name from the same active parish context used to filter people.
- `app/dashboard/people/PeopleListView.tsx` now shows a small scope label that says `People are scoped to`.
- Existing People list loading, filtering, duplicate review links, and create links are preserved.
- No People route behavior, RLS policy, migration, Google Calendar route, or production setting changed.

## What Changed Plain English

Before this update, the People page could load parishioners for the selected parish, but staff had to infer the selected parish from the app header. Now the People page itself says which parish the directory belongs to.

## Why This Matters

The People directory is the heart of Vinea's parishioner relationship data. A visible parish label helps staff avoid confusion when serving multiple parishes and reduces the chance that they open or add records while thinking they are in a different parish.

## Validation

- Loader tests confirm the selected parish name follows the validated active parish context.
- Source validation confirms the People page displays `People are scoped to`.
- Source validation confirms the People list still applies the explicit `parish_id` filter from active parish context.
- Source validation confirms this phase does not touch Google Calendar code, migrations, operational RLS, or production secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Manual browser verification is still useful to confirm the label updates after parish switching in shared QA or another approved non-production environment.

## Next Suggested Phase

Run browser QA for the People selected-parish scope label, or continue safe tenant-readiness by hardening another selected-parish UX surface while production RLS remains `NO-GO`.
