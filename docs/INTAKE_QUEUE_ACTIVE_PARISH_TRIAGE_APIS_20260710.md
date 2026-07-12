# Intake Queue Active-Parish Triage APIs

Date: 2026-07-10

Status: Implemented and fully verified locally. Safe non-production browser QA remains recommended.

## Purpose

The Intake Queue's inline request and Mass Intention triage controls previously used Server Actions that authenticated the user but did not explicitly prove that the selected active parish owned the target row before each write. The new API boundary keeps the quick, staff-reviewed experience while making parish scope and target ownership server-owned.

## Request Quick Triage

`POST /api/requests/[id]/intake-triage` now:

- requires authenticated staff before bounded JSON parsing;
- validates owner text, follow-up date, contact method, contact note, and boolean controls;
- validates the active parish cookie through the existing request-detail access loader;
- permits explicit primary-parish compatibility fallback only when no active parish cookie exists;
- denies missing, forged, and cross-parish request targets generically before writes;
- optionally logs staff-reviewed first contact, then updates assignment, follow-up, contact summary, and `in_progress` status;
- returns explicit partial-success guidance if contact history saves before the request update fails; and
- writes route-owned audit metadata containing labels and booleans only, without staff names, note text, or dates.

## Mass Intention Quick Triage

`POST /api/mass-intentions/[id]/intake-triage` now:

- requires authenticated staff before bounded JSON parsing;
- validates the Mass date, celebrant text, stipend control, and completion control;
- resolves the selected parish through the staff write-parish helper;
- permits explicit primary-parish compatibility fallback only when no active parish cookie exists;
- constrains the service-role update by both intention id and exact parish id;
- returns the same generic not-found response for unauthorized parish scope and missing target rows; and
- writes safe audit metadata with state booleans only, excluding celebrant text and Mass dates.

## Browser Boundary

- `DashboardIntakePageClient.tsx` now uses credentialed `fetch` calls to the two triage APIs.
- The obsolete `app/dashboard/intake/actions.ts` mutation path was removed.
- The inline form, success wording, safe error allowlists, refresh behavior, and staff-review boundary remain intact.
- No direct browser Supabase request or Mass Intention mutation was added.

## Preserved Safety Boundaries

- No communication or email was sent.
- No Google Calendar API was called.
- No production environment was accessed.
- No migration was applied.
- Operational RLS was not changed.
- No production-sensitive flag was added or enabled.
- No automation was enabled.

## Verification

- Focused Intake Queue API/client suite: `4 files / 17 tests passed`.
- Full Vitest regression suite: `692 files / 2,744 tests passed`.
- TypeScript: `PASS`.
- Quiet lint: `PASS`.
- Next.js `16.2.10` production build: `PASS`; `56` static pages generated.

## Remaining Manual QA

In a safe non-production staff session:

1. Select Parish A and save request owner/follow-up triage with and without first contact.
2. Confirm one first-contact communication row, updated request summary, and safe audit metadata.
3. Verify the partial-success message using a synthetic failure fixture and confirm staff are told to refresh before retrying.
4. Save a Parish A Mass Intention schedule/celebrant/stipend triage and confirm the expected completion rule.
5. Switch to Parish B and confirm stale Parish A request and intention targets deny without mutation.
6. Confirm browser network traffic uses only the two triage API routes and no obsolete action endpoint.

This manual QA does not authorize production access, migrations, operational RLS changes, real communications, or provider calls.
