# Staff Email Send Single-Flight Boundary

Decision: `STAFF_EMAIL_SEND_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without sending email or calling the provider.

## Protected Callers

- Request Detail email composer
- Daily Work Hub follow-up email action

Each caller now acquires a synchronous browser lock after local validation and before calling `/api/email/send`. A rapid repeat click cannot dispatch a second provider request before React renders its disabled state. Locks release in the existing `finally` paths after transport failure, malformed confirmation, post-send logging failure, or complete success.

Request Detail freezes subject, body, template selection, and template application controls during delivery. This keeps the visible composer aligned with the exact staff-reviewed subject/body snapshot sent to the request-bound route.

## Preserved Delivery Stages

The secure route still requires `requestId`, authenticated staff, selected active-parish membership, same-parish request ownership, and the recipient derived from the stored request/parishioner relationship. Subject and body remain staff-entered. Provider behavior and provider-message-id confirmation are unchanged.

Both callers still confirm transport before writing the communication history through the active-parish communications API. Existing partial-success guidance continues to distinguish delivery failure, malformed delivery confirmation, communication-log failure after delivery, request-summary failure after logging, and complete success.

## Boundary

This prevents immediate duplicate sends from one mounted browser caller. It is not provider-level idempotency, durable server idempotency, cross-tab/device replay protection, or a guarantee against retry by external infrastructure. Stronger delivery idempotency requires provider capability and a separately reviewed durable key/retention design.

Email remains staff-reviewed; no automation or outbound schedule is enabled.

No production or shared-QA access, email send, provider call, communication mutation, credential use, migration, operational RLS change, production-sensitive flag change, AI call, export, storage access, Calendar call, or public trust claim occurred.

## Verification

`lib/server/staffEmailSendSingleFlightBoundary.test.ts` locks acquisition before provider dispatch in both callers, release paths, frozen Request Detail composer controls, request-bound payloads, and transport-confirmation ordering before communication logging. Existing email route and partial-success suites continue to cover authorization, recipient derivation, safe failures, provider confirmation, and logging stages.
