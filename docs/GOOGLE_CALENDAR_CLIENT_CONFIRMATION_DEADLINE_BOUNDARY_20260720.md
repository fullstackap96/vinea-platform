# Google Calendar Client Confirmation Deadline Boundary - 2026-07-20

Completion marker: `GOOGLE_CALENDAR_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

Request Detail Google Calendar create, update, and delete operations now settle within a finite browser confirmation window. If the browser cannot confirm the outcome, if the server reports a failure after the provider mutation began, or if the confirmed result cannot be refreshed into the request, Vinea requires staff to refresh and review before another Calendar mutation.

## Implemented Boundary

- Browser confirmation deadline: `25` seconds.
- Existing Google provider deadline: `15` seconds.
- Create, update, delete, and conflict-override create share the existing synchronous single-flight lock.
- Server responses set only a safe `requiresRefresh` marker after a provider mutation starts or when provider success cannot be persisted to the request.
- Ambiguous browser failures and failed post-success request refresh disable every Calendar mutation control until the route changes or staff refresh the page.
- Validation, authorization, integration, and conflict responses that occur before provider mutation remain ordinary confirmed responses.
- Existing deterministic create identity, provider recovery, active-parish ownership, selected-parish integration, safe OAuth wording, and audit behavior remain authoritative.
- No browser or server path automatically replays a Calendar mutation.

## Source Identity

- Implementation commit: `10888255f20611dabc051aae0f9cd15750dd22ad`
- Tracked-head aggregate SHA-256: `35E2C1DE34877B5186F7BD45CCED994C150AD93C87EFBD995A0B928F4D4B37B6`
- Tracked source files: `1498`
- Working-tree aggregate SHA-256: `9C37D7E2B7787ACD96D1769EA19F2392881B7F45D4E9DB23F06E9A0D5CDF5DCF`
- Working source files: `1502` (`1498` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused Calendar, authorization, same-origin, audit, conflict, dialog, safe-message, and deadline suite: `12` files / `81` tests passed.
- Compatibility/source-bound follow-up: `3` files / `12` tests passed.
- Complete release-readiness contract: `15 / 15` checks passed in `345` seconds.
- Repository secret scan: `2887` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Repository lint passed.
- Full Vitest suite: `856` files / `3677` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation source-bound suite: `14` files / `89` tests passed.
- Post-documentation secret scan: `2888` text files scanned, `500` binaries skipped, `0` findings.

The first release attempt stopped at dependency audit because sandbox networking was unavailable. The authorized rerun then stopped at the environment gate because eight prior non-production AI QA variables were present. A child-only clean environment cleared those variables without changing saved configuration. The next run failed closed on the prior source aggregate and the previous Calendar safe-message source expectation. Those evidence contracts were updated to the stronger refresh-first behavior before the successful complete rerun.

## Safety Boundary

This work did not call Google, access production, mutate a request or Calendar event, apply a migration, change RLS, enable a feature flag, send a communication, run an export, access storage, call AI, generate a certificate, or make a public trust claim. Live browser/provider confirmation-loss behavior remains rollout evidence, not a local-test claim.
