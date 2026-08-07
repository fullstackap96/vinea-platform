# Workflow Template Save Confirmation Deadline Boundary - 2026-07-20

Completion marker: `WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

Selected-parish Workflow Template step saves now settle within a finite browser confirmation window. A confirmed server rejection remains safely retryable. If Vinea cannot confirm the final saved state, the editor stays unavailable until staff refresh Settings and review the selected parish.

## Implemented Boundary

- Workflow Template save confirmation deadline: `60` seconds.
- The existing synchronous single-flight lock still prevents a second save from dispatching while one is unresolved.
- Each save captures the active parish before dispatch and ignores stale results after parish scope changes.
- Non-2xx server responses continue through the existing privacy-safe message allowlist and remain retryable.
- A 2xx response without the required success acknowledgement or a valid saved-step DTO is treated as ambiguous.
- Confirmed acknowledgement must be followed by a successful authoritative selected-parish template reload before Vinea reports success.
- Timeout, transport uncertainty, malformed success, or failed scoped reload freezes type switching, refresh, field editing, and saving until page refresh.
- Switching authorized parish scope discards stale results and establishes a fresh scoped read.
- No save is replayed automatically.
- Server authentication, selected-parish membership and authorization, checked persistence, audit behavior, migrations, and RLS are unchanged.

## Source Identity

- Implementation commit: `405c7b28f7a229602b036b9f9641ada6f5e71d44`
- Tracked-head aggregate SHA-256: `B165A167D3D5343F8C61E18B592ABB779965D0C99A3729AEA672AE7ED90E56FE`
- Tracked source files: `1507`
- Working-tree aggregate SHA-256: `DBD466C8F90A1BEBD76D5CB1233C83A95C3B8B4225ACF07BD6B998CD561B73EE`
- Working source files: `1511` (`1507` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused deadline, single-flight, selected-parish, route, safe-message, and browser-evidence suite: `10` files / `36` tests passed.
- TypeScript `typecheck` passed before the complete contract.
- Repository lint passed.
- Complete release-readiness contract: `15 / 15` checks passed in `387.7` seconds.
- Repository secret scan: `2899` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Full Vitest suite: `862` files / `3698` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation focused suite: `10` files / `36` tests passed.
- Post-documentation repository secret scan: `2900` text files scanned, `500` binaries skipped, `0` findings.

## Safety Boundary

This work did not save a Workflow Template, access production, apply a migration, change RLS, enable a feature flag, mutate another record, send a communication, run an export, access storage, create a signed URL, call Google Calendar or AI, generate a certificate, or make a public trust claim. Live non-production timeout, acknowledgement-loss, and post-save refresh-failure injection remain rollout evidence, not a local-test claim.
