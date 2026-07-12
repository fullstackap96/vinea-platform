# Incident Tabletop Evidence Package Index - 2026-07-05

Status: Prepared as a non-runtime, non-secret trust-center readiness index only. No tabletop drill was executed while preparing this index. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, communications were not sent, public trust-center copy was not published, and no secrets were exposed while preparing this index.

Current public trust-center decision: `NO-GO`

Current incident tabletop decision: `EVIDENCE PACKAGE INDEX PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`

Completion marker: `INCIDENT_TABLETOP_EVIDENCE_PACKAGE_INDEX_20260705`

## Purpose

This index gives Vinea one reviewable place for the non-production incident tabletop drill package. It links the owner worksheet, execution approval packet, future evidence template, incident runbook, customer communication templates, tabletop plan, public claims boundary matrix, and remaining `NO-GO` items.

It does not approve the drill, prove incident-response maturity, approve customer communication sends, approve production access, or approve public trust-center claims.

## Package Contents

| Artifact | Purpose | Current status | Required next evidence |
|---|---|---|---|
| `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md` | Defines owner labels, synthetic scenario labels, missing evidence, and owner-review readiness | Prepared; drill execution still `NO-GO` | Product owner and security/data owner review of non-secret role labels |
| `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md` | Defines exact future approval phrase, allowed scenarios, target label, pass/fail criteria, stop conditions, and forbidden actions | Prepared; execution not approved | Exact approval language from product owner before any drill |
| `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md` | Provides label-only evidence fields for a future approved synthetic drill | Prepared as blank template; no drill evidence recorded | Future completed evidence after an approved non-production drill |
| `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md` | Defines severity, responsibilities, containment, recovery, postmortem, and approval gates | Prepared | Tabletop execution evidence showing the runbook was exercised |
| `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md` | Defines the base incident/drill evidence structure and redaction boundaries | Prepared | Completed evidence copy from an approved drill |
| `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md` | Provides draft customer communication templates for incident scenarios | Prepared; send remains forbidden | Draft-only tabletop review, legal/data owner review, no-send confirmation |
| `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md` | Defines synthetic family portal/document and cross-parish active-parish/RLS tabletop scenarios | Prepared; no drill executed | Approved non-production drill run with pass/fail outcomes |
| `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md` | Defines which trust claims remain internal, blocked, or public `NO-GO` | Prepared; public trust-center publishing `NO-GO` | Owner-reviewed claim approval after real evidence exists |
| `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md` | Tracks trust-area owners, approval status, missing evidence, and next safe actions | Prepared; public claims still blocked | Human owner labels and evidence review |
| `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md` | Tracks missing trust evidence across readiness areas | Prepared | Update after future approved tabletop evidence is reviewed |

## Review Order Before Any Future Drill

1. Read this index.
2. Confirm the owner/sign-off worksheet has non-secret owner labels.
3. Confirm the execution approval packet still matches the intended safe non-production target.
4. Confirm the evidence template is blank and label-only before use.
5. Confirm the tabletop plan covers only synthetic family portal/document exposure and synthetic cross-parish active-parish/RLS exposure.
6. Confirm the incident runbook and communication templates are used for discussion and draft-only review.
7. Confirm the claims boundary matrix still marks public trust-center publishing `NO-GO`.
8. Confirm the product owner provides the exact approval phrase before any drill execution.

## Remaining NO-GO Items

| Area | Current decision | Why it remains blocked | Required before it can move |
|---|---|---|---|
| Tabletop drill execution | `NO-GO` | Product owner has not provided exact approval phrase for execution | Exact approval language, owner labels, approved non-production target label, evidence storage label |
| Production access | `NO-GO` | This package is non-production only | Separate production incident process and explicit production approval |
| Production flags | `NO-GO` | No production runtime behavior is in scope | Separate production runtime approval |
| Migrations or operational RLS changes | `NO-GO` | The tabletop package is discussion/evidence only | Separate migration/RLS approval path |
| Record mutation | `NO-GO` | Drill evidence must be synthetic and label-only | Separate non-production mutation approval if ever needed |
| Google Calendar, exports, AI, storage, or signed URLs | `NO-GO` | These systems are explicitly out of scope | Separate approved QA packet for each system |
| Customer communication sends | `NO-GO` | Communication review is draft-only | Legal/data owner and product owner approval for any real communication path |
| Raw exports or raw metadata exposure | `NO-GO` | Evidence must remain redacted and label-only | Evidence owner approval and redaction review |
| Public trust-center publishing | `NO-GO` | No actual tabletop drill evidence exists yet | Completed drill evidence, owner review, claim review, and product/security approval |
| Incident-response maturity claims | `NO-GO` | Prepared docs do not prove execution | Completed non-production drill evidence and reviewed outcome |
| Formal compliance or certification claims | `NO-GO` | No formal audit/certification evidence exists | Formal third-party report and owner approval |

## Evidence Redaction Boundary

Any future evidence linked from this package must use labels, pass/fail outcomes, and redacted summaries only.

Do not include:

- Raw IDs.
- Real parishioner, family, staff-private, pastoral, sacramental, canonical, note, communication, or document content.
- Private document names or original filenames.
- Plaintext tokens or token material.
- Storage paths.
- Signed URL values.
- Database URLs.
- API keys.
- Provider payloads.
- Raw exports.
- Raw audit metadata.
- AI prompts or outputs.
- Screenshots with private data.
- Production command output.

## Approval Dependency Chain

| Step | Required artifact | Required decision |
|---|---|---|
| Owner readiness | `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md` | Owner labels reviewed with no `TBD` blockers |
| Execution approval | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md` | Exact approval phrase provided |
| Evidence capture | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md` | Label-only evidence file filled during approved drill |
| Runbook exercise | `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md` | Severity, containment, recovery, and postmortem steps discussed |
| Communication review | `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md` | Draft-only review recorded; no communications sent |
| Claims review | `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md` | Public trust-center decision remains `NO-GO` unless separately approved |

## Allowed Internal Wording After This Index

Allowed internally:

> Vinea has prepared a non-production incident tabletop drill package with owner labels, approval gates, redaction rules, a future evidence template, synthetic scenarios, and public-claim boundaries. The tabletop drill has not been run.

Do not say:

- Vinea has completed an incident tabletop drill.
- Vinea has production incident-response evidence.
- Vinea is ready to publish incident-response trust-center claims.
- Vinea has legal-approved customer notification workflows.
- Vinea has formal compliance certification.

## Next Safe Action

The next safe action is either:

1. Product owner reviews this index and the execution approval packet without running the drill; or
2. Product owner provides the exact approval language from `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md` to run the non-production synthetic tabletop drill and fill the evidence template.

Until that approval is provided, keep the tabletop drill and public trust-center claims `NO-GO`.

## What Changed Plain English

This index is the table of contents for Vinea's future fake incident drill. It gathers the owner worksheet, permission packet, blank evidence form, runbook, communication templates, tabletop plan, and public-claims boundary into one place. It makes clear that the drill still has not happened and that Vinea should not make public incident-response claims yet.
