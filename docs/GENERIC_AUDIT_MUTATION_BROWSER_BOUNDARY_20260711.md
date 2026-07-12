# Generic Audit Mutation Browser Boundary - 2026-07-11

Decision: `GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented as a no-runtime-change regression boundary.

## Current State

Repository discovery confirms **no current Client Component posts** to `/api/audit-events`. The Audit Log, Request Detail activity panel, and Parish Settings use the endpoint only for authenticated reads. Current workflow events are written by their owning server routes or Server Actions.

The compatibility POST remains constrained as follows:

- same-origin rejection occurs before staff authentication;
- request-target events remain route-owned and are rejected by the generic endpoint;
- selected active parish scope is resolved before any write;
- a selected-parish administrator check is required for every accepted non-request event; and
- the audit write occurs only after those checks.

## Regression Guard

The repository test scans Client Components and fails if browser code introduces a POST dependency on the generic endpoint. It also locks the current origin, authentication, request-target denial, tenant-scope, administrator, and write ordering.

## Remaining Owner Decision

The generic POST has no current first-party browser caller. Fully removing it or replacing its open action/metadata shape with a server-owned allowlist would reduce attack surface further, but that is a compatibility and permissions decision. It requires owner approval before removal or narrowing so an undocumented integration is not broken silently.

## Preserved Boundaries

- No production access.
- No audit event, record, or metadata mutation.
- No migration or operational RLS change.
- No provider, communication, Calendar, AI, export, storage, signed URL, or certificate action.
- No production-sensitive flag change.

Rollback is test/docs-only and does not affect runtime behavior or data.
