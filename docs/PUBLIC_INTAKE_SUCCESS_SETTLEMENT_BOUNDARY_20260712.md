# Public Intake Success Settlement Boundary - 2026-07-12

Status: `Implemented and verified` for local source, behavior, type, and release-gate checks. Live non-production browser timing remains `Implemented but not rollout-verified` because the exact-head protected preview is not deployable yet.

## Acceptance Criteria

- A family sees success as soon as `/api/intake` confirms the stored request id.
- The secondary `/api/request-notifications` call is not awaited by Baptism, Funeral, Wedding, OCIA, or Join Parish forms.
- Every existing notification payload field and server provider behavior remains unchanged.
- The shared client helper contains synchronous and asynchronous notification failures.
- A stalled client notification request is aborted after 15 seconds.
- Notification logging remains label-only, disabled in production, and excludes response bodies, contact details, request data, provider data, and raw errors.
- Existing form validation, same-page submission locks, retry identity, durable server rate limiting, completion-audit recovery, and safe success/error messages remain intact.

## Implementation

- `lib/publicIntakeNotificationClient.ts` owns one deferred, bounded, best-effort notification helper.
- The helper returns before invoking `fetch`, catches synchronous and asynchronous failure, sends the unchanged reviewed payload, and always clears its timer.
- All five public intake forms queue the helper after confirmed request creation and immediately settle success, clear the reviewed fields, and release their same-page lock.
- The server notification route still verifies the stored request, parish, and contact before its bounded provider call. No recipient, template, provider, audit, routing, or delivery semantics changed.

## Failure And Privacy Boundaries

- Notification failure never changes an already confirmed intake into a family-facing failure.
- The helper owns no retry loop and cannot duplicate provider delivery on its own.
- Browser shutdown or navigation may cancel a best-effort notification; the stored request remains authoritative and visible to staff.
- No notification response body or exception detail is read, rendered, persisted, or logged.
- This does not claim durable notification-job delivery, cross-tab request idempotency, or transactional intake-plus-email behavior.

## Verification

- Focused helper/form/provider coverage: `5` files / `26` tests passed.
- Complete public-intake and request-notification regression: `50` files / `251` tests passed.
- Production/source TypeScript check passed.
- Complete 15-check local release gate passed in `319.8` seconds: zero secret findings across `2,129` scanned files, zero dependency vulnerabilities, both TypeScript scopes, lint, `826` test files / `3,515` tests, and the credential-free Next.js 16.2.10 production build with `56` generated pages.
- No public submission, email, provider call, production access, environment mutation, migration, operational RLS change, runtime-routing flag change, storage action, signed URL, export, AI call, certificate generation, or public claim occurred.

## Technical Approval Record

**Capability:** Family-facing public intake success settlement independent from secondary staff notification delivery.

**Environment tested:** Local credential-free automated verification.

**Repository state/commit:** Immutable implementation commit `b3a20a892e3abd88e36b5ba989f339acb1ece35b`; source aggregate `A5402654EC53812A0737A940514BD9A287D7F510819852CA7854984C9311E1D7` across `1,462` release-source files.

**Date:** 2026-07-12.

**Acceptance criteria:** The criteria in this document.

**Evidence collected:** Focused behavior/source tests, complete public-intake/notification regression, typecheck, and the complete 15-check release gate with zero findings or failures.

**Security and tenancy result:** Server request/parish verification remains authoritative; the browser helper receives no new authority and logs no private payload material.

**Failure and rollback result:** Secondary failure and timeout are contained after stored success. Rollback is the scoped implementation revert; no schema or data rollback is needed.

**Known limitations:** Best-effort browser delivery can be lost on immediate page termination; there is no durable background notification queue; live protected-preview browser timing is unverified.

**Approval decision:** Approved with constraints for release-candidate implementation.

**Approved scope:** Immediate family-facing success after confirmed request creation, with unchanged best-effort staff notification queued in the current page.

**Reasoning:** A non-authoritative notification must not make a completed pastoral request look unfinished or encourage duplicate submission.

**Next required action:** Run an exact-head non-production browser smoke that delays or fails `/api/request-notifications` and confirms each form settles stored success immediately once the protected preview is healthy.
