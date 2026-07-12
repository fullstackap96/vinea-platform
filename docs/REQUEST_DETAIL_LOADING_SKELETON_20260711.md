# Request Detail Loading Skeleton

Decision: `REQUEST_DETAIL_LOADING_SKELETON_IMPLEMENTED_20260711`

Status: Implemented locally as presentation-only staff UX polish.

## What Changed

Request Detail now presents a stable workspace-shaped skeleton while its authorized data loads. The placeholder mirrors the eventual request header, status chips, tabs, primary workflow area, and supporting sidebar instead of centering one indefinite spinner on an otherwise blank screen.

The skeleton preserves `aria-busy`, polite live-region semantics, and a screen-reader loading announcement. Its visual placeholders are hidden from assistive technology and contain no links, buttons, forms, or other controls.

## Why This Matters

The request workspace is where parish staff spend a large portion of their day. A stable loading frame reduces layout surprise and makes the faster parallelized data load feel intentional, calm, and polished.

## Safety Boundary

This is a read-only presentation change. It does not fetch data, change authorization, cache responses, mutate records, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, call Google Calendar, or enable production-sensitive features.

No production access, migration, operational RLS change, provider call, external integration access, or public trust claim occurred.

## Verification

`lib/server/requestDetailLoadingSkeleton.test.ts` verifies workspace-shaped layout, accessible loading semantics, absence of interactive controls, and this documented boundary.

- Focused loading, performance, DTO, browser-boundary, and dashboard-loading suite: 5 test files and 18 tests passed.
- The immediately preceding full repository regression passed 781 test files and 3,304 tests; the new skeleton then passed its focused suite and production build.
- ESLint passed.
- Full TypeScript checking passed.
- Production-sensitive gate validation passed with all 15 artifacts linked and still locked.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
