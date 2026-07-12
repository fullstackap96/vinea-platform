# Staff Parish Context Legacy Fallback Boundary - 2026-07-08

Status: Implemented as a source-level production-readiness guard. The staff parish context helpers remain membership-first, while the legacy primary-parish fallback stays an explicit compatibility fallback until production membership-aware operational RLS is approved.

## What Changed

- Added `lib/server/staffParishContextLegacyFallbackBoundary.test.ts`.
- Source-guarded `resolveStaffParishContext` so read context continues to try active staff memberships before compatibility fallback.
- Source-guarded `resolveStaffWriteParishContext` so write context continues to require membership by default and only uses primary-parish fallback when a caller explicitly opts in.

## What Changed In Plain English

Vinea still behaves the same today. This adds a guardrail around the shared parish selector logic so future code keeps asking, "Which parishes is this staff member allowed to work in?" before ever using the old single-parish fallback.

## Why This Matters

Almost every multi-parish staff screen depends on these helpers. If they drift, many routes could quietly become less tenant-safe. Keeping the compatibility fallback named and explicit helps reviewers see exactly where legacy behavior still exists before production RLS is approved.

## Boundary

- Staff read context must call `current_staff_parish_ids` first and use membership results when available.
- Staff write context must call membership-aware helpers first.
- Primary-parish fallback for writes must remain opt-in through `allowPrimaryParishFallback`.
- Requested parish writes must not fall back to a different primary parish.

## Explicit Non-Goals

This does not change runtime behavior, access production, apply migrations, change operational RLS, enable production flags, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Follow-Up

Production membership-aware operational RLS remains `NO-GO` until the existing owner approvals, smoke fixtures, rollout/rollback evidence, and exact explicit approval language are complete.
