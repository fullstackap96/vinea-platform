# Request Document Client Recovery Boundary - 2026-07-12

Completion marker: `REQUEST_DOCUMENT_CLIENT_RECOVERY_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally. Live protected-preview document timing remains rollout-unverified until the exact-head Preview environment is healthy.

## What Changed

- Request-document list reads are now latest-request-wins and abort the superseded browser request.
- A response can render only documents whose stored `request_id` matches the request currently open in the staff workspace.
- The document section remounts when the Request Detail route id changes, so old request state cannot carry into the next request.
- List and signed-download preparation stop after 15 seconds, review and portal-link creation after 20 seconds, and a staff document upload after 60 seconds.
- Upload, review, and portal-link timeouts use staff-safe confirm before retrying guidance because the server may have completed after the browser lost confirmation.
- A successful upload or review remains visible while the confirmed scoped list refreshes.

## Safety Boundary

- Existing staff authentication, active-parish membership, same-parish request ownership, document ownership, private storage, signed URL, portal-token hashing, audit, and cleanup behavior are unchanged.
- The browser still receives no storage path, token hash, raw database error, provider error, or private technical detail.
- Cancellation is a browser recovery boundary, not durable server idempotency and not proof that an already-dispatched server operation was rolled back.
- No new retry loop was added. Staff are told to refresh or inspect the Audit Log before repeating an operation whose completion is uncertain.

## Verification Boundary

- Focused message and source coverage passed `5` files / `15` tests.
- The complete Request Document and family-portal regression passed `28` files / `139` tests.
- Both TypeScript scopes and lint passed before the complete release run.
- Focused coverage verifies stale-list exclusion, request-id agreement, deadlines, uncertain-write guidance, route-key remounting, and preserved success feedback.
- The first complete release attempt failed closed at dependency auditing because the sandbox denied npm advisory/cache access. The first network-enabled attempt then failed closed because eight inherited non-production AI-summary QA flag names were present in user scope.
- No saved environment value was changed. The final run removed those eight names only from its child process and restarted from check 1.
- The complete 15-check local release gate passed in `275.3` seconds: zero secret findings across `2,131` scanned files, zero dependency vulnerabilities, both TypeScript scopes, lint, `827` test files / `3,520` tests, and the credential-free Next.js 16.2.10 build with `56` generated pages.
- No production access, deployment, migration, operational RLS change, storage operation, signed URL creation, portal-token creation, record mutation, provider call, export, AI call, communication, certificate generation, or public claim occurred during implementation.

## Rollback

Rollback is the scoped code revert. There is no schema, data, storage, token, or RLS rollback for this client-only boundary.
