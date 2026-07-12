# Daily Work Hub Typed Response DTO Boundary - 2026-07-10

Decision: `DAILY_WORK_HUB_TYPED_RESPONSE_DTO_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented in repository code and verified without production access or data mutation.

## Scope

The Daily Work Hub server read model previously exposed `requests: unknown[]`, while `DashboardPageCore` cast the network response to `any[]`. The server and browser now share `DashboardWorkHubRequest` and its nested parishioner, Funeral, Wedding, and OCIA DTOs from `lib/dashboardWorkHubDtos.ts`.

Both the server loader and browser response boundary use `parseDashboardWorkHubRequests(...)`. The parser:

- requires every request to have a stable string id;
- normalizes the request discriminator;
- allowlists the current operational request, parishioner, checklist, and type-detail fields;
- converts missing optional values to stable null/default forms;
- drops unexpected future fields rather than forwarding them; and
- fails the complete Work Hub request response closed when any row lacks a stable id.

## Preserved Behavior

- The authenticated exact-membership Work Hub route remains unchanged.
- Request ordering, filters, Daily Work Hub cards, follow-up queue, batch actions, AI draft review, email review, Parish Health, Operational Intelligence, reminders, and handoff views retain their current inputs.
- Existing partial-data warnings and client-safe error guidance remain intact.
- No field was added to the server projection or browser response.

## Verification Boundary

Focused DTO tests prove allowlisted normalization, unexpected-field exclusion, malformed-row denial, shared server/client typing, and removal of the `unknown[]`/`any[]` boundary. Existing loader and route tests prove selected-parish behavior and read-model composition remain intact.

This DTO does not replace staff authentication, active-parish membership checks, operational RLS, source projection review, or server response authorization.

## Verification

- Focused DTO, loader, route, source-boundary, and release-evidence suite: 8 files / 26 tests passed.
- Full Vitest regression suite: 700 files / 2,783 tests passed.
- Standard and all-file TypeScript checks passed.
- Lint passed with zero errors and 27 remaining warnings, down from 48 before this slice.
- Next.js 16.2.10 production build passed with 56 static pages generated.
- Release handoff reconciled 103 artifacts with zero findings; all 15 production-sensitive gates remain locked.

## Preserved Gates

- No production access.
- No database mutation, migration, or operational RLS change.
- No email, AI, Calendar, export, storage, signed URL, certificate, or external provider operation.
- No production-sensitive flag or public trust claim.
- All production-sensitive gates remain locked.
