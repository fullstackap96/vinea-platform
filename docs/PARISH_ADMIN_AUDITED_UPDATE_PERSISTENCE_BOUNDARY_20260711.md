# Parish Admin Audited Update Persistence Boundary - 2026-07-11

Decision: `PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and locally verified.

## Scope

Parish Settings and Public Intake Routing metadata updates now select the minimal persisted parish id and require a matched row before returning success or writing their route-owned audit events.

Both routes retain staff authentication, selected active-parish membership, write-scope resolution, validation, safe errors, audit metadata, and their existing primary-parish compatibility behavior only when no active parish cookie exists.

## Failure Boundary

If the authorized parish disappears between scope resolution or lookup and the final update, the routes return safe not-found/update guidance and write no false `parish_settings.updated` or `public_intake_routing.updated` event.

Public intake runtime routing remains separately gated and unchanged. This boundary changes only staff-reviewed metadata persistence confirmation.

## Preserved Boundaries

- No production access.
- No real parish settings or routing metadata mutation during verification.
- No migration or operational RLS change.
- No public intake runtime flag change.
- No communication, AI, Calendar, export, storage, signed URL, or certificate action.
- No public trust claim.
