# Parish Settings and Staff Access Confirmation Deadline Boundary - 2026-07-20

Completion marker: `PARISH_SETTINGS_STAFF_ACCESS_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

Selected-parish configuration and Staff Access writes now settle within a finite browser confirmation window. A confirmed validation or authorization rejection remains retryable. If Vinea cannot confirm whether a write completed, or cannot reload the resulting selected-parish state, related controls remain unavailable until staff refresh and review.

## Implemented Boundary

- Parish-details and Staff Access confirmation deadline: `60` seconds.
- Existing synchronous locks remain authoritative for parish settings, Daily Brief exclusion, and Staff Access row/add operations.
- Each write captures the active parish generation before dispatch and ignores a result after parish scope changes.
- Non-2xx server responses continue through the existing privacy-safe allowlist and remain retryable.
- A 2xx response without the required success acknowledgement is treated as ambiguous.
- Confirmed parish-settings success must be followed by a successful authoritative settings reload before Vinea reports success.
- Confirmed Staff Access success must be followed by a successful authoritative Staff Access reload before Vinea reports success.
- Transport uncertainty, timeout, malformed success, or failed scoped reload freezes the related controls until refresh.
- Switching authorized parish scope resets the freeze only while establishing a fresh scoped read.
- Daily Brief cannot start while parish configuration requires refresh, preventing delivery from an unconfirmed recipient/configuration state.
- Public-intake routing mutation behavior, Daily Brief provider behavior, server authorization, audit behavior, migrations, and RLS are unchanged.
- No write is replayed automatically.

## Source Identity

- Implementation commit: `9c0912ebdf3d7299b9d7c8c126e23ff61a9d232d`
- Tracked-head aggregate SHA-256: `600289C1E5C6C64E09B77243D756A01CFCC9DE1064724A7B55BE20CB22F6EBDE`
- Tracked source files: `1504`
- Working-tree aggregate SHA-256: `DB53CA7C8CC2904F6C5C8AD0879D6286F4AD00DC635F73432512D0F36F602B97`
- Working source files: `1508` (`1504` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused deadline, single-flight, selected-parish, authorization, confirmation-dialog, read-model, safe-message, and Daily Brief compatibility suite: `18` files / `73` tests passed.
- TypeScript `typecheck` passed before the complete contract.
- Repository lint passed.
- Complete release-readiness contract: `15 / 15` checks passed in `389.9` seconds.
- Repository secret scan: `2895` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Full Vitest suite: `860` files / `3692` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation source-bound suite: `10` files / `50` tests passed.
- Post-documentation secret scan: `2896` text files scanned, `500` binaries skipped, `0` findings.

Three existing source assertions failed closed during focused verification because they expected the previous retry-oriented transport fallback or the previous narrower Daily Brief guard. They were updated to require the stronger refresh-first boundary; no runtime authorization, provider, or persistence behavior was weakened.

## Safety Boundary

This work did not access production, mutate parish settings or Staff Access, send a Daily Brief, change public-intake routing, apply a migration, change RLS, enable a feature flag, send another communication, run an export, access storage, create a signed URL, call Google Calendar or AI, generate a certificate, or make a public trust claim. Live non-production timeout and acknowledgement-loss behavior remains rollout evidence, not a local-test claim.
