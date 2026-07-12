# Request Action Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice.

## Scope

The staff-facing Request dashboard Server Actions now log unexpected request workflow, assignment, follow-up, waiting-for, playbook, note, intake-detail, request-person-link, and request-derived person creation failures through the shared safe server logging helper and return stable staff-safe messages instead of raw Supabase/database `.message` text.

## Staff-Safe Messages

- `Could not update request status.`
- `Could not check required workflow steps.`
- `Could not check required checklist items.`
- `Could not update workflow step.`
- `Could not update assignment.`
- `Could not update follow-up date.`
- `Could not load waiting-for status.`
- `Could not update waiting-for status.`
- `Could not load checklist items.`
- `Could not add playbook checklist items.`
- `Could not add note.`
- `Could not save contact information.`
- `Could not save baptism details.`
- `Could not save intake notes.`
- `Could not save funeral details.`
- `Could not save wedding details.`
- `Could not save OCIA details.`
- `Could not link request to person. Refresh and try again.`
- `Could not create person profile.`

## Preserved Behavior

- Existing staff authentication checks are unchanged.
- Existing request validation messages remain unchanged.
- Existing workflow-completion requirements remain unchanged.
- Existing active-parish write context for request-derived People creation is unchanged.
- Existing primary-parish fallback remains only where no active parish cookie exists.
- Existing audit event writes remain unchanged.
- Existing request, note, checklist, intake-detail, and request-person-link mutations remain unchanged.

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, enable production flags, change authorization rules, send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, generate certificates, enable automation, mutate records beyond the already-existing staff-triggered request actions, or make public trust claims.

## Verification

- `lib/server/requestActionSafeErrors.test.ts` verifies the Request Server Actions import `logServerError`, keep stable staff-safe messages, and do not return raw database/provider `.message` text in mutation failure responses.
