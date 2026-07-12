# Mass Intention Navigation Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - NAVIGATION HARDENING`

Completion marker: `MASS_INTENTION_NAVIGATION_SAFE_LINK_BOUNDARY_20260708`

This slice keeps Mass Intention list, detail, create, and edit navigation on the shared dashboard-only entity href helpers in `lib/dashboardEntityNavigation.ts`.

## What Changed

- `massIntentionDetailHref` and `massIntentionEditHref` build Mass Intention detail/edit links with `encodeURIComponent` and the shared dashboard href sanitizer.
- `app/dashboard/intentions/IntentionsListView.tsx` uses `massIntentionDetailHref` for row links.
- `app/dashboard/intentions/[id]/MassIntentionDetailPage.tsx` uses `massIntentionEditHref` for the edit link.
- `app/dashboard/intentions/new/NewMassIntentionPage.tsx` uses `massIntentionDetailHref` after a successful create.
- `app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx` uses `massIntentionDetailHref` for success, back, and cancel navigation.

## Safety Boundary

This change:

- does not change Mass Intention create/edit form behavior.
- does not mutate records beyond existing form submissions.
- does not touch Google Calendar data.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Mass Intentions remain staff-entered and staff-reviewed. This slice only hardens where the browser goes after staff click, create, save, or cancel.

## Verification

Focused tests cover:

- Mass Intention helper output, encoding, and blank-ID fallback.
- Source-level imports and usages in the Mass Intention list/detail/create/edit surfaces.
- Removal of inline Mass Intention dashboard URL interpolation for the hardened paths.
- Current-state docs references for the safe boundary.
