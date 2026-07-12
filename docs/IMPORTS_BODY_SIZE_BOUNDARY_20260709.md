# Imports Body Size Boundary - 2026-07-09

Decision: `IMPORTS_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Scope

Authenticated import preview and commit POST requests now use the shared bounded JSON reader with a `4 MiB` ceiling.

Existing maximum rows per request: `1,000`.

Existing normalized maximum per cell value: `2,000 characters`.

The ceiling leaves room for the existing supported batch while requiring unusually large spreadsheets to be split into smaller, reviewable batches.

## Preserved Safety Order

- Staff authentication remains before bounded parsing.
- Import kind, row presence, and existing normalization remain before operational work.
- Preview requests remain selected-active-parish read scoped.
- Committed imports remain selected-active-parish write scoped with explicit legacy fallback only when no active parish cookie exists.
- Preview-before-save behavior, batch history, and post-commit safe audit metadata remain unchanged for valid requests.

Malformed bodies keep the generic existing `400` response. Oversized bodies receive a generic `413` response with staff guidance to split the spreadsheet.

## Rejected-Body Boundary

- Rejected bodies do not create a service-role client.
- Rejected bodies do not resolve active-parish read or write scope.
- Rejected bodies do not load existing rows, create previews, insert records, record batches, or write audit events.
- No spreadsheet row, filename, parish/staff identity, private contact data, audit payload, or credential is returned or logged by the boundary.

## No-Go Boundary

This change does not expand supported row counts or fields, access production, apply migrations, change operational RLS, enable production flags, run a real import, call external providers or AI, or approve public trust claims.
