# Vinea Incident Response Runbook - Parish Data Access Incidents - 2026-06-27

Status: Prepared as an incident response readiness runbook only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this runbook.

## Purpose

This runbook defines how Vinea should respond to suspected or confirmed parish data access incidents. It focuses on incidents involving parishioner, household, sacramental, document, family portal, audit, staff, AI, or multi-parish tenant data.

This is not evidence that Vinea has completed a production incident drill, not a legal notification policy, and not a substitute for counsel or customer contract requirements.

## Current Decision State

Current incident response readiness: `RUNBOOK PREPARED, INCIDENT DRILL AND NAMED OWNERS PENDING`

Vinea should not claim mature incident response readiness until:

- Incident commander, technical lead, customer communications owner, evidence owner, and legal/data owner are named.
- A non-production tabletop or access-incident drill is completed.
- Audit-log preservation and evidence storage expectations are tested.
- Customer communication templates are reviewed.
- Production access and emergency-change approval gates are approved.
- Postmortem process and owner are confirmed.

## Incident Types Covered

This runbook covers:

- Suspected cross-parish data exposure.
- Staff account unauthorized access or privilege misuse.
- Family portal token exposure or unsafe family-facing data display.
- Request document or signed URL access failure.
- Direct storage privacy failure.
- Public intake routing or domain/token misrouting.
- Audit-log tampering, loss, or suspicious gaps.
- AI output exposing internal notes, staff-only information, or wrong-parish context.
- Accidental export or import of the wrong parish data.
- Production RLS, active parish context, or authorization regression.

## Severity Levels

| Severity | Description | Examples | Initial response target |
|---|---|---|---|
| `SEV-1 Critical` | Confirmed or highly likely exposure of private parish data across parish boundaries, public internet exposure, or destructive data loss | Cross-parish request/document visibility, public document access, production RLS bypass, family portal exposing internal notes | Immediate containment; incident commander assigned within 30 minutes |
| `SEV-2 High` | Sensitive data may have been exposed to unauthorized staff or a limited family portal recipient | Wrong active parish scope, signed URL sent to wrong family, staff role misuse, AI summary includes staff-only data | Triage within 2 hours |
| `SEV-3 Medium` | Security-sensitive behavior is suspicious or partially degraded but no confirmed exposure yet | Audit gap, failed document permission check, suspicious staff activity, public intake token abuse attempt | Triage same business day |
| `SEV-4 Low` | Low-risk privacy/process issue or near miss | Misconfigured routing metadata caught before use, expired token cleanup issue, documentation gap | Track and fix in normal priority queue |

Escalate severity when sacramental records, minors, pastoral notes, family portal data, documents, or multi-parish boundaries are involved.

## Incident Roles

| Role | Responsibility | Named owner |
|---|---|---|
| Incident commander | Owns severity, timeline, decisions, and coordination | `PENDING` |
| Technical lead | Investigates code, database, storage, RLS, auth, logs, and containment options | `PENDING` |
| Customer communications owner | Coordinates parish/diocese communication and support messaging | `PENDING` |
| Legal/data owner | Reviews legal, contractual, regulatory, and notification obligations | `PENDING` |
| Evidence owner | Preserves logs, screenshots, audit events, command outputs, and final incident record | `PENDING` |
| Product owner | Decides product mitigation, customer impact framing, and follow-up roadmap | `PENDING` |
| Security reviewer | Reviews root cause, containment, and recurrence prevention | `PENDING` |

No one should contact affected parishes, delete evidence, rotate production credentials, disable production features, or run production database changes without the incident commander and required approval gates for the severity level.

## First 30 Minutes

For `SEV-1` or suspected `SEV-1`:

1. Assign incident commander and technical lead.
2. Open a private incident channel with timestamped updates.
3. Record the initial report, reporter, time, environment, affected parish or suspected scope, and first observed behavior.
4. Preserve evidence before making changes.
5. Stop any automated jobs or rollout in progress if they may worsen exposure.
6. Identify whether production, shared QA, disposable QA, or local development is involved.
7. Confirm whether production data, documents, family portal tokens, or sacramental records may be affected.
8. Decide whether immediate containment is needed before full root-cause analysis.

For `SEV-2` through `SEV-4`, follow the same pattern with urgency scaled to severity.

## Evidence And Audit-Log Preservation

Preserve evidence before cleanup unless continued exposure requires immediate containment.

Minimum evidence:

- Incident timeline.
- Environment identity.
- Affected parish IDs, request IDs, person IDs, household IDs, document IDs, token IDs, and staff user IDs where safe to record.
- Relevant audit events and timestamps.
- Route/API responses, screenshots, logs, and error messages.
- Supabase RLS policy state if the incident relates to authorization.
- Active parish cookie/context observations where relevant.
- Storage object path and signed URL metadata, without exposing private document contents in evidence.
- Family portal token state, without recording plaintext tokens unless explicitly approved for containment evidence.
- AI prompt/output context if AI exposed or used sensitive data, with redaction as needed.

Do not:

- Paste secrets into incident notes.
- Store private parish documents in general chat.
- Delete audit logs.
- Rotate or revoke evidence-bearing tokens before recording their IDs, status, and suspected exposure path, unless immediate revocation is required for containment.
- Use production data in screenshots when safe synthetic reproduction is available.

## Containment Playbook

Possible containment actions, chosen by severity and approved owner:

- Disable a feature flag.
- Revoke or deactivate family portal tokens.
- Deactivate public intake routing token/domain metadata.
- Disable a staff user's access or parish membership.
- Disable document upload/download route for affected requests.
- Rotate integration credentials.
- Temporarily block an API route at middleware or deployment level.
- Roll back a deployment.
- Apply an emergency database policy rollback only with explicit production approval.
- Disable AI actions that may reveal staff-only or wrong-parish context.

Containment should be the smallest safe action that stops exposure while preserving evidence.

## Recovery Playbook

Recovery should not begin until containment is confirmed.

Recovery steps:

1. Identify root cause and affected data classes.
2. Build and review the fix in a safe environment when possible.
3. Run focused automated tests and manual smoke tests.
4. Verify affected flows: request detail, documents, signed URLs, direct storage privacy, family portal, active parish context, public intake routing if relevant, AI routes if relevant, and audit events.
5. Confirm audit events record the recovery action.
6. Confirm no new exposure path was introduced.
7. Prepare customer communication if required.
8. Confirm monitoring window and rollback criteria.

## Customer Communication

Customer communication should be truthful, concise, and approved by the incident commander and legal/data owner before sending.

Minimum communication fields:

- What happened.
- What data may have been affected.
- Which parish or users may be affected.
- When the issue started and ended, if known.
- What Vinea did to contain it.
- What Vinea is doing to prevent recurrence.
- Whether the parish needs to take action.
- Contact path for questions.

Do not speculate, assign blame, overstate certainty, or mention unaudited legal conclusions.

For diocesan or multi-parish customers, coordinate whether communication goes through parish leadership, diocesan leadership, or both.

## Production Approval Gates

Production incident actions require explicit approval unless the incident commander declares immediate emergency containment.

| Action | Required approval |
|---|---|
| Read-only production investigation | Incident commander and technical lead |
| Production feature flag disablement | Incident commander and product owner |
| Production staff access deactivation | Incident commander and legal/data owner or customer communications owner |
| Production credential rotation | Incident commander, technical lead, and security reviewer |
| Production migration, RLS rollback, or database policy change | Incident commander, technical lead, security reviewer, and product owner |
| Customer notification | Incident commander, legal/data owner, and customer communications owner |
| Public status/trust-center update | Incident commander, legal/data owner, product owner, and customer communications owner |

All production commands, migrations, rollbacks, and feature-flag changes must be copied into the incident record with secrets redacted.

## Postmortem

Every `SEV-1` and `SEV-2` incident requires a postmortem. `SEV-3` incidents require one if they involve sensitive data, repeated failures, or unclear ownership.

Postmortem sections:

- Summary.
- Severity and final incident window.
- Customer impact.
- Data classes affected.
- Root cause.
- What detected it.
- What worked well.
- What slowed response.
- Evidence preserved.
- Corrective actions.
- Product/process follow-ups.
- Owner and due date for each follow-up.
- Customer communication record.
- Trust-center claim impact.

Postmortems should be blameless but specific.

## Public Trust-Center Claim Boundaries

Safe internal statement:

> Vinea has prepared an incident response runbook for parish data access incidents covering severity levels, roles, evidence preservation, containment, recovery, customer communication, production approval gates, and postmortems.

Do not claim:

- Vinea has completed a production incident response drill.
- Vinea has named all incident-response owners.
- Vinea has legally approved breach notification language.
- Vinea has a public incident status page.
- Vinea has certified incident response under SOC 2, ISO 27001, HIPAA, or another formal framework.

## Recommended Future Engineering And Operations Phases

1. Assign named incident roles.
2. Prepare customer communication templates.
3. Prepare an incident evidence template.
4. Run a non-production tabletop drill for a family portal/document access incident.
5. Run a non-production tabletop drill for cross-parish RLS/active parish context exposure.
6. Add read-only admin security dashboard views for audit-log review and suspicious access signals.
7. Define production feature flags and emergency-disable procedures for sensitive routes.
8. Review public trust-center copy only after incident drill evidence exists.

## Final Outcome

- Current outcome: `Incident response runbook prepared; named owners and drill evidence pending`
- Current recommendation: `Assign incident roles and run a non-production tabletop drill before making stronger incident-response readiness claims`
