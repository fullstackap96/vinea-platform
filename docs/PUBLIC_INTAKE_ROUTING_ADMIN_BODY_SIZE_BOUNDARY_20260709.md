# Public Intake Routing Admin Body Size Boundary - 2026-07-09

Decision: `PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated public-intake routing metadata `POST` and `PATCH` commands now use the shared bounded JSON reader with a `32 KiB` ceiling.

The covered staff-only commands create or update routing domains and one-time-visible routing tokens. Runtime public intake routing remains disabled by default and unchanged.

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Active-parish membership/write context remains before domain or token reads and writes.
- Token normalization, one-time raw token visibility, hash-only persistence, activation, and expiration behavior remain unchanged for valid commands.
- Domain normalization, DNS TXT verification, activation, and audit behavior remain unchanged for valid commands.

Malformed bodies keep the generic existing `400` response. Oversized bodies receive a generic `413` response.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not resolve active-parish write scope.
- Rejected bodies do not generate or hash tokens.
- Rejected bodies do not perform DNS verification.
- Rejected bodies do not read or mutate routing rows and do not write audit events.
- No raw token, token hash, DNS value, parish/domain id, audit payload, or credential is returned or logged by the boundary.

## No-Go Boundary

This change does not wire or enable runtime public intake routing, access production, apply migrations, change operational RLS, alter staff permissions, mutate public intake submissions, call AI, send communications, or approve public trust claims.
