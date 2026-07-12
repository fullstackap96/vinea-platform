# Daily Work Hub Active-Parish Request Mutation Reverification

Decision: `DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_REVERIFIED_20260711`

Status: Existing server-owned implementation reverified and caller integrity strengthened locally.

## Verified Boundary

The approved persistence boundary was already present and remains authoritative:

- Daily Work Hub mark-as-contacted calls `POST /api/requests/[id]/mark-contacted`.
- Funeral care touchpoints call `POST /api/requests/[id]/care-touchpoint`.
- The browser contains no corresponding Supabase insert or update for `request_communications`, `requests`, or `funeral_request_details`.

Both authenticated request APIs require same-origin browser mutation metadata, authenticated staff, the selected active parish, exact parish membership, and same-parish request ownership before writes. The care-touchpoint route additionally requires an owned funeral request. Forged, stale, wrong-type, and cross-parish targets retain generic no-op denial behavior.

Staff-reviewed methods, note text, follow-up choices, care-cycle completion, bounded validation, safe note-free audit metadata, ordered writes, and structured partial-success guidance remain unchanged.

## Caller Integrity Added

Individual and batch mark-as-contacted now share one synchronous browser lock before the request API. Care-touchpoint persistence has its own synchronous browser lock. These close the rapid-click window before React renders disabled state and make an immediate competing call a no-op.

The batch mark action releases its lock and visible busy state through `finally`, including when a post-write refresh throws. The care editor freezes its staff-reviewed method, notes, date, and completion snapshot while saving, and all care-plan mutation controls remain disabled until the result settles.

This is same-screen exclusion, not durable server idempotency or a database transaction. Existing sequential-write partial-success guidance remains the recovery boundary.

## Safety Boundary

No production or shared-QA access, communication send, provider call, Google Calendar call, record mutation, migration, operational RLS change, AI call, export, storage access, signed URL, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/dailyWorkHubRequestMutationSingleFlightBoundary.test.ts` verifies lock ordering, individual/batch mutual exclusion, `finally` release, frozen care controls, API-only callers, and absence of direct browser table writes. Existing route suites continue to verify authentication, cookie-first active-parish selection, membership, same-parish request ownership, generic denials, bounded validation, audit redaction, write ordering, zero-row races, partial success, and same-origin enforcement.

- Dedicated route, same-origin, persistence-order, and caller-integrity regression: 5 test files and 61 tests passed.
- ESLint passed.
- Full TypeScript checking passed.
- Production-sensitive gate validation passed with all 15 artifacts linked and production-sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed.
- The latest full repository regression baseline remains 775 test files and 3,276 tests passed.
