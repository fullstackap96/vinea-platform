# Workflow Reminders V1 Runtime Approval Packet

Status: Prepared as a product-owner approval packet for a future implementation step only.

Date prepared: 2026-07-02

Completion marker: `WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702`

## Current Decision State

`WORKFLOW REMINDERS V1 RUNTIME NOT APPROVED; DASHBOARD PREVIEW REMAINS READ-ONLY; NO COMMUNICATIONS OR AUTOMATION ENABLED`

This packet prepares the approval gates for a future Workflow Reminders V1 runtime implementation. It does not implement runtime reminders, enable scheduling, send communications, add production flags, apply migrations, change operational RLS, mutate records, access storage, call AI, touch Google Calendar, or make public trust claims.

## Scope That May Be Approved Later

The future V1 runtime may only evaluate reminder candidates already represented by the safe Workflow Reminders V1 DTO foundation:

1. Overdue follow-up reminders.
2. Missing document or checklist reminders.
3. Upcoming sacramental date reminders.
4. Stalled request alerts.
5. Unassigned request alerts.
6. Certificate-ready staff-review reminders.
7. Duplicate review backlog reminders.

All reminder outcomes must remain staff-reviewed. The future runtime may create staff-visible reminder records or dashboard notifications only after a separate approved implementation step. It must not autonomously send family emails, SMS messages, calendar invitations, eligibility decisions, sacramental decisions, pastoral decisions, certificate issuance decisions, duplicate merges, or record corrections.

## Required Approvals Before Runtime Work

Before any runtime reminder code is implemented, the product owner must provide:

- Product-owner approval for the exact reminder types included in the first runtime pilot.
- Security/data owner approval for the audit metadata, active-parish scope, retention, and denied-path behavior.
- Parish operations approval that all reminders are staff-reviewed and written in plain parish-office language.
- Support owner approval for how staff report incorrect or noisy reminders.
- Rollback owner approval for disabling runtime behavior quickly.
- QA owner approval for the manual smoke-test checklist and safe non-production fixtures.

Exact approval language for the next implementation step:

```text
Approve non-production implementation of Workflow Reminders V1 runtime scaffolding only. Keep all reminders staff-reviewed, dashboard-only or staff-notification-only, and blocked from autonomous outbound communication. Require safe audit metadata, active-parish and membership scope checks, suppression/dismissal design, non-production QA, and rollback by disabling the runtime gate. Do not enable production automation, send communications, apply migrations, change operational RLS, mutate request/record/people/household data beyond approved safe reminder metadata, make AI decisions, or make public trust claims.
```

## Staff-Review Rules

Every runtime reminder must:

- Display to staff as a suggested action, not an automatic decision.
- Use plain-English labels such as "Follow up with this family" or "Review missing documents."
- Include the reason Vinea thinks the reminder matters.
- Link back to the staff-facing request, record, duplicate review, or certificate review page.
- Require a staff member to choose any family communication, status change, assignment, merge, certificate generation, or record correction.
- Preserve `staffReviewRequired: true`.
- Preserve `outboundCommunicationAllowed: false` unless a future separately approved communication workflow explicitly changes it.

## Safe Audit Metadata Requirements

Any future runtime reminder write must create safe audit metadata before delivery or display. The audit event must include:

- `feature_id`: `workflow_reminders_v1`.
- `reminder_type`.
- `runtime_gate_state`.
- staff or system actor label for the evaluation path.
- active parish context and membership scope result.
- target object type and non-secret target label.
- safe source references used to create the reminder.
- staff-review requirement.
- outbound communication blocked flag.
- suppression or dismissal state if applicable.
- blocked reason for denied paths.

The audit metadata must not include raw request notes, raw communication bodies, document contents, storage paths, signed URLs, original filenames, token material, private family portal data, AI prompts, AI outputs, service-role secrets, database connection strings, or raw exports.

## Suppression And Dismissal Design

Before runtime reminders are enabled, Vinea needs a concrete suppression and dismissal model:

- Staff can dismiss a reminder with a required plain-English reason or a structured reason.
- Staff can snooze a reminder to a future date only if the reminder type supports it.
- Suppression must be scoped to the active parish and target object.
- Suppression must not hide reminders for a different parish.
- Dismissed reminders must remain auditable.
- Suppression must not mutate the underlying request, sacramental record, person, household, document, or certificate state.
- Reminder recurrence must respect frequency limits and avoid repeated daily noise.

## Active-Parish And Membership QA Requirements

The future runtime must be validated with safe non-production fixtures:

- Same-parish staff sees reminders for the selected active parish.
- Switching active parish changes reminder scope.
- Cross-parish staff without membership cannot see or create reminder metadata.
- Forged active-parish cookies fail closed.
- Request-derived reminders verify request parish ownership before generating any reminder metadata.
- Duplicate-review reminders stay inside the selected parish scope.
- Certificate-ready reminders stay inside the selected parish scope.
- Family portal and unauthenticated contexts receive generic denial and never see staff reminders.

## Manual Smoke-Test Checklist

Run flag-off checks first:

- Runtime gate disabled: no runtime reminder writes occur.
- Dashboard preview still works from DTOs.
- No outbound communication is sent.
- No request, person, household, sacramental record, certificate, document, communication, calendar, AI, export, or storage data is mutated.

Run approved non-production flag-on checks only after explicit approval:

- Overdue follow-up reminder appears for a safe same-parish request.
- Missing document/checklist reminder appears for a safe same-parish request.
- Upcoming sacramental date reminder appears for a safe same-parish request.
- Stalled request reminder appears for a safe same-parish request.
- Unassigned request reminder appears for a safe same-parish request.
- Certificate-ready reminder appears for a safe same-parish baptism record candidate.
- Duplicate review reminder appears for a safe same-parish duplicate backlog.
- Staff dismissal/suppression records safe metadata only.
- Cross-parish and forged active-parish cases are denied generically.
- Family portal and unauthenticated cases are denied generically.
- Audit metadata exists for allowed and denied paths.
- Rollback by disabling the gate stops runtime reminder writes and leaves the read-only dashboard preview intact.

## Rollback Plan

Rollback must be possible by disabling the future runtime gate. Rollback must not require:

- A database restore.
- A migration rollback.
- Operational RLS changes.
- Deleting request, person, household, sacramental record, certificate, document, communication, calendar, export, or AI data.
- Removing the existing read-only dashboard reminder preview.

Rollback evidence must show:

- The runtime gate is disabled.
- No new runtime reminders are created after rollback.
- Staff can still use the read-only dashboard reminder preview.
- Previously created reminder metadata remains auditable but inactive if the future implementation creates metadata.

## Production Boundary

Production runtime reminder delivery remains NO-GO until all of these are complete:

- Non-production implementation approval.
- Non-production manual smoke evidence.
- Active-parish and membership denial evidence.
- Audit metadata evidence.
- Suppression/dismissal evidence.
- Rollback evidence.
- Named product, security/data, operations, support, QA, and rollback owner sign-offs.
- A separate production rollout approval packet and production-safe smoke fixture plan.

## Work Not Performed In This Slice

- Runtime reminders were not implemented.
- Communications were not sent.
- Automation was not enabled.
- Production flags were not added or enabled.
- Migrations were not applied.
- Operational RLS was not changed.
- Records were not mutated.
- Google Calendar data was not touched.
- AI was not called.
- Exports were not created.
- Storage and signed URLs were not accessed.
- Public trust claims were not made.
- Secrets were not exposed.
