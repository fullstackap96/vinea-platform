# Parish Administration Body Size Boundary - 2026-07-09

Decision: `PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated parish administration JSON mutations now use the shared byte-bounded reader:

- Parish settings: `128 KiB`.
- Workflow-template step updates: `64 KiB`.
- Staff-access create/update commands: `16 KiB`.

Covered routes:

- `app/api/parish/settings/route.ts` (`PATCH`)
- `app/api/parish/workflow-templates/route.ts` (`PATCH`)
- `app/api/parish/staff-users/route.ts` (`POST` and `PATCH`)

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Active-parish membership/write context remains before parish-scoped reads and writes.
- Existing admin-only staff-management checks remain before staff-access changes.
- Existing field normalization and validation remain unchanged for valid bodies.
- Safe audit metadata remains after successful operational writes.

Malformed bodies keep generic route-specific `400` responses. Oversized bodies receive a generic `413` response.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not resolve staff write parish context.
- Rejected bodies do not read or mutate parish, workflow-template, or staff-access rows.
- Rejected bodies do not write audit events.
- No parish directory, staff email, workflow content, row id, audit payload, or credential is returned or logged by the boundary.

## No-Go Boundary

This change does not access production, apply migrations, change operational RLS, alter active-parish or admin permissions, enable automation or production flags, send communications, call external providers or AI, or approve public trust claims.
