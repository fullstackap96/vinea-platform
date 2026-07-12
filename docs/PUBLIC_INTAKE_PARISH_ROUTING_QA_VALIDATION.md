# Public Intake Parish Routing Disposable QA Validation

Status: Disposable QA plan only. Do not apply this plan to the current QA or production database without explicit approval.

Related files:

- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `lib/server/publicIntakeParishScope.ts`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`

## Purpose

This document defines the exact preflight checks, disposable QA steps, rollback checks, resolver test matrix, and approval gates required before public intake parish routing schema can move toward an applied migration.

This plan does not change runtime public intake behavior. Current public forms must continue using the legacy single-parish path until a future approved implementation phase adds explicit parish routing.

After this disposable QA plan passes, promotion into `supabase/migrations` must still follow `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`.

When executing the candidate in a disposable Supabase target, use `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md` for the exact SQL order, verification queries, rollback commands, health-check observation steps, and evidence-capture instructions.

## Environment Rules

- Use a disposable Supabase branch or temporary Supabase project.
- Do not run the forward candidate against production.
- Do not run the forward candidate against the shared QA project unless the user explicitly approves that environment.
- Record results in `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md` or a copied evidence package based on that template.
- Record the project ref, database host, date, operator, and git commit before running SQL.
- Confirm the disposable environment has current repo migrations applied before testing this candidate.

## Preflight Checklist

Pass/fail criteria:

- Pass: every listed object is either present as expected or intentionally absent before the candidate is applied.
- Fail: any unexpected existing routing object could mask migration behavior or rollback behavior.

Verification queries:

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

Expected before applying candidate:

- `public.parishes.public_slug` is absent.
- `public.parishes.public_display_name` is absent.
- `public.parishes.public_intake_enabled` is absent.
- `public.parish_public_intake_domains` is absent.
- `public.parish_public_intake_tokens` is absent.
- Candidate indexes are absent.

## Forward Candidate Validation

Apply only this non-applied candidate in the disposable environment:

- `docs/sql/public_intake_parish_routing_migration_candidate.sql`

Required schema checks:

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

select tablename, rowsecurity
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

select policyname, tablename, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
order by tablename, policyname;
```

Expected after applying candidate:

- `public.parishes.public_slug` exists as nullable `text`.
- `public.parishes.public_display_name` exists as nullable `text`.
- `public.parishes.public_intake_enabled` exists as `boolean not null default false`.
- `public.parish_public_intake_domains` exists.
- `public.parish_public_intake_tokens` exists.
- RLS is enabled on both new routing tables.
- Staff policies exist for both new routing tables.
- No `anon` policies exist.

## Data Validation Cases

Run with safe disposable parish rows only.

| Case | Expected Result |
| --- | --- |
| Insert slug `st-ann` | Pass |
| Insert uppercase slug `St-Ann` | Fail |
| Insert slug with spaces | Fail |
| Insert duplicate slug with different case | Fail |
| Insert verified hostname `intake.stann.example` | Pass |
| Insert uppercase hostname `Intake.StAnn.Example` | Fail |
| Insert duplicate hostname with different case | Fail |
| Insert token hash for Baptism | Pass |
| Insert duplicate token hash | Fail |
| Insert token request type `invalid_type` | Fail |
| Confirm token raw value is not stored | Pass when only `token_hash` exists |

## Resolver Test Matrix

Helper: `resolvePublicIntakeParishScope`.

These tests must continue passing before runtime public intake routing is enabled.

| Input | Expected Route Source | Expected Result |
| --- | --- | --- |
| Valid active token for active parish | `token` | Returns token parish id |
| Expired token | none | Generic failure |
| Inactive token | none | Generic failure |
| Token request type mismatch | none | Generic failure |
| Verified active hostname | `domain` | Returns mapped parish id |
| Unverified hostname | none | Generic failure |
| Inactive hostname | none | Generic failure |
| Valid enabled slug | `slug` | Returns slug parish id |
| Disabled parish slug | none | Generic failure |
| Unknown slug | none | Generic failure |
| Legacy `/baptism-request` without route signal | `legacy_fallback` | Preserves current single-parish behavior |
| New `/intake/{slug}/{type}` without valid slug | none | Fails closed |
| Forged staff active parish cookie | unchanged | Has no effect |

## Public Intake Regression Checklist

Run after forward candidate and again after rollback.

- Baptism intake creates a safe disposable request.
- Funeral intake creates a safe disposable request.
- Wedding intake creates a safe disposable request.
- OCIA intake creates a safe disposable request.
- Join Parish intake creates a safe disposable request.
- Durable public intake rate limiting still permits normal submissions.
- Durable public intake rate limiting still returns 429 for repeated submissions.
- Public responses do not expose staff data, private parish settings, internal notes, AI notes, audit logs, or membership data.

## Future Health-Check Readiness

Future `/api/health` expectations, schema object labels, failure messaging, and promotion gates are documented in `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`.

Current runtime `/api/health` must not require public intake routing schema until the migration is promoted into `supabase/migrations` and applied to the target environment.

## Rollback Validation

Apply only this rollback draft in the disposable environment after forward validation:

- `docs/sql/public_intake_parish_routing_rollback_draft.sql`

Required rollback checks:

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
```

Expected after rollback:

- Public intake routing columns are absent from `public.parishes`.
- `public.parish_public_intake_domains` is absent.
- `public.parish_public_intake_tokens` is absent.
- Existing legacy public intake still works.

## Approval Gates

Do not move the candidate into `supabase/migrations` until all gates are satisfied:

- Disposable environment identity is recorded.
- Forward migration applies cleanly.
- Forward schema verification passes.
- Data validation cases pass.
- Rollback applies cleanly.
- Rollback schema verification passes.
- Legacy public intake regression checklist passes after forward and rollback.
- Resolver test matrix is approved for implementation.
- Health-check readiness criteria are reviewed and approved.
- Security review confirms no anonymous direct-write RLS was introduced.
- Product review confirms slug/domain/token precedence.
- Sign-off explicitly approves the next implementation phase.
