# Production-Sensitive Gate Boundary Index - 2026-07-06

Status: Prepared as a repository-only production-readiness guard. Production was not accessed, production flags were not enabled, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, records were not mutated, Google Calendar data was not touched, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, communications were not sent, certificates were not generated, and no public trust-center claims were made while preparing this index.

Completion marker: `PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706`

## Boundary Statement

Production-sensitive features remain `NO-GO` unless a separate product-owner approval explicitly says otherwise.

This index does not enable production flags.

This index does not approve migrations.

This index does not change operational RLS.

This index does not mutate records.

This index does not run exports.

This index does not call AI.

This index does not access storage or create signed URLs.

This index does not make public trust-center claims.

Every gate below remains blocked until its own approval packet, smoke evidence, rollback plan, and owner sign-off are complete.

## Purpose

Vinea has many production-sensitive gates spread across RLS, monitoring, browser security headers/CSP, exports, public intake routing, AI, backup/restore, workflow reminders, Catholic records, and dashboard staff authorization. This index gives reviewers one small map of the current boundaries and gives automated tests a stable place to verify that the sensitive approval chain has not drifted.

Use this index before preparing any future production approval prompt. It should answer one simple question: "Which doors are still locked, and where is the key supposed to come from?"

## Gate Index

| Gate | Current state | Boundary artifact | Required before switch-on |
| --- | --- | --- | --- |
| Membership-aware operational RLS | `NO-GO` for production rollout | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md` | Final owner approvals, production-safe fixtures, go/no-go review, rollout evidence, rollback evidence |
| Production monitoring | `NO-GO` for runtime monitoring and production smoke | `docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md` | Runtime implementation approval, non-production redaction smoke, production-safe smoke, monitoring/support owner sign-off |
| Content Security Policy runtime | `NO-GO` for report-only runtime CSP, production CSP, and enforcing CSP | `docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md` | Owner approvals, provider allowlist review, source preflight, non-production report-only smoke evidence, rollback evidence, enforcing CSP sign-off |
| Public intake runtime routing | `NO-GO` for production runtime routing | `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md` | DNS/TLS evidence, flag-off and flag-on smoke, rollback owner, support owner, customer communication approval |
| AI summary safety-chain production rollout | `NO-GO` for production safety-chain flags | `docs/AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md` | Production-safe AI fixtures, monitoring/rollback owners, safe source/audit evidence, final sign-off |
| AI reply audit-write and safe-response gates | `NO-GO` for production reply audit writes, safe-response exposure, OpenAI generation, and outbound email | `docs/AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md` | Product-owner implementation approval, non-production QA evidence, validator/source-preflight evidence, rollback evidence, production-specific smoke packet |
| Request list basic export | `NO-GO` until the exact future approval prompt is separately submitted | `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md` | Exact approval prompt, approved rollout window, flag-off baseline, flag-on smoke, rollback verification |
| Request document manifest export | `NO-GO` until exact product-owner values and future approval are provided | `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md` | Exact production URL, exact rollout window, manifest-only smoke evidence, rollback verification |
| Export audit reviewer dashboard | `NO-GO` for production dashboard exposure and production exports | `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701.md` | Production gate implementation approval, source preflight, exact smoke approval, no navigation until approved |
| Backup/restore public claims | `NO-GO` for production restore, real document recovery, RPO/RTO, and public claims | `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md` | Production restore evidence, real document recovery evidence, signed URL behavior evidence, owner-approved RPO/RTO |
| Public trust-center claims | `NO-GO` for public trust-center publication | `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md` | Evidence owner, support owner, product/security review, production evidence for production claims |
| Workflow Reminders V1 runtime | `NO-GO` for production runtime reminder delivery | `docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md` | Non-production implementation approval, smoke evidence, audit/suppression evidence, owner sign-off |
| Certificate issuance logging | `NO-GO` for production certificate issuance logging and automatic generation | `docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md` | Non-production scaffold approval, source preflight, QA evidence, no automatic certificate generation |
| Sacramental correction and notation | `NO-GO` for production correction/notation workflows and automatic register mutation | `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md` | Non-production scaffold approval, source preflight, QA evidence, canonical/pastoral exclusions preserved |
| Next.js proxy staff authorization | `NO-GO` for production dashboard-auth behavior changes | `docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md` | Product/security approval, non-production implementation, staff-auth fixture smoke, rollback owner, production-safe approval prompt |

## Review Procedure

1. Run `checkProductionSensitiveGateBoundaryConsistency()` from `lib/server/productionSensitiveGateBoundaryConsistency.ts`.
2. Confirm the report decision is `BOUNDARIES_READY_FOR_REVIEW`.
3. Confirm `productionSensitiveFeaturesApproved` is `false`.
4. Confirm `publicTrustClaimsApproved` is `false`.
5. Read the specific gate artifact for any production action being requested.
6. Do not continue if the specific gate artifact is missing owner approval, smoke evidence, rollback instructions, or explicit approval language.

## Hard Stops

Stop immediately if any future request:

- Treats this index as approval to enable production behavior.
- Uses QA/non-production flags to enable production.
- Applies migrations without explicit migration approval.
- Changes operational RLS outside the approved RLS rollout path.
- Runs exports outside an approved export smoke window.
- Calls AI in production outside the approved AI safety-chain rollout path.
- Enables report-only CSP runtime, production CSP, or enforcing CSP without the CSP approval packet, source preflight, non-production smoke evidence, rollback evidence, and owner sign-off.
- Changes dashboard proxy staff authorization behavior without the proxy auth approval packet, non-production staff-auth smoke evidence, rollback owner, and separate production approval.
- Accesses storage, creates signed URLs, or exposes document paths without explicit approval.
- Sends communications or reminders automatically without explicit workflow approval.
- Mutates sacramental records, generates certificates, or enters canonical notations automatically.
- Makes public trust-center, compliance, production restore, production monitoring, production RLS, or production export claims without evidence review and sign-off.

## What Changed Plain English

This is a master "do not turn these on by accident" checklist. It links the big sensitive launch gates in one place and gives tests a way to confirm each gate still says production is blocked until the right approvals and smoke evidence exist.

## Next Safe Step

Keep this index current whenever a production-sensitive approval packet changes. If a future production gate becomes approved, update the specific gate's evidence first, then update this index in a separate reviewable change with tests.
