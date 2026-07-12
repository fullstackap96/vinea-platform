# Request Funeral Details Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice.

## What Changed

Request Detail funeral intake detail saves now go through `app/api/requests/[id]/funeral-details/route.ts` instead of writing directly to `funeral_request_details` from the browser.

The route:

- requires an authenticated staff session;
- reads the selected active parish cookie;
- uses the request detail access loader with explicit primary-parish fallback only when no active parish cookie exists;
- verifies the request belongs to the selected parish scope;
- verifies the request is a funeral request;
- preserves the existing confirmed service timestamp while saving editable funeral detail fields;
- requires a returned `request_id` before writing audit history or reporting success;
- returns only curated staff-facing errors.

## Staff-Facing Behavior

The Funeral Details panel keeps the same staff-reviewed save flow. Staff still enter the deceased name, family relationship, service preferences, visitation details, committal notes, follow-up date, and related notes, then choose Save.

## Production-Safety Boundary

This slice does not:

- apply migrations;
- change operational RLS;
- access production;
- send communications;
- touch Google Calendar data;
- run exports;
- call AI;
- access storage;
- create signed URLs;
- generate certificates automatically;
- make canonical, sacramental, pastoral, or eligibility decisions;
- make public trust claims.

In particular, this route does not touch Google Calendar data.

## Why This Matters

Funeral request details are sensitive parish-scoped pastoral data. Moving the save path behind the server ensures selected-parish authorization is checked before any detail row is inserted or updated, which makes the Request Detail workflow safer for multi-parish operation.

## Verification

Covered by `lib/server/requestFuneralDetailsActiveParishMutationRoute.test.ts` and `lib/server/requestPastoralDetailsPersistence.test.ts`.

Recommended manual QA:

1. Sign in as a safe non-production staff user with access to two parishes.
2. Select Parish A.
3. Open a same-parish funeral request.
4. Save funeral details.
5. Confirm the details persist and the confirmed service timestamp, if present, is not cleared.
6. Switch to Parish B.
7. Confirm the Parish A funeral request is denied or not found.

## Follow-Up

Continue moving remaining Request Detail browser-side write paths behind staff-authenticated, active-parish-aware server routes in small slices.
