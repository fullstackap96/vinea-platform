# Demo Request Form Accessibility - 2026-07-11

Decision: `DEMO_REQUEST_FORM_ACCESSIBILITY_IMPLEMENTED_20260711`

Status: Implemented without submitting a demo request or calling the email provider.

## Improvements

- Name, parish, and email use native required-field semantics in addition to the existing client and server validation.
- Name, parish, email, and role/title use exact browser autofill tokens; the optional free-text message opts out of unrelated autofill.
- The form exposes a stable accessible name and announces its busy state during submission.
- Public validation, route, network, and provider failures use an assertive alert with the existing curated safe message.
- Successful submission retains the quieter polite status announcement.

## Preserved Boundaries

The `/api/demo-request` destination, JSON payload, durable rate limit, body-size limit, same-origin guard, server validation, Resend provider behavior, provider-message-id requirement, safe logging, and public response allowlist are unchanged. No production environment, provider, database, migration, operational RLS, or production-sensitive flag was accessed or changed.

## Verification

`lib/server/demoRequestFormAccessibility.test.ts` locks required/autofill semantics, busy and status announcements, failure styling, the existing endpoint and payload, and duplicate-submit prevention. Existing demo client-safe-message and route tests continue to cover public error redaction and provider behavior.

A local optimized-production rendered-page smoke returned `200` for `/`, confirmed the form accessible name, idle busy state, native required semantics, role autofill, and message no-autofill attributes in the response HTML, and found no framework error marker. The server was stopped after inspection. No form was submitted and no provider was called. This is rendered-page evidence, not interactive cross-browser or delivery evidence.
