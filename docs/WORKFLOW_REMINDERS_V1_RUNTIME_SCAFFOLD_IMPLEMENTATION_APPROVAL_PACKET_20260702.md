# Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet

Status: Prepared as a product-owner approval packet for a future non-production implementation step only.

Date prepared: 2026-07-02

Completion marker: `WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`

## Current Decision State

`WORKFLOW REMINDERS V1 RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED; PRODUCTION REMINDER DELIVERY REMAINS NO-GO; DASHBOARD PREVIEW REMAINS READ-ONLY`

This packet defines the exact boundary for a future non-production implementation of Workflow Reminders V1 runtime scaffolding. It does not implement runtime reminders, send communications, enable automation, add production flags, apply migrations, change operational RLS, mutate operational records, access storage, call AI, touch Google Calendar, or make public trust claims.

## Approved Scope For A Future Implementation Step

If separately approved, the future implementation may add non-production runtime scaffolding that evaluates existing reminder DTOs and prepares staff-visible, dashboard-only reminder metadata.

The future scaffold must remain:

- Staff-reviewed.
- Dashboard-only or staff-notification-only.
- Non-production gated.
- Active-parish scoped.
- Membership scoped.
- Audited with safe metadata before display or delivery.
- Blocked from autonomous outbound communication.
- Blocked from family portal and unauthenticated contexts.
- Blocked from production unless a separate production packet is approved later.

## Exact Future Implementation Files

The future implementation may propose changes only in these areas unless the product owner separately approves a narrower or broader list:

- `lib/server/workflowReminderRuntimeGate.ts`
- `lib/server/workflowReminderRuntimeGate.test.ts`
- `lib/server/workflowReminderRuntimeAudit.ts`
- `lib/server/workflowReminderRuntimeAudit.test.ts`
- `lib/server/workflowReminderRuntimeScaffold.ts`
- `lib/server/workflowReminderRuntimeScaffold.test.ts`
- `lib/server/workflowReminderRuntimePreflight.test.ts`
- `app/api/workflow-reminders/route.ts`
- `lib/server/workflowReminderRoute.test.ts`
- `app/dashboard/DashboardWorkflowReminderPreview.tsx`
- `lib/server/workflowReminderDashboardPreviewSource.test.ts`
- `docs/WORKFLOW_REMINDERS_V1_RUNTIME_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/VINEA_ROADMAP.md`
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

The future implementation must not add staff-facing production navigation, background jobs, cron schedules, email/SMS senders, public family portal surfaces, storage access, signed URL access, Google Calendar writes, AI calls, export behavior, or operational RLS changes.

## Required Non-Production Feature Gates

The future runtime scaffold must fail closed unless all required non-production gates are present:

- `VINEA_WORKFLOW_REMINDERS_RUNTIME=ENABLED`
- `VINEA_WORKFLOW_REMINDERS_RUNTIME_ACK=APPROVED_WORKFLOW_REMINDERS_RUNTIME_QA`
- `VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV=NON_PRODUCTION`

The future runtime scaffold must explicitly fail closed when:

- Any required flag is missing.
- The acknowledgement phrase is wrong.
- `VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV` is anything other than `NON_PRODUCTION`.
- The app is running in production.
- The request is unauthenticated.
- The active parish cannot be validated.
- The staff user is not a member of the selected active parish.
- The target reminder object is not owned by the selected active parish.

Production flags are not approved by this packet. Production reminder delivery remains NO-GO.

## Staff-Reviewed Dashboard-Only Behavior

The future scaffold may only make reminders visible to authenticated staff in the selected parish context.

It must preserve:

- Preserve `staffReviewRequired: true`.
- Preserve `outboundCommunicationAllowed: false`.
- Preserve `mutatesOperationalRecord: false`.
- plain-English reminder titles and reasons
- links back to staff-only pages
- generic denied states for blocked contexts

It must not:

- Send family emails.
- Send SMS.
- Create calendar events.
- Change request status.
- Assign staff.
- Update follow-up dates.
- Generate certificates.
- Merge duplicate people or households.
- Correct sacramental records.
- Expose reminders in the family portal.

## Active-Parish And Membership Scope Checks

Before any future reminder metadata is prepared, the scaffold must validate:

- Staff authentication.
- Active parish cookie or selected parish context.
- Staff membership in the active parish.
- Request, record, duplicate-review, or certificate-review target ownership by the selected active parish.
- Cross-parish denial before query or delivery where practical.
- Forged active-parish-cookie denial with generic error text.

The future scaffold must preserve existing operational RLS and must not weaken, replace, or bypass RLS.

## Safe Audit Metadata

The future scaffold must prepare safe audit metadata before reminder display or delivery. Audit metadata must include:

- `feature_id`: `workflow_reminders_v1`
- runtime gate state
- reminder kind
- disposition state if present
- active parish label or safe parish reference
- actor label
- target type
- safe target label
- staff-review requirement
- outbound communication blocked flag
- operational mutation blocked flag
- source DTO reference
- blocked reason for denied paths

Audit metadata must not include:

- raw request notes
- raw communication bodies
- document contents
- storage paths
- signed URLs
- original filenames
- token material
- private family portal data
- AI prompts
- AI outputs
- database URLs
- service-role keys
- raw exports
- secret values

## Suppression And Dismissal Persistence Boundaries

This packet does not approve persistence yet. A future scaffold may reference `lib/workflowReminderDispositionDtos.ts` and prepare DTO-backed disposition metadata, but persistence requires a separate approval if database tables or writes are needed.

Before persistence is approved, Vinea must define:

- Whether reminder metadata is stored in `audit_events`, a new reminder table, or both.
- Retention period.
- Parish-scoped access behavior.
- Active-parish switching behavior.
- Suppression recurrence behavior.
- Dismissed-reminder audit behavior.
- Whether a migration is required.
- Rollback and cleanup behavior for non-production test metadata.

Any future persistence must remain safe metadata only and must not mutate the underlying request, record, person, household, certificate, document, communication, or calendar object.

## Required QA Fixtures

The future non-production QA run must use safe fixture labels only:

- Safe staff user with membership in Parish A.
- Parish A active parish label.
- Parish B denied parish label.
- Same-parish request with overdue follow-up.
- Same-parish request with missing document/checklist signal.
- Same-parish request with upcoming sacramental date.
- Same-parish stalled request.
- Same-parish unassigned request.
- Same-parish certificate-ready baptism record candidate.
- Same-parish duplicate review candidate set.
- Cross-parish denied request or forged active-parish-cookie substitute.
- Family portal or unauthenticated denial substitute.
- Monitoring owner label.
- Rollback owner label.
- Evidence storage owner label.

Fixture labels must not include private family information, raw IDs where avoidable, secrets, database URLs, tokens, storage paths, filenames, or document contents.

## Required Manual Smoke Tests

Flag-off baseline:

- Runtime route unavailable or no-op.
- Dashboard preview remains read-only.
- No reminder metadata is created.
- No communication is sent.
- No records are mutated.

Flag-on non-production scaffold:

- Same-parish overdue follow-up reminder is visible to staff.
- Same-parish missing document/checklist reminder is visible to staff.
- Same-parish upcoming sacramental date reminder is visible to staff.
- Same-parish stalled request reminder is visible to staff.
- Same-parish unassigned request reminder is visible to staff.
- Same-parish certificate-ready reminder is visible to staff.
- Same-parish duplicate review reminder is visible to staff.
- Cross-parish or forged active-parish contexts are denied generically.
- Family portal and unauthenticated contexts are denied generically.
- Safe audit metadata exists for allowed and denied paths.
- No email, SMS, calendar, AI, export, storage, signed URL, certificate generation, duplicate merge, or record correction action occurs.

Rollback:

- Disable the non-production runtime flags.
- Confirm the route returns unavailable or no-op behavior.
- Confirm no new reminder metadata is created after rollback.
- Confirm dashboard preview still works.
- Confirm rollback evidence is recorded.

## Post-Implementation NO-GO Boundary

Even after future scaffold implementation, these remain NO-GO until separately approved:

- Production reminder delivery.
- Background scheduling.
- Email/SMS reminder sending.
- Family-facing reminder display.
- Reminder persistence requiring migrations.
- Operational RLS changes.
- Certificate issuance automation.
- Duplicate merge automation.
- Sacramental or canonical decision automation.
- Public trust-center claims.

Expected future post-implementation decision state:

`WORKFLOW REMINDERS V1 NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION REMINDER DELIVERY DISABLED; OUTBOUND COMMUNICATION DISABLED; AUTOMATION DELIVERY NO-GO`

## Exact Approval Language For Future Implementation

```text
Approve non-production implementation of Workflow Reminders V1 runtime scaffolding only. Use the approved implementation files and require VINEA_WORKFLOW_REMINDERS_RUNTIME=ENABLED, VINEA_WORKFLOW_REMINDERS_RUNTIME_ACK=APPROVED_WORKFLOW_REMINDERS_RUNTIME_QA, and VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV=NON_PRODUCTION. Preserve staff-reviewed dashboard-only behavior, active-parish and membership scope checks, safe audit metadata, generic denied states, no outbound communication, no operational record mutation, and rollback by disabling the flags. Do not enable production reminder delivery, send communications, add production flags, apply migrations, change operational RLS, mutate records beyond separately approved safe reminder metadata, access storage, create signed URLs, touch Google Calendar, call AI, create exports, or make public trust claims. After implementation, production reminder delivery remains NO-GO.
```

## Work Not Performed In This Slice

- Runtime reminders were not implemented.
- API routes were not added.
- Dashboard controls were not added.
- Communications were not sent.
- Automation was not enabled.
- Production flags were not added.
- Migrations were not applied.
- Operational RLS was not changed.
- Records were not mutated.
- Google Calendar data was not touched.
- AI was not called.
- Exports were not created.
- Storage and signed URLs were not accessed.
- Public trust claims were not made.
- Secrets were not exposed.
