# Non-Production Incident Tabletop Drill Execution Approval Packet - 2026-07-05

Status: Prepared as a non-runtime, non-secret approval packet only. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, communications were not sent, no tabletop drill was executed, public trust-center copy was not published, and no secrets were exposed while preparing this packet.

Current public trust-center decision: `NO-GO`

Current incident tabletop decision: `EXECUTION APPROVAL PACKET PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`

Completion marker: `NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705`

## Purpose

This packet defines the exact information and approval language required before Vinea may run a non-production incident tabletop drill for parish data access incidents. It uses the incident owner worksheet, runbook, evidence template, communication templates, and tabletop plan, but it does not execute the drill.

Primary references:

- `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`
- `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md`

Supporting trust-center references:

- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`
- `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md`
- `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md`
- `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md`

## Approval Boundary

This packet may be used only to request approval for a future non-production tabletop drill. It does not approve:

- Production access.
- Production feature flags.
- Migrations.
- Operational RLS changes.
- Runtime behavior changes.
- Record mutations.
- Google Calendar access.
- Export execution.
- AI calls.
- Storage access.
- Signed URL creation.
- Customer communication sends.
- Public trust-center claims.
- Formal compliance or certification claims.

## Required Non-Secret Inputs Before Execution

| Input | Required non-secret value | Example label |
|---|---|---|
| Approval phrase | Exact phrase from product owner | `APPROVED_NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION` |
| Drill target label | Non-production environment label only | `Approved local/shared-QA synthetic tabletop target` |
| Incident commander label | Person or role label only | `Vinea incident commander` |
| Technical lead label | Person or role label only | `Vinea technical lead` |
| Evidence owner label | Person or role label only | `Vinea evidence owner` |
| Customer communications owner label | Person or role label only | `Vinea customer communications owner` |
| Legal/data owner label | Person or role label only | `Vinea legal/data owner` |
| Product owner label | Person or role label only | `Vinea product owner` |
| Security reviewer label | Person or role label only | `Vinea security reviewer` |
| Support owner label | Person or role label only | `Vinea support owner` |
| Evidence file name | Repo-owned evidence markdown path, no secrets | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md` |
| Scenario set | Synthetic scenario labels only | `Family portal/document exposure plus cross-parish active-parish/RLS exposure` |
| Communication mode | Draft-only confirmation | `Draft only; no customer communication sent` |
| Stop-condition owner | Person or role label only | `Vinea incident commander` |
| Evidence storage owner | Person or role label only | `Vinea evidence owner` |

## Approved Scenario Scope For Future Execution

If explicitly approved later, the tabletop may cover only:

1. `Synthetic family portal and request document exposure drill`
   - Family portal token exposure concern.
   - Request document access concern.
   - Signed URL behavior discussion without creating signed URLs.
   - Direct storage privacy discussion without accessing storage.
   - Staff-only data exclusion review.
   - Customer communication draft only.

2. `Synthetic cross-parish active parish or RLS exposure drill`
   - Active parish context/cookie concern.
   - Membership-aware RLS allow/deny discussion.
   - Request detail, document, note, communication, workflow step, people, household, sacramental record, and Mass intention scope discussion using synthetic labels only.
   - Containment and rollback decision discussion without changing RLS or runtime behavior.
   - Customer communication draft only.

## Execution Steps For Future Approved Drill

These steps are planning instructions only until the approval phrase is provided.

1. Confirm approval phrase and non-production target label.
2. Confirm required owner labels from `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md`.
3. Create the evidence file from `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md` using the approved evidence filename.
4. Record environment identity as a label only.
5. Run scenario readout from `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md`.
6. Assign severity for each synthetic scenario.
7. Discuss evidence capture and redaction; do not paste secrets or private data.
8. Discuss containment decisions; do not execute production or runtime changes.
9. Draft customer communications using `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`; do not send communications.
10. Record recovery checks as discussion outcomes only unless separately approved non-production browser/API checks are included.
11. Record postmortem follow-ups and owners.
12. Record final outcome as `PASS`, `PASS WITH FOLLOW-UP`, `FAIL`, or `BLOCKED`.
13. Confirm public trust-center claims remain `NO-GO`.

## Pass/Fail Criteria

| Gate | Pass criteria | Fail or stop condition |
|---|---|---|
| Approval phrase | Exact approval phrase is present | Missing or altered approval phrase |
| Environment | Target is explicitly non-production and synthetic | Production target, real parish data, or ambiguous target |
| Owner readiness | Required owner labels are present | Required owner label missing or `TBD` |
| Evidence handling | Evidence file uses labels, summaries, and redacted notes only | Raw IDs, secrets, private document contents, signed URLs, storage paths, raw metadata, raw exports, AI prompt/output, or provider payload appears |
| Communication | Communications remain draft-only | Any customer, parish, diocese, staff, or family communication is sent |
| Runtime safety | No migrations, RLS changes, runtime changes, record mutations, exports, AI calls, storage access, signed URLs, Google Calendar access, or production flags occur | Any forbidden runtime or external action is attempted |
| Trust-center boundary | Final evidence says public trust-center claims remain `NO-GO` | Evidence implies production readiness, legal approval, formal certification, or public incident-response maturity |

## Stop Conditions

Stop immediately if:

- Production is selected or suspected.
- Real parishioner, family, document, token, note, communication, sacramental, or pastoral data appears.
- A participant needs a credential, secret, database URL, provider key, storage path, signed URL, or raw audit/export payload.
- Anyone proposes sending customer communication.
- The drill would require migrations, operational RLS changes, production flags, runtime changes, storage access, signed URL creation, export execution, AI calls, Google Calendar access, or record mutation.
- Evidence cannot be stored with safe redaction.
- The discussion starts producing public trust-center claims.

## Evidence File Requirements

The future evidence file must include:

- Approval phrase present: yes/no.
- Non-production target label.
- Owner labels.
- Scenario labels.
- Severity assignment for each scenario.
- Evidence redaction confirmation.
- Customer communication draft-only confirmation.
- Containment decision summary.
- Recovery check discussion summary.
- Postmortem follow-up owners.
- Stop-condition review.
- Final drill result.
- Public trust-center decision: `NO-GO`.

Do not include raw IDs, private document names, storage paths, signed URL values, plaintext tokens, secrets, provider payloads, raw export contents, raw audit metadata, AI prompts, AI outputs, private notes, communications, screenshots with private data, or production command output.

## Exact Future Approval Language

Use this exact language only when the product owner is ready to run the drill in a safe non-production target:

```text
Approve execution of the non-production incident tabletop drill only. Use docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md, docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md, docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md, docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md, docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md, and docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md.

I confirm the approval phrase is APPROVED_NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION. Use only the approved non-production synthetic tabletop target. Run only the synthetic family portal/document exposure and synthetic cross-parish active-parish/RLS tabletop scenarios. Communications must be draft-only and not sent. Evidence must use labels, pass/fail outcomes, and redacted summaries only.

Do not access production, enable production flags, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, expose raw exports or raw metadata, send communications, expose secrets, or make public trust claims.

After execution, update the evidence file, record unresolved risks, keep public trust-center publishing NO-GO, run checks, update build status, summarize, and include estimated total project completion percentage.
```

## What Changed Plain English

This packet is the permission slip for a future fake incident drill. It says exactly what information is needed, what scenarios are allowed, what evidence must be saved, and what actions are forbidden. It does not run the drill or prove incident-response readiness yet.
