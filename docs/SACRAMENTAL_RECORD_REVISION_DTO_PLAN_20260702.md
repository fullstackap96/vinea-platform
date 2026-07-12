# Sacramental Record Correction And Notation DTO Plan

Status: Implemented as non-runtime DTO foundation only.

Date prepared: 2026-07-02

Completion marker: `SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702`

## Goal

Prepare safe non-runtime DTOs for future sacramental record correction and notation planning without applying migrations, changing operational RLS, mutating sacramental records, enabling production flags, generating certificates automatically, making canonical/sacramental eligibility decisions, or making public trust claims.

## What The DTO Supports

The non-runtime DTO supports staff-reviewed metadata for:

- Correction review.
- Notation review.
- Drafts for staff review.
- Items ready for authorized record review.
- Items approved for future manual entry.
- Items entered by authorized staff in a future separately approved workflow.
- Items voided or superseded.

It also captures:

- Sacramental record type.
- Safe person label.
- Safe active parish label.
- Safe actor label.
- Safe affected field labels.
- Safe reason label.
- Safe proposed change summary.
- Optional reviewer label.
- Request-to-record continuity.
- Safe audit metadata.

## Staff-Reviewed Status Rules

Every revision DTO preserves:

- `staffReviewRequired: true`.
- `authorizedRecordReviewRequired: true`.
- `productOwnerApprovalRequiredForRuntime: true`.
- `canonicalDecisionMade: false`.
- `pastoralDecisionMade: false`.
- `sacramentalEligibilityDecided: false`.
- `mutatesSacramentalRecord: false`.
- `generatesCertificateAutomatically: false`.
- `runtimePersistenceApproved: false`.

Vinea must not use this DTO to decide whether a sacramental record should be corrected, whether a canonical notation is valid, whether a person is eligible for a sacrament, or whether a pastoral decision should be made. Staff and parish/canonical record owners remain responsible for review.

## Correction Event Metadata

The future planned correction event action is:

- `sacramental_record_correction_reviewed`

This event name is reserved for future staff-reviewed correction metadata only. It must not mean the register was changed unless a future approved workflow separately performs and audits the manual entry.

Correction metadata may reference safe affected fields such as:

- `person_name`
- `sacrament_date`
- `place`
- `minister`
- `book`
- `page`
- `line`
- `notes`
- `request_link`
- `person_link`
- `external_register_reference`

## Notation Event Metadata

The future planned notation event action is:

- `sacramental_record_notation_reviewed`

This event name is reserved for future staff-reviewed notation metadata only. It must not add a canonical notation, assert canonical validity, or decide pastoral readiness unless a future approved workflow separately performs and audits the authorized entry.

## Approval Boundaries

The DTO allows planning metadata only.

It explicitly blocks:

- Runtime writes.
- Sacramental register corrections.
- Canonical notations.
- Changes to book, page, line, minister, place, person, sacrament date, or notes.
- Eligibility decisions.
- Pastoral readiness decisions.
- Automatic certificate generation.
- Family-facing display.

Any future correction, notation, register-locking, or canonical review workflow requires separate product-owner, parish/canonical record owner, security/data owner, QA, rollback, and production approval.

## Active-Parish And Membership Scope Expectations

Future runtime work must validate before any display or persistence:

- Staff authentication.
- Active parish cookie or selected parish context.
- Staff membership in the active parish.
- Sacramental record ownership by the selected active parish.
- Linked request ownership by the same parish when `request_id` is present.
- Cross-parish denial before event insert or display where practical.
- Forged active-parish-cookie denial with generic error text.

Existing operational RLS must remain in place and must not be weakened, bypassed, or replaced by this feature.

## Audit Requirements

Future persistence, if separately approved, should map the DTO to append-only safe audit metadata. The safe audit metadata includes:

- `feature_id`.
- `event_action`.
- revision kind.
- record type.
- status.
- active parish label.
- actor label.
- safe person label.
- safe affected fields.
- linked request flag.
- safe request label.
- staff-review requirement.
- authorized-record-review requirement.
- product-owner runtime approval requirement.
- canonical decision blocked flag.
- pastoral decision blocked flag.
- sacramental eligibility decision blocked flag.
- sacramental record mutation blocked flag.
- automatic certificate generation blocked flag.
- runtime persistence blocked flag.
- separate correction/notation approval flag.

The audit metadata must not include raw notes, document contents, storage paths, signed URLs, original filenames, token material, family portal private data, communication bodies, AI prompts, AI outputs, provider payloads, service-role keys, database URLs, raw exports, or secret values.

## Request-To-Record Continuity

When a sacramental record has `request_id`, the DTO marks revision metadata as connected to the originating request.

When `request_id` is missing, the DTO does not pretend continuity exists. It marks the item for authorized staff review and says staff should verify continuity manually.

## Rollback And No-Op Expectations

This DTO foundation has no runtime state and therefore requires no database rollback.

Future runtime scaffolding must define:

- Flag-off no-op behavior.
- Rollback by disabling non-production flags.
- Confirmation that no new correction or notation metadata is written after rollback.
- Confirmation that sacramental record values remain unchanged.
- Confirmation that existing certificate generation behavior remains unchanged.

## Current Non-Runtime Boundary

This slice does not:

- Add routes.
- Add dashboard controls.
- Insert sacramental record events.
- Add migrations.
- Change operational RLS.
- Mutate sacramental records.
- Correct registers.
- Add canonical notations.
- Generate certificates.
- Decide sacramental eligibility.
- Decide pastoral readiness.
- Enable production flags.
- Make public trust claims.

## Production NO-GO Criteria

Production correction and notation workflows remain NO-GO until all of the following are complete:

- Product-owner approval.
- Parish/canonical record owner approval.
- Security/data owner approval.
- Active-parish and membership-scope QA.
- Request-to-record continuity QA.
- Manual smoke tests for correction, notation, missing-request-link, cross-parish denial, and unauthenticated/family denial cases.
- Rollback/no-op evidence.
- Production-safe fixture labels.
- Monitoring and support owners.
- Separate explicit production approval.
