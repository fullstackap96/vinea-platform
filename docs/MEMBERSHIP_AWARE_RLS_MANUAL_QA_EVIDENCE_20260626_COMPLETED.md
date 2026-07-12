# Membership-Aware RLS Manual QA Evidence - Completed 2026-06-26

Status: Completed against the approved reusable disposable Supabase project only.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md`
- `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `scripts/run-membership-aware-rls-manual-qa.mjs`

## Safety Confirmation

- Script executed: `Yes`
- Target host: `db.kikqtorplsswepqitjys.supabase.co`
- Required confirmation accepted: `MEMBERSHIP_AWARE_RLS_MANUAL_QA`
- Reusable disposable project confirmation accepted: `ALLOW_KIKQ_REUSE`
- Production touched: `No`
- Shared QA project `gnfomgsuottcuueasfvi` touched: `No`
- Runtime public intake routing changed: `No`
- Runtime `/api/health` changed: `No`
- `supabase/migrations` changed: `No`
- Forward candidate added to applied migrations: `No`
- Operational RLS changed outside the disposable target: `No`
- Secret printed or committed: `No`

## Execution Window

- Started at: `2026-06-26T19:48:34.989Z`
- Completed at: `2026-06-26T19:49:12.002Z`
- Database name: `postgres`
- Database user: `postgres`

## Disposable Schema Compatibility Fix

The first manual QA attempt exposed disposable bootstrap drift: the scheduling trigger from `20260426100000_prevent_past_schedule_saves.sql` expects original `requests` scheduling columns.

The disposable base schema candidate and manual QA runner now account for:

- `suggested_date_1`
- `suggested_date_2`
- `suggested_date_3`
- `confirmed_baptism_date`

During the successful run, the approved reusable disposable project already had these columns after the retry, so `addedIfMissing` was empty.

## Authenticated Staff Matrix

Disposable staff identities:

- `qa.staff.a@example.test`: authorized for Parish A only.
- `qa.staff.ab@example.test`: authorized for Parish A and Parish B.
- `qa.staff.c@example.test`: authorized for Parish C only.

Disposable parishes:

- `QA Parish A`
- `QA Parish B`
- `QA Parish C`

## Areas Covered

- People
- Households
- Sacramental Records
- Mass Intentions
- Requests
- Request Notes
- Request Communications
- Workflow Steps
- Documents

## Manual QA Result Summary

```json
{
  "status": "completed",
  "host": "db.kikqtorplsswepqitjys.supabase.co",
  "totalCases": 207,
  "passedCases": 207,
  "failedCases": 0,
  "areasCovered": [
    "Documents",
    "Households",
    "Mass Intentions",
    "People",
    "Request Communications",
    "Request Notes",
    "Requests",
    "Sacramental Records",
    "Workflow Steps"
  ],
  "forwardPolicyShape": {
    "policyCount": 33,
    "membershipRefCount": 51,
    "primaryRefCount": 0
  },
  "rollbackPolicyShape": {
    "policyCount": 33,
    "membershipRefCount": 0,
    "primaryRefCount": 51
  },
  "rollbackApplied": true,
  "cleanupCompleted": true,
  "appliedToSupabaseMigrations": false
}
```

## Pass Criteria Verified

- Authorized Parish A staff could read and mutate Parish A operational data.
- Authorized Parish A/B staff could read and mutate Parish A and Parish B operational data.
- Authorized Parish C staff could read and mutate Parish C operational data.
- Parish A-only staff could not read or mutate Parish B or Parish C operational data.
- Parish A/B staff could not read or mutate Parish C operational data.
- Parish C-only staff could not read or mutate Parish A or Parish B operational data.
- Denied writes returned no mutation or an RLS authorization failure.
- Forward policy shape had membership-aware references and no primary-parish references.
- Rollback restored primary-parish policy references and cleared membership-aware references.
- Disposable QA rows were cleaned up after the run.

## Remaining Gaps Before Promotion

- This was database-level authenticated RLS QA, not browser UI QA.
- `/api/health` was not captured during this runner-only gate.
- Staff document signed URL behavior and direct Supabase Storage privacy still require route/browser QA before production promotion.
- Family portal safety was not re-tested in this runner.
- Product-owner, QA, technical, and security/data sign-off are still required before moving operational RLS into `supabase/migrations`.

## Automated Check Outputs

- Focused manual QA runner/evidence/bootstrap tests: `Pass` (`3` files, `10` tests)
- Full test suite: `Pass` (`133` files, `542` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)
- Temporary runner dependency removed: `Yes`

## Final Decision

- Decision: `Do Not Promote Yet`
- Reason: Authenticated database allow/deny QA passed, but final promotion still requires health observations, route/browser QA for document/family portal surfaces, and sign-off.
