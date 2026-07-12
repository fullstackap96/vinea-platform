# Request Portal Token Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice. `app/api/requests/[id]/portal-token/route.ts` now uses `logServerError` for unexpected family portal token creation failures and returns generic staff-facing failure text for those failures.

## What Changed

- Updated the portal-token route catch block so unexpected token creation failures log through the shared redacted server error helper.
- Preserved the existing `REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE` response for missing migration/table setup.
- Kept the safe log context small: route label, whether a request id was present, and whether an active parish cookie was present.
- Token creation now requires a non-empty returned token-row id and a persisted expiry representing the exact requested instant before the one-time raw link is returned.
- Zero-row, malformed-id, malformed-expiry, and changed-expiry results fail through the existing generic route boundary without exposing the raw token.
- Family portal loads now update `last_used_at` through a checked best-effort helper that requires a returned token-row id.
- Returned errors, zero-row updates, and thrown telemetry failures emit only a privacy-safe failure kind and do not block family access.
- Expanded `lib/server/requestDocumentRouteAuthorization.test.ts` with source-level checks and this documentation boundary.

## What Changed Plain English

If Vinea has an unexpected problem creating a family upload link, staff now see a simple failure message instead of raw database or internal error text. Vinea also proves the stored link row and expiry are correct before revealing the one-time link. When a family later uses the link, Vinea checks whether the usage timestamp was recorded; a telemetry-only failure is safely logged without blocking the family. The route still gives the useful setup message if the family portal token table is not configured.

## Safety Boundary

- Preserved active-parish-aware request document authorization.
- Preserved the existing `Request not found.` response for denied or missing request access.
- Preserved missing-migration guidance for unconfigured family portal token storage.
- Preserved portal-token creation behavior, one-time raw token return behavior after persistence confirmation, audit write behavior, and generated family portal URL shape.
- This does not expose raw portal tokens in logs, token hashes, service-role details, database URLs, selected parish cookies, storage paths, signed URLs, private documents, or provider payloads.
- Usage-state warnings exclude token ids, request ids, parish ids, hashes, and family identity fields.
- This does not change request document authorization, selected parish behavior, request ownership checks, production flags, production access, migrations, operational RLS, records, public intake, AI, exports, storage, signed URLs, certificate generation, automation, Google Calendar behavior, or public trust claims.

## Verification

- Focused request document route authorization, portal-token safe logging, shared redaction, and docs validation tests passed: `npm.cmd test -- lib\server\requestDocumentRouteAuthorization.test.ts lib\server\safeErrorLogging.test.ts` with 2 files and 8 tests.
- Current focused runtime coverage proves confirmed creation plus zero-row, missing-id, and mismatched-expiry denial without recording raw token material.
- Focused runtime coverage also proves matched usage-state persistence and privacy-safe best-effort behavior for returned, zero-row, and thrown telemetry failures.
- Quiet lint passed: `npm.cmd run lint -- --quiet`.
- Production build and TypeScript passed: `npm.cmd run build`.
- Full-suite verification passed: `npm.cmd test -- --reporter=dot` with 418 test files and 1,792 tests.
