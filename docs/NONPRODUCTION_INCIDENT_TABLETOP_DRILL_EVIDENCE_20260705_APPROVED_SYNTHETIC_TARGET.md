# Non-Production Incident Tabletop Drill Evidence Template - Approved Synthetic Target - 2026-07-05

Status: Prepared as a label-only evidence template for a future approved non-production tabletop drill. No tabletop drill was executed while preparing this template. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, communications were not sent, public trust-center copy was not published, and no secrets were exposed while preparing this template.

Current public trust-center decision: `NO-GO`

Current incident tabletop decision: `EVIDENCE TEMPLATE PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`

Completion marker: `NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_TEMPLATE_20260705_APPROVED_SYNTHETIC_TARGET`

## Purpose

This file is the prepared evidence copy for the future approved non-production incident tabletop drill described in `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md`.

It is designed to capture label-only outcomes for the synthetic family portal/document exposure scenario and the synthetic cross-parish active-parish/RLS exposure scenario. It must not contain real parishioner data, raw identifiers, secrets, provider payloads, private document contents, storage paths, signed URL values, raw exports, raw audit metadata, AI prompts, AI outputs, or customer communication send evidence.

Primary references:

- `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md`
- `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md`
- `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`

Supporting trust-center references:

- `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md`
- `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`

## Approval Confirmation

Do not fill this section unless the product owner has provided the exact approval language from the approval packet.

| Field | Label-only value |
|---|---|
| Approval phrase present? | `PENDING - DO NOT RUN` |
| Approval phrase | `PENDING - APPROVAL REQUIRED` |
| Approved non-production target label | `PENDING - LABEL ONLY` |
| Drill execution date/time window | `PENDING - LABEL ONLY` |
| Drill executed? | `No - template prepared only` |
| Production involved? | `No` |
| Public trust-center decision | `NO-GO` |
| Customer communications sent? | `No - draft-only review is allowed after approval` |

## Owner Labels

| Required role | Label-only value | Present before execution? |
|---|---|---|
| Incident commander | `PENDING - LABEL ONLY` | `PENDING` |
| Technical lead | `PENDING - LABEL ONLY` | `PENDING` |
| Evidence owner | `PENDING - LABEL ONLY` | `PENDING` |
| Customer communications owner | `PENDING - LABEL ONLY` | `PENDING` |
| Legal/data owner | `PENDING - LABEL ONLY` | `PENDING` |
| Product owner | `PENDING - LABEL ONLY` | `PENDING` |
| Security reviewer | `PENDING - LABEL ONLY` | `PENDING` |
| Support owner | `PENDING - LABEL ONLY` | `PENDING` |
| Evidence storage owner | `PENDING - LABEL ONLY` | `PENDING` |
| Stop-condition owner | `PENDING - LABEL ONLY` | `PENDING` |

## Evidence Redaction Rules

Before any future drill execution, the evidence owner must confirm:

- [ ] Evidence uses labels, pass/fail outcomes, and redacted summaries only.
- [ ] No real parishioner names, family names, staff private details, private document contents, original filenames, storage paths, signed URL values, plaintext tokens, token material, database URLs, API keys, provider payloads, raw exports, raw audit metadata, raw IDs, AI prompts, AI outputs, screenshots with private data, private notes, communications, sacramental/canonical details, or pastoral notes are included.
- [ ] Screenshots, if separately approved, are redacted before being referenced.
- [ ] Communications are draft-only and not sent.
- [ ] Public trust-center publishing remains `NO-GO`.

## Scenario 1 - Synthetic Family Portal And Request Document Exposure

| Evidence field | Label-only result |
|---|---|
| Scenario label | `Synthetic family portal and request document exposure drill` |
| Scenario executed? | `No - template prepared only` |
| Severity assigned | `PENDING` |
| Synthetic parish label | `PENDING - LABEL ONLY` |
| Synthetic staff label | `PENDING - LABEL ONLY` |
| Synthetic request label | `PENDING - LABEL ONLY` |
| Synthetic document set label | `PENDING - LABEL ONLY` |
| Synthetic family portal token label | `PENDING - HASH/STATUS LABEL ONLY; NO PLAINTEXT TOKEN` |
| Initial report summary | `PENDING - REDACTED SUMMARY ONLY` |
| Family portal safety outcome | `PENDING` |
| Staff-only data exclusion outcome | `PENDING` |
| Request document access discussion outcome | `PENDING` |
| Signed URL behavior discussion outcome | `PENDING - DISCUSSION ONLY; NO SIGNED URL CREATED` |
| Direct storage privacy discussion outcome | `PENDING - DISCUSSION ONLY; NO STORAGE ACCESSED` |
| Token deactivation or containment decision | `PENDING - DISCUSSION ONLY UNLESS SEPARATELY APPROVED` |
| Audit preservation discussion outcome | `PENDING` |
| Communication draft decision | `PENDING - DRAFT ONLY; DO NOT SEND` |
| Recovery verification discussion outcome | `PENDING` |
| Postmortem follow-up owner labels | `PENDING - LABEL ONLY` |
| Scenario result | `PENDING - PASS, PASS WITH FOLLOW-UP, FAIL, or BLOCKED` |

### Scenario 1 Pass/Fail Notes

| Gate | Expected label-only outcome | Actual label-only outcome |
|---|---|---|
| Severity recorded | Severity label and reason recorded | `PENDING` |
| Evidence redacted | No forbidden data appears | `PENDING` |
| Family portal boundary | Internal notes, AI notes, audit logs, token hashes, and private parish data are not exposed | `PENDING` |
| Document access boundary | Document access behavior is discussed without private document contents | `PENDING` |
| Storage and signed URL boundary | No storage access or signed URL creation occurs | `PENDING` |
| Communication boundary | Draft-only decision recorded; no messages sent | `PENDING` |
| Trust boundary | Public trust-center claims remain `NO-GO` | `PENDING` |

## Scenario 2 - Synthetic Cross-Parish Active-Parish Or RLS Exposure

| Evidence field | Label-only result |
|---|---|
| Scenario label | `Synthetic cross-parish active parish or RLS exposure drill` |
| Scenario executed? | `No - template prepared only` |
| Severity assigned | `PENDING` |
| Synthetic Parish A label | `PENDING - LABEL ONLY` |
| Synthetic Parish B label | `PENDING - LABEL ONLY` |
| Synthetic multi-parish staff label | `PENDING - LABEL ONLY` |
| Synthetic single-parish staff label | `PENDING - LABEL ONLY` |
| Synthetic request labels | `PENDING - LABEL ONLY` |
| Synthetic document labels | `PENDING - LABEL ONLY` |
| Synthetic people/household labels | `PENDING - LABEL ONLY` |
| Synthetic sacramental record labels | `PENDING - LABEL ONLY` |
| Synthetic Mass intention labels | `PENDING - LABEL ONLY` |
| Active parish context discussion outcome | `PENDING` |
| Membership-aware RLS discussion outcome | `PENDING - DISCUSSION ONLY; NO RLS CHANGE` |
| Request detail scope outcome | `PENDING` |
| Document scope outcome | `PENDING` |
| Note, communication, and workflow-step scope outcome | `PENDING` |
| People, household, sacramental record, and Mass intention scope outcome | `PENDING` |
| Containment or rollback decision | `PENDING - DISCUSSION ONLY; NO RUNTIME CHANGE` |
| Audit preservation discussion outcome | `PENDING` |
| Communication draft decision | `PENDING - DRAFT ONLY; DO NOT SEND` |
| Recovery verification discussion outcome | `PENDING` |
| Postmortem follow-up owner labels | `PENDING - LABEL ONLY` |
| Scenario result | `PENDING - PASS, PASS WITH FOLLOW-UP, FAIL, or BLOCKED` |

### Scenario 2 Pass/Fail Notes

| Gate | Expected label-only outcome | Actual label-only outcome |
|---|---|---|
| Severity recorded | Severity label and tenant-boundary reason recorded | `PENDING` |
| Evidence redacted | No forbidden data appears | `PENDING` |
| Active parish boundary | Selected parish does not expose wrong-parish data | `PENDING` |
| Membership boundary | Allow/deny behavior is discussed without applying RLS changes | `PENDING` |
| Operational record boundary | Requests, documents, notes, communications, workflow steps, people, households, records, and Mass intentions remain label-only | `PENDING` |
| Communication boundary | Draft-only decision recorded; no messages sent | `PENDING` |
| Trust boundary | Public trust-center claims remain `NO-GO` | `PENDING` |

## Stop-Condition Review

Mark each item before and after any future approved drill.

| Stop condition | Before drill | After drill |
|---|---|---|
| Production selected or suspected | `PENDING` | `PENDING` |
| Real parishioner/private data appears | `PENDING` | `PENDING` |
| Credential, secret, database URL, storage path, signed URL, raw export, or raw metadata needed | `PENDING` | `PENDING` |
| Customer communication send proposed | `PENDING` | `PENDING` |
| Migration, operational RLS change, runtime change, storage access, export execution, AI call, Google Calendar access, or record mutation proposed | `PENDING` | `PENDING` |
| Evidence cannot be safely redacted | `PENDING` | `PENDING` |
| Discussion starts producing public trust-center claims | `PENDING` | `PENDING` |

## Final Drill Result

Do not complete this section until a future approved non-production tabletop drill is executed.

| Field | Label-only value |
|---|---|
| Overall result | `PENDING - PASS, PASS WITH FOLLOW-UP, FAIL, or BLOCKED` |
| Scenario 1 result | `PENDING` |
| Scenario 2 result | `PENDING` |
| Unresolved risks | `PENDING - LABELS AND REDACTED SUMMARIES ONLY` |
| Follow-up owner labels | `PENDING - LABEL ONLY` |
| Follow-up due-date labels | `PENDING - LABEL ONLY` |
| Evidence owner sign-off | `PENDING` |
| Incident commander sign-off | `PENDING` |
| Security/data owner sign-off | `PENDING` |
| Product owner sign-off | `PENDING` |
| Public trust-center decision | `NO-GO` |

## What Changed Plain English

This file is a blank, safe evidence form for a future fake incident drill. It tells the team what to record, what not to record, and how to keep the evidence safe. It does not mean the drill happened, and it does not allow Vinea to make public security or trust-center claims yet.
