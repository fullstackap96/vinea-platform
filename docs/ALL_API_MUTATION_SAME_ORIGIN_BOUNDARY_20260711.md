# All API Mutation Same-Origin Boundary - 2026-07-11

Decision: `ALL_API_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Boundary

Every side-effecting App Router API handler (`POST`, `PATCH`, `PUT`, or `DELETE`) now rejects an untrusted browser origin before privileged work.

The final first-party routes brought inside this boundary are:

- public intake;
- demo request submission;
- request notification delivery; and
- family-portal document upload.

For these routes, origin rejection occurs before rate limiting, body or form parsing, token lookup, database access, storage, or provider work. Existing durable rate limiting remains before body parsing for accepted same-origin requests.

A repository-wide discovery guard inventories every current mutation handler and fails when a future handler omits the guard or performs privileged work first. Focused runtime tests verify generic `403` responses without constructing service clients, resolving family route parameters, accessing storage, or contacting an email provider.

## Product Boundary

These are first-party Vinea browser workflows. This change does not introduce a public cross-origin integration API. Any future webhook, native client, or partner API requires a separate authenticated design rather than weakening this browser boundary.

## Verification Boundary

- No production access.
- No request submission, demo lead, notification, upload, database write, storage operation, audit write, or provider call.
- No migration or operational RLS change.
- No production-sensitive flag change or public trust claim.

Rollback is limited to the four guard calls and this regression documentation/test coverage.
