# Membership-Aware Operational RLS Non-Production Promotion Evidence - 2026-06-26

Status: Completed against the approved reusable disposable non-production Supabase project `kikqtorplsswepqitjys`. The migration candidate was promoted into `supabase/migrations` as a repo migration, applied to the non-production target, verified, rolled back in that target, and verified after rollback. Production and shared QA were not touched.

## Safety Confirmation

- Approved target host: `db.kikqtorplsswepqitjys.supabase.co`
- Shared QA project `gnfomgsuottcuueasfvi` touched: `No`
- Production touched: `No`
- Runtime public intake routing changed: `No`
- Operational RLS applied to shared QA or production: `No`
- Secret printed or committed: `No`
- Temporary runner dependency removed after execution: `Yes`

## Files Promoted Or Added

- Promoted migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Guarded runner: `scripts/run-membership-aware-rls-nonproduction-promotion.mjs`
- Evidence record: `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md`
- Validation test: `lib/server/membershipAwareOperationalRlsPromotedMigration.test.ts`

## Execution Summary

- Required confirmation accepted: `MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION`
- Reusable disposable project confirmation accepted: `ALLOW_KIKQ_REUSE`
- Started at: `2026-06-26T22:16:43.695Z`
- Completed at: `2026-06-26T22:16:44.400Z`
- Database name: `postgres`
- Database user: `postgres`

## Preflight Results

Required foundation functions found:

- `current_staff_parish_ids`
- `is_authorized_for_parish`
- `primary_parish_id`
- `request_belongs_to_primary_parish`

Missing foundation functions: `0`

## Baseline Policy Shape

- Operational policy count: `45`
- Membership-aware references: `0`
- Primary-parish references: `45`
- Tables covered: `17`

Tables covered:

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

## Forward Migration Verification

- Forward migration applied: `Pass`
- Forward source: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- `request_belongs_to_staff_parish(uuid)` existed after forward migration: `Pass`
- Operational policy count: `45`
- Membership-aware references: `45`
- Primary-parish references: `0`
- Primary-parish references cleared: `Pass`
- Forward verification passed: `Yes`

## Rollback Verification

- Rollback draft applied after forward migration: `Pass`
- Rollback source: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `request_belongs_to_staff_parish(uuid)` removed after rollback: `Pass`
- Operational policy count: `45`
- Membership-aware references: `0`
- Primary-parish references: `45`
- Membership-aware references cleared: `Pass`
- Rollback verification passed: `Yes`

## Sanitized Runner Result

```json
{
  "status": "completed",
  "host": "db.kikqtorplsswepqitjys.supabase.co",
  "forwardPath": "supabase/migrations/20260626170000_membership_aware_operational_rls.sql",
  "rollbackPath": "docs/sql/membership_aware_operational_rls_rollback_draft.sql",
  "baselinePolicyCount": 45,
  "baselineMembershipRefCount": 0,
  "baselinePrimaryRefCount": 45,
  "forwardPolicyCount": 45,
  "forwardMembershipRefCount": 45,
  "forwardPrimaryRefCount": 0,
  "rollbackPolicyCount": 45,
  "rollbackMembershipRefCount": 0,
  "rollbackPrimaryRefCount": 45,
  "forwardPassed": true,
  "rollbackPassed": true,
  "appliedToSupabaseMigrations": true
}
```

## Cleanup And Final Target State

- The non-production target was rolled back after the forward verification.
- Final non-production operational policy shape is the current primary-parish scoped rollback shape.
- Temporary `postgres` dependency was removed with `npm.cmd uninstall postgres --no-save`.

## Remaining Risks

- This was a database policy promotion and rollback rehearsal, not production approval.
- The non-production target ended in rollback state; applying the promoted migration to shared QA or production still requires a separate explicit approval.
- `/api/health` was not captured during this runner-only promotion step.
- Full browser route QA was not rerun during this promotion step; prior route/document/family portal evidence remains linked in the promotion package.

## Final Decision

- Decision: `Promoted To Repo Migration; Non-Production Apply/Rollback Passed`
- Next recommended gate: Apply the promoted migration to an explicitly approved shared QA target, capture `/api/health`, rerun authenticated staff workflow QA, and rehearse rollback again before any production discussion.
