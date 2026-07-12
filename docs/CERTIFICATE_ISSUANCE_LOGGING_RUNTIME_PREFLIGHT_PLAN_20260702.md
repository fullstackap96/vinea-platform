# Certificate Issuance Logging Runtime Source Preflight Plan

Status: Prepared as source-level preflight tests before any runtime wiring.

Date prepared: 2026-07-02

Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702`

## Current Decision State

`CERTIFICATE ISSUANCE LOGGING SOURCE PREFLIGHT PREPARED; RUNTIME ISSUANCE LOGGING SCAFFOLD NOT IMPLEMENTED; PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO; AUTOMATIC CERTIFICATE GENERATION REMAINS NO-GO`

This plan adds source-level guardrails for a future non-production certificate issuance logging scaffold. It does not wire routes, apply migrations, change operational RLS, mutate records, enable production flags, generate certificates automatically, make canonical or sacramental eligibility decisions, or make public trust claims.

## Source-Level Preflight Tests

The preflight validator lives in:

- `lib/server/certificateIssuanceLoggingRuntimePreflight.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`

These tests are not runtime enforcement. They are merge-time guardrails for future route code. Any future certificate issuance logging runtime scaffold must keep the required safety markers before any scaffold response or approved event write.

## Required Future Gate Order

Future certificate issuance logging route code must demonstrate these safeguards before response, display, or event persistence:

1. non-production gates
2. authentication
3. active-parish/membership scope
4. sacramental record ownership by the selected active parish
5. request-to-record ownership
6. audit metadata before writes
7. forbidden certificate automation blocking
8. generic denial states
9. rollback/no-op behavior

The preflight rejects future source sketches that write certificate issuance audit/event metadata or return a successful scaffold response before these controls appear.

Each future gate must satisfy one complete marker set before any scaffold response or approved event write. A single partial marker, such as only naming the runtime gate helper or only naming the active parish context variable, is not enough to pass the source-level preflight.

## Required Marker Families

Future implementation sketches must include markers equivalent to:

- `getCertificateIssuanceLoggingRuntimeGate(`
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK`
- `APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`
- `requireStaffFromRequest(` or an equivalent staff-authentication helper
- `resolveActiveStaffParishContext(`
- `authorizedParishIds`
- `loadCertificateIssuanceLoggingTarget(`
- `recordBelongsToActiveParish`
- `validateCertificateIssuanceLinkedRequestOwnership(`
- `requestToRecordContinuity`
- `buildCertificateIssuanceLoggingAuditMetadata(`
- `certificate_issuance_logging_v1`
- `assertNoCertificateAutomation(`
- `certificateGeneratedAutomatically: false`
- `automaticCertificateGenerationBlocked`
- `genericCertificateIssuanceBlockedReason`
- `certificate_issuance_logging_unavailable`
- `returnCertificateIssuanceRuntimeUnavailable(`
- `runtimePersistenceApproved: false`

## Sensitive Action Anchors

The preflight treats these as sensitive action anchors:

- `writeCertificateIssuanceLoggingAuditEvent(`
- `insertCertificateIssuanceLoggingEvent(`
- `public.sacramental_record_events` insert calls
- `returnCertificateIssuanceScaffoldResponse(`
- successful `NextResponse.json` scaffold responses

Required safeguards must appear before these anchors.

## Forbidden Runtime Markers

The preflight rejects future scaffold source that includes obvious unsafe behavior, including:

- direct `public.sacramental_records` updates
- `updateSacramentalRecord(`
- `generateCertificate(`
- `createCertificatePdf(`
- `renderCertificatePdf(`
- `createSignedUrl(`
- `sendEmail(`
- `sendSms(`
- `openai.responses.create`
- `createGoogleCalendarEvent(`
- `canonicalDecisionMade: true`
- `pastoralDecisionMade: true`
- `sacramentalEligibilityDecided: true`
- `mutatesSacramentalRecord: true`
- `certificateGeneratedAutomatically: true`

## Current Boundary

This slice does not create:

- certificate issuance logging API routes
- dashboard controls
- certificate issuance event writes
- certificate PDFs
- storage or signed URL access
- family-facing certificate status
- correction or notation workflows
- register locking
- production flags
- migrations
- operational RLS changes
- public trust-center claims

Production certificate issuance logging remains NO-GO until separately approved with production-safe fixtures, monitoring, rollback, smoke evidence, and explicit product-owner approval.

## What Changed Plain English

This update does not turn on certificate issuance logging. It adds a safety test for future code. If Vinea later adds a route for staff-reviewed certificate issuance logging, that code will need to show that it checks the staff user, parish, membership, record ownership, linked request ownership, safe audit metadata, no automatic certificate generation, generic denial messages, and rollback/no-op behavior before it writes or returns a successful result.
