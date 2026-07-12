# Request Detail Parallel Scoped Read Wave

Decision: `REQUEST_DETAIL_PARALLEL_SCOPED_READ_WAVE_IMPLEMENTED_20260711`

Status: Implemented locally as a staff-facing performance and recovery improvement.

## What Changed

Request Detail still verifies the authenticated staff member's selected-parish request access first. Only after that authorization succeeds, the page now loads workflow support, communication history, internal notes, Catholic request-type support, and request activity in one parallel wave instead of five serial waits.

Each endpoint remains independently authenticated and active-parish scoped. Existing allowlisted response parsers, safe logging, empty partial-data fallbacks, linked-record continuity handling, and staff guidance remain unchanged.

The outer load boundary now also catches an unexpected initial access or composition failure and always settles the loading state. Staff receive the existing generic request-not-found guidance rather than an indefinite loading screen or a raw exception.

## Why This Matters

The request workspace is one of Vinea's highest-frequency staff screens. Removing four avoidable network waterfalls makes it feel faster without broadening any data response or weakening tenant checks. The fail-safe loading boundary also prevents a temporary network failure from trapping staff on a spinner.

## Safety Boundary

This does not cache request data, merge authorization boundaries, bypass per-route membership checks, mutate records, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, call Google Calendar, or enable production-sensitive features.

No production access, migration, operational RLS change, provider call, external integration access, or public trust claim occurred.

## Verification

`lib/server/requestDetailParallelReadWave.test.ts` proves authorization first, the complete parallel read set, parser/fallback preservation, loading settlement, and this documentation boundary. Existing Request Detail response DTO, browser mutation, active-parish read-route, and safe-message suites remain authoritative.

- Focused Request Detail boundary suite: 9 test files and 39 tests passed.
- Full repository regression: 781 test files and 3,304 tests passed.
- ESLint passed.
- Full TypeScript checking passed.
- Dependency audit passed with zero vulnerabilities.
- Repository secret scan passed across 2,076 files with no findings.
- Production-sensitive gate validation passed with all 15 artifacts linked and still locked.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
