# Settings Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, runtime authorization behavior was not changed, and no secrets were exposed.

## Purpose

The Parish Settings APIs already resolve the selected active parish for settings, staff access, workflow templates, public intake routing, Google Calendar status, and recent admin activity. This phase makes the selected parish visible on the Settings page itself so staff can see which parish settings they are viewing or editing.

## What Changed

- `app/dashboard/settings/ParishSettingsPage.tsx` now stores the last loaded parish name separately from the editable parish name field.
- The Settings page now shows a visible scope label that says `Settings are scoped to`.
- The label is display-only and comes from the parish returned by the existing `/api/parish/settings` load.
- Existing settings save behavior, staff management, workflow templates, public intake routing, Google Calendar status, audit activity, migrations, RLS policies, and production behavior were preserved.

## What Changed Plain English

Before this update, staff could edit settings for the selected parish, but the Settings page did not clearly say which parish the page belonged to. Now it shows a simple label with the selected parish name so multi-parish staff have one more cue before editing admin settings.

## Why This Matters

Parish Settings is an admin surface. A visible selected-parish label reduces the chance that staff edit details, staff access, workflow templates, or public intake routing while thinking they are working in a different parish.

## Validation

- Source validation confirms the Settings API still uses active parish context.
- Source validation confirms the client stores `loadedParishName` separately from the editable `parishName` input.
- Source validation confirms the Settings page displays `Settings are scoped to`.
- Source validation confirms this phase does not touch Google Calendar routes/data, migrations, operational RLS, production access, or secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Manual browser verification is still useful to confirm the label updates after parish switching in shared QA or another approved non-production environment.

## Next Suggested Phase

Run browser QA for the Settings selected-parish scope label, or continue safe tenant-readiness by hardening another selected-parish admin surface while production RLS remains `NO-GO`.
