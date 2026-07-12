# Sacramental Records Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Purpose

The Sacramental Records list already loads through the validated active parish context and applies an explicit `parish_id` filter. This phase makes that selected parish visible to staff so the register list is easier to trust during multi-parish QA and future multi-parish staff use.

## What Changed

- `lib/server/loadSacramentalRecordsList.ts` now returns the selected active parish display name from the same active parish context used to filter sacramental records.
- `app/dashboard/records/RecordsListView.tsx` now shows a small scope label that says `Sacramental records are scoped to`.
- Existing Sacramental Records list loading, search, type filtering, record links, certificate support, and create links are preserved.
- No Sacramental Records route behavior, RLS policy, migration, Google Calendar route, or production setting changed.

## What Changed Plain English

Before this update, the Sacramental Records page could load register entries for the selected parish, but staff had to infer the selected parish from the app header. Now the Sacramental Records page itself says which parish the register list belongs to.

## Why This Matters

Sacramental records are one of Vinea's most Catholic-specific and trust-sensitive areas. A visible parish label helps staff avoid confusion when serving multiple parishes and reduces the chance that they open or add records while thinking they are in a different parish.

## Validation

- Loader tests confirm the selected parish name follows the validated active parish context.
- Source validation confirms the Sacramental Records page displays `Sacramental records are scoped to`.
- Source validation confirms the Sacramental Records list still applies the explicit `parish_id` filter from active parish context.
- Source validation confirms this phase does not touch Google Calendar code, migrations, operational RLS, or production secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Manual browser verification is still useful to confirm the label updates after parish switching in shared QA or another approved non-production environment.

## Next Suggested Phase

Run browser QA for the Sacramental Records selected-parish scope label, or continue safe tenant-readiness by hardening Mass Intentions selected-parish scope while production RLS remains `NO-GO`.
