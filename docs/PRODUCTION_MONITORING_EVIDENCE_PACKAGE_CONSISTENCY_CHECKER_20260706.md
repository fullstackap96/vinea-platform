# Production Monitoring Evidence Package Consistency Checker - 2026-07-06

Status: Prepared as a repository-only production-readiness check. This checker does not implement runtime monitoring, enable production monitoring, add production flags, wire an external observability vendor, send external events, page staff, create incidents, notify customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Purpose

Use `checkProductionMonitoringEvidencePackageConsistency(...)` to verify that the production monitoring evidence package is internally complete before any product-owner approval request for runtime monitoring scaffolding.

This checker is not runtime monitoring. It does not send observability events, validate a live monitoring vendor, approve production smoke testing, or approve public trust-center monitoring claims.

## Source Helper

- `lib/server/productionMonitoringEvidencePackageConsistency.ts`

## Required Inputs

- Repository checkout only.
- `docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md`.
- Linked repository docs and source helpers listed in the index.

Do not paste passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, authorization codes, OpenAI keys, monitoring DSNs, webhook URLs, provider API keys, incident-management keys, customer contact lists, raw exception payloads, raw request payloads, AI prompts, AI outputs, raw export data, document contents, storage paths, signed URLs, family portal token material, parishioner names, family names, phone numbers, emails, addresses, funeral details, pastoral details, canonical details, or real private documents into this checker or package evidence.

## What It Checks

The checker verifies:

- The evidence package index keeps runtime monitoring and production monitoring `NO-GO`.
- Required observability, support, owner intake, approval, smoke, preflight, readiness, and evidence artifacts are linked.
- Linked repository artifacts exist.
- Critical linked artifacts preserve required boundary language for runtime implementation approval, non-production redaction smoke, smoke evidence capture, and the runtime source preflight.
- Runtime source preflight artifacts require every marker in each production monitoring gate before any external monitoring send; partial marker matches are not enough.
- Approval dependency steps are present.
- Production `NO-GO` boundaries are present.
- Review checklist items are present.
- Missing human input labels are documented.
- Secret-like values are not accidentally embedded in linked package artifacts.

Critical artifact-boundary checks currently cover:

- `docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md`
- `docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md`
- `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`
- `lib/server/productionMonitoringRuntimePreflight.ts`

## Expected Safe Result

Before asking for runtime monitoring scaffold approval, the checker should return:

- `decision: READY_FOR_RUNTIME_APPROVAL_REVIEW`
- `productionMonitoringEnabled: false`
- `productionSmokeApproved: false`
- `publicTrustClaimsApproved: false`
- `artifactBoundaryCount` greater than `0`
- `findings: []`

`READY_FOR_RUNTIME_APPROVAL_REVIEW` only means the repository monitoring package is internally consistent enough for human review. It does not approve runtime implementation, production monitoring, external event delivery, production smoke, customer communication, or public trust-center monitoring claims.

## Failure Handling

If the checker returns `NEEDS_ATTENTION`, stop before preparing any runtime approval request. Fix the missing link, missing file, missing dependency step, missing `NO-GO` boundary, missing review check, missing human-input label, missing critical artifact boundary, or secret-like value first.

## Production Boundary

Production monitoring remains `NO-GO` until the product owner later provides a separate explicit approval with:

- Filled non-secret owner labels.
- Passed owner-intake validation.
- Runtime scaffold approval language.
- Non-production redaction-smoke approval language.
- Production-safe smoke boundaries.
- Rollback owner and evidence owner labels.
- Monitoring/support owner confirmation.
- Public trust-center monitoring claims still blocked until separately approved.

## Manual Testing Needed

No browser testing is needed for this repository-only checker. Future reviewers should run it with the production monitoring runtime approval readiness gate before asking for runtime-scaffold approval.
