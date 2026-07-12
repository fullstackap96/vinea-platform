# Public Intake Routing Disposable QA Evidence - Blocked Attempt 2026-06-24

Status: Blocked before SQL execution. No migrations were applied, no runtime behavior was changed, and no database was modified.

Related docs:

- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`

## Safety Confirmation

- Disposable environment only: `No`
- Not production: `Unknown`
- Not current shared QA unless explicitly approved by user: `No`
- No real parishioner data copied into this environment: `Not applicable`
- Forward candidate was not added to `supabase/migrations`: `Yes`
- Rollback draft was not added to `supabase/migrations`: `Yes`
- Runtime public intake was not wired to the resolver during this evidence run: `Yes`
- Runtime `/api/health` was not changed during this evidence run: `Yes`
- Operational RLS was not changed during this evidence run: `Yes`

## Environment Identity

- Supabase project or branch name: `Not available`
- Supabase project reference: `Not available for a disposable target`
- Database name from `select current_database()`: `Not run`
- Database host: `Not run`
- Local/branch URL: `Not available`
- Date validation started: `2026-06-24`
- Date validation completed: `2026-06-24`
- Person running validation: `Codex`
- Git branch: `Not recorded`
- Git commit SHA: `Not recorded`
- Environment variables confirmed pointed at disposable target: `No`
- Repository migrations applied before test: `Not run`
- Execution packet followed: `Stopped at target safety verification before SQL execution`

## Blocker

The execution packet requires a disposable Supabase branch, local Supabase database, or throwaway Supabase project.

The local `.env.local` points at project ref `gnfomgsuottcuueasfvi`, which is the previously used shared QA project. The user instruction for this phase explicitly said not to touch the current shared QA database.

No disposable `SUPABASE_DB_URL`, disposable project ref, disposable branch URL, local Supabase database, `psql`, `supabase` CLI, or callable Supabase MCP tool was available in this Codex session.

`codex mcp list` was attempted to verify whether the Supabase MCP server was locally accessible, but `codex.exe` returned `Access is denied` both in normal and escalated command execution.

## Preflight Results

- Baseline `/api/health` before forward application: `Not run`
- Current runtime health checks do not require public intake routing schema yet: `Not run`
- Public intake routing columns absent before candidate: `Not run`
- Public intake domain routing table absent before candidate: `Not run`
- Public intake token routing table absent before candidate: `Not run`
- Candidate indexes absent before candidate: `Not run`

Reason: no safe disposable database target was available.

## Forward Migration Candidate Apply Results

- Forward candidate applied from `docs/sql/public_intake_parish_routing_migration_candidate.sql`: `Not run`
- Candidate applied cleanly without manual edits: `Not run`
- Routing schema verification: `Not run`
- RLS verification: `Not run`
- Anonymous direct-write policy verification: `Not run`

Reason: no safe disposable database target was available.

## Resolver Case Results

- Resolver unit tests: `Run as part of local automated checks`
- Database-backed resolver checks: `Not run`

Reason: no safe disposable database target was available.

## Public Intake Regression Results

- Baptism public intake: `Not run`
- Wedding public intake: `Not run`
- Funeral public intake: `Not run`
- OCIA public intake: `Not run`
- Join Parish public intake: `Not run`
- Durable public intake normal behavior: `Not run`
- Durable public intake 429 behavior: `Not run`

Reason: no disposable app/database target was available.

## Rollback Results

- Rollback draft applied from `docs/sql/public_intake_parish_routing_rollback_draft.sql`: `Not run`
- Rollback schema verification: `Not run`

Reason: no forward migration was applied and no safe disposable database target was available.

## Automated Check Outputs

Local checks were run to verify the docs and code still pass after recording this blocked evidence.

- Targeted validation tests: `npm.cmd test -- lib/server/publicIntakeRoutingBlockedEvidence.test.ts lib/server/publicIntakeRoutingDisposableExecutionPacket.test.ts lib/server/publicIntakeRoutingPromotionReadinessChecklist.test.ts lib/server/publicIntakeRoutingEvidenceTemplate.test.ts lib/server/publicIntakeRoutingHealthReadiness.test.ts lib/server/publicIntakeParishRoutingQaValidation.test.ts lib/server/publicIntakeParishRoutingStrategy.test.ts lib/server/multiParishRemainingPathsInventory.test.ts` passed: 8 test files, 32 tests.
- Full test suite: `npm.cmd test -- --reporter=dot` passed: 96 test files, 372 tests.
- Build: `npm.cmd run build` passed on Next.js 16.2.2.
- Lint: `npm.cmd run lint` passed with 58 existing warnings and 0 errors.

## Unresolved Risks

- Disposable Supabase execution has not been performed.
- Forward migration candidate has not been validated against a real disposable Supabase target.
- Rollback draft has not been validated against a real disposable Supabase target.
- Public intake regression was not run against a disposable target.
- Promotion readiness remains blocked until a disposable target is provided and evidence is captured.

## Cleanup Confirmation

- Temporary Supabase branch/project destroyed: `Not applicable`
- Disposable routing rows removed or environment destroyed: `Not applicable`
- No database writes were performed: `Yes`
- No cleanup required because execution stopped before SQL: `Yes`

## Sign-Off

- Product owner: `Not approved`
- Technical owner: `Not approved`
- QA owner: `Not approved`
- Security/data owner: `Not approved`
- Rollback owner: `Not assigned`

## Final Decision

Decision: `Do Not Promote`

Reason: Disposable QA execution is blocked until a safe disposable Supabase branch, local Supabase database, or throwaway Supabase project is available to Codex.
