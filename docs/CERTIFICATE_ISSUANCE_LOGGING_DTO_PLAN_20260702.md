# Certificate Issuance Logging DTO Plan

Status: Implemented as non-runtime DTO foundation only.

Date prepared: 2026-07-02

Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702`

## Goal

Prepare a safe foundation for certificate issuance logging across Catholic sacramental records without generating certificates automatically, applying migrations, changing operational RLS, mutating records, enabling production flags, deciding sacramental/canonical eligibility, or making public trust claims.

## What The DTO Supports

The non-runtime DTO supports staff-reviewed metadata for:

- Certificate ready for staff review.
- Certificate generated for staff review.
- Certificate issued to requester.
- Certificate voided or replaced.

It also captures:

- Certificate type.
- Sacramental record type.
- Safe person label.
- Safe active parish label.
- Safe actor label.
- Delivery method.
- Request-to-record continuity.
- Staff note.
- Safe audit metadata.

## Staff-Reviewed Status Rules

Every certificate issuance DTO preserves:

- `staffReviewRequired: true`.
- `canonicalDecisionMade: false`.
- `sacramentalEligibilityDecided: false`.
- `certificateGeneratedAutomatically: false`.
- `mutatesSacramentalRecord: false`.

Vinea must not use this DTO to decide whether a certificate should be issued. Staff remain responsible for reviewing the register, parish policy, and any canonical/sacramental context.

## Correction And Notation Boundaries

Certificate issuance logging is not a correction or notation workflow.

The DTO explicitly blocks:

- Sacramental register corrections.
- Canonical notations.
- Changes to book, page, line, minister, place, person, or sacrament date.
- Eligibility decisions.
- Pastoral readiness decisions.

Any future correction or notation workflow requires separate product-owner, parish/canonical record owner, security/data owner, QA, and rollback approval.

## Audit Requirements

Future persistence, if separately approved, should map the DTO to append-only safe audit metadata. The safe audit metadata includes:

- `feature_id`.
- `event_action`.
- record type.
- certificate type.
- status.
- delivery method.
- active parish label.
- actor label.
- safe person label.
- linked request flag.
- safe request label.
- staff-review requirement.
- canonical decision blocked flag.
- sacramental eligibility decision blocked flag.
- automatic generation blocked flag.
- sacramental record mutation blocked flag.
- correction/notation separate approval flag.

The audit metadata must not include raw notes, document contents, storage paths, signed URLs, original filenames, token material, family portal private data, AI prompts, AI outputs, service-role keys, database URLs, or raw exports.

## Request-To-Record Continuity

When a sacramental record has `request_id`, the DTO marks the certificate issuance log as connected to the originating request.

When `request_id` is missing, the DTO does not pretend continuity exists. It marks the item for staff review and says staff should verify continuity manually.

This matters because Vinea should eventually show when a public intake request produced a sacramental record and whether a certificate was reviewed or issued, without inventing links that do not exist.

## Current Non-Runtime Boundary

This slice does not:

- Generate certificates.
- Create PDFs.
- Add routes.
- Add dashboard controls.
- Insert sacramental record events.
- Add migrations.
- Change operational RLS.
- Mutate sacramental records.
- Correct registers.
- Add canonical notations.
- Decide sacramental eligibility.
- Enable production flags.
- Make public trust claims.

## Future Implementation Gates

Before certificate issuance logging is persisted or shown as live workflow state, Vinea needs:

- Product-owner approval for the first certificate issuance logging implementation.
- Parish/canonical record owner approval for event labels and correction/notation boundaries.
- Security/data owner approval for audit metadata and retention.
- Active-parish and membership-scope QA.
- Request-to-record continuity QA.
- Manual smoke tests for issued, generated-for-review, voided/replaced, and missing-request-link cases.
- Rollback/no-op behavior for any non-production scaffold.
- Separate production rollout approval before production use.
