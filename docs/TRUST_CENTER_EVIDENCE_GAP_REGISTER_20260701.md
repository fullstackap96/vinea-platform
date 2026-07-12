# Trust Center Evidence Gap Register - 2026-07-01

Status: Prepared as a non-runtime trust-center readiness register only. Production was not accessed, production flags were not enabled, production navigation was not added, production smoke was not run, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this register.

Current decision state: `INTERNAL TRUST-CENTER GAP REGISTER PREPARED; PUBLIC TRUST CENTER REMAINS NO-GO`

Completion marker: `TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701`

## Purpose

This register turns the trust-center readiness packet into an operational checklist. It shows what Vinea can say safely today, what evidence already exists, what evidence is missing, and what must happen before public trust-center or enterprise security claims are made.

This register does not approve production RLS, production exports, production dashboard exposure, public trust-center publishing, customer-facing security claims, certification claims, migrations, runtime behavior changes, or production access.

Primary reference:

- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

Supporting references:

- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`
- `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`
- `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`
- `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md`
- `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701.md`

## Claim Rules

Use these rules before any sales deck, security questionnaire, public page, or pilot agreement language is updated.

| Claim class | Current allowed posture | Public claim allowed? | Required next evidence |
|---|---|---:|---|
| Formal compliance certification | Do not claim SOC 2, HIPAA, PCI, ISO 27001, or equivalent certification | `NO` | Formal audit scope, auditor, controls, evidence, and certification report |
| Production diocesan-grade tenant isolation | Say non-production/shared-QA membership-aware RLS validation is complete, production remains gated | `NO` | Production RLS approval, rollout evidence, smoke evidence, rollback evidence, owner sign-off |
| Staff authorization | Say staff authentication and authorization checks exist for internal parish operations | `LIMITED_INTERNAL` | Production RLS promotion, field-level permission decisions, admin policy docs |
| Document privacy | Say staff document flows, signed URL checks, direct storage denial, and family portal safety have QA/non-production evidence | `LIMITED_INTERNAL` | Production smoke after production RLS promotion |
| Family portal safety | Say token-based family portal is designed to expose only safe family-facing request/document details | `LIMITED_INTERNAL` | Production smoke, expiration/deactivation operating policy, support playbook |
| Public intake security | Say durable rate limiting and routing guardrails exist, runtime routing remains controlled by approval gates | `LIMITED_INTERNAL` | Production routing approval, DNS evidence, monitoring evidence, rollback evidence |
| AI safety | Say AI safety policy, DTOs, and disabled gate scaffolds exist, runtime production safety remains incomplete | `LIMITED_INTERNAL` | Runtime permission-scoped generation evidence, audit-write evidence, source-display evidence, human-review evidence |
| Backup and restore | Say a runbook, non-production disposable database replay, app/auth smoke evidence, approved storage-excluded wording, approved stronger limited non-production wording, and synthetic storage/document smoke evidence exist | `LIMITED_INTERNAL` | RPO/RTO confirmation and production restore evidence before stronger public restore claims |
| Data retention and deletion | Say a policy proposal exists | `NO` | Product/legal/data/canonical approval and implementation plan |
| Incident response | Say runbooks and templates exist | `NO` | Named incident owners, communication approval, tabletop drill evidence |
| Export governance | Say non-production export routes, audit review prototypes, and production readiness docs exist, production exports remain off | `LIMITED_INTERNAL` | Production gate implementation approval, production smoke evidence, monitoring evidence, rollback evidence |

## Evidence Gap Register

| Area | Existing evidence | Missing evidence | Current decision | Next safe non-production step |
|---|---|---|---|---|
| Production RLS | Disposable validation, manual QA, shared-QA promotion, route/browser QA, final approval readiness docs | Human owner sign-off, production-safe fixture labels, exact rollout window, production rollout evidence | `NO-GO` | Complete human intake and production smoke fixture selection without recording secrets |
| Backup/restore | Backup/restore runbook, non-production restore-drill evidence template, non-production execution packet, product-owner execution approval packet, filled non-secret approval inputs, approved reusable disposable database reset/replay evidence, app/auth smoke evidence, approved storage-excluded limited wording, synthetic storage/document restore smoke approval packet, synthetic storage/document restore smoke evidence, synthetic storage/document owner review packet, and approved stronger limited non-production wording | RPO/RTO confirmation, restore owner sign-off, production restore evidence, production storage restore evidence, signed URL restore behavior evidence | `DISPOSABLE DATABASE REPLAY, APP/AUTH SMOKE, SYNTHETIC STORAGE/DOCUMENT SMOKE, AND STRONGER LIMITED NON-PRODUCTION WORDING APPROVED; PRODUCTION RESTORE DRILL PENDING` | Continue production restore readiness planning without making public backup/restore claims |
| Data retention | Data retention/deletion policy proposal covering requests, notes, communications, audit logs, documents, family tokens, AI outputs, offboarding, canonical exceptions | Approval from product/data/legal/canonical owners, automation design, customer support playbook | `PROPOSAL ONLY` | Review proposal with named owners and produce implementation approval packet |
| Incident response | Incident response runbook, evidence template, tabletop plan, customer communication templates | Named owners, approved communication path, tabletop drill evidence | `RUNBOOK ONLY` | Run a non-production tabletop drill for document/family portal and cross-parish exposure scenarios |
| AI safety | AI safety policy, registry, DTOs, source display, audit metadata, staff review DTOs, family/cross-parish contracts, disabled summary gate path | Production-safe runtime generation evidence, audit-write evidence, source-display UI evidence, reply route safety wiring | `PARTIAL` | Continue non-production QA and approval packets before any production AI safety claims |
| Export controls | Export policy proposal, non-production request list and document manifest routes, audit review API/dashboard prototype, production approval/smoke docs | Production runtime gate implementation, production smoke evidence, monitoring evidence, support playbook, field-level permissions | `PRODUCTION NO-GO` | Keep preparing approval/evidence docs or run approved non-production drills only |
| Family portal | Token-based family portal, document upload/approval support, QA safety checks | Production smoke after production RLS, family token lifecycle operating policy | `STRONG FOUNDATION` | Prepare production-safe family portal smoke fixture labels after RLS approval |
| Public intake routing | Schema, settings UI, token/domain management, DNS verification, runtime routing guardrails behind flags | Production routing approval, DNS/TLS evidence, monitoring, rollback evidence | `PARTIAL` | Keep runtime routing disabled until production enablement checklist is complete |
| Public trust center page | Internal trust-center readiness packet and this gap register | Production RLS evidence, restore drill evidence, retention approval, incident owner/drill evidence, claim review | `PUBLIC PAGE NO-GO` | Draft public copy only after required evidence changes from pending to complete |

## Public Trust-Center Blockers

Public trust-center publishing remains blocked by:

1. Production RLS final approval and rollout evidence are not complete.
2. Stronger limited non-production backup/restore wording is approved, but production restore, real document recovery, signed URL restore behavior, production RPO/RTO, and public backup/restore trust-center claims remain incomplete.
3. Data retention/deletion policy is not approved.
4. Incident response owners and tabletop drill evidence are not complete.
5. AI runtime safety evidence is not complete for production claims.
6. Production export runtime controls and smoke evidence are not complete.
7. Public claims have not been reviewed for certification overstatement.

Public trust-center decision: `NO-GO`

## Safe Internal Language

Use language like:

> Vinea has a strong security and governance foundation with staff authorization, Supabase RLS, audit events, document privacy controls, family portal boundaries, and extensive non-production validation. Production diocesan-grade RLS, public trust-center claims, formal compliance claims, and production export availability remain intentionally gated behind named approvals and evidence.

Do not say:

> Vinea is SOC 2 certified.

Do not say:

> Vinea production is fully diocesan RLS-ready.

Do not say:

> Vinea has completed production backup/restore drills.

Do not say:

> Vinea production AI is fully permission-scoped for all generation features.

Do not say:

> Vinea production exports are generally available.

## Product Owner Review Checklist

Before any public trust-center or enterprise security questionnaire answer is approved:

- Confirm the claim maps to an `Existing evidence` row above.
- Confirm the claim does not depend on a `Missing evidence` item.
- Confirm no formal certification is implied.
- Confirm no production RLS, export, AI, backup, retention, or incident-response claim is overstated.
- Confirm screenshots or evidence links are redacted for secrets, raw IDs, raw metadata, document names, storage paths, signed URLs, notes, communications, AI material, and sacramental/canonical details.
- Confirm the evidence owner and support owner are named for the claim.

## What Changed Plain English

This register is a plain checklist for Vinea's security story. It says what Vinea can safely say today, what still needs proof, and what must not be claimed yet. It helps protect Vinea from over-promising before production evidence exists.

## Next Recommended Safe Step

Continue production restore readiness planning for production restore evidence, real document recovery, signed URL restore behavior, production RPO/RTO, monitoring, rollback, and final public claim review, or prepare a named-owner review packet for retention/incident-response approval. Keep public trust-center publishing, production RLS, production exports, and production dashboard exposure `NO-GO` until the missing evidence is complete.
