# Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet

Status: Prepared as a product-owner approval packet for a future non-production implementation step only.

Date prepared: 2026-07-02

Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`

## Current Decision State

`CERTIFICATE ISSUANCE LOGGING RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED; PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO; AUTOMATIC CERTIFICATE GENERATION REMAINS NO-GO; CORRECTION AND NOTATION WORKFLOWS REMAIN SEPARATELY GATED`

This packet defines the exact boundary for a future non-production implementation of staff-reviewed certificate issuance logging. It does not wire runtime routes, apply migrations, change operational RLS, mutate sacramental records, enable production flags, generate certificates automatically, create PDFs automatically, decide certificate eligibility, make pastoral decisions, make canonical or sacramental eligibility decisions, expose family-facing certificate state, or make public trust claims.

## Required Existing Prerequisites

The future implementation may be approved only after these existing non-runtime materials are reviewed:

- DTO foundation: `docs/CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702.md`
- Implementation approval boundary: `docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md`
- Source-level preflight plan: `docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702.md`
- Source-level preflight validator: `lib/server/certificateIssuanceLoggingRuntimePreflight.ts`
- Source-level preflight tests: `lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`
- Existing certificate issuance DTO tests: `lib/certificateIssuanceDtos.test.ts`
- Existing certificate issuance source tests: `lib/server/certificateIssuanceDtosSource.test.ts`

Source-level preflight is not runtime enforcement. It is a merge-time guard that must remain paired with non-production runtime tests, manual/browser QA, rollback evidence, and owner sign-off before any production conversation.

## Approved Scope For A Future Implementation Step

If separately approved, the future implementation may add a non-production-only runtime scaffold that:

- Validates authenticated staff access.
- Validates selected active parish context.
- Validates staff membership in the selected active parish.
- Validates sacramental record ownership by the selected active parish.
- Validates linked request ownership when a record is connected to a request.
- Builds DTO-backed certificate issuance review metadata.
- Builds staff-only safe responses for non-production QA.
- Prepares safe audit metadata before response or approved event write.
- Optionally writes append-only safe issuance metadata only if the approval prompt explicitly permits it.
- Uses the existing `certificate_issuance_reviewed` event/action naming.
- Passes `validateFutureCertificateIssuanceLoggingRuntimeSource()` before merge.
- Uses a future non-production QA evidence template to record the run.

The future scaffold must remain staff-reviewed, staff-only, non-production gated, active-parish scoped, membership scoped, request-to-record continuity aware, safe-audit-metadata-first, generic-denial-only for blocked contexts, blocked from automatic certificate generation, blocked from correction/notation workflows, and no-op when gates are off.

## Exact Future Implementation Files

The future implementation may propose changes only in these areas unless the product owner separately approves a narrower or broader list:

- `lib/certificateIssuanceDtos.ts`
- `lib/certificateIssuanceDtos.test.ts`
- `lib/server/certificateIssuanceLoggingGate.ts`
- `lib/server/certificateIssuanceLoggingGate.test.ts`
- `lib/server/certificateIssuanceLoggingAudit.ts`
- `lib/server/certificateIssuanceLoggingAudit.test.ts`
- `lib/server/certificateIssuanceLoggingScaffold.ts`
- `lib/server/certificateIssuanceLoggingScaffold.test.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`
- `app/api/records/[id]/certificate-issuance-review/route.ts`
- `lib/server/certificateIssuanceLoggingRoute.test.ts`
- `app/dashboard/records/[id]/page.tsx`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/VINEA_ROADMAP.md`
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

The future implementation must not add staff-facing production navigation, background jobs, cron schedules, automatic certificate generation, PDF generation automation, email/SMS senders, public family portal surfaces, storage access, signed URL access, Google Calendar writes, AI calls, export behavior, operational RLS changes, correction or notation behavior, or public trust-center claims.

## Required Non-Production Feature Gates

The future runtime scaffold must fail closed unless all required non-production gates are present:

- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED`
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION`

The future runtime scaffold must explicitly fail closed when:

- Any required flag is missing.
- The acknowledgement phrase is wrong.
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV` is anything other than `NON_PRODUCTION`.
- The app is running in production.
- The request is unauthenticated.
- The active parish cannot be validated.
- The staff user is not a member of the selected active parish.
- The sacramental record is not owned by the selected active parish.
- The linked request, when present, is not owned by the same parish as the record.
- Source-level preflight fails.
- The caller attempts to submit raw register contents, document contents, storage paths, signed URLs, token material, raw notes, raw IDs, original filenames, private communication content, AI content, or secrets.

Production flags are not approved by this packet. Production certificate issuance logging remains NO-GO.

## Required Source-Level Preflight Gates

Before any future route implementation is accepted, `validateFutureCertificateIssuanceLoggingRuntimeSource()` must pass and prove these appear before any scaffold response or approved event write:

- non-production gates
- staff authentication
- active-parish and membership scope
- sacramental record ownership
- request-to-record ownership
- safe audit metadata before writes
- forbidden certificate automation blocking
- generic denial states
- rollback/no-op behavior

The source preflight must continue rejecting direct `public.sacramental_records` updates, certificate generation, PDF rendering, signed URL creation, AI calls, Google Calendar writes, email/SMS sends, export behavior, and true decision flags for canonical, pastoral, sacramental eligibility, record mutation, or automatic certificate generation.

## Staff-Reviewed Runtime Behavior

The future scaffold may use only these DTO statuses:

- `ready_for_staff_review`
- `generated_for_review`
- `issued_to_requester`
- `voided_or_replaced`

Every future scaffold response or approved event metadata write must preserve:

- `staffReviewRequired: true`
- `canonicalDecisionMade: false`
- `sacramentalEligibilityDecided: false`
- `certificateGeneratedAutomatically: false`
- `mutatesSacramentalRecord: false`
- `correctionOrNotationWorkflowApproved: false`
- `runtimePersistenceApproved: false` unless an approval prompt explicitly permits append-only safe review metadata

Staff remain responsible for reviewing the register, parish policy, identity, requester authority, and any canonical or sacramental context before certificate issuance.

## Safe Audit Metadata

The future scaffold must prepare safe audit metadata before any event insert, staff display, or response delivery. Audit metadata must include:

- `feature_id`: `certificate_issuance_logging_v1`
- `event_action`: `certificate_issuance_reviewed`
- runtime gate state
- source preflight status
- record type
- certificate type
- issuance status
- delivery method
- active parish label or safe parish reference
- actor label
- safe person label
- linked request flag
- safe request label
- request-to-record continuity status
- staff-review requirement
- automatic certificate generation blocked flag
- sacramental record mutation blocked flag
- canonical decision blocked flag
- sacramental eligibility decision blocked flag
- correction/notation separate approval flag
- runtime persistence blocked flag unless explicitly approved
- source DTO reference
- blocked reason for denied paths

Audit metadata must not include raw register notes, raw record values, document contents, storage paths, signed URLs, original filenames, token material, family portal private data, communication bodies, AI prompts, AI outputs, provider payloads, database URLs, service-role keys, raw exports, raw IDs, or secret values.

## Request-To-Record Continuity

The future scaffold must show whether certificate issuance review is connected to an originating request.

When `sacramental_records.request_id` is present:

- Validate that the linked request belongs to the same parish as the sacramental record.
- Preserve `linked_request: true` in safe metadata.
- Include a safe request label rather than private request details.

When `sacramental_records.request_id` is missing:

- Preserve `linked_request: false` in safe metadata.
- Show staff that continuity needs manual review.
- Do not invent or create a request link.

## Certificate Issuance Boundaries

The future implementation must not:

- Update `public.sacramental_records`.
- Change book, page, line, minister, place, person, sacrament date, or notes.
- Generate a certificate automatically.
- Create a certificate PDF automatically.
- Mark a request complete.
- Decide whether a certificate may canonically or pastorally be issued.
- Decide sacramental eligibility.
- Enter canonical notation text.
- Implement correction or notation workflows.
- Send email or SMS.
- Create calendar events.
- Expose issuance metadata to family portal users.
- Expose raw notes, raw metadata, private documents, storage paths, signed URLs, original filenames, token material, AI content, service-role keys, database URLs, raw exports, or raw IDs.

## Required QA Fixtures

The future non-production QA run must use safe fixture labels only:

- Safe staff user with membership in Parish A.
- Parish A active parish label.
- Parish B denied parish label.
- Same-parish baptism record with linked request.
- Same-parish confirmation or marriage record without certificate generation.
- Same-parish record without `request_id`.
- Same-parish linked request that produced a sacramental record.
- Same-parish `ready_for_staff_review` issuance event candidate.
- Same-parish `generated_for_review` issuance event candidate.
- Same-parish `issued_to_requester` issuance event candidate.
- Same-parish `voided_or_replaced` issuance event candidate.
- Cross-parish denied sacramental record or forged active-parish-cookie substitute.
- Family portal or unauthenticated denial substitute.
- Monitoring owner label.
- Rollback owner label.
- Evidence storage owner label.

Fixture labels must not include private family information, raw IDs where avoidable, secrets, database URLs, tokens, storage paths, filenames, document contents, raw notes, or raw metadata.

## Required Manual Smoke Tests

Flag-off baseline:

- Runtime route unavailable or no-op.
- Existing baptism certificate generation behavior remains unchanged.
- No `certificate_issuance_reviewed` event is created.
- No sacramental record values are mutated.
- No correction, notation, eligibility, or completion decision occurs.

Flag-on non-production scaffold:

- Same-parish linked-request record can prepare safe issuance metadata.
- Same-parish missing-request-link record shows manual continuity review.
- Same-parish broader certificate type can prepare metadata without generating a PDF.
- Same-parish `issued_to_requester` status can be logged only when append-only safe metadata writing is explicitly approved.
- Same-parish `voided_or_replaced` status can be logged only when append-only safe metadata writing is explicitly approved.
- Cross-parish or forged active-parish contexts are denied generically.
- Family portal and unauthenticated contexts are denied generically.
- Safe audit metadata exists for allowed and denied paths when audit writing is approved.
- Source-level preflight remains passing.
- No automatic certificate generation occurs.
- No certificate PDF is generated automatically.
- No sacramental record value is mutated.
- No correction or notation behavior occurs.
- No canonical, pastoral, or eligibility decision occurs.
- No email, SMS, calendar, AI, export, storage, signed URL, migration, or operational RLS change occurs.

Rollback:

- Disable the non-production runtime flags.
- Confirm the future route returns unavailable or no-op behavior.
- Confirm no new `certificate_issuance_reviewed` event is created after rollback.
- Confirm existing baptism certificate behavior remains unchanged.
- Confirm sacramental record values remain unchanged.
- Confirm rollback evidence is recorded in the QA evidence template.

## Post-Implementation NO-GO Boundary

Even after future non-production scaffold implementation, these remain NO-GO until separately approved:

- Production certificate issuance logging.
- Broader production certificate issuance workflow.
- Automatic certificate generation.
- Automatic certificate PDF creation.
- Family-facing certificate status.
- Sacramental record correction.
- Canonical notation.
- Register locking.
- Pastoral readiness decisions.
- Sacramental or canonical eligibility decisions.
- Background jobs or scheduled issuance reminders.
- New persistence requiring migrations.
- Operational RLS changes.
- Public trust-center claims.

Expected future post-implementation decision state:

`CERTIFICATE ISSUANCE LOGGING NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CERTIFICATE ISSUANCE LOGGING DISABLED; AUTOMATIC CERTIFICATE GENERATION DISABLED; CORRECTION AND NOTATION WORKFLOWS NO-GO`

## Exact Approval Language For Future Implementation

```text
Approve non-production implementation of the certificate issuance logging runtime scaffold only. Use the approved implementation files and require VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED, VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA, and VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION. Preserve source-level preflight compliance, staff authentication, active-parish and membership scope checks, sacramental record ownership checks, linked-request ownership checks, safe audit metadata before response or approved event write, generic denied states, staff-reviewed certificate issuance metadata, no automatic certificate generation, no automatic PDF creation, no sacramental record mutation, no correction or notation behavior, no canonical, pastoral, or eligibility decisions, and rollback by disabling the flags. Do not enable production certificate issuance logging, add production flags, apply migrations, change operational RLS, mutate sacramental records, generate certificates automatically, create certificate PDFs automatically, access storage, create signed URLs, touch Google Calendar, call AI, create exports, send email/SMS, expose family-facing certificate state, implement correction or notation workflows, or make public trust claims. After implementation, production certificate issuance logging remains NO-GO.
```

## Work Not Performed In This Slice

- Runtime routes were not wired.
- Dashboard controls were not added.
- Event writes were not added.
- Migrations were not applied.
- Operational RLS was not changed.
- Sacramental records were not mutated.
- Production flags were not enabled.
- Certificates were not generated automatically.
- Certificate PDFs were not created automatically.
- Correction or notation workflows were not implemented.
- Canonical notations were not entered.
- Pastoral decisions were not made.
- Canonical or sacramental eligibility decisions were not made.
- Google Calendar data was not touched.
- AI was not called.
- Exports were not created.
- Storage and signed URLs were not accessed.
- Family portal behavior was not changed.
- Public trust claims were not made.
- Secrets were not exposed.

## What Changed Plain English

This packet gives the exact copy/paste approval language and safety checklist for a future non-production certificate issuance logging scaffold. It does not build the feature. It says what future code may touch, what tests must pass, what evidence must be collected, and what is still forbidden. The core idea is simple: Vinea may eventually help staff log that a certificate was reviewed or issued, but it must not automatically generate certificates, change sacramental records, or make canonical or pastoral decisions.
