# Governance Filter Latest-Response Boundary

Decision: `GOVERNANCE_FILTER_LATEST_RESPONSE_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented locally as read-only governance UX and evidence-review hardening.

## What Changed

The Audit Log and non-production Export Audit Reviewer now use a last-request-wins boundary by assigning each filter load or manual refresh a monotonically increasing sequence. Only the newest request may apply rows, selected-parish labels, safe errors, loaded timestamps, or loading completion.

Changing a filter invalidates the current request immediately, before React starts the next effect. A stale response therefore cannot briefly appear beneath a newly selected filter. Older successes, failures, and `finally` paths all become no-ops once a newer filter or refresh owns the surface.

Selecting the already-active filter is a no-op and does not invalidate its current load. The dedicated Refresh control remains the explicit way to reload the active filter.

## Why This Matters

Security and export review screens must be trustworthy. Reviewers should never see rows from an older filter presented as though they match the current selection, especially when investigating denied, blocked-field, or cross-parish activity.

## Preserved Boundaries

Both surfaces remain read-only. Existing staff authentication, selected-parish membership scope, API response allowlists, saved-filter semantics, forbidden-data exclusions, production export `NO-GO`, prototype feature gates, safe links, and generic error messages remain unchanged.

No production access, production flag change, dashboard navigation change, data mutation, migration, operational RLS change, export execution, storage access, signed URL creation, provider call, external integration access, or public trust claim occurred.

## Verification

`lib/server/governanceFilterLatestResponseBoundary.test.ts` verifies per-load sequencing, immediate filter invalidation, stale success/failure/completion no-op behavior, and this read-only documentation boundary.

- Focused Audit Log, reviewer dashboard/API, selected-parish, safe-message, and safe-link suite: 7 test files and 31 tests passed.
- The current full repository regression baseline remains 781 test files and 3,304 tests passed; all subsequent focused freshness/loading suites passed.
- ESLint passed.
- Full TypeScript checking passed.
- Production-sensitive gate validation passed with all 15 artifacts linked and still locked.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
