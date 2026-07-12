# Membership-Aware Operational RLS Non-Production Promotion Plan - 2026-06-26

Status: Prepared plan and role-readiness record only. Do not move the migration candidate into `supabase/migrations` from this document. Do not apply operational RLS to shared QA or production from this document.

## Decision Boundary

This plan prepares the next controlled promotion step for the membership-aware operational RLS candidate.

Approved now:

- Record advisory technical, QA, and security/data readiness based on completed evidence.
- Define the exact non-production promotion procedure.
- Define rollback, verification, and no-go criteria.

Not approved now:

- Moving `docs/sql/membership_aware_operational_rls_migration_candidate.sql` into `supabase/migrations`.
- Applying operational RLS to shared QA project `gnfomgsuottcuueasfvi`.
- Applying operational RLS to production.
- Enabling runtime public intake routing.

## Evidence Package

- Product-owner sign-off: `docs/MEMBERSHIP_AWARE_RLS_PRODUCT_OWNER_SIGNOFF_20260626.md`
- Disposable forward/rollback validation: `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md`
- Manual authenticated allow/deny QA: `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- Route/document/family portal QA: `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md`
- Promotion readiness checklist: `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- Forward candidate: `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- Rollback draft: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Role Readiness Record

These entries are readiness recommendations, not named human signatures. A future promotion prompt must either name the human approver for each role or explicitly accept Codex advisory review as sufficient for a non-production-only run.

| Role | Readiness status | Reviewer source | Decision | Evidence |
|---|---|---|---|---|
| Product owner | `Signed off for next controlled non-production preparation` | User-approved product-owner prompt | `Proceed to planning only` | Product-owner sign-off doc |
| Technical owner | `Advisory ready; named sign-off pending` | Codex architecture review of candidate, rollback, parity tests, and route safety evidence | `Recommend non-production-only promotion after explicit prompt` | Candidate SQL, rollback draft, parity/evidence tests |
| QA owner | `Advisory ready; named sign-off pending` | Codex QA review of disposable validation, 207 manual allow/deny cases, and route/document/family portal QA | `Recommend non-production-only promotion after explicit prompt` | Completed disposable, manual QA, and route QA docs |
| Security/data owner | `Advisory ready; named sign-off pending` | Codex security/data review of cross-parish deny cases, direct storage denial, token hash non-exposure, and family portal safety | `Recommend non-production-only promotion after explicit prompt` | Manual QA and route/browser QA evidence |

## Non-Production Target Rules

Allowed target for the next promotion run:

- A disposable Supabase project, temporary branch, or explicitly approved non-production project.

Blocked targets for the next promotion run:

- Production.
- Shared QA project `gnfomgsuottcuueasfvi`, unless a later prompt explicitly approves shared QA application.
- Any database whose host or project reference cannot be verified before execution.

Required environment naming for the future run:

- Use `NON_PRODUCTION_SUPABASE_DB_URL` or another clearly non-production variable name.
- Do not reuse `SUPABASE_DB_URL` unless the prompt explicitly confirms it points to the approved non-production target.
- Do not print the database URL, passwords, anon key, or service-role key.

## Future Migration Promotion Procedure

Run these steps only after a new explicit approval prompt.

1. Verify the working tree and identify unrelated changes.
2. Verify the candidate and rollback files exist:
   - `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
   - `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
3. Verify no existing migration file includes `membership_aware_operational_rls`.
4. Create a new timestamped migration file:
   - Suggested pattern: `supabase/migrations/YYYYMMDDHHMMSS_membership_aware_operational_rls.sql`
5. Copy the full contents of `docs/sql/membership_aware_operational_rls_migration_candidate.sql` into that new migration file.
6. Add a migration header that references:
   - This plan.
   - The product-owner sign-off.
   - The rollback draft.
   - The completed disposable/manual/route QA evidence.
7. Run focused validation tests for:
   - Candidate coverage.
   - Rollback parity.
   - Product-owner sign-off.
   - This non-production promotion plan.
8. Run the full automated checks locally:
   - `npm.cmd test -- --reporter=dot`
   - `npm.cmd run lint`
   - `npm.cmd run build`
9. Apply the new migration to the approved non-production target only.
10. Confirm `/api/health` returns `checks.schema: true`.
11. Rerun the core membership-aware allow/deny checks against the promoted migration shape.
12. Rerun staff route QA for:
    - Request detail.
    - Request documents.
    - Signed URL access.
    - Direct storage privacy.
    - Family portal safety.
13. Record an evidence doc with target identity, timestamps, sanitized outputs, results, and cleanup/rollback status.

## Rollback Procedure For The Future Non-Production Run

Rollback must be rehearsed before production is considered.

1. Confirm the target is the approved non-production target.
2. Apply `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
3. Verify `request_belongs_to_staff_parish(uuid)` no longer exists.
4. Verify operational policies return to the current primary-parish scoped shape.
5. Confirm `/api/health` returns `checks.schema: true`.
6. Confirm single-primary-parish staff access still works.
7. Record rollback evidence and unresolved risks.

## No-Go Conditions

Do not proceed with future promotion if any of these are true:

- Target database identity is unclear.
- Target is production.
- Target is shared QA without a new explicit approval.
- Candidate or rollback draft changed without rerunning validation tests.
- Any policy coverage/parity test fails.
- Full tests, lint, or build fail.
- `/api/health` returns `checks.schema: false`.
- Public/family-facing routes expose internal notes, AI notes, audit data, token hashes, or staff-only data.
- Direct Supabase Storage access succeeds through anon/public access for protected request documents.
- Rollback owner or rollback command path is unclear.

## Evidence To Capture During The Future Run

- Git branch and commit under test.
- Exact migration filename created.
- Approved non-production target host or project reference.
- Confirmation that production and shared QA were not touched.
- `/api/health` before migration.
- `/api/health` after migration.
- `/api/health` after rollback rehearsal.
- Forward validation output.
- Rollback validation output.
- Manual route QA output.
- Full test, lint, and build outputs.
- Any failures, fixes, and retest evidence.
- Cleanup status.
- Final decision: `Ready for shared QA`, `Do Not Promote`, or `Promote After Fixes`.

## Next Approval Phrase

The next prompt should explicitly say:

`Approve non-production migration promotion for membership-aware operational RLS. Move the candidate into supabase/migrations, apply only to [TARGET], run the documented verification and rollback checks, do not touch production, and summarize evidence.`

Replace `[TARGET]` with the exact approved non-production project reference or database host.
