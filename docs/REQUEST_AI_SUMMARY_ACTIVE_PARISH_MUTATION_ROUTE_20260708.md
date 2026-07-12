# Request AI Summary Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice.

## What Changed

Request Detail AI summary persistence now goes through `app/api/requests/[id]/ai-summary/route.ts` instead of updating `requests.ai_summary` directly from the browser.

The route:

- requires an authenticated staff session;
- reads the selected active parish cookie;
- uses the request detail access loader with explicit primary-parish fallback only when no active parish cookie exists;
- verifies request ownership within the selected parish scope before saving;
- updates only `requests.ai_summary`;
- returns only curated staff-facing errors.

## Staff-Facing Behavior

The staff summary generation flow remains staff-reviewed. The existing `/api/ai/summary` route still performs generation. This slice only moves the final save step behind server-side parish authorization.

## Production-Safety Boundary

This slice does not:

- call OpenAI or change AI generation behavior;
- expose AI output to family-facing surfaces;
- write audit events;
- apply migrations;
- change operational RLS;
- access production;
- send communications;
- touch Google Calendar data;
- run exports;
- access storage;
- create signed URLs;
- generate certificates automatically;
- make canonical, sacramental, pastoral, or eligibility decisions;
- make public trust claims.

In particular, this route does not call OpenAI.

## Why This Matters

AI summary text is staff-facing operational data tied to a specific parish request. Moving the save path behind the server ensures selected-parish authorization is checked before the summary is stored.

## Verification

Covered by `lib/server/requestAiSummaryActiveParishMutationRoute.test.ts`.

Recommended manual QA:

1. Sign in as a safe non-production staff user with access to two parishes.
2. Select Parish A.
3. Open a same-parish request.
4. Generate a staff-reviewed AI summary.
5. Confirm the summary appears and persists after refresh.
6. Switch to Parish B.
7. Confirm the Parish A request is denied or not found.

## Follow-Up

Continue moving remaining Request Detail communication logging writes behind staff-authenticated, active-parish-aware server routes in small slices.

## Completion Integrity

The update selects the minimal persisted request id and returns generic not-found guidance when no row matched. Vinea records the summary audit event only after positive persistence confirmation, so a disappearing request cannot produce a false saved-summary event. This route still does not call OpenAI or make decisions.
