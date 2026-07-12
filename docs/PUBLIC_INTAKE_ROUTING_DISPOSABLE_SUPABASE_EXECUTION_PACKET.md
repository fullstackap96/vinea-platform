# Public Intake Routing Disposable Supabase Execution Packet

Status: Disposable execution packet only. Do not apply this packet to production, the current shared QA database, or any real parish data environment without explicit approval.

Related docs:

- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`

## Purpose

This packet gives the exact order for testing the public intake parish routing migration candidate in a disposable Supabase branch, local Supabase database, or throwaway Supabase project.

It is a runbook for collecting evidence. It is not permission to promote the candidate, change runtime public intake, update runtime `/api/health`, move SQL into `supabase/migrations`, or change operational RLS.

## Non-Negotiable Safety Rules

- Use only a disposable Supabase target.
- Do not use production.
- Do not use the current shared QA database unless the user explicitly approves that exact target.
- Do not copy real parishioner data into the disposable target.
- Do not add the migration candidate to `supabase/migrations`.
- Do not wire `resolvePublicIntakeParishScope` into `/api/intake`.
- Do not change runtime public form pages.
- Do not change runtime `/api/health`.
- Do not change operational RLS.
- Record every result in a copied evidence file based on `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`.

## Required Inputs

- Disposable Supabase project reference or local database identity.
- Disposable database URL or SQL editor access.
- Current git branch and commit SHA.
- Current repo migrations applied to the disposable target.
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`.
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`.
- Safe disposable parish rows.
- Safe public intake test data.

## Evidence File Setup

Before running SQL:

1. Copy `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md` into a run-specific evidence note.
2. Record:
   - Supabase project or branch name.
   - Supabase project reference.
   - Database host.
   - Git branch.
   - Git commit SHA.
   - Operator.
   - Start date and time.
3. Confirm the target is disposable.
4. Confirm environment variables point at the disposable target if app-based checks will be run.
5. Confirm no real parishioner data is present.

## Exact Execution Order

Run these steps in order. Stop on the first failure and record the failure in the evidence file.

1. Capture baseline environment identity.
2. Capture baseline `/api/health` observation.
3. Run preflight schema queries.
4. Apply the forward candidate from `docs/sql/public_intake_parish_routing_migration_candidate.sql`.
5. Run forward schema verification queries.
6. Run forward policy verification queries.
7. Run data validation queries with safe disposable rows.
8. Run resolver unit tests locally.
9. Run public intake regression checks against safe disposable data if the disposable app environment is available.
10. Capture post-forward `/api/health` observation.
11. Apply the rollback draft from `docs/sql/public_intake_parish_routing_rollback_draft.sql`.
12. Run rollback verification queries.
13. Run public intake regression checks again if the disposable app environment is available.
14. Capture post-rollback `/api/health` observation.
15. Run automated checks locally.
16. Record unresolved risks.
17. Destroy or clean up the disposable environment.
18. Record sign-off decision.

## Step 1: Baseline Environment Identity

Run:

```sql
select current_database() as database_name;
select current_user as database_user;
select now() as captured_at;
```

Record:

- Database name.
- Database host.
- Project reference.
- Date and time.
- Operator.

Pass criteria:

- The environment is confirmed disposable.
- The environment is not production.
- The environment is not the current shared QA database unless explicitly approved.

## Step 2: Baseline `/api/health` Observation

If an app instance is pointed at the disposable target, request:

```text
GET /api/health
```

Record the full JSON response in the evidence file.

Expected current-runtime behavior before promotion:

- `/api/health` should not require public intake routing schema yet.
- Missing `public_slug`, domain routing table, or token routing table must not fail current health checks yet.

If no app instance is available, record:

```text
Not run: no disposable app instance connected to this database.
```

## Step 3: Preflight Schema Queries

Run:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'parishes'
  and column_name in ('public_slug', 'public_display_name', 'public_intake_enabled')
order by column_name;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename;

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'parishes_public_slug_lower_unique',
    'parish_public_intake_domains_hostname_lower_unique',
    'parish_public_intake_tokens_token_hash_unique'
  )
order by indexname;
```

Expected result before forward candidate:

- No rows for the three `parishes` routing columns.
- No rows for the two routing tables.
- No rows for the three routing indexes.

## Step 4: Apply Forward Candidate

Apply exactly:

```text
docs/sql/public_intake_parish_routing_migration_candidate.sql
```

Recommended execution methods:

- Supabase SQL editor: paste the full file into the disposable project SQL editor and run it.
- `psql`: connect only to the disposable database, then run `\i docs/sql/public_intake_parish_routing_migration_candidate.sql`.

Pass criteria:

- The full candidate applies without manual edits.
- No statement errors.
- No SQL is copied into `supabase/migrations`.

## Step 5: Forward Schema Verification Queries

Run:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'parishes'
  and column_name in ('public_slug', 'public_display_name', 'public_intake_enabled')
order by column_name;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename;

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'parishes_public_slug_lower_unique',
    'parish_public_intake_domains_hostname_lower_unique',
    'parish_public_intake_tokens_token_hash_unique'
  )
order by indexname;
```

Pass criteria:

- `public_slug` exists.
- `public_display_name` exists.
- `public_intake_enabled` exists with default `false`.
- `parish_public_intake_domains` exists.
- `parish_public_intake_tokens` exists.
- All expected indexes exist.

## Step 6: Forward Policy Verification Queries

Run:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename;

select policyname, tablename, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename, policyname;
```

Pass criteria:

- `rowsecurity` is `true` for both routing tables.
- Staff policies exist for both routing tables.
- Policies reference staff parish authorization.
- No policy grants anonymous direct-write management access.

## Step 7: Data Validation Queries

Use safe disposable parish rows only. If needed, create two disposable parishes and record their ids.

Example setup:

```sql
insert into public.parishes (name, city, state)
values
  ('Disposable St Ann', 'Test City', 'TS'),
  ('Disposable St Mark', 'Test City', 'TS')
returning id, name;
```

Run validation cases from `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`, including:

- Valid lowercase slug succeeds.
- Uppercase slug fails.
- Slug with spaces fails.
- Duplicate slug with different case fails.
- Valid lowercase hostname succeeds.
- Uppercase hostname fails.
- Duplicate hostname with different case fails.
- Valid token hash succeeds.
- Duplicate token hash fails.
- Invalid token request type fails.
- Raw token value is not stored.

Record pass/fail for each case.

## Step 8: Resolver Unit Tests

Run locally:

```bash
npm.cmd test -- lib/server/publicIntakeParishScope.test.ts
```

Pass criteria:

- Token, verified domain, slug, legacy fallback, disabled parish, expired token, request-type mismatch, and forged staff active parish cookie cases pass.

## Step 9: Public Intake Regression Checks

If a disposable app instance is connected to the disposable database, test safe submissions for:

- Baptism public intake.
- Wedding public intake.
- Funeral public intake.
- OCIA public intake.
- Join Parish public intake.
- Normal public intake before rate-limit threshold.
- Durable public intake 429 behavior after threshold.

Pass criteria:

- Valid safe submissions work.
- Public responses do not expose staff data, private parish settings, internal notes, AI notes, audit logs, membership data, raw tokens, or token hashes.
- Current runtime forms still use legacy behavior unless a future approved runtime routing phase changes that.

If no disposable app instance is available, record:

```text
Not run: no disposable app instance connected to this database.
```

## Step 10: Post-Forward `/api/health` Observation

If an app instance is pointed at the disposable target, request:

```text
GET /api/health
```

Record the full JSON response.

Expected result for this phase:

- Runtime `/api/health` still does not require public intake routing schema.
- This observation is evidence only.
- Do not update runtime `/api/health` in this phase.

## Step 11: Apply Rollback Draft

Apply exactly:

```text
docs/sql/public_intake_parish_routing_rollback_draft.sql
```

Recommended execution methods:

- Supabase SQL editor: paste the full rollback draft into the disposable project SQL editor and run it.
- `psql`: connect only to the disposable database, then run `\i docs/sql/public_intake_parish_routing_rollback_draft.sql`.

Pass criteria:

- Rollback applies without manual edits.
- No statement errors.

## Step 12: Rollback Verification Queries

Run:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'parishes'
  and column_name in ('public_slug', 'public_display_name', 'public_intake_enabled')
order by column_name;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename;

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'parishes_public_slug_lower_unique',
    'parish_public_intake_domains_hostname_lower_unique',
    'parish_public_intake_tokens_token_hash_unique'
  )
order by indexname;
```

Pass criteria:

- No rows for the three `parishes` routing columns.
- No rows for the two routing tables.
- No rows for the three routing indexes.
- Legacy public intake still works if an app instance is available.

## Step 13: Post-Rollback `/api/health` Observation

If an app instance is pointed at the disposable target, request:

```text
GET /api/health
```

Record the full JSON response.

Expected current-runtime behavior:

- `/api/health` should return the same current-runtime schema readiness behavior as before forward application.
- Public intake routing schema absence should not fail current runtime health checks.

## Step 14: Automated Local Checks

Run:

```bash
npm.cmd test -- lib/server/publicIntakeParishScope.test.ts lib/server/publicIntakeRoutingPromotionReadinessChecklist.test.ts lib/server/publicIntakeRoutingEvidenceTemplate.test.ts lib/server/publicIntakeRoutingHealthReadiness.test.ts lib/server/publicIntakeParishRoutingQaValidation.test.ts lib/server/publicIntakeParishRoutingStrategy.test.ts lib/server/multiParishRemainingPathsInventory.test.ts
npm.cmd test -- --reporter=dot
npm.cmd run build
npm.cmd run lint
```

Record the output summaries in the evidence file.

## Step 15: Cleanup Confirmation

Complete one of these:

- Destroy the disposable Supabase branch or project.
- Reset the local Supabase database.
- Confirm disposable routing rows and safe test submissions were removed.

Record:

- Cleanup method.
- Cleanup time.
- Person who confirmed cleanup.

## Step 16: Evidence Capture Checklist

The evidence file must include:

- Environment identity.
- Baseline `/api/health` observation or reason it was not run.
- Preflight query outputs.
- Forward candidate apply result.
- Forward schema and policy query outputs.
- Data validation pass/fail table.
- Resolver test output.
- Public intake regression results or reason they were not run.
- Post-forward `/api/health` observation or reason it was not run.
- Rollback apply result.
- Rollback query outputs.
- Post-rollback `/api/health` observation or reason it was not run.
- Automated check outputs.
- Unresolved risks.
- Cleanup confirmation.
- Rollback owner.
- Sign-off decision.

## Stop Conditions

Stop immediately and record the issue if:

- The target is not disposable.
- Any forward SQL statement fails.
- Any rollback SQL statement fails.
- Any anonymous direct-write policy appears.
- Runtime public intake behavior changes unexpectedly.
- `/api/health` fails in a way not explained by the disposable environment.
- Any public response exposes staff-only data, internal notes, AI notes, audit logs, token hashes, or private parish data.
- Operational RLS is changed.
