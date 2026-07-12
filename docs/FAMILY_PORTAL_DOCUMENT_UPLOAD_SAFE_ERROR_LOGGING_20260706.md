# Family Portal Document Upload Safe Error Logging - 2026-07-06

Status: Implemented for the public family portal document upload route.

## Scope

- Updated `app/api/family/request-portal/[token]/documents/route.ts`.
- Replaced raw storage, insert, and unexpected upload failure responses with generic family-facing text.
- Added `logServerError` calls with redacted operational context.
- Added request-document storage setup guidance for missing `request_documents` storage/table configuration.

## Preserved Behavior

- Preserved invalid or expired upload-link behavior.
- Preserved family-visible validation messages for missing workflow step, missing file, and oversized file.
- Preserved request-document storage setup guidance through `REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE`.
- Preserved portal token lookup, family step selection, safe filename normalization, storage upload behavior, insert cleanup behavior, and audit event writes.

## Safety Boundary

The safe log context records only route shape plus boolean and file-size metadata needed for troubleshooting. It does not log raw portal tokens, token hashes, storage paths, original filenames, or document contents.

Family-facing unexpected failures remain generic:

- `Could not upload document.`

## Production Notes

- This slice does not access production.
- This slice does not apply migrations or change operational RLS.
- This slice does not change portal-token validation, upload validation, storage access, document insert semantics, cleanup behavior, or audit event behavior.
- This slice does not enable exports, AI, automation, public intake routing, certificate generation, Google Calendar behavior, or public trust claims.

## Verification

- Focused family portal document upload safe logging tests passed: `npm.cmd test -- lib\server\familyPortalDocumentUploadSafeErrors.test.ts lib\server\safeErrorLogging.test.ts` with 2 files and 5 tests.
- Quiet lint passed: `npm.cmd run lint -- --quiet`.
- Production build and TypeScript passed: `npm.cmd run build`.
- Full-suite verification passed: `npm.cmd test -- --reporter=dot` with 419 test files and 1,797 tests.
