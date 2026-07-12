# Trust Center Public Claims Boundary Matrix - 2026-07-05

Status: Prepared as a non-runtime trust-center readiness slice. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this matrix.

Current public trust-center decision: `NO-GO`

Completion marker: `TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705`

## Purpose

Vinea now has many strong trust-readiness artifacts, but public trust-center language must stay conservative until production evidence is complete. This matrix tells staff, sales, product, and support which claims may be used internally, which claims are blocked publicly, and what evidence is still required.

This matrix does not approve public trust-center publishing, production monitoring, production RLS promotion, production exports, production public intake routing, customer-facing AI claims, production restore claims, formal compliance claims, migrations, runtime changes, or production access.

Primary references:

- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`
- `docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`
- `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`
- `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`
- `docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md`
- `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md`
- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`

## Decision Summary

| Trust area | Current evidence posture | Internal wording allowed? | Public claim allowed? | Required before public claim |
|---|---|---:|---:|---|
| Formal compliance certification | No formal third-party certification evidence exists | `NO` | `NO` | Completed audit scope, auditor evidence, certification report, and product-owner approval |
| Production membership-aware RLS | Disposable validation, shared-QA application, route/browser smoke, readiness packets, owner/fixture packets | `LIMITED_INTERNAL` | `NO` | Production owner sign-off, production-safe fixture selection, explicit approval, rollout evidence, rollback evidence |
| Production monitoring | Readiness plan, support matrix, owner intake, approval packet, smoke template, runtime implementation packet, source preflight, redaction-smoke QA packet, owner completion worksheet, evidence package index | `LIMITED_INTERNAL` | `NO` | Runtime implementation approval, non-production redaction smoke, production-safe smoke, owner sign-off, rollback proof |
| Backup and restore | Runbook, disposable database replay, app/auth smoke, storage-excluded decision, synthetic storage/document smoke, stronger limited non-production wording approval | `LIMITED_INTERNAL` | `NO` | Production restore evidence, real document recovery evidence, signed URL restore behavior evidence, production RPO/RTO approval |
| Export controls | Non-production request-list and document-manifest export pilots, audit reviewer API/dashboard prototypes, production readiness packets | `LIMITED_INTERNAL` | `NO` | Production gate implementation, production smoke evidence, monitoring/support owner approval, rollback evidence |
| Public intake routing | Migration applied in shared QA, settings/domain/token management, DNS verification, runtime wiring behind disabled gates, production enablement checklist | `LIMITED_INTERNAL` | `NO` | Production DNS/TLS evidence, smoke evidence, monitoring, rollback evidence, explicit product-owner approval |
| AI safety | AI safety policy, feature registry, DTO chain, audit/source/review scaffolds, non-production QA evidence for summary path | `LIMITED_INTERNAL` | `NO` | Production-safe safety-chain evidence, reply-route alignment, staff-review UI evidence, audit-write evidence, explicit approval |
| Data retention and deletion | Policy proposal only | `LIMITED_INTERNAL` | `NO` | Product, legal/data, canonical, and support approvals plus implementation plan |
| Incident response | Runbook, evidence template, tabletop plan, customer communication templates | `LIMITED_INTERNAL` | `NO` | Named incident owners, tabletop drill evidence, support communication approval, escalation coverage |
| Document and family portal safety | Non-production/shared-QA document and family portal safety evidence exists across RLS and route/browser QA | `LIMITED_INTERNAL` | `NO` | Production smoke after production RLS approval, token lifecycle operating policy, support playbook |
| MFA, SSO, and advanced RBAC | Roadmap item only | `NO` | `NO` | Implemented product surface, QA evidence, production approval, support docs |

## Allowed Internal Language

Use conservative wording like:

> Vinea has a strong trust-readiness foundation with staff authentication, authorization checks, Supabase RLS, audit trails, document privacy guardrails, family portal boundaries, non-production validation, and careful approval gates. Production-sensitive claims remain gated until owner sign-off, smoke evidence, rollback evidence, and production-safe fixtures are complete.

For backup/restore, use only the approved limited internal/sales-support wording from `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`. Do not present disposable or synthetic restore evidence as production restore assurance.

For monitoring, use only:

> Production monitoring readiness artifacts are prepared, but runtime monitoring is not implemented or enabled.

For exports, use only:

> Export pilots and governance prototypes have non-production evidence, but production exports remain no-go.

For RLS, use only:

> Membership-aware operational RLS has non-production/shared-QA evidence, but production promotion remains no-go pending owner approvals and production-safe smoke fixtures.

## Forbidden Public Claims

Do not say:

- Vinea is SOC 2 certified, HIPAA certified, PCI compliant, or ISO 27001 certified.
- Vinea has completed production backup and restore drills.
- Vinea has production RPO/RTO guarantees.
- Vinea production is fully diocesan RLS-ready.
- Vinea production exports are generally available.
- Vinea production monitoring is live and staffed.
- Vinea AI is fully permission-scoped in production for all summary and reply workflows.
- Vinea public intake routing is production-enabled for custom domains.
- Vinea retention and deletion automation is approved and implemented.
- Vinea incident response has completed production-grade tabletop drills.

## Sales And Support Use Rules

1. Use `LIMITED_INTERNAL` claims only in internal demos, sales-support notes, or security-questionnaire drafts that are explicitly marked as not final public copy.
2. Link the evidence file for every claim.
3. Do not use screenshots that show raw IDs, private document names, storage paths, signed URLs, tokens, raw metadata, raw exports, communications, notes, AI prompts, AI outputs, database URLs, provider keys, or service-role material.
4. When the evidence is non-production, say non-production.
5. When evidence is synthetic, say synthetic.
6. When a production gate is no-go, say no-go.
7. Do not convert a readiness packet into a public promise.

## Public Claim Review Checklist

Before any public trust-center page, sales deck, procurement response, or customer-facing security answer uses a trust claim:

- The claim maps to one row in this matrix.
- The row's public claim status is not `NO`.
- The evidence is complete and linked.
- The evidence owner is named.
- The support owner is named.
- Production smoke evidence is present when the claim is about production behavior.
- Rollback or incident handling evidence is present when the claim implies operational readiness.
- No formal certification is implied unless a formal report exists.
- No canonical, sacramental, pastoral, legal, financial, privacy, or retention assurance is implied without named owner approval.
- The final answer has been reviewed by the product owner and security/data owner.

## Next Safe Steps

1. Keep public trust-center publishing `NO-GO` until production RLS, production restore/RPO/RTO, production monitoring, export governance, incident response, and retention evidence mature.
2. Prepare a non-secret owner review worksheet for this matrix so each trust area has a named product owner, support owner, evidence owner, and approval status.
3. Continue non-production trust drills, especially incident tabletop drills and production-safe restore/RPO/RTO planning, without making public trust claims.
4. Use this matrix when answering security questionnaires so Vinea stays confident, honest, and evidence-based.

## What Changed Plain English

This document is a simple promise-control checklist. It says which security and trust statements Vinea can safely use inside the team, which claims are not ready for the public, and what proof is still needed. It helps Vinea look serious and trustworthy without accidentally promising something that has not been tested in production yet.
