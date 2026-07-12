# Demo Request Single-Flight Submission Boundary

Decision: `DEMO_REQUEST_SINGLE_FLIGHT_SUBMISSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented without submitting a demo request or calling the email provider.

## Protection

The Schedule Demo form now acquires a synchronous browser in-flight lock after its required fields pass validation and before it creates the `/api/demo-request` request. A same-page rapid repeat is ignored even if React has not yet rendered the visible disabled state.

The lock is released in the existing `finally` path after success, safe route rejection, malformed response handling, or network failure, so a staff prospect can retry normally. The form retains its visible busy state, accessible announcements, curated error messages, and original payload.

## Boundary

This is immediate same-page duplicate-submit protection. It is not durable server idempotency across tabs, devices, browser retries, or repeated HTTP requests. The server's existing durable rate limit remains authoritative for abuse protection; adding durable request idempotency would require a separately reviewed persistence and retention design.

The demo-request endpoint, recipient, email content, Resend behavior, provider-message-id requirement, validation, same-origin protection, body limit, durable rate limit, and safe logging are unchanged. No production access, demo submission, provider call, migration, operational RLS change, or production-sensitive flag was used.

## Verification

`lib/server/demoRequestFormAccessibility.test.ts` locks the synchronous ref acquisition and release, acquisition before fetch, visible busy semantics, payload, autofill, and accessible status behavior. Existing demo route tests continue to cover server validation, origin protection, durable rate limiting, safe errors, and provider confirmation.
