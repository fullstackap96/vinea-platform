# Audit Log Client Read Deadline Boundary - 2026-07-20

Status: `AUDIT_LOG_CLIENT_READ_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## What Changed

- Each Audit Log load now owns an `AbortController` and a 15-second browser deadline.
- A refresh or filter change aborts the replaced read immediately.
- Unmount invalidates sequence ownership and aborts outstanding work.
- Only the latest load may settle rows, selected-parish labeling, errors, or loading state.
- A stalled current read reaches the existing curated retryable error state instead of leaving a permanent spinner.

## Safety Boundary

The surface still performs only authenticated `GET /api/audit-events` reads. Server-side staff authentication, parish-admin authorization, selected active-parish membership scope, safe response projection, and the audit client error allowlist remain authoritative.

This slice adds no writes, exports, downloads, storage access, signed URLs, production flags, migrations, RLS changes, provider calls, or public claims. It does not access production or mutate audit records.

## Rollback

Remove the per-load controller, timer, and cleanup calls. The prior last-request-wins sequence guards and read-only API behavior remain otherwise unchanged.
