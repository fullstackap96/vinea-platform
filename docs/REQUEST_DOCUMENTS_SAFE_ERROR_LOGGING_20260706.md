# Request Documents Safe Error Logging - 2026-07-06

Status: Implemented for the authenticated staff request-document list, upload, download, and review routes.

## Scope

- Updated `app/api/requests/[id]/documents/route.ts`.
- Updated `app/api/requests/[id]/documents/[documentId]/route.ts`.
- Replaced raw backend error responses for unexpected list, upload, signed URL, download, and review failures with generic staff-facing messages.
- Added `logServerError` calls with redacted operational context.

## Preserved Behavior

- Preserved active-parish-aware request document authorization.
- Preserved explicit primary parish fallback only when no active parish cookie exists.
- Preserved missing request-document storage migration guidance through `REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE`.
- Preserved upload file-size validation, workflow-step ownership checks, storage upload behavior, insert cleanup behavior, signed URL creation behavior, document review updates, and audit event writes.
- Preserved signed URL creation behavior while keeping storage paths and signed URL values out of safe log metadata.

## Safety Boundary

The safe log context records only route shape and boolean/size metadata needed for troubleshooting. It does not log storage paths, signed URL values, original filenames, or document contents.

Staff-facing unexpected failures remain generic:

- `Could not load documents.`
- `Could not upload document.`
- `Could not prepare document download.`
- `Could not review document.`

## Production Notes

- This slice does not access production.
- This slice does not apply migrations or change operational RLS.
- This slice does not change storage access, signed URL duration, document authorization, document review semantics, or audit event behavior.
- This slice does not enable exports, AI, automation, public intake routing, certificate generation, Google Calendar behavior, or public trust claims.

## Verification

- Focused request document authorization and safe logging tests passed: `npm.cmd test -- lib\server\requestDocumentRouteAuthorization.test.ts lib\server\safeErrorLogging.test.ts` with 2 files and 11 tests.
- Quiet lint passed: `npm.cmd run lint -- --quiet`.
- Production build and TypeScript passed: `npm.cmd run build`.
- Full-suite verification passed: `npm.cmd test -- --reporter=dot` with 418 test files and 1,795 tests.
