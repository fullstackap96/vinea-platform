# Daily Work Hub Operational Detail Projection - 2026-07-10

Decision: `DAILY_WORK_HUB_OPERATIONAL_DETAIL_PROJECTION_IMPLEMENTED_20260710`

Status: Implemented and verified without accessing production or mutating records.

## Change

Daily Work Hub request enrichment previously used `select('*')` for funeral, wedding, and OCIA detail rows. Those selected-parish, request-id-scoped queries now request only fields consumed by the dashboard, care-plan builder, workflow cues, and existing staff-reviewed follow-up draft builder.

## Why It Matters

- Smaller payloads reduce unnecessary browser work on the staff morning screen.
- Explicit projections make future private or canonical fields opt-in instead of silently exposing them to the dashboard bundle.
- The selected-parish/request-id lookup shape and all existing staff behavior remain unchanged.
- The change is easy to review because the allowed fields are visible in source and guarded by tests.

## Preserved Boundaries

- No query became broader.
- Every detail query remains limited to request ids from the already selected-parish request result.
- No mutation, communication, AI call, Calendar call, export, storage access, signed URL, certificate generation, migration, operational RLS change, production access, production-sensitive flag, or public trust claim occurred.

## Verification

`lib/server/dashboardOperationalDetailProjection.test.ts` rejects a return to wildcard detail projections and requires the explicit funeral, wedding, and OCIA field sets plus request-id scoping.

Manual non-production browser QA should confirm funeral, wedding, and OCIA names, schedule cues, care plans, and staff-reviewed draft inputs still render with representative synthetic requests.
