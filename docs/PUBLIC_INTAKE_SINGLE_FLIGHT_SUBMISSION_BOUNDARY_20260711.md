# Public Intake Single-Flight Submission Boundary

Status: Implemented and verified locally on 2026-07-11.

Baptism, Wedding, Funeral, OCIA, and Join Parish forms now acquire a synchronous browser lock before request creation. A same-page rapid repeat tap or submit event returns before a second `/api/intake` request can be dispatched, including the brief interval before React paints the existing disabled button.

The lock covers request creation and the existing best-effort staff notification attempt. Every current validation, failure, and success exit releases the lock through the shared per-form `finishSubmission` helper. Existing form `aria-busy`, disabled controls, curated errors, success guidance, payloads, server validation, durable rate limiting, cleanup, and notification behavior remain unchanged.

## Conservative Boundary

This is not durable server idempotency. It prevents duplicate dispatch from one mounted form instance, but does not deduplicate separate tabs, browser retries after an uncertain network response, or two different devices. A future durable idempotency design would require separately reviewed server persistence and likely a schema migration.

## Safety Boundary

No production access, public request submission, notification send, record mutation, migration, operational RLS change, parish-routing enablement, provider call, communication, storage access, export, AI call, sensitive flag change, or public trust claim occurred during implementation or verification.
