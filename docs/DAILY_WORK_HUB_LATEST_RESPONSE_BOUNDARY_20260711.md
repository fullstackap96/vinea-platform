# Daily Work Hub Latest-Response Boundary

Decision: `DAILY_WORK_HUB_LATEST_RESPONSE_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented locally as a staff-facing data freshness and recovery boundary.

## What Changed

Every Daily Work Hub aggregate refresh now receives a monotonically increasing browser sequence. Only the newest in-flight refresh may apply returned requests, suggested actions, operating signals, warnings, errors, or loading-state completion.

If an older same-parish refresh resolves after a newer one, the stale response is ignored. An older network failure likewise cannot replace current data with an error or clear the loading indicator owned by the newer refresh. The newest response always settles visible loading, including the defensive edge case where a silent refresh supersedes an initial visible load.

The existing single `/api/dashboard/work-hub` aggregate endpoint, no-store request behavior, selected active-parish hint, server-owned membership validation, response parser, partial warning behavior, and mutation-triggered refresh calls remain unchanged.

The aggregate browser request now also has a 15-second deadline. A current initial load that stalls settles into plain-English recovery guidance instead of leaving the morning workspace busy indefinitely. If a silent post-action refresh stalls, Vinea keeps the last confirmed requests and operating signals visible, shows the warning, and lets staff retry without losing their working context.

## Why This Matters

Parish staff can complete different follow-up actions close together. Network timing should never let an older dashboard snapshot appear after newer work has already been saved. The last-request-wins boundary keeps the Daily Work Hub feeling immediate while showing the freshest confirmed response.

## Safety Boundary

This is a browser response-coordination and bounded-recovery change only. Browser timeout cancellation does not claim server-side rollback or transactional cancellation. It does not mutate records, change API authorization, cache dashboard data, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, call Google Calendar, or enable production-sensitive features.

No production access, migration, operational RLS change, provider call, external integration access, or public trust claim occurred.

## Verification

`lib/server/dailyWorkHubLatestResponseBoundary.test.ts` verifies sequence assignment, stale-success and stale-failure no-op behavior, loading-state ownership, the bounded deadline, silent-refresh data preservation, aggregate endpoint preservation, and this documented boundary.

- Focused Work Hub aggregate, route, active-parish, signals, and selected-parish suite: 7 test files and 25 tests passed.
- The current full repository regression baseline remains 781 test files and 3,304 tests passed; subsequent focused suites for the new loading and freshness boundaries also passed.
- ESLint passed.
- Full TypeScript checking passed.
- Production-sensitive gate validation passed with all 15 artifacts linked and still locked.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
