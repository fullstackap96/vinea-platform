# Duplicate Merge Body Size Boundary - 2026-07-09

Decision: `DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated People and Household duplicate merge POST commands now use the shared bounded JSON reader with a `32 KiB` ceiling.

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Selected active-parish write context remains before entity reads and mutations.
- Existing canonical/duplicate id validation and approved field filtering remain unchanged.
- Existing parish-scoped lookups, repointing, merge behavior, deletion, and safe audit metadata remain unchanged for valid commands.

Malformed bodies keep the generic existing `400` response. Oversized bodies receive a generic `413` response.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not resolve active-parish write scope.
- Rejected bodies do not read, update, repoint, or delete People or Household records.
- Rejected bodies do not write audit events.
- No person/household id, selected field value, private contact data, audit payload, or credential is returned or logged by the boundary.

## No-Go Boundary

This change does not change merge field selection or merge semantics. It does not access production, apply migrations, change operational RLS, enable production flags, call external providers or AI, or approve public trust claims.
