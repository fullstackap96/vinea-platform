# Sacramental Record Read Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

Vinea's selected-parish Sacramental Records list and detail loaders now use explicit, compile-time database projections instead of wildcard reads.

## Implemented Boundary

- The records list requests only the nine fields used for row display and request-to-record continuity review.
- The record detail query explicitly requests the current register-detail contract, including staff-visible notes and audit ownership fields required by the existing edit/detail model.
- The recent-activity query requests only event id, action, actor email, and creation time.
- Event metadata, actor ids, parish ids, and record ids no longer enter the detail activity DTO because the screen does not display them.
- Existing authentication, selected active-parish membership resolution, same-parish record constraints, continuity summaries, certificate-activity detection, staff-safe errors, and UI behavior remain unchanged.

## Verification

- Focused list, detail, and continuity tests assert the exact projections and selected-parish filters.
- Tests assert that list reads exclude notes and audit ownership fields.
- Tests assert that activity rows exclude raw metadata and actor ids.
- TypeScript compilation confirms the minimized list and activity DTO contracts remain compatible with their staff-facing views.

## Safety And Rollback

- No migration, RLS change, record mutation, certificate generation, storage access, external service call, or production access occurred.
- Rollback is code-only: restore the prior loader projections and DTO shapes.
- Synthetic non-production browser QA should confirm list filters, continuity cues, record detail, recent activity, parish switching, and cross-parish not-found behavior before deployment evidence is claimed.

## Production Boundary

This is a data-minimization and future-schema containment control. It does not approve production RLS, certificate issuance, public trust claims, or any other gated production capability.
