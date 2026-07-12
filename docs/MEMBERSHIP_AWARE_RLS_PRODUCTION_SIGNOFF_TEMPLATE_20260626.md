# Membership-Aware Operational RLS Production Sign-Off Template - 2026-06-26

Status: Template prepared only. Production is not approved. Production was not touched while preparing this template, no migrations were applied, and runtime behavior was not changed.

## Approval Scope

This template is for a future production approval decision for:

- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- Production runbook: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production owner/sign-off capture packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`

This template does not approve:

- Production migration execution.
- Runtime public intake routing.
- Public intake feature flag changes.
- Any unrelated deployment.
- Any destructive production data operation.

## Evidence To Review Before Signing

Each approver must review the evidence relevant to their role.

Required shared evidence:

- Production readiness gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Promotion readiness checklist: `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- Build status: `docs/VINEA_BUILD_STATUS.md`

Database and QA evidence:

- Disposable forward/rollback validation: `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md`
- Cross-parish allow/deny QA: `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- Disposable route/document/family portal QA: `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md`
- Non-production promotion evidence: `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md`
- Shared QA migration, rollback rehearsal, workflow, document, family portal, and active-parish-cookie smoke evidence: `docs/VINEA_BUILD_STATUS.md`

Active-parish-cookie evidence:

- Cookie name: `vinea_active_parish_id`
- Prior failure: request detail/document route smoke returned `404` when the active parish cookie was present.
- Fix: `lib/server/staffParishContext.ts` preserves membership-authorized parish IDs even when parish display rows are hidden.
- Shared QA result: active-cookie route smoke passed with request detail API HTTP `200`, request detail page HTTP `200`, document routes passing, family portal safety passing, and direct storage access denied.

## Production-Safe Requirements Still Needed

These must be identified before any production execution:

- Production-safe staff user for sign-in and dashboard smoke.
- Production-safe active parish selection for that staff user.
- Production-safe request for request detail smoke.
- Production-safe family-facing workflow step for document upload.
- Safe staff test document content.
- Safe family portal test upload content.
- Production-safe family portal token plan.
- Production rollout evidence owner and storage location.
- Monitoring owner and channel.
- Support owner and escalation path.
- Evidence storage owner and redaction plan.
- Production app host.
- Production database host recorded without secrets.
- Rollout window and rollback decision deadline.
- Monitoring owner or channel for `/api/health`, auth failures, request/document `403` or `404` spikes, family portal errors, and Supabase RLS errors.

## Named Approval Record

All rows must be completed before production can be considered.

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

Allowed decisions:

- `Approve production rollout`
- `Approve with named conditions`
- `Hold`
- `Reject`

Any `Hold` or `Reject` blocks production execution.

## Role-Specific Sign-Off Statements

Product owner signs that:

- The business risk is acceptable.
- The rollout window is acceptable.
- The production-safe smoke-test records are acceptable.
- Customer/support communication expectations are understood.

Technical owner signs that:

- The forward SQL and rollback SQL are coherent.
- The production command sequence is clear.
- The rollback path is executable during the rollout window.
- No unrelated runtime feature or public intake routing change is bundled.

QA owner signs that:

- Shared QA evidence is sufficient.
- Active-parish-cookie request detail/document smoke evidence is included.
- Production smoke steps are clear and can be executed safely.
- Final automated checks must be rerun on the exact production-intended commit.

Security/data owner signs that:

- Cross-parish deny evidence is sufficient.
- Direct storage privacy evidence is sufficient.
- Family portal safety evidence is sufficient.
- The production smoke plan does not expose real parishioner private documents.

Rollback owner signs that:

- They will be present during the rollout window.
- They understand `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
- They can run rollback and verify post-rollback health if needed.
- They understand the rollback decision criteria in the production packet.

Monitoring owner signs that:

- They will monitor `/api/health`, authentication failures, request/document `403` or `404` spikes, family portal errors, direct storage privacy, document upload/signed URL behavior, and Supabase RLS/policy errors.
- The monitoring channel is ready and visible to the required owners.

Support owner signs that:

- They reviewed `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`.
- They understand the support escalation path and forbidden content rules.
- They will not ask customers for passwords, raw family portal tokens, signed URLs, private documents, internal notes, AI notes, or secrets.

Evidence storage owner signs that:

- The rollout evidence location is ready before production is touched.
- Evidence will be redacted for secrets, raw tokens, signed URLs, token hashes, private documents, passwords, and service role keys.

## Final Approval Gate

Production remains blocked unless all of these are true:

- Every named approval row is complete.
- No decision is `Hold` or `Reject`.
- Production-safe staff credentials and test records are identified.
- Production rollout evidence template is ready to be filled during the rollout window.
- Rollout window and rollback deadline are recorded.
- Rollback owner is present.
- Monitoring owner and channel are ready.
- Support owner and escalation path are ready.
- Evidence storage owner and location are ready.
- Final test, lint, and build pass on the production-intended commit.
- Product owner gives a separate explicit prompt approving production application.

## Final Outcome

- Current outcome: `Template prepared; all production approvals pending`
- Current recommendation: `Do not apply production RLS`
