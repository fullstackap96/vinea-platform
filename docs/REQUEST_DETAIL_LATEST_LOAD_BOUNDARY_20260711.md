# Request Detail Latest Full-Load Boundary

Decision: `REQUEST_DETAIL_LATEST_LOAD_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating records.

## What Changed

Request Detail now gives every full workspace load its own browser `AbortController`. Starting a new load aborts the prior one, so the latest full load wins after staff actions or route changes.

The cancellation signal reaches detail access, workflow support, communications, notes, Catholic request-type support, and activity history. Active-parish request authorization remains first; the independent support reads still begin only after the access response succeeds.

Aborted support reads rethrow cancellation instead of clearing visible data through their ordinary partial-data fallback. An obsolete load cannot clear the newer controller, settle the newer loading state, write a generic access error, or emit expected-cancellation diagnostics. Route cleanup also aborts outstanding full-load work.

Standalone activity-history refreshes remain valid because their signal is optional.

## Plain English

When two refreshes overlap, Vinea now stops listening to the older one. Staff see the freshest confirmed request workspace instead of an older response arriving late and making the screen appear to move backward.

Expected cancellation is quiet and does not display a false error. Genuine current-load failures retain the existing safe guidance and partial-data behavior.

## Preserved Boundaries

- Request Detail APIs, response shapes, authentication, active-parish membership, and request ownership are unchanged.
- No mutation or staff workflow behavior changed.
- No production access, shared-QA access, record write, migration, operational RLS change, communication send, provider call, AI call, export, storage access, signed URL, certificate generation, sensitive flag change, or public trust claim occurred.
- Browser cancellation does not claim server-side cancellation, transactional behavior, or durable idempotency.

## Rollback

Remove the controller/ref and signal propagation while retaining the existing authorization-first parallel read wave. No data rollback or migration is required.

## Verification

- Focused Request Detail freshness, authorization-order, DTO, browser-boundary, and safe-message regression passed with 6 files and 27 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed; existing line-ending notices are informational only.
