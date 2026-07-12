# Request Communication Log Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

Manual staff communication logging now goes through `app/api/requests/[id]/communications/route.ts`
with a staff-authenticated `POST` handler instead of browser-side Supabase writes.

## What Changed

- The existing communication-history route now supports `POST` for manual communication logs.
- The route requires staff authentication through `requireStaffFromRequest`.
- The route reads the selected active parish from `ACTIVE_STAFF_PARISH_COOKIE`.
- The route verifies request ownership through `loadStaffScopedRequestDetailAccess`.
- The route preserves primary-parish fallback only when no active parish cookie exists.
- The route accepts only approved communication methods:
  `email`, `phone`, `text`, `in_person`, `voicemail`, and `other`.
- The route inserts the communication row and updates the request communication summary fields
  only after the request is confirmed inside the selected parish scope.
- The summary update positively confirms the minimal updated request id. A zero-row response is
  treated as an honest partial save instead of a completed action.
- The Request Detail page now calls the route with `fetch` instead of directly inserting into
  `request_communications` and updating `requests` from the browser.
- Staff-facing API errors are passed through the existing curated Request Detail message helper.

## What Changed In Plain English

When a staff member logs that they called, emailed, texted, or spoke with a family, Vinea now checks
on the server that the selected parish is allowed to work on that request before saving the note.

This keeps the same staff workflow, but moves the sensitive write behind the same selected-parish
guardrails used by the newer Request Detail mutation routes.

## Safety Boundary

This slice does not send communications, send email, change email delivery, run automation, call AI,
run exports, touch Google Calendar, access storage, create signed URLs, generate certificates,
apply migrations, change operational RLS, access production, or make public trust claims.

This route records a staff-reviewed manual communication log only.

Because the history insert and summary update are sequential, a later database error or zero-row
summary update returns the existing partial-success guidance. Staff can refresh and review without
blindly repeating the communication-history insert.

## Manual QA Checklist

- Sign in as a safe staff user in a non-production environment.
- Select an authorized active parish.
- Open a same-parish request detail page.
- Log a manual communication using each allowed method as practical.
- Confirm the communication appears in the communication history.
- Confirm the request communication summary updates.
- Switch to another authorized parish and confirm the same request is not writable unless it belongs
  to that selected parish.
- Confirm invalid method/date payloads are rejected with safe generic messages.

## Verification

- Source-level tests cover the route guardrails, selected-parish ownership check, method allowlist,
  server-owned inserts/updates, browser-side mutation removal, curated API messages, and this doc.
