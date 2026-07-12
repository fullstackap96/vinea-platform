# Request Audited Update Persistence Regression Boundary - 2026-07-11

Decision: `REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented as a source-level production-readiness guard.

## Scope

The guard inventories all 11 single-row audited request mutation routes. Each route must use an explicit update projection, complete with `.single()` or `.maybeSingle()`, and provide positive persistence confirmation before route-owned audit history.

Covered staff actions include checklist review, document review, intake triage, confirmed Baptism/Funeral/Wedding/OCIA scheduling, reply drafts, staff notes, saved AI summaries, and suggested dates.

The multi-stage care-touchpoint, communications, and mark-as-contacted routes remain covered by their dedicated runtime and partial-success tests because their ordered writes require more specific assertions.

## Failure Boundary

If a future audited request update omits returned-row confirmation, moves its audit before confirmation, or adds an unreviewed audited update route, the standard Vitest suite fails. This prevents a successful zero-row response from creating false staff success or audit history.

This guard does not replace route-specific authorization or validation tests. Authentication, selected active-parish membership, same-parish request ownership, same-origin enforcement, field allowlists, body limits, safe errors, audit metadata privacy, and partial-success behavior remain independently tested.

## Preserved Boundaries

- No production access.
- No database write or real record mutation during verification.
- No migration or operational RLS change.
- No communication, AI, Google Calendar, export, storage, signed URL, or certificate action.
- No production-sensitive flag enabled and no public trust claim made.
