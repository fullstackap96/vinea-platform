# Record Prefill Supporting-Data Safety - 2026-07-07

Status: Implemented as a scoped Catholic-records production-readiness hardening slice.

## What Changed

- Added `lib/recordPrefillClientMessages.ts`.
- Updated `app/dashboard/records/actions.ts`.
- Updated `app/dashboard/records/new/NewSacramentalRecordPage.tsx`.
- The New Sacramental Record page now fails closed when request prefill cannot verify:
  - the source request
  - funeral, wedding, or OCIA detail rows used for prefill
  - linked parishioner display data
  - whether a sacramental record already exists for the request
- Request prefill now runs through a server action that authenticates staff, reads the selected active parish cookie, verifies same-parish request access through `loadStaffScopedRequestDetailAccess`, and only then loads prefill source data.
- The browser page no longer reads `requests`, request detail tables, `parishioners`, or duplicate `sacramental_records` checks directly for prefill.
- Staff see stable, plain-English messages instead of raw database/provider details.

## Staff-Facing Messages

- `Could not load the request for prefill.`
- `Could not safely prepare this request for record prefill. Please open the request and try again.`
- `Could not verify whether a record already exists for this request. Please refresh before saving.`

## Why This Matters

Request-to-record continuity is one of Vinea's Catholic-specific trust surfaces. This request-to-record continuity boundary means that if the app cannot verify same-parish access and all prefill inputs, it should not offer staff a draft record that might be incomplete, misleading, cross-parish, or duplicate an existing record.

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
- make canonical or sacramental eligibility decisions
- make public trust claims

Messages are intentionally generic and do not expose database URLs, provider payloads, JWTs, token material, raw IDs, storage paths, file names, or secret-looking values.

## Verification

- `lib/recordPrefillClientMessages.test.ts`
- `lib/server/recordPrefillSafeSource.test.ts`
- `lib/server/sacramentalRecordRequestPrefillAction.test.ts`
- `lib/server/recordPrefillSafeSupportingDataDoc.test.ts`
