# Membership-Aware Operational RLS Production Final Approval Readiness Record - 2026-06-26

Status: Final approval readiness record prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this record.

## Executive Decision Summary

Current decision: `NO-GO`

Reason: Membership-aware operational RLS has strong disposable, non-production, shared QA, active-parish-cookie, document, and family portal evidence. However, production approval is not ready because named production sign-offs, production-safe smoke-test data, rollout evidence owner/storage location, production rollout window, rollback owner confirmation, and final checks on the production-intended commit are still pending.

This record is the single go/no-go summary for the future production decision. It does not approve production execution.

## Scope

Decision under review:

- Promote membership-aware operational RLS to production.

Files in scope:

- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- Production smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production owner/sign-off capture packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md`
- Production final go/no-go review checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production readiness gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- Production support communication note: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`
- Promotion readiness checklist: `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- Build status: `docs/VINEA_BUILD_STATUS.md`

Out of scope:

- Runtime public intake routing.
- Public intake feature flags.
- New operational RLS policy design.
- Production data cleanup.
- Staff membership data changes.
- Any unrelated production deployment.

## Evidence Package Status

| Evidence area | Source | Status | Decision impact |
|---|---|---|---|
| Disposable forward/rollback validation | `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Supports future approval |
| Disposable cross-parish allow/deny QA | `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Supports future approval |
| Disposable route/document/family portal QA | `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Supports future approval |
| Non-production promotion evidence | `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md` | `COMPLETE` | Supports future approval |
| Shared QA promotion and rollback rehearsal | `docs/VINEA_BUILD_STATUS.md` | `COMPLETE` | Supports future approval |
| Shared QA authenticated workflow smoke | `docs/VINEA_BUILD_STATUS.md` | `COMPLETE` | Supports future approval |
| Shared QA document/family portal safety smoke | `docs/VINEA_BUILD_STATUS.md` | `COMPLETE` | Supports future approval |
| Fixed active-parish-cookie request/detail document smoke | `docs/VINEA_BUILD_STATUS.md` and `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md` | `COMPLETE` | Supports future approval |
| Production smoke fixture worksheet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md` | `PREPARED BUT INCOMPLETE` | Blocks approval until fixtures are selected |
| Production smoke-test data checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` | `PENDING` | Blocks approval |
| Named production sign-offs | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md` | `PENDING` | Blocks approval |
| Owner/sign-off capture packet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md` | `PREPARED BUT UNASSIGNED` | Blocks approval until owners are named |
| Final go/no-go review checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md` | `PREPARED BUT INCOMPLETE` | Blocks approval until every production artifact cross-checks cleanly |
| Production rollout evidence owner/storage | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` | `PENDING` | Blocks approval |
| Customer/support communication note | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md` | `PREPARED` | Supports future approval |
| Final automated checks on production-intended commit | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` | `PENDING` | Blocks approval |

## Production Smoke-Test Data Checklist Status

Current status: `PENDING`

Required before go:

- Production-safe staff account selected.
- Active parish selected and staff membership confirmed.
- Production-safe request selected.
- Family-facing workflow step selected.
- Synthetic staff test document content prepared.
- Synthetic family test document content prepared.
- Family portal token plan prepared without storing raw token in docs or chat.
- Monitoring owner/channel prepared.
- Cleanup and evidence plan prepared.

Decision impact: `BLOCKS PRODUCTION APPROVAL`

## Named Sign-Off Status

Current status: `PENDING`

Required named approvals:

| Role | Required status |
|---|---|
| Product owner | `PENDING` |
| Technical owner | `PENDING` |
| QA owner | `PENDING` |
| Security/data owner | `PENDING` |
| Rollback owner | `PENDING` |

Approval rule:

- Every role must have a named person.
- No decision may be `Hold` or `Reject`.
- Any `Approve with named conditions` decision must list conditions that are satisfied before execution.
- Product owner must provide a separate explicit production approval prompt before production can be touched.

Decision impact: `BLOCKS PRODUCTION APPROVAL`

## Rollout Evidence Template Status

Current status: `PREPARED BUT NOT ASSIGNED`

Required before go:

- Evidence owner assigned.
- Evidence storage location assigned.
- Rollout identity fields ready.
- Pre-apply health section ready.
- Forward migration output section ready.
- Post-apply health section ready.
- Active-parish-cookie request/document smoke section ready.
- Family portal safety smoke section ready.
- Monitoring observation section ready.
- Cleanup/deactivation section ready.
- Rollback decision section ready.
- Final outcome section ready.

Decision impact: `BLOCKS PRODUCTION APPROVAL UNTIL OWNER/STORAGE ARE ASSIGNED`

## Rollout/Rollback Packet Status

Current status: `PREPARED`

Required before go:

- Production rollout window chosen.
- Rollback decision deadline chosen.
- Rollback owner present.
- Production app host identified without secrets.
- Production database host identified without credentials.
- Automated checks rerun on the exact production-intended commit.
- Pre-apply `/api/health` is healthy.
- Runtime public intake routing and unrelated deployments confirmed out of scope.

Decision impact: `SUPPORTS FUTURE APPROVAL, BUT OPEN FIELDS STILL BLOCK EXECUTION`

## Shared QA Evidence Summary

Current status: `COMPLETE`

Evidence already recorded:

- Shared QA migration promotion completed.
- Shared QA rollback rehearsal completed.
- Shared QA final policy state is membership-aware operational RLS active.
- Shared QA `/api/health` returned `ok: true` and `checks.schema: true`.
- Authenticated workflow smoke passed for request status, assignment, follow-up, notes, workflow steps, request detail, and request detail page.
- Document smoke passed for staff document list, upload, signed URL route, signed URL fetch, review, and audit checks.
- Family portal safety smoke passed for portal token creation without `token_hash`, family portal page safety, family upload, and staff visibility of family-uploaded document.
- Direct anon Supabase Storage access was denied.
- Active-parish-cookie route smoke passed after the request detail/document `404` issue was fixed.

Decision impact: `SUPPORTS FUTURE APPROVAL`

## Remaining Blockers

Production approval remains blocked until all of these are resolved:

1. Production-safe smoke fixture worksheet is completed.
2. Production-safe smoke-test data checklist is completed.
3. Final go/no-go review checklist is completed.
4. Product owner sign-off is recorded.
5. Technical owner sign-off is recorded.
6. QA owner sign-off is recorded.
7. Security/data owner sign-off is recorded.
8. Rollback owner sign-off is recorded.
9. Monitoring owner is assigned.
10. Support owner is assigned.
11. Production rollout evidence owner is assigned.
12. Production rollout evidence storage location is assigned.
13. Production rollout window is chosen.
14. Rollback decision deadline is chosen.
15. Production app/database target identities are recorded without secrets.
16. Customer/support communication note approvers and support owner are named.
17. Final tests, lint, and build pass on the exact production-intended commit.
18. Product owner provides a separate explicit production approval prompt.

## Go Criteria

The final decision may change to `GO` only when all criteria below are true:

- Smoke fixture worksheet status is `COMPLETE`.
- Smoke-test data checklist status is `COMPLETE`.
- Final go/no-go review checklist decision is `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`.
- Every named sign-off is `Approve production rollout` or `Approve with named conditions`.
- Any named conditions are satisfied.
- Rollback owner is present for the rollout window.
- Monitoring owner and channel are assigned.
- Support owner and escalation path are assigned.
- Evidence owner and storage location are assigned.
- Customer/support communication note owner and approvers are assigned.
- Production rollout/rollback packet fields are complete.
- Final automated checks pass on the production-intended commit.
- Pre-apply `/api/health` is healthy.
- Public intake runtime routing remains out of scope.
- Product owner gives separate explicit production approval.

## No-Go Criteria

The final decision must remain `NO-GO` if any of these are true:

- Any required sign-off is missing.
- Any decision is `Hold` or `Reject`.
- Production-safe smoke-test data is incomplete.
- Evidence owner/storage location is not assigned.
- Rollback owner is unavailable.
- Rollback SQL path is unclear or unreviewed.
- Production target identity cannot be recorded without secrets.
- Public intake runtime routing or unrelated deployments are bundled into the same rollout.
- Final checks fail on the production-intended commit.
- Pre-apply `/api/health` is unhealthy.
- Product owner has not issued explicit production approval.

## Current Final Recommendation

Recommendation: `NO-GO`

Rationale:

- The technical and QA evidence is strong enough to continue production planning.
- The governance and production execution details are not complete enough to touch production.
- The next action is to fill the smoke-test data checklist, collect named sign-offs, assign evidence ownership/storage, and choose the rollout/rollback window.

## Final Outcome

- Current outcome: `Final approval readiness record prepared; production remains blocked`
- Current recommendation: `NO-GO - do not apply production RLS`
