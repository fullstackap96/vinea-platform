# Incident Tabletop Owner Sign-Off Worksheet - 2026-07-05

Status: Prepared as a non-runtime, non-secret owner/sign-off worksheet using role labels only. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, no tabletop drill was executed, public trust-center copy was not published, and no secrets were exposed while preparing this worksheet.

Current public trust-center decision: `NO-GO`

Current incident response decision: `OWNER SIGN-OFF WORKSHEET PREPARED; TABLETOP DRILL NOT EXECUTED`

Completion marker: `INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705`

## Purpose

This worksheet gives the product owner a non-secret way to prepare the people, role labels, evidence locations, synthetic scenario labels, approval status, missing evidence, and next safe action needed before Vinea runs a non-production incident tabletop drill.

It does not execute a tabletop drill, approve customer communication, approve production incident claims, approve public trust-center copy, or prove incident-response maturity.

Primary references:

- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md`
- `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`

Supporting references:

- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`
- `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md`
- `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md`
- `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`

## Use Rules

1. Fill this worksheet with non-secret labels only.
2. Do not paste real parishioner names, raw request IDs, raw document IDs, private document names, family portal plaintext tokens, storage paths, signed URLs, database URLs, API keys, provider secrets, raw audit metadata, raw exports, AI prompts, AI outputs, screenshots with private data, or private document contents.
3. Use role labels until humans are formally assigned, such as `Vinea incident commander`, `Vinea support communications owner`, or `Vinea evidence owner`.
4. Use synthetic scenario labels only.
5. Keep the tabletop drill blocked until owner labels, approval status, scenario labels, evidence storage, and stop conditions are reviewed.
6. Keep public trust-center publishing `NO-GO` even after this worksheet is filled.

## Approval Status Values

Use exactly one status per row:

- `NO-GO`: The tabletop step is blocked.
- `READY_FOR_OWNER_REVIEW`: Labels are complete enough for the product owner and security/data owner to review.
- `APPROVED_FOR_NONPRODUCTION_DRILL_PLANNING`: Owners may prepare the non-production drill packet, but the drill is not approved to run.
- `APPROVED_FOR_NONPRODUCTION_DRILL_EXECUTION`: Owners approve running the non-production drill in an explicitly approved non-production target.
- `COMPLETED_NONPRODUCTION_DRILL_REVIEW`: Drill evidence has been reviewed after execution.

This worksheet starts at `NO-GO`. It does not grant `APPROVED_FOR_NONPRODUCTION_DRILL_EXECUTION`.

## Owner Sign-Off Worksheet

| Area | Incident response owner label | Support communication owner label | Evidence owner label | Security/data owner label | Synthetic scenario label | Current approval status | Missing evidence | Next safe action |
|---|---|---|---|---|---|---|---|---|
| Overall tabletop readiness | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `All approved synthetic incident scenarios` | `NO-GO` | Named role labels, evidence storage location, drill target label, stop conditions, owner sign-off | Fill owner labels and scenario labels before requesting drill planning approval |
| Family portal/document exposure scenario | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic family portal and request document exposure drill` | `READY_FOR_OWNER_REVIEW` | Approved non-production target, synthetic request/document labels, token lifecycle decision labels, communication review | Prepare a drill execution approval packet without accessing production or real documents |
| Cross-parish active-parish/RLS scenario | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic cross-parish active parish or RLS exposure drill` | `READY_FOR_OWNER_REVIEW` | Approved non-production target, synthetic Parish A/B labels, synthetic staff labels, route/checklist evidence plan | Prepare a drill execution approval packet using synthetic tenant-boundary fixtures only |
| Customer communication review | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea legal/data owner` | `Synthetic customer communication draft review` | `NO-GO` | Legal/data review, communication owner review, no-send confirmation, template selection | Review templates with owner labels; do not send messages |
| Evidence handling and storage | `Vinea incident commander` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic evidence capture and redaction review` | `NO-GO` | Evidence storage label, redaction checklist, screenshot rules, audit-log preservation plan | Choose label-only evidence storage and redaction rules before drill execution |
| Postmortem and follow-up ownership | `Vinea incident commander` | `Vinea support owner` | `Vinea evidence owner` | `Vinea product owner` | `Synthetic postmortem and follow-up assignment review` | `NO-GO` | Postmortem owner, follow-up owner labels, due-date format, trust-center impact review | Prepare postmortem template fields and follow-up ownership rules |

## Required Owner Labels Before Drill Execution

| Required role | Non-secret label to fill | Required before execution? |
|---|---|---:|
| Incident commander | `Vinea incident commander` | Yes |
| Technical lead | `Vinea technical lead` | Yes |
| Evidence owner | `Vinea evidence owner` | Yes |
| Customer communications owner | `Vinea customer communications owner` | Yes |
| Legal/data owner | `Vinea legal/data owner` | Yes for customer communication review |
| Product owner | `Vinea product owner` | Yes for drill approval and postmortem follow-up |
| Security reviewer | `Vinea security reviewer` | Yes for cross-parish/RLS scenario |
| Support owner | `Vinea support owner` | Yes for customer-facing support path |

## Synthetic Scenario Labels

Use these labels instead of real production identifiers:

| Scenario label | What it covers | Forbidden evidence |
|---|---|---|
| `Synthetic family portal and request document exposure drill` | Family portal, request documents, signed URL behavior, direct storage privacy, token deactivation decision, staff-only data exclusion | Plaintext tokens, storage paths, signed URLs, private document contents, original filenames, real family data |
| `Synthetic cross-parish active parish or RLS exposure drill` | Active parish context, membership-aware RLS discussion, request detail, documents, notes, communications, workflow steps, people, households, sacramental records, Mass intentions | Raw IDs, real parish data, production RLS changes, production screenshots, private notes, raw audit metadata |
| `Synthetic customer communication draft review` | Holding statement, confirmed incident notice, no-impact notice, follow-up note, parish/diocese coordination note | Sent emails, legal conclusions, customer names, private facts, unapproved public claims |
| `Synthetic evidence capture and redaction review` | Evidence template, redaction rules, audit-log preservation, route/API summaries, screenshot handling | Secrets, service-role keys, database URLs, provider credentials, raw exports, raw metadata |
| `Synthetic postmortem and follow-up assignment review` | Root cause format, corrective actions, owner/due-date format, trust-center claim impact | Blame language, public trust claims, production guarantees, compliance certification language |

## Stop Conditions

Stop before drill execution if any of these are true:

- The drill target is production or contains real parishioner/private document data.
- Required owner labels are still blank or `TBD`.
- Evidence storage is not defined.
- Customer communication review would send a message instead of drafting only.
- The scenario would require migrations, operational RLS changes, production feature flags, runtime behavior changes, storage access, signed URL creation, exports, AI calls, Google Calendar access, or record mutation.
- The team cannot confirm redaction rules for screenshots, audit summaries, route/API output, document labels, token metadata, or incident notes.
- The drill would imply a public trust-center claim.

## Future Approval Language

Use this only after owner labels and synthetic scenario labels are complete:

```text
Approve non-production incident tabletop drill planning only. Use docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md, docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md, docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md, and docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md. Prepare a drill execution packet for the synthetic family portal/document exposure scenario and the synthetic cross-parish active-parish/RLS scenario. Do not run the drill, access production, send communications, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, expose raw exports or raw metadata, or make public trust claims.
```

## What Changed Plain English

This worksheet helps Vinea prepare for an incident tabletop drill without actually running it. It lists who needs to own the drill, what safe synthetic scenarios should be used, what proof is still missing, and what the next safe step is. It keeps public trust-center claims blocked until a real approved drill is completed and reviewed.
