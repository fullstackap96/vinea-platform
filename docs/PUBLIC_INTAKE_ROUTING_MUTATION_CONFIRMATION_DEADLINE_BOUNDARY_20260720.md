# Public Intake Routing Mutation Confirmation Deadline Boundary - 2026-07-20

Completion marker: `PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

Selected-parish Public Intake Routing management mutations now settle within a finite browser confirmation window. A confirmed server rejection remains safely retryable. If Vinea cannot confirm the final routing state, the complete management surface stays unavailable until staff refresh Settings and review the selected parish.

## Implemented Boundary

- Metadata, domain, DNS verification, and token mutation confirmation deadline: `60` seconds.
- The existing shared synchronous single-flight lock still prevents competing routing mutations.
- Each mutation captures the active parish before dispatch and ignores stale results after parish scope changes.
- Non-2xx server responses continue through the existing privacy-safe message allowlist and remain retryable.
- A 2xx response without the required success acknowledgement or valid operation-specific DTO is treated as ambiguous.
- Confirmed acknowledgement must be followed by a successful authoritative selected-parish routing reload before Vinea reports success.
- Timeout, transport uncertainty, malformed success, or failed scoped reload freezes metadata, domain, verification, and token controls until page refresh.
- An acknowledged one-time token remains visible if the authoritative reload fails, allowing staff to secure it without creating another token.
- Switching authorized parish scope discards stale results, clears any one-time token from the prior parish, and establishes a fresh scoped read.
- No routing mutation is replayed automatically.
- Runtime public intake routing, server authentication and administrator authorization, token hashing, audit behavior, migrations, and RLS are unchanged.

## Source Identity

- Implementation commit: `f0b7d6201657785cfe731527e09dd6a7ce698d79`
- Tracked-head aggregate SHA-256: `9610711F2CA49207F321D827B95719F6E859C7A318289DA9B1FE9430600DA92D`
- Tracked source files: `1510`
- Working-tree aggregate SHA-256: `84B12A24F3353EB0735BA2C9B76BB3C83F9C8B2319E638610C0BA30232A93AC3`
- Working source files: `1514` (`1510` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused mutation-deadline, single-flight, routing-route, selected-parish, validated-read-model, safe-message, and browser-evidence suite: `15` files / `74` tests passed.
- TypeScript `typecheck` passed before the complete contract.
- Repository lint passed.
- Complete release-readiness rerun: `15 / 15` checks passed in `382` seconds.
- Repository secret scan: `2903` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Full Vitest suite: `864` files / `3704` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation focused suite: `15` files / `74` tests passed.
- Post-documentation repository secret scan: `2904` text files scanned, `500` binaries skipped, `0` findings.

An initial full-contract execution passed checks `1` through `14`, including `864` files / `3704` tests, but the tool session transitioned while the final build was running TypeScript. That interrupted process was not counted as a pass. The complete contract was rerun in a resumable terminal session and returned `LOCAL_RELEASE_READINESS_PASSED` with exit code `0`.

## Safety Boundary

This work did not enable runtime public intake routing, save routing metadata, add or verify a domain, create or expose a real token, access production, apply a migration, change RLS, enable a feature flag, mutate another record, send a communication, run an export, access storage, create a signed URL, call Google Calendar or AI, generate a certificate, or make a public trust claim. Live non-production timeout, acknowledgement-loss, one-time-token, and post-save reload-failure injection remain rollout evidence, not a local-test claim.
