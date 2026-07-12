# Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet

Status: Prepared as a product-owner approval packet for a future non-production implementation step only.

Date prepared: 2026-07-02

Completion marker: `SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`

## Current Decision State

`SACRAMENTAL RECORD REVISION RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO; AUTOMATIC REGISTER MUTATION REMAINS NO-GO`

This packet defines the exact boundary for a future non-production implementation of correction and notation runtime scaffolding. It does not wire runtime routes, apply migrations, change operational RLS, mutate sacramental records, enable production flags, generate certificates automatically, enter canonical notations, make pastoral decisions, make canonical or sacramental eligibility decisions, expose family-facing revision state, or make public trust claims.

## Required Existing Prerequisites

The future implementation may be approved only after these existing non-runtime materials are reviewed:

- DTO foundation: `docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md`
- Runtime scaffold approval boundary: `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md`
- Non-production QA evidence template: `docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- Source-level preflight plan: `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702.md`
- Source-level preflight validator: `lib/server/sacramentalRecordRevisionRuntimePreflight.ts`
- Source-level preflight tests: `lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`

Source-level preflight is not runtime enforcement. It is a merge-time guard that must remain paired with non-production runtime tests, browser/manual QA, rollback evidence, and owner sign-off before any production conversation.

## Approved Scope For A Future Implementation Step

If separately approved, the future implementation may add a non-production-only runtime scaffold that:

- Validates authenticated staff access.
- Validates selected active parish context.
- Validates staff membership in the selected active parish.
- Validates sacramental record ownership by the selected active parish.
- Validates linked request ownership when a record is connected to a request.
- Builds DTO-backed correction review metadata.
- Builds DTO-backed notation review metadata.
- Prepares safe audit metadata before response or approved event write.
- Returns staff-only safe scaffold responses for non-production QA.
- Optionally writes append-only safe review metadata only if the approval prompt explicitly permits it.
- Passes `validateFutureSacramentalRecordRevisionRuntimeSource()` before merge.
- Uses the non-production QA evidence template to record the run.

The future scaffold must remain staff-reviewed, staff-only, non-production gated, active-parish scoped, membership scoped, request-to-record continuity aware, safe-audit-metadata-first, generic-denial-only for blocked contexts, and no-op when gates are off.

## Exact Future Implementation Files

The future implementation may propose changes only in these areas unless the product owner separately approves a narrower or broader list:

- `lib/sacramentalRecordRevisionDtos.ts`
- `lib/sacramentalRecordRevisionDtos.test.ts`
- `lib/server/sacramentalRecordRevisionRuntimeGate.ts`
- `lib/server/sacramentalRecordRevisionRuntimeGate.test.ts`
- `lib/server/sacramentalRecordRevisionAudit.ts`
- `lib/server/sacramentalRecordRevisionAudit.test.ts`
- `lib/server/sacramentalRecordRevisionScaffold.ts`
- `lib/server/sacramentalRecordRevisionScaffold.test.ts`
- `lib/server/sacramentalRecordRevisionRuntimePreflight.ts`
- `lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`
- `app/api/records/[id]/revision-review/route.ts`
- `lib/server/sacramentalRecordRevisionRoute.test.ts`
- `app/dashboard/records/[id]/page.tsx`
- `docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/VINEA_ROADMAP.md`
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

The future implementation must not add staff-facing production navigation, background jobs, cron schedules, email/SMS senders, public family portal surfaces, storage access, signed URL access, Google Calendar writes, AI calls, export behavior, operational RLS changes, automatic certificate generation, automatic register mutation, or public trust-center claims.

## Required Non-Production Feature Gates

The future runtime scaffold must fail closed unless all required non-production gates are present:

- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED`
- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA`
- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION`

The future runtime scaffold must explicitly fail closed when:

- Any required flag is missing.
- The acknowledgement phrase is wrong.
- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV` is anything other than `NON_PRODUCTION`.
- The app is running in production.
- The request is unauthenticated.
- The active parish cannot be validated.
- The staff user is not a member of the selected active parish.
- The sacramental record is not owned by the selected active parish.
- The linked request, when present, is not owned by the same parish as the record.
- Source-level preflight fails.
- The caller attempts to submit raw register contents, document contents, storage paths, signed URLs, token material, raw notes, raw IDs, or secrets.

Production flags are not approved by this packet. Production correction and notation workflows remain NO-GO.

## Required Source-Level Preflight Gates

Before any future route implementation is accepted, `validateFutureSacramentalRecordRevisionRuntimeSource()` must pass and prove these appear before any scaffold response or approved event write:

- non-production gates
- staff authentication
- active-parish and membership scope
- sacramental record ownership
- request-to-record ownership
- safe audit metadata before writes
- forbidden mutation blocking
- generic denial states
- rollback/no-op behavior

The source preflight must continue rejecting direct `public.sacramental_records` updates, certificate generation, signed URL creation, AI calls, Google Calendar writes, email/SMS sends, export behavior, and true decision flags for canonical, pastoral, sacramental eligibility, record mutation, or automatic certificate generation.

The source-level preflight must also require complete marker sets for each gate. A future scaffold must not pass by including only one partial marker from the runtime gate, active-parish scope, membership scope, ownership, safe-audit, forbidden-mutation, generic-denial, or rollback/no-op gate.

## Staff-Reviewed Runtime Behavior

The future scaffold may use only these DTO statuses:

- `draft_for_staff_review`
- `ready_for_authorized_review`
- `approved_for_manual_entry`
- `entered_by_authorized_staff`
- `voided_or_superseded`

Every future scaffold response or approved event metadata write must preserve:

- `staffReviewRequired: true`
- `authorizedRecordReviewRequired: true`
- `productOwnerApprovalRequiredForRuntime: true`
- `canonicalDecisionMade: false`
- `pastoralDecisionMade: false`
- `sacramentalEligibilityDecided: false`
- `mutatesSacramentalRecord: false`
- `generatesCertificateAutomatically: false`
- `runtimePersistenceApproved: false` unless an approval prompt explicitly permits append-only safe review metadata

## Safe Audit Metadata

The future scaffold must prepare safe audit metadata before any event insert, staff display, or response delivery. Audit metadata must include:

- `feature_id`: `sacramental_record_revision_v1`
- `event_action`: `sacramental_record_correction_reviewed` or `sacramental_record_notation_reviewed`
- runtime gate state
- source preflight status
- revision kind
- record type
- status
- active parish label or safe parish reference
- actor label
- safe person label
- safe affected fields
- linked request flag
- safe request label
- staff-review requirement
- authorized-record-review requirement
- product-owner runtime approval requirement
- canonical decision blocked flag
- pastoral decision blocked flag
- sacramental eligibility decision blocked flag
- sacramental record mutation blocked flag
- automatic certificate generation blocked flag
- runtime persistence blocked flag
- source DTO reference
- blocked reason for denied paths

Audit metadata must not include raw register notes, raw record values, document contents, storage paths, signed URLs, original filenames, token material, family portal private data, communication bodies, AI prompts, AI outputs, provider payloads, database URLs, service-role keys, raw exports, raw IDs, or secret values.

## Request-To-Record Continuity

The future scaffold must show whether correction or notation review is connected to an originating request.

When `sacramental_records.request_id` is present:

- Validate that the linked request belongs to the same parish as the sacramental record.
- Preserve `linked_request: true` in safe metadata.
- Include a safe request label rather than private request details.

When `sacramental_records.request_id` is missing:

- Preserve `linked_request: false` in safe metadata.
- Show staff that continuity needs manual review.
- Do not invent or create a request link.

## Correction And Notation Boundaries

The future implementation must not:

- Update `public.sacramental_records`.
- Change book, page, line, minister, place, person, sacrament date, or notes.
- Enter canonical notation text.
- Lock or unlock a register record.
- Generate a certificate.
- Mark a request complete.
- Decide sacramental eligibility.
- Decide pastoral readiness.
- Send email or SMS.
- Create calendar events.
- Expose revision metadata to family portal users.
- Expose raw notes, raw metadata, private documents, storage paths, signed URLs, original filenames, token material, AI content, service-role keys, database URLs, raw exports, or raw IDs.

## Required QA Fixtures

The future non-production QA run must use safe fixture labels only:

- Safe staff user with membership in Parish A.
- Parish A active parish label.
- Parish B denied parish label.
- Same-parish baptism record with linked request.
- Same-parish marriage or confirmation record without request link.
- Same-parish correction review candidate with affected fields.
- Same-parish notation review candidate with affected fields.
- Same-parish linked request that produced a sacramental record.
- Same-parish missing-request-link review candidate.
- Cross-parish denied sacramental record or forged active-parish-cookie substitute.
- Family portal or unauthenticated denial substitute.
- Monitoring owner label.
- Rollback owner label.
- Evidence storage owner label.

Fixture labels must not include private family information, raw IDs where avoidable, secrets, database URLs, tokens, storage paths, filenames, document contents, raw notes, or raw metadata.

## Required Manual Smoke Tests

Flag-off baseline:

- Runtime route unavailable or no-op.
- Record detail page remains unchanged.
- No correction or notation metadata is created.
- No sacramental record values are mutated.
- No certificate is generated.
- No canonical, pastoral, or eligibility decision occurs.

Flag-on non-production scaffold:

- Same-parish correction review metadata can be prepared safely.
- Same-parish notation review metadata can be prepared safely.
- Same-parish linked-request record preserves request continuity.
- Same-parish missing-request-link record shows manual continuity review.
- Cross-parish or forged active-parish contexts are denied generically.
- Family portal and unauthenticated contexts are denied generically.
- Safe audit metadata exists for allowed and denied paths when audit writing is approved.
- Source-level preflight remains passing.
- No automatic register mutation occurs.
- No canonical notation entry occurs.
- No pastoral or eligibility decision occurs.
- No certificate is generated.
- No email, SMS, calendar, AI, export, storage, signed URL, migration, or operational RLS change occurs.

Rollback:

- Disable the non-production runtime flags.
- Confirm the future route returns unavailable or no-op behavior.
- Confirm no new correction or notation metadata is created after rollback.
- Confirm sacramental record values remain unchanged.
- Confirm existing certificate behavior remains unchanged.
- Confirm rollback evidence is recorded in the QA evidence template.

## Post-Implementation NO-GO Boundary

Even after future non-production scaffold implementation, these remain NO-GO until separately approved:

- Production correction workflow.
- Production notation workflow.
- Automatic register mutation.
- Canonical notation entry.
- Pastoral readiness decisions.
- Canonical or sacramental eligibility decisions.
- Certificate generation or issuance automation.
- Family-facing correction or notation display.
- Background jobs or scheduled revision reminders.
- New persistence requiring migrations.
- Operational RLS changes.
- Public trust-center claims.

Expected future post-implementation decision state:

`SACRAMENTAL RECORD REVISION NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS DISABLED; AUTOMATIC REGISTER MUTATION DISABLED; CANONICAL AND PASTORAL DECISIONS NO-GO`

## Exact Approval Language For Future Implementation

```text
Approve non-production implementation of the sacramental record correction/notation runtime scaffold only. Use the approved implementation files and require VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED, VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA, and VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION. Preserve source-level preflight compliance, staff authentication, active-parish and membership scope checks, sacramental record ownership checks, linked-request ownership checks, safe audit metadata before response or approved event write, generic denied states, staff-reviewed correction/notation metadata, no automatic register mutation, no canonical notation entry, no certificate generation, no pastoral or eligibility decisions, and rollback by disabling the flags. Do not enable production correction or notation workflows, add production flags, apply migrations, change operational RLS, mutate sacramental records, generate certificates automatically, access storage, create signed URLs, touch Google Calendar, call AI, create exports, send email/SMS, expose family-facing revision state, or make public trust claims. After implementation, production correction and notation workflows remain NO-GO.
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

This packet gives the exact copy/paste approval language and safety checklist for a future non-production correction/notation scaffold. It does not build the feature. It says what future code may touch, what tests must pass, what evidence must be collected, and what is still forbidden. The heart of it is simple: Vinea may help staff review possible corrections or notations, but it must not automatically change sacramental registers or make canonical decisions.
