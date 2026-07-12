# Public Intake Network Recovery And Status Accessibility - 2026-07-11

Decision: `PUBLIC_INTAKE_NETWORK_RECOVERY_AND_STATUS_IMPLEMENTED_20260711`

Status: Implemented for Baptism, Wedding, Funeral, OCIA, and Join Parish without submitting forms or changing server behavior.

## Reliability Fix

All five forms now call `submitPublicIntake(...)`, one shared client helper that:

- posts the unchanged JSON payload to `/api/intake`;
- accepts success only when the response is successful and contains a non-empty request id;
- preserves allowlisted public validation guidance;
- converts network rejection, malformed JSON, unexpected errors, and missing request ids into the existing generic family-safe recovery message; and
- always resolves to a typed result instead of throwing into a form and leaving its loading state stuck.

Request notification remains best-effort only after confirmed intake creation. Notification failure still does not tell a family that the already-created request failed.

## Accessible Status Boundary

Each form exposes an accessible name and `aria-busy` during submission. Validation and submission failures use an assertive `alert`; successful creation uses a polite `status`. The existing green success and amber recovery styling now share the same centralized success/error classification.

## Preserved Boundaries

- Intake payload field names and values are unchanged.
- Runtime public parish routing and legacy fallback behavior are unchanged.
- Durable rate limiting, body-size limits, same-origin protection, persistence confirmation, and compensating cleanup remain server-owned and unchanged.
- No production/shared-QA access, form submission, request creation, notification, provider call, migration, operational RLS change, or production-sensitive flag occurred.

## Verification

Focused tests cover confirmed request ids, payload preservation, allowlisted validation guidance, network rejection, malformed responses, missing ids, shared status classification, five-page source wiring, autofill, accessible names, busy state, and error/success announcements.
