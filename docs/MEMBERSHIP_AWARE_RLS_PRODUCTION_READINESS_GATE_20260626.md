# Membership-Aware Operational RLS Production Readiness Gate - 2026-06-26

Status: Prepared as a production-planning gate only. Production was not touched, no migrations were applied, and operational RLS was not changed in this step.

## Decision State

- Current recommendation: `Production Packet Prepared; Do Not Apply Production Yet`
- Reason: Shared QA evidence is now much stronger, including the fixed active-parish-cookie route smoke, and the production rollout/rollback packet exists, but final production planning still needs named human sign-off.
- Production application approved: `No`
- New migration applied in this step: `No`
- Runtime public intake routing changed: `No`
- Operational RLS changed in this step: `No`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`

## Evidence Now Included

Completed disposable and non-production evidence:

- Disposable forward/rollback validation: `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md`
- Disposable cross-parish allow/deny QA: `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- Disposable route/document/family portal QA: `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md`
- Non-production migration promotion evidence: `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md`

Completed shared QA evidence:

- Shared QA migration promotion and rollback rehearsal: `docs/VINEA_BUILD_STATUS.md`
- Shared QA project: `gnfomgsuottcuueasfvi`
- Shared QA final policy state: membership-aware operational RLS active.
- Shared QA `/api/health`: `ok: true`, `checks.schema: true`.
- Shared QA authenticated workflow smoke: request status, assignment, follow-up, notes, workflow steps, request detail, and request detail page passed.
- Shared QA document and family portal smoke: staff document list, upload, signed URL, signed URL fetch, review, portal token creation, family portal page safety, family upload, and audit checks passed.
- Shared QA direct storage privacy: anon direct storage download denied with `404`.

Fixed active-parish-cookie evidence:

- Active parish cookie name: `vinea_active_parish_id`
- Previous issue: request detail/document route smoke returned `404` when the active parish cookie was present.
- Fix: `lib/server/staffParishContext.ts` now preserves membership-authorized parish IDs even when parish display rows are not visible to the staff session.
- Live shared QA result: route smoke passed with `activeParishCookieUsed: true`.
- Request detail access API result: HTTP `200`, `ok: true`.
- Request detail page result: HTTP `200`, no login or unauthorized shell.
- Document routes and family portal safety passed under the active parish cookie smoke.

## Remaining Production Blockers

These blockers must be resolved before production migration planning begins:

1. Named technical owner sign-off is still required.
2. Named QA owner sign-off is still required.
3. Named security/data owner sign-off is still required.
4. Product-owner production approval is still required and must be separate from prior non-production/shared-QA approval.
5. A production rollout window must be chosen with enough time for health checks, staff workflow smoke, document/family portal smoke, and rollback verification.
6. A production rollback owner must be named and must confirm they can apply `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
7. Production-safe staff credentials and production-safe test records must be identified in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` before execution.
8. A customer/support communication note must be prepared in case staff see permission-related issues after rollout.
9. Monitoring expectations must be defined for `/api/health`, authentication failures, 403/404 spikes on request/document routes, and Supabase policy errors.
10. The production rollout evidence template must have an evidence owner and storage location ready before execution.
11. The production final approval readiness record must be updated from `NO-GO` to `GO` only after all blockers are resolved.
12. Final automated checks must be rerun on the exact commit intended for production.

## Required Production Planning Packet

Before production can be considered, create a final production packet that includes:

- Exact migration file: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Exact rollback file: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- Production database target identity, recorded without secrets.
- Final git commit or release tag.
- Named product owner, technical owner, QA owner, and security/data owner approvals.
- Production rollout start time and rollback decision deadline.
- Pre-apply `/api/health` result.
- Post-apply `/api/health` result.
- Forward migration output.
- Request detail active-parish-cookie smoke result.
- Staff document route smoke result.
- Family portal safety smoke result.
- Monitoring observations, cleanup/deactivation result, rollback decision, and final outcome.
- Rollback rehearsal instructions and owner.
- Final approval readiness decision: `GO`, `NO-GO`, or `HOLD`.
- Final decision: `Proceed`, `Hold`, or `Rollback`.

## No-Go Conditions

Do not plan or apply production migration if any of these are true:

- Any named owner has not signed off.
- The active-parish-cookie route smoke is not included in the evidence package.
- The rollback owner is unavailable during the rollout window.
- The production-safe smoke-test credentials are not ready.
- The production rollout evidence template owner/storage location is not ready.
- The production final approval readiness record is still `NO-GO`.
- `/api/health` is not healthy before the migration.
- The exact commit under test differs from the commit intended for production.
- Public intake runtime routing or other unrelated feature work is bundled into the same production change.

## Final Outcome

- Outcome: `Production readiness gate prepared; production remains blocked pending named sign-offs and production packet`
- Recommended next action: collect named technical, QA, security/data, rollback owner, and product-owner production sign-offs. Do not apply production RLS without a new explicit approval.
