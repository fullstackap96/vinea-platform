# Membership-Aware RLS Promotion Readiness Checklist

Status: Repo migration promoted and applied to shared QA only. Shared QA membership-aware operational RLS is active and smoke-tested. Do not apply the promoted migration to production until the remaining production approval gates below are complete.

Related docs:

- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md`
- `docs/MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCT_OWNER_SIGNOFF_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- `docs/VINEA_BUILD_STATUS.md`
- `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`

Current sign-off status:

- Product-owner sign-off is recorded for the next controlled non-production promotion preparation step.
- Engineering technical approval and QA non-production evidence acceptance are recorded in `docs/MEMBERSHIP_AWARE_RLS_ENGINEERING_QA_TECHNICAL_APPROVAL_20260711.md` against immutable forward/rollback SQL hashes.
- Product-owner production approval, security/data-owner approval, named production rollback/monitoring/support/evidence owners, exact production-safe fixtures, rollout window, and immutable production-intended Git commit are still pending.
- The migration candidate has been promoted into `supabase/migrations` for non-production validation as `20260626170000_membership_aware_operational_rls.sql`.
- Non-production apply and rollback passed against `kikqtorplsswepqitjys`.
- Shared QA apply, rollback rehearsal, final forward application, health check, authenticated workflow smoke, document/family portal smoke, and active-parish-cookie request detail/document smoke have passed against `gnfomgsuottcuueasfvi`.
- Production rollout/rollback packet has been prepared but is not approval to apply production RLS.
- Production sign-off template has been prepared; all production approvals remain pending.
- Operational RLS has not been applied to production.

## Purpose

This checklist defines the approval gates required before applying the membership-aware operational RLS migration to production.

Production application means the SQL can affect real parish data access. Do not apply the migration to production until the evidence below is complete, reviewed, and signed off.

## Hard Promotion Rules

- Do not promote directly from draft SQL to production.
- Do not promote unless the disposable QA execution checklist has passed from a clean disposable Supabase environment.
- Do not promote unless rollback has been applied and verified after the forward candidate in that same disposable environment.
- Do not apply to production unless shared QA has passed forward application, rollback rehearsal, final forward application, `/api/health`, authenticated staff workflow smoke, document/family portal smoke, and active-parish-cookie request detail/document smoke.
- Do not promote if any staff workflow, public intake, family portal, document, AI, email, or calendar regression remains unresolved.
- Do not promote without a documented rollback command/path and named approver.
- Do not promote if `supabase/migrations` already contains an unreviewed operational RLS migration.

## Required Evidence Package

Create a short evidence note before promotion. It must include:

- Disposable environment name or project reference.
- Date and time of validation.
- Person who ran validation.
- Exact git commit or branch under test.
- Confirmation that the environment was not production and not the current shared QA database.
- Confirmation that all repository migrations were applied before the candidate was tested.
- `/api/health` result before forward candidate application.
- `/api/health` result after forward candidate application.
- `/api/health` result after rollback application.
- Full test, build, and lint results after forward validation.
- Full test, build, and lint results after rollback validation.
- Sanitized notes for any failures and fixes.
- Confirmation that the disposable environment was destroyed or cleaned up.
- Shared QA migration, health, workflow, document/family portal, and active-parish-cookie smoke evidence.
- Production-specific rollout window, rollback owner, and smoke-test plan before production application.
- Production rollout/rollback packet with exact forward and rollback commands.
- Production sign-off record with named product owner, technical owner, QA owner, security/data owner, and rollback owner approvals.

## Gate 1: Candidate Location And Review

Pass criteria:

- `docs/sql/membership_aware_operational_rls_migration_candidate.sql` exists.
- No matching operational RLS candidate has been placed in `supabase/migrations`.
- The candidate header says it is not a Supabase migration.
- The candidate references the rollback draft.
- The candidate references the disposable QA execution checklist.
- The candidate has been reviewed against the forward draft parity tests.

Fail criteria:

- The candidate is already in `supabase/migrations`.
- The candidate lacks rollback reference.
- The candidate lacks disposable QA checklist reference.
- The candidate policy coverage differs from the tested forward draft without explanation.

## Gate 2: Disposable Forward Validation Evidence

Pass criteria:

- Forward candidate applies cleanly in a disposable Supabase environment.
- `request_belongs_to_staff_parish(uuid)` exists after forward application.
- Direct parish-scoped policies use `is_authorized_for_parish(parish_id)`.
- Request child policies use `request_belongs_to_staff_parish(request_id)`.
- Tested operational policies no longer depend on `primary_parish_id()` or `request_belongs_to_primary_parish(request_id)`.
- Every cross-parish allow case from the QA validation plan passes.
- Every cross-parish deny case from the QA validation plan passes.
- No anonymous client can directly read or write operational parish tables.

Fail criteria:

- Any forward SQL statement fails.
- Any unauthorized parish row is visible.
- Any unauthorized parish mutation succeeds.
- Any tested operational policy is missing.
- Any direct operational table remains scoped only by `primary_parish_id()`.

## Gate 3: Rollback Evidence

Pass criteria:

- Rollback draft applies cleanly after the forward candidate in the same disposable environment.
- `request_belongs_to_staff_parish(uuid)` is removed after rollback.
- Direct parish-scoped policies return to `is_authorized_staff()` plus `primary_parish_id()`.
- Request child policies return to `request_belongs_to_primary_parish(request_id)`.
- Single-primary-parish staff access still works after rollback.
- `/api/health` returns `checks.schema: true` after rollback.

Fail criteria:

- Any rollback SQL statement fails.
- The membership-aware helper remains after rollback.
- Any tested operational policy still references `is_authorized_for_parish()` or `request_belongs_to_staff_parish()`.
- Staff sign-in or core dashboard access breaks after rollback.

## Gate 4: Manual Staff Workflow QA

Pass criteria:

- Staff can sign in and sign out.
- Dashboard loads for an authorized staff user.
- Parish switcher shows only authorized parishes.
- Request list and request detail pages honor selected parish scope.
- Request status, assignment, follow-up, notes, workflow steps, and documents work for an authorized parish.
- Unauthorized parish request data is not visible.
- People list, detail, create, and edit flows work for an authorized parish.
- Household list, detail, create, and edit flows work for an authorized parish.
- Sacramental record list, detail, create, edit, and certificate flows work for an authorized parish.
- Mass Intention list, detail, create, and edit flows work for an authorized parish.
- Settings, Reports, Calendar, Communications, Intake Queue, Notifications, and Global Search load without cross-parish leakage.

Fail criteria:

- Any core staff workflow fails without a documented fix.
- Any selected-parish workflow writes to the wrong parish.
- Any unauthorized parish data appears in staff UI.
- Any user-facing action fails silently.

## Gate 5: Public, Family, Document, And External Action QA

Pass criteria:

- Public Baptism, Wedding, Funeral, OCIA, and Join Parish intake forms still create requests.
- Durable public intake rate limiting still works.
- Family portal token access shows only safe family-facing request details.
- Family portal document upload works only for the token-scoped request.
- Staff document upload, approval, rejection, and signed URL access work for authorized staff.
- Direct Supabase Storage paths remain private.
- Google Calendar tests use safe test credentials only.
- Email tests use safe test recipients only.
- AI summary and draft actions do not expose cross-parish or family-private data.

Fail criteria:

- Public intake breaks.
- Family portal exposes staff-only data, internal notes, AI notes, audit logs, or private parish data.
- Document access bypasses server authorization.
- Google Calendar, Email, or AI actions touch non-test credentials during validation.

## Gate 6: Automated Checks

Pass criteria:

- `npm.cmd test -- --reporter=dot` passes.
- `npm.cmd run build` passes.
- `npm.cmd run lint` has no new errors.
- `/api/health` returns `checks.schema: true`.
- Existing RLS draft, rollback, parity, disposable QA, and migration candidate validation tests pass.
- Production readiness gate docs validation tests pass.

Fail criteria:

- Any test fails.
- Build fails.
- Lint reports errors.
- `/api/health` reports `checks.schema: false`.

## Gate 7: Approval Sign-Off

Required sign-off:

- Product owner approval that the risk is acceptable.
- Technical owner approval that the migration and rollback are coherent.
- QA owner approval that disposable forward and rollback validation passed.
- Security/data owner approval that cross-parish deny cases passed.
- Product owner production approval must be separate from non-production and shared QA approval.

Sign-off record must include:

- Approver name.
- Role.
- Date.
- Evidence package location.
- Explicit decision: `Promote`, `Do Not Promote`, or `Promote After Fixes`.

## Promotion Procedure After Approval

Only after all production gates pass:

1. Confirm the promoted migration exists at `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`.
2. Keep the rollback draft in `docs/sql` and reference it in the build status entry.
3. Confirm shared QA remains healthy with membership-aware operational RLS active.
4. Run the full automated checks locally on the exact production-intended commit.
5. Capture pre-apply production `/api/health`.
6. Apply to production only after named approvals and a rollback owner are present.
7. Capture post-apply production `/api/health`, staff workflow smoke, active-parish-cookie request detail/document smoke, and family portal safety smoke.
8. Update `docs/VINEA_BUILD_STATUS.md` with the applied migration name, target, verification results, rollback reference, and final decision.

## Explicit No-Go Conditions

Do not promote if any of these are true:

- Disposable QA evidence is missing.
- Rollback evidence is missing.
- Manual staff workflow QA is incomplete.
- Public intake or family portal QA is incomplete.
- Any cross-parish deny case fails.
- Any staff-only data appears in public or family-facing routes.
- The rollback path is not understood by the person applying the migration.
- The production deployment window does not allow rollback verification.
