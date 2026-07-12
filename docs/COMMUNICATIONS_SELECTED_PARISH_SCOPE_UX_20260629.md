# Communications Selected-Parish Scope UX

Status: Completed as a safe multi-parish tenant-readiness hardening phase on 2026-06-29.

## Scope

This change adds a visible selected-parish scope label to the staff Communications page. It does not access production, apply migrations, change operational RLS, touch Google Calendar routes or data, mutate communication records, or expose secrets.

## What Changed

- `loadParishCommunicationCenter` now returns the resolved active parish display name from the existing active-parish context.
- `DashboardCommunicationsPageClient` displays `Communications are scoped to ...` when the active parish name is available.
- Existing communication center data loading remains scoped by the same validated active parish id already used for dashboard request loading.
- Existing communication touchpoint and follow-up actions were not changed.

## What Changed Plain English

The Communications page now says which parish the communication queue belongs to. Before this, the data was already loaded through the selected parish context, but staff had to infer the scope from the top parish switcher.

## Why This Matters

Communication follow-up is pastoral and time-sensitive. A visible parish label helps multi-parish staff avoid logging notes, follow-up dates, or request communication work while mentally looking at the wrong parish.

## Validation

- Loader tests confirm the active parish name is returned from the validated active-parish context.
- Loader tests confirm stale active-parish cookies still fall back to the resolver-approved parish.
- Source validation confirms the client renders the selected-parish label.
- Source validation confirms this is display-only and does not change operational RLS, migrations, production access, Google Calendar behavior, or communication write actions.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS or change communication query/write rules.
- Browser QA should still verify the label updates after parish switching in shared QA or another approved non-production environment.

## Recommended Next Phase

Run browser QA for the Communications selected-parish scope label, or continue hardening another low-risk selected-parish UX surface while production RLS remains `NO-GO`.
