# Family Portal Document Upload Client Recovery - 2026-07-12

Completion marker: `FAMILY_PORTAL_DOCUMENT_UPLOAD_CLIENT_RECOVERY_IMPLEMENTED_20260712`

Status: Implemented and verified locally. Live protected-preview timing remains rollout-unverified until the exact-head Preview environment is healthy.

## What Changed

- The family upload form acquires a synchronous single-flight lock before React state changes, closing the rapid double-submit window.
- The selected requested-document step, file input, and submit button remain disabled while the reviewed upload is active.
- Files larger than the existing 10 MB contract are rejected in the browser before multipart data is constructed or sent; the server limit remains authoritative.
- The browser upload stops waiting after 60 seconds instead of showing an indefinite busy state.
- If confirmation is lost, the family sees: `We could not confirm whether your document finished uploading. Please contact the parish office before trying again so the same document is not uploaded twice.`

## Safety Boundary

- Existing same-origin enforcement, durable per-IP rate limiting, active token verification, required family-step ownership, server file-size validation, private storage, metadata confirmation, cleanup, and audit ordering are unchanged.
- No automatic retry was added.
- Browser timeout guidance is not durable server idempotency and does not claim the already-dispatched upload was cancelled or rolled back.
- The family-facing message contains no token, storage path, filename, request id, provider detail, database detail, or raw exception.

## Verification

- Focused helper/source coverage passed `6` files / `14` tests.
- The broader family-portal, portal-token, and upload-cleanup regression passed `9` files / `32` tests.
- Both TypeScript scopes and lint passed before the complete release run.
- Focused coverage verifies the synchronous lock, lock-before-fetch order, deadline, pre-send size check, frozen inputs, safe timeout guidance, and existing safe-message allowlist.
- The complete 15-check release gate passed in `276.8` seconds with zero secret findings across `2,133` files, zero dependency vulnerabilities, both TypeScript scopes, lint, `828` test files / `3,525` tests, and the credential-free `56`-page Next.js build.
- Release-source aggregate `D65A37DF88E420CF5516CD3C3F62585EC96739CF1B987FF529F97CAE1BDD3B18` binds `1,464` files to immutable implementation commit `a4f66fbf64328113a43586a662169970569f38f6`.
- No production access, upload, storage operation, token lookup, signed URL, record mutation, migration, operational RLS change, provider call, export, AI call, communication, certificate generation, or public claim occurred during implementation.

## Rollback

Rollback is the scoped client/helper revert. No database, storage, token, migration, or RLS rollback is required.
