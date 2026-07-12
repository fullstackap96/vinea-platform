# Reports Abortable Response Boundary - 2026-07-11

Status: `REPORTS_ABORTABLE_RESPONSE_IMPLEMENTED_20260711`

## What Changed

- Every selected-parish Reports load owns an abort controller.
- Parish changes and unmount cancel the outgoing request.
- Expected cancellation stays quiet and cannot settle stale metrics or errors.
- The client validates the complete Reports success/failure contract before rendering.
- Request totals and type breakdowns must satisfy arithmetic invariants.
- Parish insights require valid non-negative counts and ages.
- Staff workload rows require valid display labels and non-negative operational counts.
- Malformed data fails closed to the existing Reports unavailable state.
- Curated soft parish-scope guidance remains distinct from a true fetch failure.

## Plain-English Result

Reports will not display polished but internally impossible numbers. When staff switch parishes, the old analytics request is cancelled, and only a complete validated summary can reach the screen.

## Preserved Boundaries

- Existing staff authentication and exact selected-parish Reports API authorization remain authoritative.
- Reports remain read-only.
- No record mutation occurred.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication, provider, Calendar, AI, export, storage, or signed-URL action occurred.

## Rollback

Revert the parser and AbortController wiring. No schema, data, environment, or feature-flag rollback is required.
