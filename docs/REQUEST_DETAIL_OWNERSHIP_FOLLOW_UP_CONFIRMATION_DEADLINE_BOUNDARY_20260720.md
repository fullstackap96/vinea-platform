# Request Detail Ownership And Follow-Up Confirmation Deadline Boundary

Completion marker: `REQUEST_DETAIL_OWNERSHIP_FOLLOW_UP_CONFIRMATION_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## Staff Outcome

Request Detail assignment, waiting-on, follow-up date, and care-cadence shortcut writes now share a 60-second browser confirmation deadline. If transport fails, the deadline expires, or the confirmed request cannot be refreshed, Vinea keeps the reviewed inputs in place, explains that the outcome is unconfirmed, and freezes related workflow controls until staff refresh and review the request.

Explicit Server Action rejections retain their action-specific safe messages and remain retryable. Vinea does not replay an uncertain write automatically. The Request Detail loader now returns an explicit refresh result, so post-save callers cannot interpret a displayed load error as fresh data.

## Preserved Boundaries

- Existing Server Actions remain the only assignment, waiting-on, and follow-up persistence path.
- Existing synchronous single-flight locks remain authoritative before dispatch.
- Staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, and safe audit behavior remain server-authoritative.
- Staff choose every assignment, waiting-on value, and follow-up date; no automation was enabled.
- Status, checklist, workflow-step, communication, document, calendar, AI, certificate, and provider behavior is unchanged except that the earlier core-workflow boundary now consumes the explicit refresh result.

This slice executed no request mutation and changes no Server Action, API route, database schema, migration, operational RLS policy, production flag, provider, external integration, export, storage behavior, AI behavior, certificate behavior, or public trust claim. It does not access production.

## Verified Identity

- Immutable implementation commit: `e6f184b45104b2e23936bd37e07bb28c7b20b282`
- Tracked-head aggregate SHA-256: `2F18FF4EB0EAC4A4648A4728F89D3567E6325C878F2B332F161DEAA48EA1CE02`
- Committed release-source files: `1491`
- Production approval granted: `NO`

Focused confirmation-helper, ownership/follow-up, single-flight, safe-message, and core-workflow coverage passed `8` files / `44` tests. The source-bound suite passed `9` files / `50` tests. The isolated complete `15`-check release contract passed in `339.1` seconds with zero secret findings across `2,875` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `851` test files / `3,653` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the shared client confirmation helpers and ownership/follow-up refresh-required props, restore the prior void-only request-loader contract, and restore direct Server Action settlement in the four controls. Existing Server Actions, authorization, persistence, audit behavior, and external state remain unchanged.
