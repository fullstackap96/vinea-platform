# Production Monitoring Safe Event Contract

Date: 2026-07-06

Status: Implemented as a non-runtime production-readiness hardening slice. This does not enable production monitoring, add production flags, wire a monitoring vendor, send external events, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Purpose

Future production monitoring needs a safe payload shape before any provider is connected. This slice strengthens `lib/observabilityEvent.ts` so future monitoring code has a single DTO contract for label-only, redacted, staff-safe events.

## What Changed

- `buildObservabilityEvent` now includes explicit negative storage flags for provider payloads, signed URLs, storage paths, document payloads, raw exports, original filenames, and family portal token material.
- `redactObservabilityText` now redacts sensitive free-form key/value payloads before any future external send, including plain and encoded token parameters, signed URL markers, storage paths, original filenames, raw AI prompt/output markers, provider payload markers, bearer tokens, API-key-shaped values, JSON-style sensitive fields, and AWS signed URL signature parameters. For production-monitoring safety, sensitive key/value patterns collapse sensitive key names to generic labels instead of preserving field names such as raw prompt, provider payload, storage path, signed URL, or original filename.
- The safe event now includes `monitoringSafety` fields proving external delivery is not self-approved, customer communication is not automatic, forbidden payload checks are required, and rollback must remain possible by disabling flags.
- Added `assertNoForbiddenObservabilityPayload` and `assertNoForbiddenProductionMonitoringPayload` helpers for future runtime code to call before any external send.
- Added focused unit coverage for redacted document-portal/export/AI-style payloads and forged unsafe monitoring events.

## Safety Boundary

This is not runtime monitoring. There is no provider adapter, no network delivery, no alerting, no paging, no customer communication, and no production smoke.

Production monitoring remains `NO-GO` until all of the following are approved and evidenced:

- Completed owner/support intake.
- Completed non-production redaction smoke.
- Production-safe smoke fixtures.
- Rollback owner and monitoring owner approval.
- Source-level runtime preflight pass.
- Product owner approval for production smoke and later production enablement.

## What Changed Plain English

Vinea now has a stricter "safe envelope" for future error monitoring. If monitoring is approved later, engineers have a tested format that says what can be included, what must never be included, and that the event itself cannot approve sending data outside Vinea.

## Manual Testing Needed

No browser testing is needed for this non-runtime slice. Future monitoring smoke should use the prepared production monitoring smoke evidence template and verify that no emails, tokens, database URLs, private document details, AI prompts/outputs, raw exports, signed URLs, storage paths, original filenames, or customer communication controls are exposed externally.
