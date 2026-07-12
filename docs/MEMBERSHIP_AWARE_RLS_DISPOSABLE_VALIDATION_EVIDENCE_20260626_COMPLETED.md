# Membership-Aware RLS Disposable Validation Evidence - Completed 2026-06-26

Status: Completed against the approved reusable disposable Supabase project only.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md`
- `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `scripts/run-membership-aware-rls-disposable-validation.mjs`

## Safety Confirmation

- Script executed: `Yes`
- Target host: `db.kikqtorplsswepqitjys.supabase.co`
- Required confirmation accepted: `MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION`
- Reusable disposable project confirmation accepted: `ALLOW_KIKQ_REUSE`
- Production touched: `No`
- Shared QA project `gnfomgsuottcuueasfvi` touched: `No`
- Runtime public intake routing changed: `No`
- Runtime `/api/health` changed: `No`
- `supabase/migrations` changed: `No`
- Forward candidate added to applied migrations: `No`
- Operational RLS changed outside the disposable target: `No`

## Execution Window

- Started at: `2026-06-26T19:00:11.372Z`
- Completed at: `2026-06-26T19:00:11.985Z`
- Database name: `postgres`
- Database user: `postgres`

## Preflight Results

- Required foundation functions found:
  - `current_staff_parish_ids`
  - `is_authorized_for_parish`
  - `primary_parish_id`
  - `request_belongs_to_primary_parish`
- Missing foundation functions: `0`
- Baseline policy count: `45`
- Baseline membership-aware references: `0`
- Baseline primary-parish references: `45`

## Forward Validation Results

- Forward candidate applied cleanly: `Pass`
- `request_belongs_to_staff_parish(uuid)` existed after forward application: `Pass`
- Forward policy count: `45`
- Forward membership-aware references: `45`
- Forward primary-parish references: `0`
- Primary-parish references cleared: `Pass`
- Tables covered:
  - `checklist_items`
  - `funeral_request_details`
  - `household_members`
  - `households`
  - `join_parish_request_details`
  - `mass_intentions`
  - `ocia_request_details`
  - `parishioners`
  - `people`
  - `request_communications`
  - `request_documents`
  - `request_notes`
  - `request_workflow_steps`
  - `requests`
  - `sacramental_record_events`
  - `sacramental_records`
  - `wedding_request_details`

## Rollback Validation Results

- Rollback draft applied cleanly after forward candidate: `Pass`
- `request_belongs_to_staff_parish(uuid)` removed after rollback: `Pass`
- Rollback policy count: `45`
- Rollback membership-aware references: `0`
- Rollback primary-parish references: `45`
- Membership-aware references cleared: `Pass`
- Rollback tables covered matched forward tables: `Pass`

## Verification Summary

```json
{
  "status": "completed",
  "host": "db.kikqtorplsswepqitjys.supabase.co",
  "forwardPassed": true,
  "rollbackPassed": true,
  "baselinePolicyCount": 45,
  "forwardPolicyCount": 45,
  "rollbackPolicyCount": 45,
  "baselinePrimaryRefCount": 45,
  "forwardMembershipRefCount": 45,
  "rollbackPrimaryRefCount": 45,
  "forwardPrimaryRefsCleared": true,
  "rollbackMembershipRefsCleared": true,
  "appliedToSupabaseMigrations": false
}
```

## Unresolved Risks

- Manual authenticated cross-parish allow/deny workflow QA has not been completed.
- `/api/health` observations were not captured during this script-only run.
- This evidence validates policy shape, forward application, and rollback shape; it does not replace staff workflow QA.
- Operational RLS remains unpromoted and must not be applied to shared QA or production until the promotion checklist gates are complete.

## Cleanup Confirmation

- Rollback draft applied after forward candidate: `Yes`
- Disposable target returned to primary-parish scoped policy shape: `Yes`
- Temporary runner dependency removed after execution: `Yes`
- Secret printed or committed: `No`

## Automated Check Outputs

- Focused evidence and runner tests: `Pass` (`2` files, `7` tests)
- Full test suite: `Pass` (`130` files, `532` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)

## Final Decision

- Decision: `Do Not Promote Yet`
- Reason: Disposable forward/rollback validation passed, but manual authenticated allow/deny workflow QA and promotion sign-off remain required.
