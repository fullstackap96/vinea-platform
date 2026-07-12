# Public Intake Routing Promotion Readiness Checklist

Status: Schema-only promotion approved. Runtime public intake routing remains unwired and operational RLS remains unchanged.

Related docs:

- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_EVIDENCE_SUMMARY_20260625.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- `supabase/migrations/20260625193000_public_intake_parish_routing.sql`

## Purpose

This checklist defines the approval gates required before promoting the public intake parish routing migration candidate from `docs/sql` into `supabase/migrations`.

Schema promotion means the routing schema becomes an applied Supabase migration and can support a future approved public intake route-wiring phase. The approved promotion does not make public forms route by slug, domain, or token yet.

## Hard Promotion Rules

- Do not promote directly from draft SQL to production.
- Do not promote unless disposable QA evidence has been completed from a clean disposable Supabase environment.
- Do not promote unless rollback has been applied and verified after the forward candidate in that same disposable environment.
- Do not promote unless public intake regression testing passed for Baptism, Wedding, Funeral, OCIA, and Join Parish forms.
- Do not promote unless durable public intake rate-limit behavior, including normal submission and 429 behavior, has been verified.
- Do not promote unless future `/api/health` update criteria are explicitly approved for the same implementation phase as the applied migration.
- Do not promote unless a rollback owner is named.
- Do not bundle runtime public intake routing, route wiring, or operational RLS changes into the schema-promotion commit.

## Required Evidence Links

Create a short promotion evidence note before promotion. It must include links or file paths for:

- Completed promotion evidence summary: `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_EVIDENCE_SUMMARY_20260625.md`.
- Completed disposable QA evidence package based on `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`.
- Confirmation that `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md` was followed.
- Disposable cleanup evidence: `docs/DISPOSABLE_REUSABLE_PROJECT_CLEANUP_EXECUTION_EVIDENCE_20260625.md`.
- Disposable base schema bootstrap replay evidence: `docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md`.
- Disposable app public intake evidence: `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md`.
- Forward migration candidate used during disposable QA.
- Rollback draft used during disposable QA.
- Disposable Supabase project or branch identity.
- `/api/health` output before forward candidate application.
- `/api/health` output after forward candidate application.
- `/api/health` output after rollback application.
- Resolver case results for token, verified domain, slug, legacy fallback, disabled parish, expired token, request-type mismatch, and forged staff active parish cookie.
- Public intake regression results for Baptism, Wedding, Funeral, OCIA, Join Parish, normal rate-limit behavior, and 429 behavior.
- Automated check outputs for focused tests, full tests, build, and lint.
- Cleanup confirmation for the disposable environment.
- Sign-off record.

Current evidence status:

- Disposable cleanup evidence is complete for approved reusable disposable project `kikqtorplsswepqitjys`.
- Base schema bootstrap replay evidence is complete and verified all required tables and functions.
- Disposable app public intake QA evidence is complete, including `/api/health`, all five public intake types, normal rate-limit behavior, and durable `429` behavior.
- Schema-only promotion has product-owner approval.
- Runtime public intake routing remains blocked until a separate route-wiring phase is explicitly approved.

## Gate 1: Candidate Location And Review

Pass criteria:

- `docs/sql/public_intake_parish_routing_migration_candidate.sql` exists.
- `docs/sql/public_intake_parish_routing_rollback_draft.sql` exists.
- No public intake routing migration candidate has been placed in `supabase/migrations`.
- The migration candidate is still documented as a non-applied candidate.
- The candidate references or is reviewed against the rollback draft.
- The candidate creates only schema needed for future public routing: parish slug/display/enabled columns, domain routing table, token routing table, indexes, and staff-scoped management policies.
- The candidate does not add anonymous direct-write policies.

Fail criteria:

- A public intake routing migration is already present in `supabase/migrations` without this checklist being complete.
- The candidate lacks rollback coverage.
- The candidate adds runtime assumptions that current public forms do not satisfy.
- The candidate weakens staff, family portal, document, or operational RLS policies.

## Gate 2: Disposable Forward Validation Evidence

Pass criteria:

- Forward candidate applies cleanly in a disposable Supabase environment.
- The disposable environment was not production and not the current shared QA database unless explicitly approved.
- `parishes.public_slug`, `parishes.public_display_name`, and `parishes.public_intake_enabled` exist after forward application.
- `parish_public_intake_domains` exists after forward application.
- `parish_public_intake_tokens` exists after forward application.
- Unique indexes and check constraints pass the cases in the disposable QA validation plan.
- RLS is enabled on public intake routing tables.
- Staff policies use membership-aware parish authorization where applicable.
- No anonymous client can directly manage routing rows.

Fail criteria:

- Any forward SQL statement fails.
- Any required routing object is missing.
- Any duplicate slug, hostname, or token hash case succeeds when it should fail.
- Any anonymous direct-write access exists.
- Any real parishioner data is copied into the disposable environment.

## Gate 3: Rollback Evidence

Pass criteria:

- Rollback draft applies cleanly after the forward candidate in the same disposable environment.
- Public intake routing columns are removed from `public.parishes`.
- `parish_public_intake_domains` is removed.
- `parish_public_intake_tokens` is removed.
- Public intake routing indexes are removed.
- Existing public intake forms still use the legacy single-parish path after rollback.
- `/api/health` returns the expected current-runtime result after rollback.
- Rollback owner is named and has confirmed the rollback command/path.

Fail criteria:

- Any rollback SQL statement fails.
- Any routing object remains after rollback without documented reason.
- Rollback breaks staff sign-in, dashboard loading, current public intake, family portal, document upload, email, AI, or Google Calendar safety checks.
- No person is named as rollback owner.

## Gate 4: Future `/api/health` Update Criteria

Pass criteria:

- The implementation plan identifies the exact phase that will add the public intake routing checks to runtime `/api/health`.
- The planned checks match `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`.
- The planned missing-schema labels are:
  - `public intake parish routing columns`
  - `public intake domain routing table`
  - `public intake token routing table`
- The failure response uses `error: "schema"` and safe `missingSchema` labels only.
- Health-check tests will be added or updated in the same phase as the applied migration.
- A rollback plan exists if `/api/health` reports missing public intake routing schema after deployment.

Fail criteria:

- Runtime `/api/health` is updated before the migration is applied.
- The migration is promoted without a committed plan to update `/api/health`.
- Health responses expose SQL text, tokens, token hashes, hostnames, staff data, parish-private data, or raw exception details.

## Gate 5: Manual Public Intake QA

Pass criteria:

- Baptism public intake submits successfully.
- Wedding public intake submits successfully.
- Funeral public intake submits successfully.
- OCIA public intake submits successfully.
- Join Parish public intake submits successfully.
- Normal public intake submissions are accepted before the rate-limit threshold.
- Durable public intake 429 behavior works after the threshold.
- Public intake failure messages are understandable and do not expose internal data.
- Runtime forms still use legacy behavior until a future route-wiring phase is explicitly approved.
- Staff active parish cookies do not affect public intake routing tests.

Fail criteria:

- Any public form fails to submit valid safe test data.
- Rate limiting fails open or blocks normal first submissions.
- Public forms expose private parish, staff, AI, audit, or token data.
- Staff active parish context changes public intake results before runtime routing is intentionally wired.

## Gate 6: Automated Checks

Pass criteria:

- `npm.cmd test -- --reporter=dot` passes.
- `npm.cmd run build` passes.
- `npm.cmd run lint` has no new errors.
- Focused public intake routing strategy, QA validation, health readiness, resolver, evidence template, and promotion checklist tests pass.
- `/api/health` returns the expected result for the target phase.

Fail criteria:

- Any test fails.
- Build fails.
- Lint reports errors.
- `/api/health` fails unexpectedly.

## Gate 7: Approval Sign-Off

Required sign-off:

- Product owner approval that public intake routing promotion is worth the risk.
- Technical owner approval that the migration and rollback are coherent.
- QA owner approval that disposable forward and rollback validation passed.
- Security/data owner approval that public routes do not expose private data and anonymous write access is not broadened.

Sign-off record must include:

- Approver name.
- Role.
- Date.
- Evidence package location.
- Rollback owner.
- Explicit decision: `Promote`, `Do Not Promote`, or `Promote After Fixes`.

## Promotion Procedure After Approval

Only after all gates pass:

1. Copy the migration candidate into a new timestamped file under `supabase/migrations`.
2. Keep the rollback draft in `docs/sql` and reference it in the build status entry.
3. Add or update runtime `/api/health` checks in the same implementation phase as the applied migration.
4. Add or update health-check tests for the promoted schema.
5. Run focused public intake routing tests.
6. Run full automated checks locally.
7. Apply to a non-production Supabase target first.
8. Repeat manual public intake QA against safe test data.
9. Apply to production only after non-production results match the evidence package and approval record.
10. Update `docs/VINEA_BUILD_STATUS.md` with the applied migration name, target, verification results, health-check result, and rollback reference.

## Explicit No-Go Conditions

Do not promote if any of these are true:

- Disposable QA evidence is missing.
- Rollback evidence is missing.
- `/api/health` update criteria are not approved.
- Manual public intake QA is incomplete.
- Rate-limit 429 behavior is untested.
- Resolver fail-closed cases are incomplete.
- Any public route exposes staff-only data, internal notes, AI notes, audit logs, token hashes, or private parish data.
- Runtime route wiring is being bundled into the migration-promotion step.
- Operational RLS is being changed as part of this promotion.
- The rollback owner is missing.
- The deployment window does not allow rollback verification.
