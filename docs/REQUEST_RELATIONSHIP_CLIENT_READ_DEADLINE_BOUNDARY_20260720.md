# Request Relationship Client Read Deadline Boundary

Completion marker: `REQUEST_RELATIONSHIP_CLIENT_READ_DEADLINE_IMPLEMENTED_20260720`

## Staff Outcome

Request Detail no longer waits indefinitely while checking People-directory links or suggested person and household connections. Both read-only relationship panels now give the current parish-scoped read 15 seconds before settling into their existing unavailable guidance.

## Preserved Boundaries

- Request replacement and unmount still abort obsolete reads quietly.
- A timeout on the still-current request is distinct from superseded cancellation, so loading cannot remain stuck merely because the shared AbortController was used for the deadline.
- Link/create actions remain blocked unless the People-directory lookup reached confirmed `ready` state.
- Safe person and household links, staff authentication, active-parish membership, same-parish request ownership, and server-side projection remain unchanged.
- Both clients still perform only credentialed `GET /api/requests/[id]/relationship-suggestions` reads.

This slice adds no relationship mutation, automatic link, send, export, download, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or request records directly.

## Verified Identity

- Immutable implementation commit: `6515b931bcc5ec1ee0bb0da6b3483b56788aff57`
- Tracked-head aggregate SHA-256: `D7DE9F4F31FEE2C8393DDDACA5F073A86AD37C30A07AB38B000335BD2FB8121A`
- Committed release-source files: `1481`
- Production approval granted: `NO`

Focused deadline, fail-closed, selected-parish, and safe-link coverage passed `6` files / `21` tests. The complete `15`-check local release contract passed in `358.8` seconds with zero secret findings across `2,858` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `843` test files / `3,607` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the two deadline constants, timers, and timer cleanup, then restore the prior `controller.signal.aborted` settlement guards. Server authorization, projection, link/create actions, and all data remain unchanged.
