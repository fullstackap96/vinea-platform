# Communications Center Active-Parish Mutation API

Date: 2026-07-10

Status: Implemented and fully verified locally. Safe non-production browser QA remains recommended; no communication provider was called.

## Purpose

The Communications Center previously used browser-triggered Server Actions that authenticated staff but did not prove that the selected active parish owned the target request before writing communication and follow-up data. This boundary moves those writes onto the existing request communications API so the server owns authentication, parish scope, request ownership, validation, audit metadata, and partial-success guidance.

## Implemented Boundary

- `POST /api/requests/[id]/communications` now accepts the allowlisted `communications_center` source.
- Staff authentication runs before bounded JSON parsing.
- The selected active parish cookie is validated through the existing request-detail access loader.
- Primary-parish compatibility fallback remains explicit and is allowed only when no active parish cookie exists.
- Forged, missing, and cross-parish request targets return the same generic `Request not found.` response before any write.
- Communications Center notes remain required and follow-up dates use the existing calendar-date validation.
- The server supplies the contact timestamp for Communications Center entries.
- A successful communication write followed by a failed request-summary update returns structured partial-success guidance so staff can refresh and review instead of repeating the contact blindly.
- `PATCH /api/requests/[id]/communications` updates only the scoped request follow-up date.
- Route-owned audit metadata records source, method label, outcome, completion flags, and follow-up-state booleans. It excludes note text and raw follow-up dates.

## Client And Audit Ownership

- `DashboardCommunicationsPageClient.tsx` uses credentialed API requests and no longer imports a mutation Server Action.
- The obsolete `app/dashboard/communications/actions.ts` write path was removed.
- The client continues to use curated queue messages and preserves existing staff-reviewed form behavior.
- Request Detail no longer writes a duplicate `request.communication.logged` browser audit because the communications API owns that event.
- The separate `request.email.sent` event remains unchanged.

## Preserved Boundaries

- No communication or email was sent during verification.
- No Google Calendar API was called.
- No production environment was accessed.
- No migration was applied.
- Operational RLS was not changed.
- No production-sensitive flag was added or enabled.
- Existing provider behavior and staff-entered communication content were not changed.

## Verification

- Focused Communications Center/request communication suite: `6 files / 26 tests passed`.
- Corrected safe-message/source-boundary suite: `3 files / 16 tests passed`.
- Full Vitest regression suite: `690 files / 2,733 tests passed`.
- TypeScript: `PASS`.
- Quiet lint: `PASS`.
- Next.js `16.2.10` production build: `PASS`; `56` static pages generated.

## Remaining Manual QA

In a safe non-production staff session:

1. Select Parish A and log a communication plus follow-up date on a Parish A request.
2. Confirm the communication timeline and request summary update after refresh.
3. Simulate or inspect the partial-success response and confirm the staff guidance appears without encouraging a duplicate contact.
4. Switch to Parish B and confirm the Parish A request cannot be mutated through a stale or forged request URL.
5. Confirm Communications Center audit rows contain safe labels and booleans but no note text.
6. Confirm Request Detail still logs one communication event and retains its distinct sent-email event.

This manual QA does not authorize production rollout, real communication sends, migration changes, or operational RLS changes.
