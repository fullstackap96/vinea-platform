# Request Person Link Active Parish Server Actions - 2026-07-08

## Status

Implemented as a Request Detail production-readiness hardening slice.

## What Changed

- Updated the Request Detail person-link Server Actions to verify request ownership through `loadStaffScopedRequestDetailAccess` before loading request rows or writing links.
- Preserved selected active-parish behavior when an active parish cookie is present.
- Preserved legacy primary-parish fallback only when no active parish cookie is available.
- Scoped request-derived person lookup and duplicate-recovery lookup to the verified request parish.
- Scoped request-derived `people` inserts to the verified request parish.

## Staff Impact

Staff can still link an intake request to an existing person profile or create a person profile from the intake contact. The change is underneath the button: Vinea now confirms the selected parish owns the request before it reads the request contact, links the request, or creates the person profile.

## Safety Boundary

This slice does not generate certificates, mutate sacramental records, send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, apply migrations, change operational RLS, access production, or make public trust claims.

## Verification

- Focused runtime tests confirm request-derived person creation uses active-parish request ownership, preserves no-cookie fallback, and fails before request/person reads when scope cannot be resolved.
- Source-level tests confirm both request person link Server Actions call the shared active-parish request access helper and keep person lookup/inserts scoped to the verified parish.
