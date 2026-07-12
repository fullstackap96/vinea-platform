# Daily Work Hub Single-Response Composition

Date: 2026-07-10

Status: Implemented and fully verified locally. Safe non-production browser QA remains recommended.

## Purpose

Make Vinea's first staff screen feel faster without weakening its selected-parish or membership boundaries. The browser now receives the Daily Work Hub queue, suggested actions, and supporting operating signals from one authenticated response.

## Implementation

- `GET /api/dashboard/work-hub` remains the only browser request used to load the main Daily Work Hub data.
- `lib/server/loadDashboardWorkHub.ts` starts request-queue and daily-operating-signal reads together with `Promise.all(...)` after the route has authenticated staff and validated the selected parish.
- Relationship suggestions remain dependent on the validated queue because they require its request scope.
- The response contains only the existing queue, suggested-action, aggregate-signal, and safe-warning DTOs.
- `app/dashboard/DashboardPageCore.tsx` rejects missing, non-object, or array-shaped signal payloads and falls back to the existing safe unavailable state.
- The dedicated `GET /api/dashboard/daily-operating-signals` endpoint remains implemented and independently tested, but the main dashboard no longer pays a second browser round trip for it.

## Preserved Boundaries

- Staff authentication and exact selected-parish membership still happen before the Work Hub loader runs.
- Forged and cross-parish selections still fail generically.
- The authenticated staff read client remains in use; no service-role path was added.
- No record mutation, communication send, Google Calendar call, storage access, export, AI provider call, migration, operational RLS change, or production-sensitive flag was added.
- Production-sensitive features and public trust claims remain unapproved.

## Verification

- Composition-focused suite: 7 files / 26 tests passed.
- Final focused Work Hub suite after payload-shape hardening: 7 files / 23 tests passed.
- Full Vitest regression suite: 683 files / 2,694 tests passed.
- All-file TypeScript: passed.
- Quiet lint: passed.
- Next.js 16.2.10 production build: passed with 56 static pages generated.
- Repository secret scan after documentation: 1,865 text files scanned, 26 binaries skipped, 0 findings, and no secret values printed.
- Release handoff: 81 artifacts, 16 CI commands, 15 locked gates, and 0 findings.
- Completed local evidence: 510 required phrases and 0 findings.
- `git diff --check`: passed; existing line-ending warnings only.

## Safe Browser QA

Use an explicitly approved non-production staff session and two authorized parish fixtures:

1. Confirm `/api/health` returns `checks.schema: true`.
2. Open the Daily Work Hub with Parish A selected and record label-only queue, suggested-action, and operating-signal outcomes.
3. Switch to Parish B and confirm all three groups update to Parish B without stale Parish A content.
4. Confirm a forged active-parish hint is denied generically.
5. Confirm partial-data fixtures show safe warnings without technical details.
6. Confirm the browser makes one request to `/api/dashboard/work-hub` and no request to `/api/dashboard/daily-operating-signals` during the main load.
7. Confirm no mutation, send, provider, storage, export, or certificate-generation control was introduced by this change.

## Approval Boundary

This evidence does not approve production RLS, production monitoring, production exports, public intake production routing, production AI, runtime reminders, certificate issuance, public backup/restore claims, or public trust-center claims.
