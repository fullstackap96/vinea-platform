# Runtime Supabase Wildcard Projection Guard - 2026-07-10

Decision: `RUNTIME_SUPABASE_WILDCARD_PROJECTION_GUARD_IMPLEMENTED_20260710`

Status: Implemented as a repository source guard after application runtime wildcard reads were removed.

## Guarded Boundary

`lib/server/runtimeSupabaseWildcardProjectionGuard.test.ts` recursively scans runtime TypeScript sources under:

- `app/**/*.{ts,tsx}`
- `lib/**/*.{ts,tsx}`

Test and spec files are excluded because they intentionally contain forbidden-pattern assertions. The guard fails when runtime code begins a Supabase `.select(...)` string with `*`, including single-quoted, double-quoted, or template-literal forms.

Every operational read must instead use an explicit view-specific projection or a named projection constant. This keeps new database columns opt-in and prevents future pastoral, identity, audit, token, storage, or provider fields from silently entering unrelated server or browser DTOs.

## What This Proves

- Current application runtime source has no Supabase wildcard projection.
- New wildcard projections fail the standard Vitest suite and CI path.
- Projection growth must be visible in code review.

## What This Does Not Prove

This source guard does not prove row-level authorization, selected-parish ownership, RLS correctness, response redaction, or minimality of every explicit field list. Those remain covered by route/loader tests, membership-aware RLS evidence, active-parish boundaries, and human review.

## Preserved Gates

- No production access.
- No database, migration, storage, provider, AI, email, export, or Calendar operation.
- No operational RLS or runtime behavior change.
- No public trust claim.
- Production-sensitive features remain unapproved and all production-sensitive gates remain locked.
