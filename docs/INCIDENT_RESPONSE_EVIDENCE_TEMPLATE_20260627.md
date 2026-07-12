# Vinea Incident Response Evidence Template - Parish Data Access Incidents - 2026-06-27

Status: Template prepared only. No incident drill was executed while preparing this template. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed.

## Purpose

Use this template to capture evidence for a suspected or confirmed parish data access incident, or for a non-production incident tabletop drill. It is designed to preserve the facts needed for triage, containment, customer communication, postmortem, and trust-center readiness without storing secrets or unnecessary private parish data.

This is not a completed incident record, not customer notification, and not proof of incident-response maturity.

## Incident Identity

| Field | Value |
|---|---|
| Incident ID | `PENDING` |
| Incident type | `PENDING` |
| Severity | `PENDING` |
| Environment | `PENDING` |
| Production involved? | `No` |
| Drill or real incident? | `PENDING` |
| Date/time opened | `PENDING` |
| Date/time contained | `PENDING` |
| Date/time closed | `PENDING` |
| Incident commander | `PENDING` |
| Technical lead | `PENDING` |
| Customer communications owner | `PENDING` |
| Legal/data owner | `PENDING` |
| Evidence owner | `PENDING` |
| Security reviewer | `PENDING` |

## Scenario Classification

Select all that apply:

- [ ] Family portal token exposure.
- [ ] Family portal displayed staff-only data.
- [ ] Request document signed URL exposure.
- [ ] Direct storage privacy failure.
- [ ] Cross-parish request/detail visibility.
- [ ] Cross-parish document visibility.
- [ ] Active parish context/cookie scope failure.
- [ ] Membership-aware RLS allow/deny failure.
- [ ] Public intake routing misdirected request.
- [ ] AI output exposed internal notes, staff-only data, or wrong-parish context.
- [ ] Audit-log gap or suspicious audit-event state.
- [ ] Other: `PENDING`.

## Initial Report

| Field | Value |
|---|---|
| Reported by | `PENDING` |
| Reporter role | `PENDING` |
| Report channel | `PENDING` |
| First observed time | `PENDING` |
| First observed behavior | `PENDING` |
| Affected parish or suspected scope | `PENDING` |
| Affected data classes | `PENDING` |
| Immediate risk to minors, sacramental records, pastoral notes, documents, or multi-parish tenant boundaries? | `PENDING` |

## Evidence Inventory

Do not paste secrets, plaintext family portal tokens, private document contents, production credentials, or unnecessary parishioner data into this record.

| Evidence item | Location or redacted summary | Captured by | Timestamp | Notes |
|---|---|---|---|---|
| Incident timeline | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Route/API response | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Screenshot or screen recording | `PENDING` | `PENDING` | `PENDING` | Redact parishioner/private document content |
| Audit events | `PENDING` | `PENDING` | `PENDING` | Preserve event IDs and timestamps |
| Supabase RLS/policy state | `PENDING` | `PENDING` | `PENDING` | Only if authorization/RLS-related |
| Active parish context/cookie observation | `PENDING` | `PENDING` | `PENDING` | Only record safe scope metadata |
| Storage object path metadata | `PENDING` | `PENDING` | `PENDING` | Do not attach private document contents |
| Signed URL metadata | `PENDING` | `PENDING` | `PENDING` | Record expiration and target metadata only |
| Family portal token metadata | `PENDING` | `PENDING` | `PENDING` | Hash/status/expiration only; no plaintext token |
| AI prompt/output excerpt | `PENDING` | `PENDING` | `PENDING` | Redact sensitive content |
| Deployment/change history | `PENDING` | `PENDING` | `PENDING` | Commit, deployment, feature flag, migration references |

## Affected Records

Use IDs and safe summaries. Do not include private document contents or unnecessary personal details.

| Record type | Safe identifier | Parish scope | Exposure status | Notes |
|---|---|---|---|---|
| Parish | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Staff user | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Request | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Request note | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Communication | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Workflow step | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Request document | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Family portal token | `PENDING` | `PENDING` | `PENDING` | Hash/status only |
| Person/household | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Sacramental record | `PENDING` | `PENDING` | `PENDING` | Use extra caution |

## Containment Evidence

| Action | Approved by | Executed by | Timestamp | Evidence | Result |
|---|---|---|---|---|---|
| Feature flag disabled | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Portal tokens deactivated | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Staff access restricted | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Document access blocked or repaired | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Deployment rolled back | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| RLS/policy rollback | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Customer communication held/sent | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

## Recovery Verification

| Verification | Expected result | Actual result | Evidence location | Owner |
|---|---|---|---|---|
| Request detail access | Only authorized active-parish staff can view | `PENDING` | `PENDING` | `PENDING` |
| Request documents | Only authorized staff/family surfaces can access | `PENDING` | `PENDING` | `PENDING` |
| Signed URL access | Signed URLs are scoped, temporary, and correct | `PENDING` | `PENDING` | `PENDING` |
| Direct storage privacy | Direct unauthenticated/private storage access denied | `PENDING` | `PENDING` | `PENDING` |
| Family portal safety | No internal notes, AI notes, audit logs, token hashes, or private parish data exposed | `PENDING` | `PENDING` | `PENDING` |
| Active parish context | Selected parish does not expose other-parish data | `PENDING` | `PENDING` | `PENDING` |
| Membership-aware RLS | Cross-parish allow/deny cases behave as expected | `PENDING` | `PENDING` | `PENDING` |
| Audit events | Incident/recovery actions are recorded | `PENDING` | `PENDING` | `PENDING` |
| AI routes, if relevant | AI does not expose wrong-parish or staff-only context | `PENDING` | `PENDING` | `PENDING` |

## Customer Communication Record

Use `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md` when drafting customer-facing updates.

| Field | Value |
|---|---|
| Customer communication required? | `PENDING` |
| Communication approved by legal/data owner? | `PENDING` |
| Communication approved by incident commander? | `PENDING` |
| Communication approved by customer communications owner? | `PENDING` |
| Parish/diocese recipients | `PENDING` |
| Sent timestamp | `PENDING` |
| Message location | `PENDING` |
| Follow-up required? | `PENDING` |

## Postmortem Evidence

| Field | Value |
|---|---|
| Root cause | `PENDING` |
| Detection source | `PENDING` |
| What worked well | `PENDING` |
| What slowed response | `PENDING` |
| Corrective actions | `PENDING` |
| Product/process follow-ups | `PENDING` |
| Owners and due dates | `PENDING` |
| Trust-center claim impact | `PENDING` |
| Final severity | `PENDING` |
| Final outcome | `PENDING` |

## Completion Gate

This incident or drill is not complete until:

- [ ] Severity and incident window are recorded.
- [ ] Evidence is preserved without secrets or unnecessary private data.
- [ ] Audit-log preservation is confirmed.
- [ ] Containment actions are documented.
- [ ] Recovery checks are documented.
- [ ] Customer communication decision is documented.
- [ ] Postmortem is completed or explicitly not required.
- [ ] Follow-up owners and due dates are recorded.
- [ ] Incident commander signs off.
- [ ] Evidence owner confirms storage location.

## Final Outcome

- Current outcome: `Evidence template prepared; no incident or tabletop drill executed`
- Current recommendation: `Use this template during a non-production tabletop drill before making stronger incident-response readiness claims`
