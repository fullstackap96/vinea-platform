# Dashboard Detail Partial-Data Warnings - 2026-07-07

Status: Implemented as a scoped production-readiness and daily staff UX hardening slice.

## What Changed

- Added `lib/dashboardDetailClientMessages.ts`.
- Added staff-safe partial-data warnings to:
  - `app/dashboard/people/[id]/PersonDetailPage.tsx`
  - `app/dashboard/households/[id]/HouseholdDetailPage.tsx`
  - `app/dashboard/records/[id]/RecordDetailPage.tsx`
- Person and Household detail pages now keep the main profile visible when linked household, record, request, or communication data fails, but show a calm warning that linked details may be missing.
- Sacramental Record detail now shows the same kind of warning when linked person or recent activity metadata fails.
- The certificate suggestion on Sacramental Record detail is hidden unless certificate-event metadata actually loaded, so staff are not nudged from incomplete event history.

## Staff-Facing Messages

- `Some linked person details may be missing. Please refresh if this profile looks incomplete.`
- `Some linked household details may be missing. Please refresh if this household looks incomplete.`
- `Some linked record details may be missing. Please refresh if this record looks incomplete.`

## Safety Boundary

This slice does not:

- mutate records
- apply migrations
- change operational RLS
- access production
- send communications
- call AI
- run exports
- access storage
- create signed URLs
- generate certificates
- make public trust claims

Warnings are intentionally generic and do not expose database URLs, provider payloads, JWTs, token material, raw IDs, storage paths, or secret-looking values.

## Verification

- `lib/dashboardDetailClientMessages.test.ts`
- `lib/server/dashboardDetailPartialDataSource.test.ts`
- `lib/server/dashboardDetailPartialDataWarningsDoc.test.ts`
