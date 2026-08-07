# Demo Request Client Confirmation Deadline Boundary

Completion marker: `DEMO_REQUEST_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_IMPLEMENTED_20260720`

## Visitor Outcome

The public Schedule Demo form no longer waits indefinitely after a visitor submits it. Browser confirmation now has a 20-second deadline, longer than the server's existing 12-second email-provider deadline. If confirmation is lost, the form explains that the outcome is uncertain and asks the visitor to retry once without changing the form or contact Vinea directly.

All reviewed fields are frozen while the request is unresolved, so the visible form cannot drift away from the submitted payload.

## Preserved Boundaries

- The synchronous in-flight lock still permits only one browser request at a time.
- An unchanged reviewed payload retains the same opaque UUID delivery attempt for a safe provider-idempotent retry; changing the payload creates a new attempt.
- Only confirmed success clears the delivery attempt and form fields.
- Unmount aborts obsolete browser work and suppresses its settlement.
- Ordinary failures still pass through the public client-message allowlist.
- Same-origin rejection, durable rate limiting before bounded parsing, server validation, the Resend idempotency key, the 12-second provider deadline, and mandatory provider message-id confirmation remain authoritative.

This slice sends no demo request during verification and changes no recipient, sender, email content, provider configuration, production flag, migration, RLS policy, export, storage behavior, or public trust claim. It does not access production.

## Verified Identity

- Immutable implementation commit: `3f34153d99bcb90fe659fd08fadc4753aa034e18`
- Tracked-head aggregate SHA-256: `44988A2FE5E122391718249761BACAF6784FBEBF8F0CC22D0832E87553F19587`
- Committed release-source files: `1484`
- Production approval granted: `NO`

Focused client deadline, accessibility, native-form, safe-message, same-origin, route-error, and provider-delivery coverage passed `8` files / `32` tests before immutable source binding. The source-bound suite then passed `9` files / `38` tests. The isolated complete `15`-check release contract passed in `350.8` seconds with zero secret findings across `2,864` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `846` test files / `3,623` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Remove the client AbortController, confirmation timer, unmount cleanup, unconfirmed message, and `disabled={loading}` field controls. Restore the prior direct browser fetch and ordinary catch message. Server idempotency, rate limiting, provider delivery, and all external state remain unchanged.
