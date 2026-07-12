# Workflow Reminders V1 Disposition DTO Plan

Status: Implemented as non-runtime DTO foundation only.

Date prepared: 2026-07-02

Completion marker: `WORKFLOW_REMINDERS_V1_DISPOSITION_DTO_PLAN_20260702`

## Goal

Prepare safe metadata shapes for future Workflow Reminders V1 dismissal, snooze, and suppression behavior without enabling runtime reminders, writing reminder records, sending communications, changing records, adding production flags, applying migrations, or changing operational RLS.

## Supported Staff Dispositions

1. Dismiss
   - Staff indicates a reminder no longer needs attention.
   - Requires a structured reason.
   - Does not change the underlying request, record, person, household, document, certificate, or duplicate candidate.

2. Snooze
   - Staff indicates a reminder should come back later.
   - Requires a future `snoozedUntil` timestamp.
   - Does not schedule delivery in this slice.

3. Suppress
   - Staff indicates a reminder signal should be hidden for the relevant target in future runtime work.
   - Requires a structured reason.
   - Must remain active-parish and target scoped in any future runtime implementation.

## Required Safety Properties

- Every disposition DTO preserves `staffReviewRequired: true`.
- Every disposition DTO preserves `outboundCommunicationAllowed: false`.
- Every disposition DTO preserves `mutatesOperationalRecord: false`.
- Runtime status remains `non_runtime_disposition_dto_only`.
- The DTO includes safe audit metadata for future runtime approval work.
- The DTO blocks family portal exposure.
- Staff notes are plain text, length-limited, and checked for obvious secret material.
- Snooze requires a future timestamp.
- Dismiss and suppress must not include a snooze timestamp.

## Audit Metadata Shape

The safe audit metadata includes:

- `feature_id`.
- `action`.
- `reminder_kind`.
- active parish label.
- actor label.
- target type.
- target label.
- staff-review requirement.
- outbound communication blocked flag.
- operational mutation blocked flag.
- safe source reference.
- family portal blocked flag.

The safe audit metadata must not include raw request notes, communication bodies, document contents, storage paths, signed URLs, original filenames, token material, AI prompts, AI outputs, database connection strings, service-role keys, raw exports, or private family portal data.

## Current Non-Runtime Boundary

This slice does not:

- Create reminder records.
- Create suppression records.
- Create dismissal records.
- Create snooze records.
- Add API routes.
- Add dashboard controls.
- Send communications.
- Enable automation.
- Add production flags.
- Apply migrations.
- Change operational RLS.
- Mutate records.
- Touch Google Calendar.
- Call AI.
- Create exports.
- Access storage or signed URLs.
- Make public trust claims.

## Future Runtime Requirements

Before runtime dismissal, snooze, or suppression behavior can be implemented, Vinea still needs:

- Product-owner approval for the first runtime reminder pilot.
- Security/data owner approval for persistence and retention.
- Active-parish and membership-scope QA.
- Manual smoke tests for same-parish, cross-parish, forged active-parish, family portal, and unauthenticated cases.
- Staff UX review for plain-English labels.
- Audit-log verification.
- Rollback plan and owner.
- Production rollout packet if production is ever considered.
