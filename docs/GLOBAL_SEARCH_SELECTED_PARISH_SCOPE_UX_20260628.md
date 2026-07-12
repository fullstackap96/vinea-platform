# Global Search Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Purpose

Global Search already uses active parish context for explicit people, household, and sacramental record filters, while request results remain constrained by existing request security rules. This phase makes the selected parish context visible on the full search results page so staff can tell which parish context they are working in.

## What Changed

- `app/dashboard/search/page.tsx` now loads the selected active parish display name from the staff parish switcher context.
- `app/dashboard/_components/GlobalSearchResultsView.tsx` now shows a small header label that says `Search is using selected parish context`.
- 2026-07-05 update: `app/dashboard/_components/GlobalSearchResultsView.tsx` also shows a request-scope cue after staff search, explaining that request results follow the selected parish and linked parishioners.
- Existing global search loading behavior is preserved.
- No search route behavior, RLS policy, migration, Google Calendar route, or production setting changed.

## What Changed Plain English

Before this update, staff could search from the selected parish context, but the full search page did not clearly say which parish was selected. Now the search page shows the selected parish name, which helps staff avoid confusion when serving more than one parish.

## Why This Matters

Search is one of the fastest ways staff move through Vinea. A visible parish context label makes multi-parish use safer and makes QA easier because staff can confirm the page is operating in the expected parish context before opening records.

## Validation

- Source validation confirms the search page derives the selected parish name from the active parish switcher.
- Source validation confirms the results page displays `Search is using selected parish context`.
- Source validation confirms the existing global search loader still uses the active parish cookie and resolver for explicit parish filters.
- Source validation confirms the request-scope cue explains linked parishioner scoping and remains read-only.
- Source validation confirms this phase does not touch Google Calendar code, migrations, operational RLS, or production secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Request result visibility still depends on the existing request security path and request-to-parishioner links; this phase intentionally does not mutate or repair legacy request links.
- Manual browser verification is still useful to confirm the label updates after parish switching in shared QA or another approved non-production environment.

## Next Suggested Phase

Run browser QA for the Global Search selected-parish scope label, or continue safe tenant-readiness by hardening another selected-parish UX surface while production RLS remains `NO-GO`.
