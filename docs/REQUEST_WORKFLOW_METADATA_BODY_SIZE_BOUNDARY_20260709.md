# Request Workflow Metadata Body Size Boundary - 2026-07-09

Decision: `REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated checklist-item updates and request-document review updates now use the shared bounded JSON reader with a `32 KiB` ceiling.

Covered routes:

- `app/api/requests/[id]/checklist-items/[itemId]/route.ts`
- `app/api/requests/[id]/documents/[documentId]/route.ts` (`PATCH` only)

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Active-parish request ownership remains before operational reads and writes.
- Checklist item ownership remains constrained by both item id and the scoped request id.
- Document review remains constrained by parish id, request id, and document id.
- Safe audit metadata is written only after a successful scoped document review update.

Malformed bodies keep generic route-specific `400` responses. Oversized bodies receive a generic `413` response.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not read or update checklist items or request documents.
- Rejected bodies do not write audit events or access storage.
- No request id, parish id, document metadata, reviewer note, filename, storage path, signed URL, or credential is returned or logged by the boundary.

## No-Go Boundary

This change does not access production, apply migrations, change operational RLS, alter document storage/download behavior, generate signed URLs during verification, enable automation, send communications, call AI, or approve public trust claims.
