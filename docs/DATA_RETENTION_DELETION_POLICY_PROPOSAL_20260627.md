# Vinea Data Retention And Deletion Policy Proposal - 2026-06-27

Status: Proposal prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this proposal.

## Purpose

This proposal gives Vinea a conservative starting point for parish data retention, deletion, export, and offboarding decisions. It is intended for product-owner, legal/data-owner, parish operations, and canonical-record review before any automated deletion or public trust-center claim is implemented.

This is not yet an approved customer-facing policy, not legal advice, and not a data-deletion automation plan.

## Current Decision State

Current retention/deletion readiness: `PROPOSAL PREPARED, APPROVAL AND AUTOMATION NOT COMPLETE`

Vinea should not claim formal retention automation, automated deletion, or complete customer offboarding workflows until:

- Product owner approves the proposed policy.
- Legal/data owner reviews privacy, contract, and state-law requirements.
- Parish/canonical record owner reviews sacramental and canonical exceptions.
- Engineering designs and tests deletion/export workflows.
- Audit evidence proves deletion/export actions are permissioned and logged.
- Customer-facing policy language is reviewed for accuracy.

## Guiding Principles

- Preserve records that parishes may need for pastoral, administrative, canonical, or legal reasons.
- Minimize unnecessary sensitive data, especially family portal tokens, uploaded documents, AI drafts, and transient intake artifacts.
- Never delete sacramental/canonical records automatically without explicit parish/canonical policy approval.
- Prefer deactivation, archival, or restricted visibility before hard deletion when record history matters.
- Keep audit logs long enough to investigate access, deletion, exports, staff actions, and sensitive data changes.
- Make parish offboarding safe: export first, confirm ownership, then delete or retain according to the signed agreement and canonical exceptions.
- Keep family-facing access short-lived and revocable.
- Treat AI outputs as derived sensitive data, not disposable UI text.

## Proposed Data Classes

| Data class | Examples | Sensitivity | Proposed handling |
|---|---|---:|---|
| Parish operational requests | Baptism, wedding, funeral, OCIA, join parish requests | High | Retain while active; archive after completion; delete only through approved retention/offboarding process |
| Internal notes | Staff notes, pastoral context, private follow-up notes | Very high | Retain with request/record context; restrict access; delete only through approved admin workflow |
| Communication history | Email drafts, sent emails, communication records, phone-call summaries if added later | High | Retain for accountability; separate outbound evidence from draft-only content |
| Audit logs | Staff actions, settings changes, document approvals, portal-token actions, security events | Very high | Long retention; append-only; no routine deletion by parish staff |
| Documents | Baptism certificates, IDs, forms, sacramental prep documents, funeral/wedding documents | Very high | Retain according to document type; support approval/rejection and eventual archive/delete controls |
| Family portal tokens | Token hashes, expiration, deactivation metadata | High | Short-lived by default; store hashes only; deactivate on completion/offboarding |
| AI outputs | AI summaries, AI email drafts, future call summaries, suggested actions | High | Retain only when staff saves/uses them; audit sensitive AI actions; avoid autonomous deletion decisions |
| People and households | Parishioner directory, household membership, contact data | High | Retain while parish relationship exists; export/offboarding rules needed |
| Sacramental/canonical records | Baptism, confirmation, marriage, funeral, notations, certificate issuance logs | Canonical/critical | Indefinite retention unless parish/diocese policy says otherwise; no automatic hard deletion |

## Proposed Retention Schedule

These are product recommendations for review, not approved policy.

| Area | Proposed retention | Deletion approach | Approval required before automation |
|---|---|---|---|
| Open requests | Until completed, cancelled, or archived | No automatic deletion | Product owner |
| Completed requests | Minimum 7 years after completion, then archive review | Admin-reviewed archive/delete, except sacramental-linked data | Product owner and legal/data owner |
| Request notes | Match parent request or linked sacramental record retention | Admin-reviewed only; never family-facing | Product owner and legal/data owner |
| Communications | Minimum 7 years for sent/outbound history; shorter for unsent drafts if not tied to a record | Admin-reviewed delete/archive | Product owner and legal/data owner |
| Audit logs | Minimum 7 years; longer for security/deletion/export events | Append-only; deletion only by platform owner under policy | Security/data owner |
| Uploaded request documents | Retain while request is active; after completion, retain based on request/document type | Archive/delete by document type; keep approval history | Product owner, legal/data owner, parish operations |
| Rejected documents | Minimum 1 year after rejection or request completion, whichever is later | Admin-reviewed purge if not canonically required | Product owner and legal/data owner |
| Family portal tokens | Expire by default; deactivate on request completion, token rotation, or offboarding | Token hashes may remain for audit; no plaintext retention | Product owner and security/data owner |
| AI summaries | Retain only when saved to request/person/communication history | Delete with parent object unless legal hold/canonical exception applies | Product owner and legal/data owner |
| AI email drafts | Retain only if sent or explicitly saved; otherwise treat as transient | Purge abandoned drafts after a short configurable period | Product owner |
| People/households | Retain while parish relationship is active; archive inactive members before deletion | Export first during offboarding; deletion reviewed | Product owner and legal/data owner |
| Sacramental records | Indefinite retention by default | No automated hard deletion; corrections/notations instead | Parish/canonical record owner and diocese policy |
| Certificate issuance logs | Indefinite or match sacramental record retention | No routine deletion | Parish/canonical record owner |
| Imports | Retain import summary and audit trail; purge raw upload files after successful import window | Time-boxed raw-file deletion | Product owner and security/data owner |

## Canonical And Sacramental Exceptions

Sacramental and canonical records require special treatment because they may be governed by parish, diocesan, civil, and Church requirements.

Vinea should not automatically delete:

- Sacramental records.
- Sacramental record events or notations.
- Certificate issuance logs.
- Records linked to baptism, confirmation, marriage, funeral, OCIA, or future canonical workflows.
- Audit logs proving who viewed, changed, corrected, exported, or issued a certificate from those records.

Recommended model:

- Use correction, notation, superseded-state, or restricted-visibility workflows instead of hard deletion.
- Require parish/canonical record owner approval for any destructive record action.
- Make diocesan policy configurable later, but do not build custom retention automation before the canonical baseline is agreed.

## Parish Offboarding Proposal

Before deleting or disabling a parish tenant, Vinea should complete a controlled offboarding workflow.

Minimum offboarding gates:

1. Confirm parish identity and authorized decision-maker.
2. Freeze or restrict new staff access if requested.
3. Export operational data in a documented format.
4. Export documents where allowed by contract and policy.
5. Export sacramental/canonical records separately with clear custody notes.
6. Deactivate public intake routing, domains, and tokens.
7. Deactivate family portal tokens.
8. Rotate or remove integration credentials.
9. Preserve required audit/deletion/offboarding records.
10. Confirm deletion/archive decision in writing.

Do not delete sacramental/canonical records during offboarding unless the approved parish/diocesan policy explicitly allows the action and evidence is recorded.

## Deletion Workflow Proposal

Future deletion tooling should require:

- Staff authorization and active parish context.
- Explicit object type and parish scope.
- Preview of what will be deleted, archived, retained, or blocked.
- Reason code.
- Optional legal hold or canonical hold flag.
- Two-step confirmation for destructive actions.
- Audit event before and after deletion.
- Deletion evidence report.
- Rollback/recovery expectation, if any.

Recommended deletion outcomes:

- `archive`: hide from daily workflows but retain for reporting/history.
- `deactivate`: disable access, tokens, routes, or user membership without deleting history.
- `redact`: remove specific sensitive fields while preserving operational shell and audit chain.
- `hard_delete`: rare, gated, audited, and unavailable for canonical records by default.

## Public Trust-Center Claim Boundaries

Safe internal statement:

> Vinea has prepared a data retention and deletion policy proposal covering parish operational data, documents, audit logs, AI outputs, family portal tokens, offboarding, and sacramental record exceptions.

Do not claim:

- Vinea has approved retention automation.
- Vinea automatically deletes all customer data on a fixed schedule.
- Vinea can delete sacramental/canonical records on demand.
- Vinea has completed customer offboarding automation.
- Vinea has legal approval for this policy.

## Implementation Gates Before Coding

Do not implement automated deletion until these gates are complete:

1. Product owner approves retention periods.
2. Legal/data owner approves privacy and contractual requirements.
3. Parish/canonical record owner approves sacramental/canonical exceptions.
4. Security/data owner approves audit and deletion evidence requirements.
5. Engineering designs schema/API/UI changes.
6. Non-production tests prove archive/delete/export actions are permissioned and audited.
7. Build status records the approved policy version.

## Recommended Future Engineering Phases

1. Add policy constants/config docs only; no deletion runtime.
2. Add admin-facing retention policy read-only page.
3. Add export inventory and offboarding checklist.
4. Add archive/deactivate workflow for low-risk objects.
5. Add deletion preview/reporting framework.
6. Add approved automated cleanup only for low-risk transient data, such as expired token plaintext display state or abandoned unsaved drafts.
7. Add canonical-hold guardrails before any sacramental record destructive workflow.

## Final Outcome

- Current outcome: `Retention/deletion policy proposal prepared; approval and automation pending`
- Current recommendation: `Review with product owner, legal/data owner, and parish/canonical record owner before any runtime deletion work`
