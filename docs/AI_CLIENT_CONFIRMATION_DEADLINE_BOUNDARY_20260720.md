# AI Client Confirmation Deadline Boundary - 2026-07-20

Completion marker: `AI_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

Request Detail AI summaries and reply drafts, plus Daily Work Hub follow-up drafts, now settle within finite browser confirmation windows. Vinea accepts only non-empty structured generation results. If generated-content persistence cannot be confirmed, related staff mutation controls remain unavailable until staff refresh and review the request.

## Implemented Boundary

- Browser generation confirmation deadline: `40` seconds.
- Existing AI provider deadline: `30` seconds.
- Generated summary/reply persistence confirmation deadline: `60` seconds.
- Request Detail summary and reply actions share synchronous generation and persistence locks.
- Daily Work Hub single and batch follow-up drafting share one synchronous dispatch lock.
- The reply payload now includes the current `requestId` for the existing permission-scoped adapter path.
- Only non-empty structured `summary` and `reply` fields can reach staff review or persistence.
- Explicit rejected saves remain retryable.
- Ambiguous transport, timeout, malformed-success acknowledgement, or failed confirmation freezes related request mutations until staff refresh and review.
- Batch follow-up drafting stops at the first ambiguous persistence result and does not reload or continue.
- No generation or persistence operation is replayed automatically.
- Existing authentication, active-parish membership, same-parish request ownership, AI safety gates, staff review, provider implementation, source/audit scaffolds, and production-disabled boundaries remain authoritative.

## Source Identity

- Implementation commit: `eb6a622db9e74eb0bd72dc8f05f01220f791186e`
- Tracked-head aggregate SHA-256: `B6FA677F41018079FA23CE91DBD63025494B8D88DC46ED4722813A67F4312B7B`
- Tracked source files: `1501`
- Working-tree aggregate SHA-256: `2102EE1B06C0348B5AB1EB4CBA3647AD83FB766371BA74ABA08894EBF97C2CFE`
- Working source files: `1505` (`1501` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused AI confirmation, provider deadline, safety gate, active-parish persistence, same-origin, body-size, and Daily Work Hub suite: `17` files / `129` tests passed.
- Corrected confirmation compatibility suite: `8` files / `33` tests passed.
- Complete release-readiness contract: `15 / 15` checks passed in `380.2` seconds.
- Repository secret scan: `2891` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Repository lint passed.
- Full Vitest suite: `858` files / `3685` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation source-bound suite: `10` files / `41` tests passed.
- Post-documentation secret scan: `2892` text files scanned, `500` binaries skipped, `0` findings.

The first complete run stopped at one source-contract assertion that still expected the earlier email-template confirmation guard. The test was corrected to require the stronger generation-lock, persistence-lock, and refresh-required boundaries; no runtime behavior was weakened. The complete release contract then passed from the beginning.

## Safety Boundary

This work did not call OpenAI or another provider, enable an AI runtime gate, access production, mutate a request, apply a migration, change RLS, send a communication, run an export, access storage, create a signed URL, touch Google Calendar, generate a certificate, or make a public trust claim. Production approval remains `NO`. Live non-production browser/provider confirmation-loss behavior remains rollout evidence, not a local-test claim.
