# Workflow Reminders V1 Non-Runtime Plan

Status: Implemented as DTO/planning foundation only.

Date opened: 2026-07-02

## Goal

Create a safe foundation for Vinea reminders without sending messages, enabling schedulers, adding production flags, or changing database/security behavior. V1 reminder DTOs define what Vinea should surface for staff review before a future runtime reminder engine exists.

## V1 Reminder Types

1. Overdue follow-up reminders
   - Signal: an open request has a past-due `next_follow_up_date`.
   - Action: staff should contact the family or update the follow-up date.

2. Missing document/checklist reminders
   - Signal: an open request has incomplete checklist items or is waiting on document-related information.
   - Action: staff should review required items and prepare a staff-approved family nudge if appropriate.

3. Upcoming sacramental date reminders
   - Signal: an open baptism, funeral, wedding, or OCIA request has a confirmed date within the planning window.
   - Action: staff should confirm readiness, documents, records, and calendar details.

4. Stalled request alerts
   - Signal: an open request has stale or missing contact.
   - Action: staff should log a touchpoint or decide the next pastoral step.

5. Unassigned request alerts
   - Signal: an open request has no clear staff owner.
   - Action: staff should assign ownership before routine work continues.

6. Certificate-ready reminders
   - Signal: an explicit upstream certificate-ready signal is provided.
   - Action: staff should review the record and generate the certificate only where appropriate.

7. Duplicate review reminders
   - Signal: an explicit duplicate-review backlog signal is provided.
   - Action: staff should review possible duplicate people or households before merging anything.

## Safety Boundaries

- This is not a runtime automation engine.
- No outbound communication is sent.
- No production flags are added or enabled.
- No migrations are added.
- No operational RLS changes are made.
- No Google Calendar, email, AI, export, public intake, or storage behavior is changed.
- Every reminder DTO is marked staff-review-required.
- Every reminder DTO explicitly blocks autonomous outbound communication.
- Certificate-ready DTOs must not decide sacramental validity, canonical eligibility, or pastoral readiness.
- Duplicate-review DTOs must not merge or mutate records.

## Future Runtime Approval Gates

Before reminders become runtime behavior, Vinea needs:

- Product-owner approval for the exact runtime scope.
- Staff-facing UI review.
- Audit metadata design.
- Suppression/dismissal rules.
- Frequency/rate-limit rules.
- Tenant/active-parish scope verification.
- Manual QA with safe fixtures.
- Rollback plan.
- Documentation distinguishing dashboard-only reminders from outbound automation.
