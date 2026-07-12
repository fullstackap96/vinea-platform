# Request Access Legacy Fallback Boundary - 2026-07-08

Status: Implemented as a source-level production-readiness guard. Request detail and staff document authorization keep the approved legacy primary-parish fallback available only through explicit compatibility options, while selected active-parish requests must still validate staff membership before reading request-scoped data.

## What Changed

- Added `lib/server/requestAccessLegacyFallbackBoundary.test.ts`.
- Source-guarded `loadStaffScopedRequestDetailAccess` and `loadStaffScopedRequestDocumentAccess`.
- Verified staff-facing request detail, document list/upload, signed document, review, and portal-token routes do not perform direct oldest-parish lookups.

## What Changed In Plain English

Vinea still behaves the same today. This adds a guardrail around request detail and document access so future code cannot quietly skip the selected parish check and guess a parish by taking the oldest parish row.

## Why This Matters

Request details and documents are among the most sensitive parish-office surfaces. Multi-parish staff must only see the request and document data for the parish they are authorized to work in. Keeping the old single-parish fallback isolated makes future production RLS promotion safer and easier to review.

## Boundary

- `loadStaffScopedRequestDetailAccess` and `loadStaffScopedRequestDocumentAccess` must validate an active parish cookie through staff membership when one is present.
- The legacy primary-parish fallback is an explicit compatibility path only when no active parish cookie exists and the caller opts in with `allowPrimaryParishFallback`.
- Staff-facing request routes must call the scoped helpers instead of querying `parishes` directly.

## Explicit Non-Goals

This does not change runtime behavior, access production, apply migrations, change operational RLS, enable production flags, mutate records, touch Google Calendar data, run exports, call AI, access storage directly, create signed URLs differently, send communications, generate certificates, or make public trust claims.

## Follow-Up

Production membership-aware operational RLS remains `NO-GO` until the existing production owner approvals, smoke fixtures, rollout/rollback evidence, and explicit approval language are complete.
