# Shared-QA Database Security Reconciliation

Status: `DISPOSABLE VALIDATION PASSED; SHARED-QA APPLICATION NO-GO`

Date: 2026-08-07

Target label: `Shared QA Supabase project`

## Evidence Boundary

This review used Supabase security advisors and Postgres catalog metadata only. It did not read parish/customer rows, change schema, apply migrations, alter RLS, or access production.

Official Supabase guidance says database functions are executable by broad roles by default, recommends revoking `EXECUTE` from roles that do not need it, and requires a fixed `search_path` for `SECURITY DEFINER` functions. The review also considered the 2026 Data API default-grant change; no relevant breaking change alters this least-privilege conclusion.

## Findings

### Function execution surface

The catalog reports `anon_execute = true` and `authenticated_execute = true` for 17 reviewed functions.

| Intended surface | Functions | Candidate action |
| --- | --- | --- |
| Authenticated staff/RLS helpers | `current_staff_parish_ids`, `current_staff_primary_parish_id`, `is_authorized_for_parish`, `is_authorized_staff`, `primary_parish_id`, `request_belongs_to_primary_parish`, `request_belongs_to_staff_parish` | Revoke broad access, then grant only `authenticated` |
| Server/service-role operational RPC | `check_public_intake_rate_limit`, `create_request_workflow_steps_from_active_template` | Revoke every reviewed Data API role, then preserve explicit `service_role` execution |
| Server/service-role schema-health probe | `current_staff_parish_ids`, `is_authorized_for_parish` | Preserve explicit `service_role` execution for the existing non-mutating `/api/health` probes |
| Trigger-only | `household_members_before_write`, `parishioners_set_parish_id_before_insert`, `people_households_before_write`, `sacramental_record_events_after_write`, `sacramental_records_before_write`, `sync_parish_membership_from_staff_user`, `vinea_validate_schedule_not_past`, `workflow_templates_touch_updated_at` | Revoke direct browser-role execution; trigger behavior remains unchanged |

`vinea_validate_schedule_not_past` is the one reviewed function without a fixed search path. The candidate sets an empty search path; its body uses trigger records and `pg_catalog` built-ins only.

Candidate: [`sql/shared_qa_function_privilege_hardening_candidate.sql`](sql/shared_qa_function_privilege_hardening_candidate.sql)

Guarded disposable validator:
`scripts/run-function-privilege-hardening-disposable-validation.mjs`. It requires
`VINEA_FUNCTION_PRIVILEGE_DISPOSABLE_CONFIRM=FUNCTION_PRIVILEGE_DISPOSABLE_VALIDATION`,
blocks shared QA, requires the separate reusable-disposable confirmation when
applicable, applies the candidate inside a transaction, verifies catalog-only
outcomes, rolls back, and confirms the original baseline was restored. The
approved reusable disposable run passed on 2026-08-07: anonymous execution was
removed, the authenticated and service-role privilege surfaces matched the
allowlists, the schedule trigger search path was fixed, and rollback restored the
baseline. Sanitized evidence:
[`FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md`](FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md).

### RLS-enabled service-only tables

The advisor reports `rls_enabled_no_policy` at informational severity for `audit_logs`, `parish_google_integrations`, `rate_limit_buckets`, and `request_portal_tokens`. Their current design is server/service-role only, and no client policy should be invented solely to silence an informational advisor. A future approved validation must confirm browser roles have no effective table privileges and service routes still work. This candidate deliberately makes no table or policy change.

### Auth configuration

Leaked-password protection is disabled in shared QA. Enabling it changes Auth behavior and requires a separate owner-approved non-production Auth smoke. It is not part of this SQL candidate.

## Migration-History Drift

The shared-QA migration tracker ends at `20260626103000 public_intake_domain_verification`. The repository also contains these later or untracked candidates:

- `20260625193000_public_intake_parish_routing.sql`
- `20260626170000_membership_aware_operational_rls.sql`
- `20260630170000_enable_parishes_rls.sql`

Read-only migration/catalog reconciliation completed on 2026-08-07. All three
files' material schema/policy effects are present, but none of their versions is
tracked. Public-intake routing and `parishes` RLS match their required catalog
fingerprints. Membership-aware RLS has all 45 expected scoped policies with no
unexpected peers, while its request-scope helper still has anonymous execution
privilege drift. Do not replay any target migration. Evidence:
[`SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md`](SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md).

Any migration-history repair or shared-QA privilege change requires a separate
guarded plan and explicit approval.

## Required Validation Before Any Application

1. Completed: run the guarded validator first in the approved disposable target.
2. Completed: confirm `anon` cannot execute all 17 reviewed functions.
3. Completed: confirm `authenticated` can execute only the seven staff/RLS helpers.
4. Completed for catalog privileges: confirm the exact four-function service
   surface: two server-owned RPCs and two non-mutating `/api/health` probes.
   Runtime behavior remains part of application smoke.
5. Confirm inserts/updates still invoke every trigger-only function normally.
6. Confirm `/api/health` reports `checks.schema: true`.
7. Run authenticated active-parish staff smoke and public-intake normal/429 rate-limit smoke.
8. Re-run Supabase security advisors and retain sanitized output.
9. Rehearse rollback by restoring only the pre-candidate grants/configuration captured from the disposable target.

## Decision

The function-privilege candidate passed guarded disposable transaction/rollback
validation, and the read-only migration/schema/policy reconciliation is complete.
The next safe database step is a non-applied migration-history repair plan plus a
separately approved shared-QA privilege application packet. Shared-QA writes,
Auth changes, migration-history repair, production application, and operational
RLS changes remain `NO-GO`.
