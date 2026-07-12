# Public Intake Routing Disposable QA Evidence Template

Status: Blank evidence template. Complete this only for a disposable Supabase branch, local Supabase database, or throwaway Supabase project.

Related docs:

- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`

## Safety Confirmation

- Disposable environment only: `Yes / No`
- Not production: `Yes / No`
- Not current shared QA unless explicitly approved by user: `Yes / No`
- No real parishioner data copied into this environment: `Yes / No`
- Forward candidate was not added to `supabase/migrations`: `Yes / No`
- Rollback draft was not added to `supabase/migrations`: `Yes / No`
- Runtime public intake was not wired to the resolver during this evidence run: `Yes / No`
- Operational RLS was not changed during this evidence run: `Yes / No`

## Environment Identity

- Supabase project or branch name:
- Supabase project reference:
- Database name from `select current_database()`:
- Database host:
- Local/branch URL:
- Date validation started:
- Date validation completed:
- Person running validation:
- Git branch:
- Git commit SHA:
- Environment variables confirmed pointed at disposable target: `Yes / No`
- Repository migrations applied before test: `Yes / No`
- Execution packet followed: `Yes / No`
- Notes:

## Preflight Results

- Baseline `/api/health` before forward application:

```json

```

- Current runtime health checks do not require public intake routing schema yet: `Pass / Fail`
- `public.parishes.public_slug` absent before candidate: `Pass / Fail`
- `public.parishes.public_display_name` absent before candidate: `Pass / Fail`
- `public.parishes.public_intake_enabled` absent before candidate: `Pass / Fail`
- `public.parish_public_intake_domains` absent before candidate: `Pass / Fail`
- `public.parish_public_intake_tokens` absent before candidate: `Pass / Fail`
- Candidate indexes absent before candidate: `Pass / Fail`
- Preflight notes:

## Forward Migration Candidate Apply Results

- Forward candidate applied from `docs/sql/public_intake_parish_routing_migration_candidate.sql`: `Pass / Fail`
- Candidate applied cleanly without manual edits: `Pass / Fail`
- `public.parishes.public_slug` exists: `Pass / Fail`
- `public.parishes.public_display_name` exists: `Pass / Fail`
- `public.parishes.public_intake_enabled` exists with default `false`: `Pass / Fail`
- `public.parish_public_intake_domains` exists: `Pass / Fail`
- `public.parish_public_intake_tokens` exists: `Pass / Fail`
- `parishes_public_slug_lower_unique` exists: `Pass / Fail`
- `parish_public_intake_domains_hostname_lower_unique` exists: `Pass / Fail`
- `parish_public_intake_tokens_token_hash_unique` exists: `Pass / Fail`
- RLS enabled on public intake routing tables: `Pass / Fail`
- No `anon` direct-write policies created: `Pass / Fail`
- Staff policies use `is_authorized_for_parish(parish_id)`: `Pass / Fail`
- Forward application notes:

## Data Validation Results

| Case | Result | Notes |
| --- | --- | --- |
| Insert slug `st-ann` | `Pass / Fail` | |
| Insert uppercase slug `St-Ann` fails | `Pass / Fail` | |
| Insert slug with spaces fails | `Pass / Fail` | |
| Insert duplicate slug with different case fails | `Pass / Fail` | |
| Insert verified hostname `intake.stann.example` | `Pass / Fail` | |
| Insert uppercase hostname fails | `Pass / Fail` | |
| Insert duplicate hostname with different case fails | `Pass / Fail` | |
| Insert token hash for Baptism | `Pass / Fail` | |
| Insert duplicate token hash fails | `Pass / Fail` | |
| Insert invalid token request type fails | `Pass / Fail` | |
| Raw token value is not stored | `Pass / Fail` | |

## Future `/api/health` Expectations

These checks are evidence for the future applied migration phase. Current runtime `/api/health` should not require this schema until the migration is promoted into `supabase/migrations` and applied.

- Future success shape reviewed:

```json
{
  "ok": true,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": true,
    "resend": true,
    "googleOAuth": true
  }
}
```

- Future missing parish routing columns label verified: `Pass / Fail`
  - Expected label: `public intake parish routing columns`
- Future missing domain routing table label verified: `Pass / Fail`
  - Expected label: `public intake domain routing table`
- Future missing token routing table label verified: `Pass / Fail`
  - Expected label: `public intake token routing table`
- Future missing schema response uses `error: "schema"`: `Pass / Fail`
- Future `missingSchema` labels contain no SQL text, secrets, hostnames, raw tokens, token hashes, staff data, or private parish data: `Pass / Fail`
- Existing public intake rate-limit health checks still pass: `Pass / Fail`
- Existing membership foundation health checks still pass: `Pass / Fail`
- Health notes:

## Resolver Case Results

Run resolver tests against safe disposable data or through focused unit tests before runtime wiring.

| Case | Result | Notes |
| --- | --- | --- |
| Valid active token for active parish returns `token` | `Pass / Fail` | |
| Expired token fails closed | `Pass / Fail` | |
| Inactive token fails closed | `Pass / Fail` | |
| Token request type mismatch fails closed | `Pass / Fail` | |
| Verified active hostname returns `domain` | `Pass / Fail` | |
| Unverified hostname fails closed | `Pass / Fail` | |
| Inactive hostname fails closed | `Pass / Fail` | |
| Valid enabled slug returns `slug` | `Pass / Fail` | |
| Disabled parish slug fails closed | `Pass / Fail` | |
| Unknown slug fails closed | `Pass / Fail` | |
| Legacy `/baptism-request` returns `legacy_fallback` | `Pass / Fail` | |
| New `/intake/{slug}/{type}` without valid slug fails closed | `Pass / Fail` | |
| Forged staff active parish cookie has no effect | `Pass / Fail` | |

## Public Intake Regression Results

Run after forward candidate and again after rollback.

| Workflow | After Forward | After Rollback | Notes |
| --- | --- | --- | --- |
| Baptism public intake | `Pass / Fail` | `Pass / Fail` | |
| Funeral public intake | `Pass / Fail` | `Pass / Fail` | |
| Wedding public intake | `Pass / Fail` | `Pass / Fail` | |
| OCIA public intake | `Pass / Fail` | `Pass / Fail` | |
| Join Parish public intake | `Pass / Fail` | `Pass / Fail` | |
| Durable public intake normal submission | `Pass / Fail` | `Pass / Fail` | |
| Durable public intake 429 behavior | `Pass / Fail` | `Pass / Fail` | |
| Public responses expose only safe family-facing data | `Pass / Fail` | `Pass / Fail` | |
| Runtime forms still use legacy route behavior | `Pass / Fail` | `Pass / Fail` | |

## Rollback Results

- Rollback draft applied from `docs/sql/public_intake_parish_routing_rollback_draft.sql`: `Pass / Fail`
- Rollback applied cleanly without manual edits: `Pass / Fail`
- `public.parishes.public_slug` removed: `Pass / Fail`
- `public.parishes.public_display_name` removed: `Pass / Fail`
- `public.parishes.public_intake_enabled` removed: `Pass / Fail`
- `public.parish_public_intake_domains` removed: `Pass / Fail`
- `public.parish_public_intake_tokens` removed: `Pass / Fail`
- Candidate indexes removed: `Pass / Fail`
- Existing legacy public intake still works after rollback: `Pass / Fail`
- Rollback notes:

## Automated Check Outputs

- Targeted validation tests:

```text

```

- Full test suite:

```text

```

- Build:

```text

```

- Lint:

```text

```

- Health:

```json

```

## Unresolved Risks

- Open defects:
- Deferred fixes:
- Manual QA gaps:
- Security concerns:
- Product/UX concerns:
- Deployment timing concerns:
- Migration promotion concerns:
- Runtime wiring concerns:

## Cleanup Confirmation

- Disposable public slugs removed or environment destroyed: `Yes / No`
- Disposable domain routing rows removed or environment destroyed: `Yes / No`
- Disposable token routing rows removed or environment destroyed: `Yes / No`
- Disposable parishioners and requests removed or environment destroyed: `Yes / No`
- Uploaded test files removed from Supabase Storage, if any: `Yes / No`
- Temporary Supabase branch/project destroyed: `Yes / No`
- Local environment variables restored away from disposable target: `Yes / No`
- Cleanup notes:

## Sign-Off

| Role | Name | Decision | Date | Notes |
| --- | --- | --- | --- | --- |
| Product Owner | | `Promote / Do Not Promote / Promote After Fixes` | | |
| Technical Owner | | `Promote / Do Not Promote / Promote After Fixes` | | |
| QA Owner | | `Promote / Do Not Promote / Promote After Fixes` | | |
| Security/Data Owner | | `Promote / Do Not Promote / Promote After Fixes` | | |

## Final Decision

- Decision: `Promote / Do Not Promote / Promote After Fixes`
- Evidence package location:
- Required follow-up before promotion:
- Promotion readiness checklist completed: `Yes / No`
- Promotion readiness checklist location:
- Promotion window:
- Rollback owner:
- Final notes:
