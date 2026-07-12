# Request Document Upload Compensation Boundary - 2026-07-11

Status: Implemented and locally verified without production or storage access.

## Purpose

A staff or family document upload writes a private storage object before creating its `request_documents` row. If row creation fails, Vinea must not silently assume the private object was removed.

## Runtime Boundary

- Each staff upload and family portal upload positively confirms the uploaded object path before creating document metadata.
- Each `request_documents` insert must return a minimal persisted id before audit history or success.
- A failed or zero-row metadata insert calls one shared server-only cleanup helper.
- Cleanup succeeds only when storage returns no error and exactly one removed object.
- Returned errors, thrown failures, zero-object results, and unexpected multi-object results are treated as unconfirmed cleanup.
- Staff receive explicit administrator-review guidance when cleanup cannot be confirmed.
- Families receive pastoral, generic contact-the-parish guidance without internal storage details.
- Cleanup logs include only source and safe object counts. They exclude storage paths, bucket names, original filenames, document contents, portal tokens, token hashes, signed URLs, and staff/parishioner identifiers.

## Residual Risk

This is checked compensating cleanup, not a storage/database transaction. A confirmed metadata insert followed by an audit failure retains the existing best-effort audit boundary. Atomic object/row creation would require a separately reviewed architecture and provider capability.

## Verification

- Focused helper tests cover confirmed removal, returned errors, thrown failures, zero-object results, and unexpected multi-object results.
- Source guards require upload-path confirmation, document-row id confirmation, checked cleanup, safe cleanup outcome metadata, and audit/success ordering in both routes.
- No production or shared-QA access occurred.
- No real storage object, document row, signed URL, portal token, communication, AI call, export, Calendar event, certificate, migration, RLS change, production flag, or public trust claim occurred.

## Rollback

Rollback is code-only: restore each route's prior local removal call and remove the shared helper. No schema or data rollback is involved.
