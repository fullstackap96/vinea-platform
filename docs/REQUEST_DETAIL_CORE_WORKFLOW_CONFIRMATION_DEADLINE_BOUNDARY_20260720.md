# Request Detail Core Workflow Confirmation Deadline Boundary

Completion marker: `REQUEST_DETAIL_CORE_WORKFLOW_CONFIRMATION_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## Staff Outcome

Request Detail checklist, request-status, and workflow-step writes no longer wait indefinitely for browser confirmation. Each staff-reviewed write now has a 60-second confirmation deadline. If transport fails, the deadline expires, a successful checklist response omits the expected acknowledgement, or the confirmed record cannot be refreshed, Vinea explains that the result is unconfirmed and requires staff to refresh and review the request before trying another core workflow change.

The review-required state freezes status, legacy-checklist, workflow-step, and Mark complete controls for that request. Navigating to a different request clears the local lock. Vinea never replays an uncertain write automatically.

## Preserved Boundaries

- Checklist writes still use the existing authenticated, active-parish-scoped request API.
- Request-status and workflow-step writes still use the existing authenticated Server Actions.
- Existing synchronous single-flight locks remain authoritative before dispatch.
- Explicit server rejections retain their action-specific safe guidance and remain retryable.
- Staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, and safe audit behavior remain server-authoritative.
- Waiting-on, assignment, intake-detail, communication, document, calendar, AI, and certificate behavior is unchanged.

This slice executed no request mutation and changes no API route, Server Action, database schema, migration, operational RLS policy, production flag, provider, external integration, export, storage behavior, AI behavior, certificate behavior, or public trust claim. It does not access production.

## Verified Identity

- Immutable implementation commit: `e87e6b863f0cbc7c1f5b19bacce442993fd5010b`
- Tracked-head aggregate SHA-256: `8F6585E9FC44F8601F22EABBFA2387F9CA6977DFD31A1981CF8CF39061569F84`
- Committed release-source files: `1487`
- Production approval granted: `NO`

Focused confirmation, single-flight, safe-message, active-parish route, and Server Action coverage passed `7` files / `34` tests. The source-bound suite passed `8` files / `40` tests. The isolated complete `15`-check release contract passed in `393` seconds with zero secret findings across `2,870` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `849` test files / `3,644` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the Request Detail confirmation helper and refresh-required state, remove the propagated checklist/workflow/Mark complete locks, and restore the prior direct browser settlement. Existing API routes, Server Actions, authorization, persistence, audit behavior, and external state remain unchanged.
