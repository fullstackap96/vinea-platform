# Mass Intentions Active Parish Detail Scope - 2026-07-08

Status: `IMPLEMENTED - SERVER-SCOPED DETAIL/EDIT HARDENING`

Completion marker: `MASS_INTENTIONS_ACTIVE_PARISH_DETAIL_SCOPE_20260708`

This slice moves Mass Intention detail/edit record loading behind the selected active-parish server loader and constrains Mass Intention updates to the staff write parish context.

## What Changed

- Added `lib/server/loadMassIntentionDetail.ts`.
- Updated `app/dashboard/intentions/[id]/page.tsx` to load Mass Intention detail data on the server.
- Updated `app/dashboard/intentions/[id]/edit/page.tsx` to load Mass Intention edit data on the server.
- Updated `app/dashboard/intentions/[id]/MassIntentionDetailPage.tsx` to render scoped server-loaded data instead of querying Supabase from the browser.
- Updated `app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx` to receive the scoped Mass Intention from the server while keeping the staff form client-side.
- Updated `app/dashboard/intentions/actions.ts` so updates require staff write parish context and match both `id` and `parish_id`.

## Safety Boundary

This change:

- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not touch Google Calendar data.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not make public trust claims.

Mass Intention create/edit forms remain staff-driven. This slice narrows read/write scope to the selected active parish or explicit primary-parish fallback when no active parish cookie exists.

## Verification

Focused tests cover:

- selected active parish cookie propagation into the server detail loader.
- detail loads filtering by both Mass Intention ID and active parish ID.
- safe not-found behavior for cross-parish or missing rows.
- update action staff write parish context resolution.
- update action filtering by both Mass Intention ID and write parish ID.
- source-level boundaries preventing browser-side `mass_intentions` detail/edit record queries from returning.
