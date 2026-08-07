# Shared-QA Database Security Promotion Approval Packet

Status: `PREPARED; SHARED-QA WRITES NO-GO`

Date: 2026-08-07

Target label: `Shared QA Supabase project`

## Purpose

Reconcile three migration-history rows whose schema/policy effects already
match the repository, then apply the separately disposable-validated function
privilege hardening. This packet authorizes nothing by itself.

Evidence inputs:

- [`SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md`](SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md)
- [`FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md`](FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md)
- [`SHARED_QA_DATABASE_SECURITY_RECONCILIATION_20260807.md`](SHARED_QA_DATABASE_SECURITY_RECONCILIATION_20260807.md)

## Exact Scope

History-only repair candidates:

- `20260625193000_public_intake_parish_routing.sql`
- `20260626170000_membership_aware_operational_rls.sql`
- `20260630170000_enable_parishes_rls.sql`

Privilege candidate:

- `docs/sql/shared_qa_function_privilege_hardening_candidate.sql`
- SHA-256 `82D84FF5C81B215330A49F51ED1DB7F7025D982FC2405DA83CD1736CA3622DF8`
- 17 reviewed functions only
- seven authenticated helpers
- four service-role functions: two operational RPCs and two non-mutating health probes
- fixed empty search path on `vinea_validate_schedule_not_past()`

No migration SQL is replayed. No table, policy, RLS, data, Auth, storage, or
production change is in scope.

## Required Human Approvals

- Product owner: confirms shared-QA maintenance timing and smoke fixtures.
- Engineering owner: confirms exact candidate hash and runner version.
- Security/data owner: approves the exact authenticated/service-role allowlists.
- QA owner: owns health, staff, trigger, and public-intake smoke evidence.
- Rollback owner: remains available through the observation window.

All five approvals must be recorded by non-secret role/name labels before any
write. Production approval does not follow from shared-QA approval.

## Controlled Sequence

1. Re-run read-only migration list and catalog reconciliation. Stop on any drift.
2. Confirm the exact target is `gnfomgsuottcuueasfvi` and the direct database
   host is used.
3. Repair history only with the current Supabase CLI after reviewing `--help`:

   ```powershell
   supabase migration repair 20260625193000 20260626170000 20260630170000 --status applied --db-url <percent-encoded-shared-QA-db-url>
   ```

4. Re-run `supabase migration list --db-url <percent-encoded-shared-QA-db-url>`.
   Stop unless all three versions are present exactly once.
5. Install the temporary unsaved `postgres` runner without changing package
   metadata, then run only:

   ```powershell
   $env:VINEA_FUNCTION_PRIVILEGE_SHARED_QA_CONFIRM = 'FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION'
   $env:VINEA_FUNCTION_PRIVILEGE_SHARED_QA_EXECUTE = 'EXECUTE_FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION'
   node scripts/run-function-privilege-hardening-shared-qa-promotion.mjs
   ```

6. Remove the temporary runner and restore the exact lockfile dependency tree.
7. Confirm `/api/health` returns `checks.schema: true`.
8. Run authenticated Parish A/Parish B switching and same-/cross-parish read-only
   staff smoke.
9. Exercise synthetic/non-customer trigger writes and public-intake normal/429
   behavior only under a separately approved shared-QA smoke.
10. Re-run Supabase security advisors and capture sanitized catalog evidence.

## Runner Guarantees

`scripts/run-function-privilege-hardening-shared-qa-promotion.mjs`:

- accepts only the exact shared-QA direct host;
- requires separate approval and execute confirmations;
- blocks the reusable disposable ref and every non-matching host;
- pins the approved candidate SHA-256;
- refuses promotion until all three repaired migration versions are tracked;
- reads only migration and function catalog metadata;
- applies only the candidate body inside one transaction;
- commits only when anon, authenticated, service-role, function-count, and
  schedule-search-path checks all match exactly;
- rolls back on any validation or execution failure;
- emits sanitized JSON without credentials or parish data.

## Stop And Rollback

Stop before privilege application if history repair, candidate hash, target,
owner availability, or catalog state differs. Roll back the open transaction on
any catalog mismatch.

If a post-commit health or smoke stop condition occurs:

1. stop shared-QA testing;
2. obtain a separate explicit rollback approval;
3. apply only
   `docs/sql/shared_qa_function_privilege_hardening_rollback_candidate.sql`;
4. verify the captured baseline and document why broad execution was restored;
5. if history repair itself must be undone, use the current CLI after review:

   ```powershell
   supabase migration repair 20260625193000 20260626170000 20260630170000 --status reverted --db-url <percent-encoded-shared-QA-db-url>
   ```

The rollback SQL intentionally restores the insecure reviewed baseline and is
therefore `NO-GO` without its own approval.

## Exact Approval Language

> Approve shared-QA-only migration-history reconciliation and function privilege
> hardening for project gnfomgsuottcuueasfvi. Mark only migration versions
> 20260625193000, 20260626170000, and 20260630170000 as applied without replaying
> SQL, then run scripts/run-function-privilege-hardening-shared-qa-promotion.mjs
> with the exact confirmation and execute phrases in the 2026-08-07 approval
> packet. Run the documented health and non-production smoke, stop and roll back
> on any mismatch, and do not access production, change operational RLS, read
> parish data, or expose secrets.

## Decision Boundary

Shared-QA migration-history repair and privilege application remain `NO-GO`.
Production application, production migration repair, production RLS, and public
trust claims remain separately locked regardless of future shared-QA results.
