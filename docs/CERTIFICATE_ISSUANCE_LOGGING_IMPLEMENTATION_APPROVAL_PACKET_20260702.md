# Certificate Issuance Logging Implementation Approval Packet

Status: Prepared as a product-owner approval packet for a future non-production implementation step only.

Date prepared: 2026-07-02

Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702`

## Current Decision State

`CERTIFICATE ISSUANCE LOGGING IMPLEMENTATION NOT APPROVED; PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO; CORRECTION AND NOTATION WORKFLOWS REMAIN SEPARATELY GATED`

This packet defines the exact boundary for a future non-production implementation of staff-reviewed certificate issuance logging. It does not generate certificates automatically, create PDFs, add production flags, apply migrations, change operational RLS, mutate sacramental records, correct registers, add canonical notations, decide sacramental or pastoral eligibility, expose family-facing certificate state, or make public trust claims.

## Approved Scope For A Future Implementation Step

If separately approved, the future implementation may persist staff-reviewed certificate issuance metadata for authenticated staff using the existing certificate issuance DTO foundation.

The future implementation must remain:

- Staff-reviewed.
- Staff-only.
- Non-production gated.
- Active-parish scoped.
- Membership scoped.
- Append-only for issuance events.
- Request-to-record continuity aware.
- Audited with safe metadata before display or persistence.
- Blocked from automatic certificate generation.
- Blocked from correction, notation, eligibility, and pastoral-readiness decisions.
- Blocked from production unless a separate production packet is approved later.

## Exact Future Implementation Files

The future implementation may propose changes only in these areas unless the product owner separately approves a narrower or broader list:

- `lib/certificateIssuanceDtos.ts`
- `lib/certificateIssuanceDtos.test.ts`
- `lib/server/certificateIssuanceLoggingGate.ts`
- `lib/server/certificateIssuanceLoggingGate.test.ts`
- `lib/server/certificateIssuanceLoggingAudit.ts`
- `lib/server/certificateIssuanceLoggingAudit.test.ts`
- `lib/server/certificateIssuanceLoggingService.ts`
- `lib/server/certificateIssuanceLoggingService.test.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`
- `lib/server/certificateIssuanceLoggingPreflight.test.ts`
- `app/api/records/[id]/certificate/route.ts`
- `app/dashboard/records/[id]/page.tsx`
- `lib/server/certificateIssuanceLoggingRoute.test.ts`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702.md`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/VINEA_ROADMAP.md`
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

The future implementation must not add new certificate-generation automation, staff-facing production navigation, background jobs, cron schedules, email/SMS senders, public family portal surfaces, storage access, signed URL access, Google Calendar writes, AI calls, export behavior, operational RLS changes, or public trust-center claims.

## Source-Level Preflight Tests

Before any future certificate issuance logging runtime route is merged, the future source must pass `validateFutureCertificateIssuanceLoggingRuntimeSource()` from:

- `lib/server/certificateIssuanceLoggingRuntimePreflight.ts`
- `lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`

The source-level preflight is not runtime enforcement. It is a merge-time guard that requires future implementation sketches to keep these controls before any scaffold response or approved event write:

- non-production gates
- authentication
- active-parish/membership scope
- sacramental record ownership
- request-to-record ownership
- audit metadata before writes
- forbidden certificate automation blocking
- generic denial states
- rollback/no-op behavior

The source-level preflight must require complete marker sets for each gate. A future scaffold must not pass by including only one partial marker from the runtime gate, active-parish scope, membership scope, ownership, safe-audit, forbidden-automation, generic-denial, or rollback/no-op gate.

The preflight must reject source that tries to mutate sacramental records, generate certificates or PDFs, create signed URLs, call AI, write Google Calendar events, expose specific cross-parish details, mark canonical or pastoral decisions as made, or present certificate issuance logging as production-approved.

## Required Non-Production Feature Gates

The future runtime path must fail closed unless all required non-production gates are present:

- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED`
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION`

The future runtime path must explicitly fail closed when:

- Any required flag is missing.
- The acknowledgement phrase is wrong.
- `VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV` is anything other than `NON_PRODUCTION`.
- The app is running in production.
- The request is unauthenticated.
- The active parish cannot be validated.
- The staff user is not a member of the selected active parish.
- The sacramental record is not owned by the selected active parish.
- The linked request, when present, is not owned by the same parish as the record.

Production flags are not approved by this packet. Production certificate issuance logging remains NO-GO.

## Event And Action Naming

The future implementation should use the existing append-only `public.sacramental_record_events` table unless a separate migration is approved later.

The planned issuance event action is:

- `certificate_issuance_reviewed`

The existing `certificate_generated` action remains the current behavior for the baptism certificate route. A future implementation may keep that event for PDF generation while adding `certificate_issuance_reviewed` only when staff-reviewed issuance metadata is deliberately prepared and persisted.

The future implementation must not reuse issuance logging to represent:

- sacramental record correction
- canonical notation
- register locking
- eligibility approval
- pastoral readiness approval
- certificate generation itself unless staff review metadata is also present

## Staff-Reviewed Issuance Status

The future implementation may persist only these staff-reviewed issuance statuses:

- `ready_for_staff_review`
- `generated_for_review`
- `issued_to_requester`
- `voided_or_replaced`

Every future persisted issuance event must preserve:

- `staffReviewRequired: true`
- `canonicalDecisionMade: false`
- `sacramentalEligibilityDecided: false`
- `certificateGeneratedAutomatically: false`
- `mutatesSacramentalRecord: false`

Staff remain responsible for reviewing the register, parish policy, and any canonical or sacramental context before certificate issuance.

## Active-Parish And Membership Scope Checks

Before any future issuance metadata is prepared, displayed, or persisted, the implementation must validate:

- Staff authentication.
- Active parish cookie or selected parish context.
- Staff membership in the active parish.
- Sacramental record ownership by the selected active parish.
- Linked request ownership by the same parish when `request_id` is present.
- Cross-parish denial before event insert or display where practical.
- Forged active-parish-cookie denial with generic error text.

The future implementation must preserve existing operational RLS and must not weaken, replace, or bypass RLS.

## Safe Audit Metadata

The future implementation must prepare safe audit metadata before event insert or staff display. Audit metadata must include:

- `feature_id`: `certificate_issuance_logging_v1`
- `event_action`: `certificate_issuance_reviewed`
- runtime gate state
- record type
- certificate type
- issuance status
- delivery method
- active parish label or safe parish reference
- actor label
- safe person label
- linked request flag
- safe request label
- staff-review requirement
- automatic certificate generation blocked flag
- sacramental record mutation blocked flag
- canonical decision blocked flag
- sacramental eligibility decision blocked flag
- correction/notation separate approval flag
- source DTO reference
- blocked reason for denied paths

Audit metadata must not include:

- raw register notes
- document contents
- storage paths
- signed URLs
- original filenames
- token material
- family portal private data
- communication bodies
- AI prompts
- AI outputs
- provider payloads
- database URLs
- service-role keys
- raw exports
- secret values

## Request-To-Record Continuity Requirements

The future implementation must show whether the certificate issuance event is linked to an originating request.

When `sacramental_records.request_id` is present:

- The implementation must verify that the linked request belongs to the same parish as the sacramental record.
- The implementation must record `linked_request: true`.
- The implementation must include a safe request label rather than raw private request details.

When `sacramental_records.request_id` is missing:

- The implementation must record `linked_request: false`.
- The implementation must show staff that continuity should be verified manually.
- The implementation must not invent a request link.

## Correction And Notation Exclusions

Certificate issuance logging is not a correction or notation workflow.

The future implementation must not:

- Change book, page, line, minister, place, person, sacrament date, or notes.
- Add canonical notations.
- Correct sacramental register values.
- Decide whether a person is eligible for a sacrament.
- Decide whether a certificate should be pastorally issued.
- Mark a request complete solely because issuance metadata exists.

Any future correction, notation, register-locking, or canonical review workflow requires separate product-owner, parish/canonical record owner, security/data owner, QA, and rollback approval.

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

- Runtime path unavailable or no-op.
- Existing baptism certificate generation behavior remains unchanged.
- No `certificate_issuance_reviewed` event is created.
- No sacramental record values are mutated.
- No correction, notation, eligibility, or completion decision occurs.

Flag-on non-production scaffold:

- Same-parish linked-request record can prepare safe issuance metadata.
- Same-parish missing-request-link record shows manual continuity review.
- Same-parish broader certificate type can prepare metadata without generating a PDF.
- Same-parish `issued_to_requester` status can be logged as a staff-reviewed event.
- Same-parish `voided_or_replaced` status can be logged as a staff-reviewed event.
- Cross-parish or forged active-parish contexts are denied generically.
- Family portal and unauthenticated contexts are denied generically.
- Safe audit metadata exists for allowed and denied paths.
- `certificate_issuance_reviewed` events are append-only.
- No automatic certificate generation occurs.
- No email, SMS, calendar, AI, export, storage, signed URL, correction, notation, or operational RLS change occurs.

Rollback:

- Disable the non-production runtime flags.
- Confirm the future path returns unavailable or no-op behavior.
- Confirm no new `certificate_issuance_reviewed` event is created after rollback.
- Confirm existing baptism certificate behavior remains unchanged.
- Confirm rollback evidence is recorded.

## Post-Implementation NO-GO Boundary

Even after a future non-production implementation passes, the following remain NO-GO until separately approved:

- Production certificate issuance logging.
- Broader production certificate issuance workflow.
- Automatic certificate generation.
- Family-facing certificate status.
- Sacramental record correction.
- Canonical notation.
- Register locking.
- Sacramental or canonical eligibility decisions.
- Production routing flags.
- Operational RLS changes.
- Public trust-center claims.

The required post-implementation decision-state phrase is:

`CERTIFICATE ISSUANCE LOGGING NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CERTIFICATE ISSUANCE LOGGING DISABLED; AUTOMATIC CERTIFICATE GENERATION DISABLED; CORRECTION AND NOTATION WORKFLOWS NO-GO`

## Exact Future Approval Language

The product owner must provide this exact language before the future implementation begins:

`Approve non-production implementation of the certificate issuance logging scaffold only. Wire staff-reviewed certificate issuance metadata behind VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED, VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA, and VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION. Use the existing certificate issuance DTO foundation, selected active parish scope, membership scope, request-to-record ownership checks, safe audit metadata, and append-only sacramental_record_events action certificate_issuance_reviewed. Do not generate certificates automatically, apply migrations, change operational RLS, mutate sacramental records, enable production flags, expose family-facing certificate state, make canonical or sacramental eligibility decisions, implement correction or notation workflows, or make public trust claims. Add focused tests, QA evidence, docs updates, run checks, and keep production certificate issuance logging NO-GO.`

## What Changed Plain English

This packet does not turn on certificate issuance logging. It gives Vinea a careful checklist for the future: what code could be changed, what safety checks must pass, what audit event name should be used, and what must remain blocked. The goal is to help parish staff eventually see when a certificate was reviewed or issued without letting software make sacramental, canonical, or pastoral decisions.
