# Vinea Non-Production Incident Tabletop Drill Plan - Parish Data Access Incidents - 2026-06-27

Status: Plan prepared only. No tabletop drill was executed while preparing this plan. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed.

## Purpose

This plan defines two safe non-production tabletop drills for Vinea parish data access incidents:

1. Family portal and request document exposure.
2. Cross-parish active parish context or membership-aware RLS exposure.

The drills are designed to exercise the incident response runbook and evidence template without touching production or real parishioner data.

## Required References

- Incident response runbook: `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- Incident evidence template: `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- Production RLS final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Data retention and deletion policy proposal: `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`

## Drill Rules

- Use only disposable QA, shared QA, or local development with explicit approval.
- Do not use production data.
- Do not access production.
- Do not apply migrations.
- Do not change runtime behavior.
- Do not change operational RLS.
- Use synthetic parishes, staff users, requests, documents, notes, workflow steps, and family portal tokens.
- Do not record plaintext family portal tokens or secrets in evidence.
- Use screenshots only after redacting private content.

## Participants

| Role | Required for drill? | Named owner |
|---|---:|---|
| Incident commander | Yes | `PENDING` |
| Technical lead | Yes | `PENDING` |
| Evidence owner | Yes | `PENDING` |
| Customer communications owner | Yes | `PENDING` |
| Legal/data owner | Recommended | `PENDING` |
| Product owner | Recommended | `PENDING` |
| Security reviewer | Recommended | `PENDING` |

## Drill 1 - Family Portal And Document Exposure

### Scenario

A staff member reports that a family portal link may show the wrong request document or staff-only request information. The team must triage whether internal notes, AI notes, audit logs, token hashes, private parish data, or wrong-family documents could be exposed.

### Safe Setup

Use non-production data only:

- Synthetic parish.
- Synthetic staff account.
- Synthetic request.
- Synthetic workflow step.
- Synthetic request document with harmless content.
- Synthetic family portal token.
- Synthetic internal note.
- Synthetic AI note or placeholder if AI content is not available.

### Injects

1. Report arrives: "A family says their portal link shows something unexpected."
2. Technical lead checks portal page and document routes.
3. Evidence owner captures route responses, safe screenshots, token metadata, document metadata, and audit events.
4. Incident commander assigns severity.
5. Team decides whether to deactivate portal token, block document access, or disable a route.
6. Customer communications owner drafts a parish-facing note, but does not send it.
7. Team completes recovery checks and postmortem notes.

### Pass Criteria

- Severity is assigned and justified.
- Evidence template is filled without secrets or private document contents.
- Family portal safety check explicitly verifies no internal notes, AI notes, audit logs, token hashes, or private parish data are exposed.
- Request document access and signed URL behavior are checked.
- Direct storage privacy is checked.
- Token deactivation/containment decision is documented.
- Audit-log preservation is documented.
- Customer communication decision is documented.
- Postmortem follow-ups are assigned.

## Drill 2 - Cross-Parish Active Parish Or RLS Exposure

### Scenario

A multi-parish staff user reports seeing a request, document, person, household, note, communication, workflow step, or sacramental record from the wrong parish after switching active parish context.

### Safe Setup

Use non-production data only:

- Two synthetic parishes.
- One synthetic multi-parish staff account.
- One synthetic single-parish staff account for each parish.
- Synthetic people and households in both parishes.
- Synthetic requests in both parishes.
- Synthetic request notes and communications.
- Synthetic workflow steps.
- Synthetic request documents with harmless content.
- Synthetic sacramental records.
- Active parish cookie/context test notes.

### Injects

1. Report arrives: "After switching parish context, a staff member may see another parish's request/document."
2. Technical lead identifies whether the issue is route guard, active parish context, membership helper, RLS policy, query filter, or test setup.
3. Evidence owner captures route/API responses, active parish cookie observations, RLS/policy state if relevant, and audit events.
4. Incident commander assigns severity with attention to multi-parish boundaries.
5. Team decides whether feature flag disablement, staff access restriction, route block, deployment rollback, or RLS rollback would be appropriate in a real production incident.
6. Customer communications owner drafts parish/diocese communication, but does not send it.
7. Team completes recovery checks and postmortem notes.

### Pass Criteria

- Severity is assigned and justified.
- Evidence template records safe IDs, active parish context observations, and audit events.
- Cross-parish allow/deny cases are documented for requests, documents, notes, communications, workflow steps, people, households, sacramental records, and mass intentions if present in the test environment.
- Staff authorization and active parish context are verified.
- Membership-aware RLS behavior is discussed without applying production RLS changes.
- Containment options and rollback decision criteria are documented.
- Customer communication path for parish/diocese is documented.
- Postmortem follow-ups are assigned.

## Shared Drill Timeline

| Timebox | Activity |
|---|---|
| 0-10 minutes | Scenario readout, role assignment, severity draft |
| 10-25 minutes | Evidence capture and initial triage |
| 25-40 minutes | Containment decision and communication draft |
| 40-55 minutes | Recovery verification and audit-log review |
| 55-70 minutes | Postmortem notes and follow-up ownership |
| 70-75 minutes | Final pass/fail decision |

## Required Outputs

Each drill must produce:

- Completed copy of `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`.
- Safe screenshots or route/API summaries, if applicable.
- Audit event references.
- Containment decision.
- Customer communication decision.
- Recovery verification results.
- Postmortem notes.
- Follow-up owner/due date list.
- Final drill result: `PASS`, `PASS WITH FOLLOW-UP`, or `FAIL`.

## Trust-Center Claim Gate

After one successful non-production tabletop drill, Vinea may internally say:

> Vinea has run a non-production tabletop drill using its incident response runbook.

Do not claim:

- A production incident response drill has been completed.
- Legal notification templates are approved.
- Incident response is certified under SOC 2, ISO 27001, HIPAA, or another formal framework.
- Production RLS or family portal incident response has been production-smoked unless that evidence separately exists.

## Final Outcome

- Current outcome: `Non-production tabletop drill plan prepared; no drill executed`
- Current recommendation: `Run Drill 1 and Drill 2 in a safe non-production environment and record evidence before making stronger incident-response readiness claims`
