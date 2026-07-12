# Membership-Aware Operational RLS Production Owner And Sign-Off Capture Packet - 2026-06-27

Status: Capture packet prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this packet.

## Purpose

This packet is the single place to capture the named people, approval evidence, support readiness, monitoring ownership, rollback ownership, evidence storage ownership, and final go/no-go fields required before membership-aware operational RLS can be considered for production.

This packet does not approve:

- Production migration execution.
- Production database access.
- Runtime public intake routing.
- Public intake feature flag changes.
- Operational RLS changes.
- Staff membership data changes.
- Any unrelated production deployment.

## Required Evidence Package

Every owner must review the evidence relevant to their role before signing.

Core production packet:

- Final readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Production readiness gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production support communication note: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`

Completed validation evidence:

- Disposable forward/rollback validation: `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md`
- Disposable cross-parish allow/deny QA: `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- Disposable route/document/family portal QA: `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md`
- Non-production promotion evidence: `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md`
- Shared QA evidence summary: `docs/VINEA_BUILD_STATUS.md`

Implementation references:

- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Named Owner Capture

All rows must be complete before production can be considered.

| Responsibility | Required named person | Backup person | Contact path | Required evidence reviewed | Status |
|---|---|---|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | Final readiness record, sign-off template, smoke-test data, support note | `PENDING` |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | Forward SQL, rollback SQL, rollout packet, health checks | `PENDING` |
| QA owner | `PENDING` | `PENDING` | `PENDING` | Disposable QA, shared QA, active-parish-cookie smoke, production smoke checklist | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | Cross-parish denial, direct storage privacy, family portal safety, support note | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | Rollback SQL, rollback decision criteria, rollback verification steps | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING` | Monitoring expectations, health checks, auth and 403/404 observations | `PENDING` |
| Support owner | `PENDING` | `PENDING` | `PENDING` | Support communication note, escalation matrix, customer holding replies | `PENDING` |
| Evidence storage owner | `PENDING` | `PENDING` | `PENDING` | Rollout evidence template and evidence redaction rules | `PENDING` |

Pass criteria:

- Every responsibility has a named person.
- Rollback owner and monitoring owner are reachable during the entire rollout window.
- Support owner knows the escalation paths and forbidden content rules.
- Evidence storage owner confirms where rollout evidence will live and how secrets/private data will be redacted.

## Role-Specific Approval Record

Allowed decisions:

- `Approve production rollout`
- `Approve with named conditions`
- `Hold`
- `Reject`

Any `Hold` or `Reject` is a hard `NO-GO`.

| Role | Name | Date/time | Decision | Evidence reviewed | Conditions |
|---|---|---:|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| QA owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Support owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Evidence storage owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

## Required Owner Attestations

Product owner attests:

- The business and customer risk is acceptable.
- The rollout window is acceptable.
- Production-safe smoke-test data is acceptable.
- A separate explicit production approval prompt will be provided before production is touched.

Technical owner attests:

- The forward migration and rollback SQL have been reviewed.
- The production command sequence is clear.
- The rollback path is executable during the rollout window.
- No unrelated runtime feature or public intake routing change is bundled.

QA owner attests:

- Disposable and shared QA evidence is sufficient.
- Active-parish-cookie request detail/document smoke evidence is included.
- Production smoke-test steps are clear and safe.
- Final automated checks will run on the exact production-intended commit.

Security/data owner attests:

- Cross-parish denial evidence is sufficient.
- Direct storage privacy evidence is sufficient.
- Family portal safety evidence is sufficient.
- Production smoke data avoids sensitive parishioner, pastoral, funeral, canonical, and private family situations.

Rollback owner attests:

- They will be present for the rollout window.
- They can run `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
- They understand rollback decision criteria and post-rollback verification.

Monitoring owner attests:

- Monitoring will cover `/api/health`, staff authentication failures, request/document `403` or `404` spikes, Supabase RLS/policy errors, direct storage privacy, document upload/signed URL behavior, and family portal errors.
- The monitoring channel is active and visible to product, technical, QA, security/data, rollback, and support owners.

Support owner attests:

- They reviewed `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`.
- They understand what support may ask customers for.
- They understand forbidden content: passwords, raw portal tokens, signed URLs, private documents, internal notes, AI notes, and cross-parish identifiers.
- They know when to escalate to technical owner, security/data owner, incident commander, or rollback owner.

Evidence storage owner attests:

- The evidence storage location is ready before rollout.
- Evidence will not include secrets, raw family portal tokens, signed URLs, token hashes, private document contents, passwords, or service role keys.
- Screenshots and logs will be redacted before storage.

## Go / No-Go Decision Fields

| Field | Required value before GO |
|---|---|
| Production-safe smoke-test data checklist complete | `YES` |
| Every named owner assigned | `YES` |
| Every approval decision is approve or approve-with-conditions | `YES` |
| All approve-with-conditions items satisfied | `YES_OR_NOT_APPLICABLE` |
| Rollback owner reachable during rollout window | `YES` |
| Monitoring owner and channel ready | `YES` |
| Support owner and support escalation path ready | `YES` |
| Evidence storage owner and location ready | `YES` |
| Production rollout window chosen | `YES` |
| Rollback decision deadline chosen | `YES` |
| Production app host recorded without secrets | `YES` |
| Production database host recorded without credentials | `YES` |
| Final automated checks passed on production-intended commit | `YES` |
| Pre-apply `/api/health` healthy | `YES` |
| Public intake runtime routing confirmed out of scope | `YES` |
| Product owner explicit production approval prompt provided | `YES` |

Final decision options:

- `GO_PRODUCTION_RLS_ROLLOUT`
- `NO_GO_MISSING_OWNER`
- `NO_GO_MISSING_SMOKE_DATA`
- `NO_GO_MISSING_SIGNOFF`
- `NO_GO_HEALTH_CHECK`
- `NO_GO_UNRELATED_SCOPE`
- `HOLD_FOR_PRODUCT_OWNER_DECISION`

Current decision: `NO_GO_MISSING_OWNER`

## Hard Stop Conditions

Do not touch production if any of these are true:

- Any required owner is unnamed.
- Any approval row is `PENDING`, `Hold`, or `Reject`.
- Production-safe smoke-test data is incomplete.
- Evidence storage location is missing.
- Rollback owner is unavailable.
- Monitoring channel is unavailable.
- Support owner is unavailable.
- Production app or database target identity cannot be recorded without secrets.
- Final automated checks fail.
- Pre-apply `/api/health` is unhealthy.
- Public intake runtime routing or unrelated deployment work is bundled.
- Product owner has not issued a separate explicit production approval prompt.

## Final Outcome

- Current outcome: `Owner/sign-off capture packet prepared; production RLS remains blocked`
- Current recommendation: `Do not apply production RLS until every owner, sign-off, evidence location, smoke-test fixture, monitoring channel, rollback path, and explicit product-owner approval is complete`

## What Changed Plain English

This packet is a roll-call sheet for the future production RLS rollout. It says exactly who must be named, what each person must review, who watches monitoring, who can roll back, who handles support messages, where evidence goes, and what must be true before anyone can say "go."
