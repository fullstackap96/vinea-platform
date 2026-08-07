# Parish Settings Client Read Deadline Boundary

Completion marker: `PARISH_SETTINGS_CLIENT_READ_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## Staff Outcome

The selected-parish Settings workspace no longer waits indefinitely for parish configuration, Staff Access, recent audit activity, public-intake routing metadata, or Workflow Templates. Each current read now has a 15-second browser deadline and reaches its existing safe retry/error guidance if the server does not settle.

## Preserved Boundaries

- Each surface retains its existing latest-generation-wins sequence and AbortController.
- Parish switching, refresh replacement, and unmount invalidate the old generation before aborting it, so stale cancellation remains quiet.
- A timeout on the still-current generation is no longer suppressed merely because it uses the same AbortController; staff see the existing safe unavailable state instead of a permanent spinner.
- Shared response parsers, selected-parish response agreement, staff authentication, and active-parish membership remain authoritative.
- Workflow Template and all other Settings mutations retain their existing staff review, single-flight locking, confirmation, and server authorization behavior.

This slice adds no mutation, automatic retry, send, export, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or parish records directly.

## Verified Identity

- Immutable implementation commit: `0f0af9cdd663b84e02d375e663ec70ae7f40223d`
- Tracked-head aggregate SHA-256: `096F00926A4F42AB5F3EF2DF757ED8EA22A7053465EB1D6EDC0044C99CBB8910`
- Committed release-source files: `1483`
- Production approval granted: `NO`

Focused deadline, latest-generation, response-parser, safe-message, selected-parish, and Workflow Template coverage passed `8` files / `33` tests. The complete `15`-check local release contract passed in an isolated flag-disabled verification process in `350.1` seconds with zero secret findings across `2,862` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `845` test files / `3,617` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the two read-deadline helpers, timer creation, timer cleanup, and current-timeout settlement expectations. Restore the prior unconditional AbortError suppression. Server authorization, Settings and Workflow Template mutations, and all stored data remain unchanged.
