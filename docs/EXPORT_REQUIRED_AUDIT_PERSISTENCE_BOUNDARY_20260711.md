# Export Required Audit Persistence Boundary - 2026-07-11

Decision: `EXPORT_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally for the disabled-by-default non-production export pilots.

## Boundary

The `request_list_basic` and `request_document_manifest` routes now require the safe download audit event to be positively accepted before constructing the privileged export client, querying export rows, or returning CSV.

If required audit persistence returns `false`, each route returns generic `503` guidance and performs no export query or delivery. Denied attempts remain denied even when their best-effort denial audit is unavailable.

The export route source preflight is now version 2 and requires:

- safe audit metadata before query or delivery;
- a checked `auditWritten` result;
- generic fail-closed `503` behavior; and
- no privileged query or file delivery after audit failure.

## Preserved Boundaries

- Both pilots remain disabled by default and blocked in production.
- No staff-facing production export UI was added.
- Existing authentication, selected-parish membership, permission DTO, blocked-field, family-surface, canonical/sacramental exclusion, and safe CSV boundaries remain unchanged.
- No denied request becomes allowed because denial-audit persistence is best effort.

## Verification Boundary

- No production access or production export flag enablement.
- No export query, CSV delivery, record mutation, migration, operational RLS change, storage access, signed URL, provider call, or public trust claim.
- Rollback is limited to the two checked audit results, preflight version, tests, and documentation.
