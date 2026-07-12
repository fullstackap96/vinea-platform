# Daily Operating Signals Active-Parish Fail-Closed Boundary

Date: 2026-07-10

Status: Implemented and locally verified.

## Scope

The Daily Work Hub derives duplicate, sacramental-record, certificate-readiness, Parish Health Score, reminder-preview, and handoff signals from read-only staff data. These supporting queries now require the server-validated active parish id supplied to the dashboard page.

## Behavior

- People, household, sacramental-record, and certificate-event queries always include the selected parish id.
- If active parish context is unavailable, the loader returns empty signals before issuing any of those reads.
- Staff receive a generic refresh-oriented warning instead of a blended multi-parish result.
- Existing request loading, staff-reviewed controls, and operational RLS are unchanged.

## Safety Boundary

- No records are mutated.
- No communication, AI, export, storage, Calendar, or external provider is called.
- No production feature flag is introduced or enabled.
- No production environment, migration, or operational RLS policy is accessed or changed.

## Verification

`lib/server/dashboardDailyOperatingSignalsActiveParishScope.test.ts` proves the fail-closed guard precedes table reads, every supporting query is parish-filtered, and the prior conditional unfiltered branch is absent.
