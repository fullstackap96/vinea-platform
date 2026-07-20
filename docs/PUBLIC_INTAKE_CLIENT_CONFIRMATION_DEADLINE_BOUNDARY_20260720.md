# Public Intake Client Confirmation Deadline Boundary

Completion marker: `PUBLIC_INTAKE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## Family Outcome

Baptism, Wedding, Funeral, OCIA, and Join Parish submissions no longer wait indefinitely for browser confirmation. The shared submission client now stops waiting after 60 seconds and explains that the result could not be confirmed. The family may retry once without changing the form or contact the parish office.

All reviewed controls are disabled while confirmation is pending. This keeps the visible form aligned with the payload and opaque attempt identifier already sent to the server.

## Preserved Recovery And Safety Boundaries

- Each form still acquires its synchronous same-page lock before request creation.
- One unchanged reviewed payload retains the same in-memory random UUID v4 attempt after transport uncertainty.
- Changing reviewed content creates a new attempt instead of recovering a different request.
- Server recovery still requires exact request, parish, contact, and completed-audit agreement.
- Only confirmed success clears the pending attempt and form fields.
- Explicit server responses still use the public safe-message allowlist.
- Staff notification remains best-effort after confirmed stored-request success and cannot invalidate that success.
- Durable rate limiting, bounded parsing, routing gates, workflow/detail/checklist persistence, checked cleanup, and generic privacy-safe errors remain server-authoritative.

This slice submitted no form and changes no Intake route, notification route, database schema, migration, operational RLS policy, runtime routing flag, provider, external integration, export, storage behavior, AI behavior, certificate behavior, or public trust claim. It does not access production.

## Verified Identity

- Immutable implementation commit: `602caf91024fe98af52ddd6769ab2da9a0a98d92`
- Tracked-head aggregate SHA-256: `BED359B9A0E8F1489654E7CF428FA317D1041D6119B45B8B30C2D53C72D28E5C`
- Committed release-source files: `1485`
- Production approval granted: `NO`

Focused confirmation, frozen-form, retry-identity, safe-message, persistence, recovery, and native-form coverage passed `8` files / `39` tests before immutable source binding. The source-bound suite then passed `9` files / `45` tests. The isolated complete `15`-check release contract passed in `327.1` seconds with zero secret findings across `2,867` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `847` test files / `3,633` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the shared confirmation signal and unconfirmed message, remove the disabled fieldset from the five forms, and restore the prior network-error fallback. Server attempt identity, recovery, persistence, notification, authorization, and all external state remain unchanged.
