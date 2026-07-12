# Membership-Aware RLS Disposable QA Evidence Template

Status: Blank evidence template. Complete this only for a disposable Supabase branch, local Supabase database, or throwaway Supabase project.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md`
- `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `scripts/run-membership-aware-rls-disposable-validation.mjs`

## Safety Confirmation

- Disposable environment only: `Yes / No`
- Not production: `Yes / No`
- Not current shared QA: `Yes / No`
- No real parishioner data copied into this environment: `Yes / No`
- Forward candidate was not added to `supabase/migrations`: `Yes / No`
- Rollback draft was not added to `supabase/migrations`: `Yes / No`

## Environment Identity

- Supabase project or branch name:
- Supabase project reference:
- Database name from `select current_database()`:
- Local/branch URL:
- Date validation started:
- Date validation completed:
- Person running validation:
- Git branch:
- Git commit SHA:
- Environment variables confirmed pointed at disposable target: `Yes / No`
- Repository migrations applied before test: `Yes / No`
- Notes:

## Preflight Results

- Disposable parishes created:
  - `QA Parish A`: `Pass / Fail`
  - `QA Parish B`: `Pass / Fail`
  - `QA Parish C`: `Pass / Fail`
- Disposable staff users created:
  - `qa.staff.a@example.test`: `Pass / Fail`
  - `qa.staff.ab@example.test`: `Pass / Fail`
  - `qa.staff.c@example.test`: `Pass / Fail`
- Disposable parish memberships created:
  - Parish A only membership: `Pass / Fail`
  - Parish A plus Parish B membership: `Pass / Fail`
  - Parish C only membership: `Pass / Fail`
- Required foundation functions exist:
  - `current_staff_parish_ids()`: `Pass / Fail`
  - `is_authorized_for_parish(uuid)`: `Pass / Fail`
  - `request_belongs_to_primary_parish(uuid)`: `Pass / Fail`
- Baseline policy snapshot captured: `Yes / No`
- `/api/health` before forward application:

```json

```

## Forward Validation Results

- Forward candidate applied cleanly: `Pass / Fail`
- `request_belongs_to_staff_parish(uuid)` exists after forward application: `Pass / Fail`
- Direct parish policies use `is_authorized_for_parish(parish_id)`: `Pass / Fail`
- Request child policies use `request_belongs_to_staff_parish(request_id)`: `Pass / Fail`
- Tested operational policies no longer depend on `primary_parish_id()`: `Pass / Fail`
- Tested operational policies no longer depend on `request_belongs_to_primary_parish(request_id)`: `Pass / Fail`
- `/api/health` after forward application:

```json

```

### Forward Cross-Parish Allow/Deny Matrix

| Area | `qa.staff.a@example.test` Parish A | `qa.staff.a@example.test` Parish B | `qa.staff.ab@example.test` Parish A/B | `qa.staff.c@example.test` Parish A/B | Result Notes |
| --- | --- | --- | --- | --- | --- |
| People | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Households | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Sacramental Records | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Mass Intentions | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Requests | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Request Notes | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Request Communications | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Request Workflow Steps | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |
| Request Documents | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | `Pass / Fail` | |

### Forward Failure Notes

- Unauthorized rows visible:
- Unauthorized mutations succeeded:
- Missing policies:
- Unexpected errors:
- Fixes applied before rerun:

## Rollback Validation Results

- Rollback draft applied cleanly after forward candidate: `Pass / Fail`
- `request_belongs_to_staff_parish(uuid)` removed after rollback: `Pass / Fail`
- Direct parish policies returned to `is_authorized_staff()` plus `primary_parish_id()`: `Pass / Fail`
- Request child policies returned to `request_belongs_to_primary_parish(request_id)`: `Pass / Fail`
- Tested operational policies no longer reference `is_authorized_for_parish()`: `Pass / Fail`
- Tested operational policies no longer reference `request_belongs_to_staff_parish()`: `Pass / Fail`
- Single-primary-parish staff access works after rollback: `Pass / Fail`
- `/api/health` after rollback:

```json

```

### Rollback Failure Notes

- Rollback SQL errors:
- Membership-aware helper remained:
- Policy mismatch after rollback:
- Staff access issues after rollback:
- Fixes applied before rerun:

## Manual Staff Workflow QA Results

| Workflow | Result | Notes |
| --- | --- | --- |
| Sign in/sign out | `Pass / Fail` | |
| Dashboard | `Pass / Fail` | |
| Parish switcher authorized parishes only | `Pass / Fail` | |
| Request list and detail selected-parish scope | `Pass / Fail` | |
| Request status | `Pass / Fail` | |
| Assignment | `Pass / Fail` | |
| Follow-up date | `Pass / Fail` | |
| Internal notes | `Pass / Fail` | |
| Workflow steps | `Pass / Fail` | |
| Request documents | `Pass / Fail` | |
| People list/detail/create/edit | `Pass / Fail` | |
| Household list/detail/create/edit | `Pass / Fail` | |
| Sacramental records list/detail/create/edit | `Pass / Fail` | |
| Certificate generation | `Pass / Fail` | |
| Mass Intentions list/detail/create/edit | `Pass / Fail` | |
| Settings | `Pass / Fail` | |
| Reports | `Pass / Fail` | |
| Calendar | `Pass / Fail` | |
| Communications | `Pass / Fail` | |
| Intake Queue | `Pass / Fail` | |
| Notifications | `Pass / Fail` | |
| Global Search | `Pass / Fail` | |

## Public, Family, Document, And External QA Results

| Workflow | Result | Notes |
| --- | --- | --- |
| Baptism public intake | `Pass / Fail` | |
| Wedding public intake | `Pass / Fail` | |
| Funeral public intake | `Pass / Fail` | |
| OCIA public intake | `Pass / Fail` | |
| Join Parish public intake | `Pass / Fail` | |
| Durable public intake rate limiting | `Pass / Fail` | |
| Family portal safe details only | `Pass / Fail` | |
| Family portal document upload | `Pass / Fail` | |
| Staff document upload/review/signed URL | `Pass / Fail` | |
| Direct Supabase Storage remains private | `Pass / Fail` | |
| Google Calendar safe test credentials only | `Pass / Fail` | |
| Email safe test recipients only | `Pass / Fail` | |
| AI summary/draft data isolation | `Pass / Fail` | |

## Automated Check Outputs

- Guarded disposable RLS validation script:

```json

```

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

## Cleanup Confirmation

- Disposable staff users removed or disabled: `Yes / No`
- Disposable parish memberships removed or disabled: `Yes / No`
- Disposable parishioners and requests removed or archived: `Yes / No`
- Disposable people, households, records, and Mass Intentions removed or archived: `Yes / No`
- Disposable notes, communications, workflow steps, documents, and portal tokens removed or archived: `Yes / No`
- Uploaded test files removed from Supabase Storage: `Yes / No`
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
- Promotion window:
- Rollback owner:
- Final notes:
