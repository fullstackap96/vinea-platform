# Request Actions Active Parish Server Actions - 2026-07-08

## Status

Implemented as Request Detail production-readiness hardening for staff-reviewed Server Actions.

## What Changed

- Added a shared `loadRequestActionAccess` helper for Request Detail Server Actions.
- Verified selected active-parish request ownership before these staff-reviewed mutations:
  - request status updates
  - workflow-step status updates
  - assignment updates
  - next follow-up date updates
  - waiting-for/blocker updates
  - workflow playbook checklist inserts
  - internal request notes
  - staff-corrected intake/contact details
  - request person link/create actions
- Preserved legacy primary-parish fallback only when no active parish cookie exists.
- Scoped intake contact updates to the verified request parish before updating `parishioners`.

## Staff Impact

The Request Detail buttons and forms should feel the same to staff. Underneath, Vinea now proves that the selected parish owns the request before saving status, assignment, follow-up, blocker, checklist, note, intake, or person-link changes.

## Safety Boundary

This slice does not send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, generate certificates, apply migrations, change operational RLS, access production, mutate sacramental records, or make public trust claims.

## Verification

- Source-level tests assert the core Request Detail Server Actions call `loadRequestActionAccess` and use `access.requestId` instead of raw request ids for query/write scopes.
- Source-level tests assert intake contact updates are scoped by `access.parishId`.
- Focused runtime tests still cover request-derived person creation, no-cookie fallback, and fail-closed request-scope denial.
