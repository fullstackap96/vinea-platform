# Care Calendar And Intake Intention Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

The selected-parish Parish Care Calendar and Intake Queue now load Mass Intention data through separate minimal operational contracts instead of wildcard rows.

## Implemented Boundary

- Calendar receives only id, requester, intention text, requested/assigned dates, assigned priest label, and fulfillment state.
- Intake receives only id, requester, assigned date, assigned priest label, stipend state, fulfillment state, and creation time.
- Calendar no longer receives stipend state, notes, parish ids, or creation/update metadata.
- Intake no longer receives intention text, requested date, notes, parish ids, or update metadata.
- Both loaders retain staff authentication, selected active-parish resolution, same-parish filtering, shared explicit request loading, ordering, safe warnings, and existing read-only DTO behavior.
- Intake quick-triage APIs and Calendar links/actions are unchanged.

## Verification

- Five focused loader, selected-parish UI, and domain test files passed with 17 tests.
- Tests assert each exact projection and reject wildcard selection and fields forbidden from that operating surface.
- TypeScript verification passed with separate Calendar and Intake Mass Intention source contracts.

## Safety And Rollback

- No production environment, database mutation, migration, RLS change, Google Calendar call, communication, or external service was used.
- Rollback is code-only by restoring the prior loader projections and source types.
- Synthetic non-production browser QA should confirm Calendar dates/labels, Intake priority/missing-info cues, parish switching, and safe quick-triage defaults before deployment evidence is claimed.

## Production Boundary

This data-minimization control does not approve production RLS, Google Calendar changes, automated triage, exports, or public trust claims.
