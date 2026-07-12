# Public Intake Retry Identity - 2026-07-12

Status: `Implemented and verified` for local source, unit, type, and release-gate behavior. Live non-production submission recovery remains `Implemented but not rollout-verified`.

## Acceptance Criteria

- Durable rate limiting remains before bounded body parsing.
- Parish routing scope is resolved before recovery reads or inserts.
- One browser submission attempt uses a random UUID v4 as the request identity.
- An unchanged reviewed payload reuses that attempt after an uncertain response; changed content receives a new attempt.
- Recovery requires the same request id, request type, resolved parish, contact name, email, and phone.
- Recovery also requires a durable `public_intake.created` completion audit marker.
- A new intake cannot report `201` success unless the completion audit write succeeds.
- A forged, cross-parish, incomplete, or mismatched attempt receives a generic denial and cannot mutate the existing request.
- Existing detail/checklist confirmation, workflow creation, audit metadata, compensating cleanup, safe errors, and runtime-routing gates remain intact.

## Implementation

- `lib/publicIntakeSubmissionClient.ts` keeps one pending attempt in page memory. It does not use local or session storage and sends no payload fingerprint.
- `lib/publicIntakeSubmissionAttempt.ts` validates attempt IDs and centralizes the exact recovery identity checks.
- `app/api/intake/route.ts` resolves parish scope before loading a possible existing attempt, requires a matching completion audit marker, and uses the validated attempt UUID for a newly inserted request.
- The client clears the attempt only after a confirmed success. A changed payload creates a new attempt.

## Failure And Privacy Boundaries

- A response lost after completed persistence can be retried without creating a second request in the same page flow.
- A leftover partial request without the completion audit marker is not represented as successful.
- Reused IDs with mismatched parish, request type, or contact identity fail generically with no existing data disclosure.
- The browser keeps the comparison fingerprint only in memory; the server receives the normal reviewed fields plus the opaque UUID.
- This is not claimed as cross-tab idempotency, simultaneous-request serialization, or a database transaction.
- The existing checked compensating cleanup remains the boundary for sequential insert failures.

## Verification

- Focused completion-boundary suite: `5` files / `28` tests passed.
- Complete public-intake regression suite after the completion-marker tightening: `47` files / `235` tests passed.
- `npm run typecheck` passed after the retry identity implementation.
- Complete release gate: all `15/15` checks passed in `298.9` seconds, including zero secret findings across `2,126` files, zero dependency vulnerabilities, every locked evidence check, both TypeScript scopes, lint, `824` test files / `3,511` tests, and the credential-free Next.js `16.2.10` build with `56` static pages.
- No public submission, email, provider call, production access, migration, operational RLS change, runtime-routing flag change, storage action, signed URL, export, AI call, record correction, or public claim occurred.

## Remote Verification

- GitHub Actions run `29197924589` passed `Test, lint, and build` for exact evidence head `1819e3eb8579a2029a936e1fe50724b4c840932b`.
- Matching non-production Vercel deployment `dpl_E3ZrW9mQH6UerBmm3jgCzSYYsW7d` failed closed before `READY` because Preview is missing the required environment variable name `SUPABASE_SERVICE_ROLE_KEY`; no value was printed or changed.
- The connected GitHub app and the repository pull-request API both returned zero open pull requests at verification time, so no PR-number check attribution was available despite the expected open-PR premise.
- Protected-preview health and authenticated staff smoke did not run because no exact-head deployment was published. A prior deployment or local substitute is not represented as exact-head preview evidence.

## Technical Approval Record

**Capability:** Public intake same-page ambiguous-response retry identity.

**Environment tested:** Local source and credential-free automated verification.

**Repository state/commit:** Immutable implementation commit `ca7412d1d64b21841bac7018eae7054ea25311d4`; source aggregate `B492D2C542EC7CBE53EA3A28A0BFCD1CE031AF505739579535BA99E763F95D32` across `1,460` release-source files.

**Date:** 2026-07-12.

**Acceptance criteria:** The criteria in this document.

**Evidence collected:** Focused behavior/source tests, full public-intake regression, TypeScript verification, and the complete `15/15` local release gate.

**Security and tenancy result:** Recovery is resolved-parish scoped, requires exact contact/request identity plus a completion audit marker, and denies mismatches generically.

**Failure and rollback result:** Disable by reverting this scoped implementation commit; no schema rollback or data migration is required. Partial rows without a completion marker are never recovered as success.

**Known limitations:** No live non-production response-loss replay; no cross-tab or simultaneous-request guarantee; sequential writes remain compensating rather than transactional.

**Approval decision:** Approved with constraints for release-candidate implementation. Rollout verification remains required before claiming live recovery evidence.

**Approved scope:** Same-page retry of an unchanged public intake payload after an uncertain response.

**Reasoning:** The server-owned recovery boundary now distinguishes completed persistence from partial leftovers without adding schema or weakening existing abuse, tenancy, cleanup, or privacy controls.

**Next required action:** Add the approved shared-QA service-role credential to Vercel Preview scope without exposing it, redeploy the exact head, confirm the open PR reference, then run protected health/staff smoke and a synthetic non-production response-loss retry smoke.
