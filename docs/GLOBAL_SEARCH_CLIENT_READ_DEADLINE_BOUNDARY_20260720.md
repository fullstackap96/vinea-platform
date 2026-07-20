# Global Search Client Read Deadline Boundary

Completion marker: `GLOBAL_SEARCH_CLIENT_READ_DEADLINE_IMPLEMENTED_20260720`

## Staff Outcome

Compact Global Search no longer waits indefinitely when its current server read stalls. Its existing 300-millisecond typing debounce remains separate from a 15-second network deadline; a timed-out current query settles through the existing safe unavailable state.

## Preserved Boundaries

- Query replacement and unmount still cancel pending debounce work and in-flight reads.
- Superseded cancellation remains quiet, while only the currently owned query may settle results, warnings, errors, and loading state.
- Response/query agreement, grouped DTO validation, dashboard-internal safe links, curated staff messages, staff authentication, and active-parish server scope are unchanged.
- The client still performs only credentialed `GET /api/dashboard/search` reads.

This slice adds no mutation, send, export, download, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or search records directly.

## Verified Identity

- Immutable implementation commit: `95e3991c0f4b291af5dfb06370ceb3daed59ef6c`
- Tracked-head aggregate SHA-256: `8DE4BB9673747C4FBD7836109A0B2787047B879201BB08FFA57D5F8E1B234B87`
- Committed release-source files: `1479`
- Production approval granted: `NO`

Focused deadline, cancellation, safe-message, selected-parish, and safe-link coverage passed `5` files / `20` tests. The complete `15`-check local release contract passed in `339.2` seconds with zero secret findings across `2,854` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `841` test files / `3,599` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the network deadline constant, timer, and timer cleanup. The prior debounce, AbortController, response/query agreement, parser, safe links, and read-only API behavior remain otherwise unchanged.
