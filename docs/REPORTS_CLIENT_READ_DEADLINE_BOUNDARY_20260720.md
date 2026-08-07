# Reports Client Read Deadline Boundary

Completion marker: `REPORTS_CLIENT_READ_DEADLINE_IMPLEMENTED_20260720`

## Staff Outcome

The Reports dashboard no longer waits indefinitely when its current selected-parish summary read stalls. Each read has a 15-second browser deadline and then settles through the existing unavailable-report state.

## Preserved Boundaries

- Selected-parish replacement and unmount still cancel older work quietly.
- The existing active-parish header, shared response parser, arithmetic invariants, partial-results guidance, and read-only analytics components are unchanged.
- Staff authentication and active-parish membership authorization remain server-owned.
- The client still performs only credentialed `GET /api/dashboard/reports-summary` reads.

This slice adds no mutation, send, export, download, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or report records directly.

## Verified Identity

- Immutable implementation commit: `1e7d0851965d33dff15a1615d0b59f94dc9e85c8`
- Tracked-head aggregate SHA-256: `BF64664A9F75860CC2C25122E8B7137040DAED3BBA204E8D7A52549FE45E1B7B`
- Committed release-source files: `1480`
- Production approval granted: `NO`

Focused deadline, cancellation, selected-parish, route, and loader coverage passed `5` files / `19` tests. The complete `15`-check local release contract passed in `321.9` seconds with zero secret findings across `2,856` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `842` test files / `3,603` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the read deadline constant, timer, and timer cleanup. The prior AbortController, selected-parish header, shared parser, partial-result behavior, and read-only API remain otherwise unchanged.
