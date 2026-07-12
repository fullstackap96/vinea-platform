# Sacramental Record Correction And Notation Runtime Scaffold Approval Packet

Status: Prepared as a product-owner approval packet for a future non-production implementation step only.

Date prepared: 2026-07-02

Completion marker: `SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702`

## Current Decision State

`SACRAMENTAL RECORD REVISION RUNTIME SCAFFOLD NOT APPROVED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO; AUTOMATIC REGISTER MUTATION REMAINS NO-GO`

This packet defines the exact boundary for a future non-production runtime scaffold that may prepare staff-reviewed correction and notation review metadata. It does not apply migrations, change operational RLS, mutate sacramental records, enable production flags, generate certificates automatically, enter canonical notations, make pastoral decisions, make canonical or sacramental eligibility decisions, expose family-facing revision state, or make public trust claims.

## Approved Scope For A Future Implementation Step

If separately approved, the future implementation may add a non-production scaffold that uses `lib/sacramentalRecordRevisionDtos.ts` to prepare safe staff-reviewed correction and notation review metadata for authenticated staff.

The future scaffold must remain:

- Staff-reviewed.
- Staff-only.
- Non-production gated.
- Active-parish scoped.
- Membership scoped.
- Request-to-record continuity aware.
- Safe-audit-metadata-first.
- No-op when gates are off.
- Blocked from automatic register mutation.
- Blocked from canonical notation entry.
- Blocked from pastoral or eligibility decisions.
- Blocked from certificate generation.
- Blocked from production unless a separate production packet is approved later.

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
- `lib/server/sacramentalRecordRevisionPreflight.test.ts`
- `app/api/records/[id]/revision-review/route.ts`
- `lib/server/sacramentalRecordRevisionRoute.test.ts`
- `app/dashboard/records/[id]/page.tsx`
- `docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/VINEA_ROADMAP.md`
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

The future implementation must not add staff-facing production navigation, background jobs, cron schedules, email/SMS senders, public family portal surfaces, storage access, signed URL access, Google Calendar writes, AI calls, export behavior, operational RLS changes, automatic certificate generation, automatic register mutation, or public trust-center claims.

## Source-Level Preflight Tests

Vinea now has source-level preflight scaffolding in:

- `lib/server/sacramentalRecordRevisionRuntimePreflight.ts`
- `lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`
- `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702.md`

These tests are merge-time guards only. They do not replace runtime QA, browser QA, product-owner approval, security/data approval, parish/canonical record owner approval, rollback evidence, or production smoke testing.

Future runtime route code must keep non-production gates, authentication, active-parish/membership scope, sacramental record ownership, request-to-record ownership, safe audit metadata before writes, forbidden mutation blocking, generic denial states, and rollback/no-op behavior before any scaffold response or event write.

The source-level preflight must require complete marker sets for each gate. A future scaffold must not pass by including only one partial marker from the runtime gate, active-parish scope, membership scope, ownership, safe-audit, forbidden-mutation, generic-denial, or rollback/no-op gate.

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
- The caller attempts to submit raw register contents, document contents, storage paths, signed URLs, token material, or secrets.

Production flags are not approved by this packet. Production correction and notation workflows remain NO-GO.

## Event And Action Naming

The future scaffold should use the existing append-only `public.sacramental_record_events` table only if separately approved for non-production safe metadata writes. No migration is approved by this packet.

The planned correction review event action is:

- `sacramental_record_correction_reviewed`

The planned notation review event action is:

- `sacramental_record_notation_reviewed`

These actions are reserved for staff-reviewed metadata only. They must not mean that the sacramental register was changed, that a canonical notation was entered, or that a pastoral/canonical decision was made.

## Runtime Behavior Boundary

The future runtime scaffold may only:

- Validate staff authentication.
- Validate selected active parish scope.
- Validate staff membership in the active parish.
- Validate sacramental record ownership by the active parish.
- Validate linked-request parish ownership when `request_id` is present.
- Build DTO-backed correction or notation review metadata.
- Prepare safe audit metadata before any future event insert or staff display.
- Return staff-only safe metadata for non-production QA.
- Write append-only safe review metadata only if separately approved in the implementation prompt.

The future runtime scaffold must not:

- Update `public.sacramental_records`.
- Change book, page, line, minister, place, person, sacrament date, or notes.
- Enter a canonical notation.
- Lock or unlock a register record.
- Generate a certificate.
- Mark a request complete.
- Decide sacramental eligibility.
- Decide pastoral readiness.
- Send email or SMS.
- Create calendar events.
- Expose revision metadata to family portal users.
- Expose raw notes, raw metadata, private documents, storage paths, signed URLs, original filenames, token material, AI content, service-role keys, database URLs, or raw exports.

## Staff-Reviewed Statuses

The future scaffold may use only these statuses from the DTO foundation:

- `draft_for_staff_review`
- `ready_for_authorized_review`
- `approved_for_manual_entry`
- `entered_by_authorized_staff`
- `voided_or_superseded`

Every future scaffold response or event must preserve:

- `staffReviewRequired: true`
- `authorizedRecordReviewRequired: true`
- `productOwnerApprovalRequiredForRuntime: true`
- `canonicalDecisionMade: false`
- `pastoralDecisionMade: false`
- `sacramentalEligibilityDecided: false`
- `mutatesSacramentalRecord: false`
- `generatesCertificateAutomatically: false`
- `runtimePersistenceApproved: false`

## Active-Parish And Membership Scope Checks

Before any future correction or notation metadata is prepared, displayed, or persisted, the scaffold must validate:

- Staff authentication.
- Active parish cookie or selected parish context.
- Staff membership in the active parish.
- Sacramental record ownership by the selected active parish.
- Linked request ownership by the same parish when `request_id` is present.
- Cross-parish denial before query, event insert, or display where practical.
- Forged active-parish-cookie denial with generic error text.
- Family portal and unauthenticated denial with generic error text.

The future scaffold must preserve existing operational RLS and must not weaken, replace, or bypass RLS.

## Safe Audit Metadata

The future scaffold must prepare safe audit metadata before any event insert, staff display, or response delivery. Audit metadata must include:

- `feature_id`: `sacramental_record_revision_v1`
- `event_action`: `sacramental_record_correction_reviewed` or `sacramental_record_notation_reviewed`
- runtime gate state
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

Audit metadata must not include:

- raw register notes
- raw record values
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

## Request-To-Record QA Fixtures

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
- Confirm existing certificate generation behavior remains unchanged.
- Confirm rollback evidence is recorded.

## Post-Implementation NO-GO Boundary

Even after a future non-production scaffold implementation passes, the following remain NO-GO until separately approved:

- Production correction workflow.
- Production notation workflow.
- Automatic register mutation.
- Canonical notation entry.
- Register locking.
- Sacramental or canonical eligibility decisions.
- Pastoral readiness decisions.
- Automatic certificate generation.
- Family-facing revision display.
- Production routing flags.
- Operational RLS changes.
- Public trust-center claims.

The required post-implementation decision-state phrase is:

`SACRAMENTAL RECORD REVISION NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS DISABLED; AUTOMATIC REGISTER MUTATION DISABLED; CANONICAL AND PASTORAL DECISIONS NO-GO`

## Exact Future Approval Language

The product owner must provide this exact language before the future implementation begins:

`Approve non-production implementation of the sacramental record correction/notation runtime scaffold only. Wire staff-reviewed correction and notation review metadata behind VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED, VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA, and VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION. Use the existing sacramental record revision DTO foundation, selected active parish scope, membership scope, request-to-record ownership checks, safe audit metadata, and planned append-only event actions sacramental_record_correction_reviewed and sacramental_record_notation_reviewed. Do not apply migrations, change operational RLS, mutate sacramental records, enable production flags, generate certificates automatically, enter canonical notations, make pastoral decisions, make canonical or sacramental eligibility decisions, expose family-facing revision state, or make public trust claims. Add focused tests, QA evidence, docs updates, run checks, and keep production correction and notation workflows NO-GO.`

## What Changed Plain English

This packet does not turn on correction or notation workflows. It gives Vinea a careful checklist for a future non-production scaffold: what code could be changed, what safety checks must pass, what event names are reserved, and what must remain blocked. The goal is to help parish staff eventually track possible register corrections or notations without letting software casually change sacramental records or make canonical decisions.
