# Notifications Center Client Read Deadline Boundary

Completion marker: `NOTIFICATIONS_CENTER_CLIENT_READ_DEADLINE_IMPLEMENTED_20260720`

## Staff Outcome

Notifications Center no longer waits indefinitely when its current dashboard read stalls. Each load has a 15-second browser deadline and then settles through the existing safe retryable error state.

## Preserved Boundaries

- Replacement and selected-parish remount still abort older work.
- The existing sequence owner still prevents stale rows, badges, errors, or loading completion from settling beneath a newer read.
- Response DTO validation, dashboard-internal safe links, curated client messages, staff authentication, and active-parish membership scope are unchanged.
- The client still performs only credentialed `GET /api/dashboard/notifications` reads.

This slice adds no mutation, send, export, download, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or notification records directly.

## Verified Identity

- Immutable implementation commit: `835e7004d982d6137ffa7f0c4ce82f4dc5924d67`
- Tracked-head aggregate SHA-256: `76390841AFD500F790D4A0246BF063D5705F0C951F016F51CF462735B84209B9`
- Committed release-source files: `1478`
- Production approval granted: `NO`

Focused deadline, latest-response, safe-message, selected-parish, and safe-link coverage passed `5` files / `19` tests. The complete `15`-check local release contract passed in `384.2` seconds with zero secret findings across `2,852` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `840` test files / `3,595` tests, and the credential-free Next.js 16.2.10 `56`-page build. The first focused Vitest launch was blocked before config load by the Windows sandbox; the authorized rerun executed the suite successfully.

## Rollback

Remove the deadline constant, timer, and timer cleanup. The prior AbortController, sequence ownership, selected-parish remount cancellation, safe parser, and read-only API behavior remain otherwise unchanged.
