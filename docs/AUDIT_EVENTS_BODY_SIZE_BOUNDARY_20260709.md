# Audit Events Body Size Boundary - 2026-07-09

Decision: `AUDIT_EVENTS_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated `POST /api/audit-events` requests now use the shared bounded JSON reader with a `64 KiB` ceiling.

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Required action, target type, and target id validation remains before operational work.
- Non-request audit targets still require a parish admin.
- Request-target parish attribution and active-parish matching remain unchanged.
- Safe audit writing remains after successful scope resolution.

Malformed bodies keep the generic existing `400` response. Oversized bodies receive a generic `413` response.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not resolve active-parish or request-parish ownership.
- Rejected bodies do not resolve request parish ownership or write audit events.
- No staff identity, parish/request id, action metadata, private request content, or credential is returned or logged by the boundary.

## No-Go Boundary

This boundary does not change which audit actions or target types staff may submit. It does not access production, apply migrations, change operational RLS, mutate any non-audit record, enable production flags, call external providers or AI, or approve public trust claims.
