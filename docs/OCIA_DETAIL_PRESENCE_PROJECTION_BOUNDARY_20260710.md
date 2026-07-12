# OCIA Detail Presence Projection Boundary - 2026-07-10

Decision: `OCIA_DETAIL_PRESENCE_PROJECTION_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented in repository code and verified without production access or database mutation.

## Scope

`lib/ensureOciaRequestDetails.ts` ensures an OCIA detail row exists before the authenticated confirmed-session route updates its schedule. The helper previously used `select('*')` for the initial existence check, insert result, and unique-conflict retry.

All three reads now use the explicit `OCIA_DETAILS_PRESENCE_SELECT` contract containing only `request_id`. The helper returns a narrow `OciaRequestDetailPresence` DTO rather than carrying the entire OCIA intake row through a path that needs only existence confirmation.

## Preserved Behavior

- Existing OCIA detail rows still return immediately.
- Missing rows still receive the same server-owned placeholder values.
- Concurrent insert or unique-conflict races still retry the existence lookup.
- Safe access and create messages remain unchanged.
- The confirmed-session route still authenticates staff, validates selected-parish request ownership, verifies the OCIA request type, and performs the schedule update after presence is confirmed.

## Privacy Boundary

The presence helper no longer reads sacramental background, seeking status, parishioner status, preferred contact method, availability, birth information, staff notes, or future OCIA columns. Those fields remain available only through the dedicated staff-reviewed intake/detail contracts that explicitly request them.

Focused tests prove the existing-row, insert, race-recovery, safe-error, and missing-id behavior and source-guard all three reads against wildcard selection.

## Verification

- Focused OCIA helper, active-parish route, and release-evidence suite: 5 files / 19 tests passed.
- Full Vitest regression suite: 698 files / 2,777 tests passed.
- Standard and all-file TypeScript checks passed.
- Lint passed with zero errors; 56 pre-existing warnings remain outside this slice.
- Next.js 16.2.10 production build passed with 56 static pages generated.
- Repository secret scan passed across 1,906 files with zero findings.
- Release handoff reconciled 101 artifacts with zero findings; all 15 production-sensitive gates remain locked.
- Completed local release evidence retained 510 required phrases with zero findings.

## Preserved Gates

- No production access.
- No database row was created or updated during verification.
- No migration or operational RLS change.
- No Google Calendar or other provider call.
- No communication, AI, export, storage, signed URL, certificate, or public trust claim.
- Existing production-sensitive approval gates remain locked.
