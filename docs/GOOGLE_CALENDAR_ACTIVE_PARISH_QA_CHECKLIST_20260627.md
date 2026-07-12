# Google Calendar Active-Parish QA Checklist - 2026-06-27

Status: Manual QA checklist and source-level guard plan only. Do not access production, do not apply migrations, do not change operational RLS, and do not use a real parish calendar that is not approved for safe QA.

Related files:

- `app/api/google/calendar-event/create/route.ts`
- `app/api/google/calendar-event/update/route.ts`
- `app/api/google/calendar-event/delete/route.ts`
- `lib/parishGoogleCalendarServer.ts`
- `docs/MULTI_PARISH_REMAINING_PATHS_INVENTORY.md`
- `docs/VINEA_BUILD_STATUS.md`

## Safety Boundaries

- Use only safe QA or local test credentials.
- Use only a non-production Google Calendar that can safely receive and delete test events.
- Do not access production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not run this checklist against a real parish calendar unless the parish has explicitly approved the test window and cleanup plan.
- Do not leave stale Google Calendar test events after the run.
- Do not store Google OAuth tokens, refresh tokens, calendar event ids, or staff passwords in evidence.
- Redact request ids, parish ids, staff emails, and Google event ids unless the evidence store is approved for those values.

## Required Fixtures

| Fixture | Required Value | Evidence |
| --- | --- | --- |
| QA staff account | Authorized staff user with access to at least two QA parishes | `PENDING` |
| Active parish A | Parish with connected safe QA Google Calendar integration | `PENDING` |
| Active parish B | Parish used for cross-parish denial or mismatched selection checks | `PENDING` |
| Same-parish request | Future-dated request owned by active parish A with enough schedule data to build a calendar event | `PENDING` |
| Cross-parish request | Request owned by parish B that the active parish A context must not mutate | `PENDING` |
| Mismatched calendar request | Request with a stored `google_calendar_id` different from the selected parish calendar id | `PENDING` |
| Safe QA calendar | Non-production Google Calendar with cleanup owner assigned | `PENDING` |
| Cleanup owner | Person responsible for confirming no stale event remains | `PENDING` |

## Preflight

- Confirm `/api/health` returns HTTP 200 and `checks.schema: true` in the approved non-production app.
- Confirm the QA staff account can sign in.
- Confirm the parish switcher can select active parish A and active parish B.
- Confirm Settings shows Google Calendar connected for active parish A.
- Confirm the safe QA calendar id matches the selected parish integration.
- Confirm the same-parish request belongs to active parish A.
- Confirm the cross-parish request belongs to active parish B.
- Confirm the test request is future-dated and safe to create/update/delete.
- Confirm no existing active Google Calendar event uses the exact planned test summary.

## Manual QA Cases

### Case 1 - Create Event With Selected Parish

Expected result: event is created only in the selected parish calendar, and the request stores the selected parish calendar id.

Steps:

1. Sign in as the QA staff account.
2. Select active parish A in the parish switcher.
3. Open the same-parish request detail page.
4. Create a Google Calendar event.
5. Confirm the route returns success.
6. Confirm the request has `google_calendar_event_id`, `google_calendar_id`, and `google_calendar_event_html_link`.
7. Confirm `google_calendar_id` equals the selected parish calendar id.
8. Confirm the event appears in the safe QA calendar.

### Case 2 - Update Event With Selected Parish

Expected result: event is patched only on the selected parish calendar.

Steps:

1. Keep active parish A selected.
2. Edit the request schedule fields enough to change the calendar event payload.
3. Update the Google Calendar event.
4. Confirm the route returns success.
5. Confirm the safe QA calendar event changed.
6. Confirm no event was created or changed in another parish calendar.

### Case 3 - Delete Event With Selected Parish

Expected result: event is removed from the selected parish calendar and request calendar fields are cleared.

Steps:

1. Keep active parish A selected.
2. Delete the Google Calendar event from the request detail page.
3. Confirm the route returns success.
4. Confirm the request has null `google_calendar_event_id`, null `google_calendar_id`, and null `google_calendar_event_html_link`.
5. Confirm direct Google Calendar search finds no active matching QA event.

### Case 4 - Cross-Parish Request Denial

Expected result: active parish A cannot create, update, or delete a Google Calendar event for a request owned by parish B.

Steps:

1. Select active parish A.
2. Attempt create, update, and delete actions against the cross-parish request fixture.
3. Confirm each attempt returns a generic denial such as `Request not found` or an authorization error.
4. Confirm no event is created, patched, deleted, or cleared for the cross-parish request.
5. Confirm no Google Calendar API call mutates the safe QA calendar for the denied request.

### Case 5 - Stale Or Forged Active Parish Cookie

Expected result: stale or unauthorized active parish selections fail closed before Google Calendar mutation.

Steps:

1. Use a safe browser/devtools or scripted QA client to set `vinea_active_parish_id` to a parish the staff user cannot access.
2. Attempt create, update, and delete actions.
3. Confirm each route denies the action before request mutation or Google mutation.
4. Confirm the response does not expose membership internals, OAuth tokens, refresh tokens, or private parish data.

### Case 6 - No Active Parish Cookie Legacy Fallback

Expected result: if no active parish cookie exists, the explicit compatibility fallback still works only through the staff parish context helper.

Steps:

1. Clear the active parish cookie in a non-production session.
2. Repeat create/update/delete for a safe same-parish request that belongs to the staff user's primary fallback parish.
3. Confirm the event lifecycle succeeds only for the fallback parish calendar.
4. Confirm source evidence records that the fallback was intentional and no operational RLS changed.

### Case 7 - Mismatched Stored Calendar Id

Expected result: update and delete refuse to mutate a request linked to a different parish calendar.

Steps:

1. Select active parish A.
2. Use the mismatched calendar request fixture.
3. Attempt update.
4. Confirm HTTP 409 or equivalent user-facing error.
5. Attempt delete.
6. Confirm HTTP 409 or equivalent user-facing error.
7. Confirm the route does not patch, delete, or clear the linked event.

### Case 8 - Conflict Checks Stay Parish-Scoped

Expected result: create and update conflict checks use the selected parish calendar id only.

Steps:

1. Create a safe conflict event in active parish A's QA calendar.
2. Attempt to create a request event for the same time without force-create.
3. Confirm conflict response.
4. Attempt update into the conflicting time.
5. Confirm conflict response.
6. Confirm conflict results do not include events from another parish calendar.

### Case 9 - Delete Google 404 Tolerance

Expected result: if Google says the linked event is already gone, Vinea can still clear the request fields after selected-parish checks pass.

Steps:

1. Create a safe event for the same-parish request.
2. Delete the event directly from the safe QA calendar.
3. Run delete from Vinea.
4. Confirm the request calendar fields are cleared.
5. Confirm no unrelated event is deleted.

### Case 10 - Not Connected Parish Behavior

Expected result: if the selected parish has no usable Google Calendar integration, the user receives the normal not-connected message and no request is mutated.

Steps:

1. Select active parish B if it has no connected safe QA calendar.
2. Open a parish B safe request.
3. Attempt create/update/delete where applicable.
4. Confirm the route returns the Google Calendar not-connected message.
5. Confirm no request calendar fields are changed.

## Source-Level Guard Criteria

The source-level guard tests must verify all create/update/delete event routes:

- require `requireStaffFromRequest` before body parsing.
- read `ACTIVE_STAFF_PARISH_COOKIE`.
- call `resolveActiveStaffParishContext`.
- fail closed when an active parish cookie is stale, unauthorized, or resolved through primary fallback.
- load the request only after active parish context is resolved.
- check `parishionerMatchesParish` before loading the Google Calendar integration.
- call `loadParishGoogleCalendarIntegration(parishContext.activeParishId)`.
- require `usable.parishId === parishContext.activeParishId`.
- create the Google Calendar client only after selected-parish integration and request ownership checks pass.
- use the selected parish calendar id for insert, patch, delete, conflict checks, and request field cleanup.
- avoid `createSupabaseRouteHandlerClient` in these event mutation routes.
- preserve explicit primary parish compatibility fallback only through the active staff parish context helper when no active parish cookie exists.
- avoid changing operational RLS.

## Evidence To Capture

- Non-production app URL.
- QA staff identity or redacted staff id.
- Active parish selected for each case.
- Same-parish request fixture id or redacted id.
- Cross-parish request fixture id or redacted id.
- Google Calendar integration connected state.
- Create/update/delete HTTP results.
- Request row calendar-field before/after state.
- Direct Google Calendar search screenshot or command output showing no stale event remains.
- Denial evidence for cross-parish and stale-cookie cases.
- Cleanup confirmation.
- Remaining risks.
- Reviewer/sign-off.

## Pass Criteria

- Same-parish create, update, and delete pass against the selected parish calendar.
- Cross-parish and forged/stale active-parish attempts fail before Google mutation.
- Mismatched calendar id update/delete attempts fail without patching, deleting, or clearing.
- Not-connected parish shows the expected user-facing error without mutation.
- No stale Google Calendar QA event remains.
- No production data, migrations, or operational RLS changes are involved.

## Fail Criteria

- Any Google Calendar event is created, updated, deleted, or cleared for the wrong parish.
- Any denied route leaks OAuth tokens, refresh tokens, staff membership internals, or private parish data.
- Any test touches production or a non-approved parish calendar.
- Any stale Google Calendar QA event remains without documented cleanup owner and follow-up.
- Any route bypasses active staff parish context while an active parish cookie is present.
