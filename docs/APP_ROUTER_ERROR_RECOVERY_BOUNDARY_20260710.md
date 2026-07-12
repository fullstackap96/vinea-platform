# App Router Error Recovery Boundary

Decision: `APP_ROUTER_ERROR_RECOVERY_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - GENERIC RETRYABLE FALLBACKS`

Date: 2026-07-10

## Scope

Vinea now provides App Router recovery UI for unexpected page-render failures and root-layout failures.

- `app/error.tsx` handles uncaught errors below the root layout.
- `app/global-error.tsx` provides a complete HTML fallback if the root layout fails.
- Both boundaries use the Next.js 16 `unstable_retry` recovery contract.
- The shared recovery surface now warns staff to confirm whether a recent save or send completed before repeating it, reducing duplicate-action risk after an uncertain render failure.
- Retry and return controls use Vinea's shared primary/secondary button system, and the dashboard return action is labeled `Daily Work Hub` in parish-office language.
- The shared fallback offers a plain retry action and a normal home link.
- Exception messages, error digests, object dumps, stack traces, and raw technical details are not rendered or logged by the client fallback.

Expected validation and request failures remain handled by their existing route, Server Action, and client-message boundaries. This fallback is only for unexpected render failures.

## Preserved Behavior

- Authentication, active-parish scope, membership checks, queries, mutations, navigation, and production gates are unchanged.
- No external monitoring provider is configured or called.
- No production environment is accessed.
- No migration, operational RLS change, production flag, record mutation, communication send, AI call, export, storage access, signed URL, Calendar mutation, certificate generation, or public trust claim is made.

## Verification Boundary

- Focused source tests verify the Client Component requirement, complete root HTML fallback, `unstable_retry` use, accessible recovery controls, and forbidden error-detail rendering/logging.
- TypeScript, lint, full regression, release-evidence checks, secret scanning, and production build remain required before this slice is recorded as release evidence.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.

## Verification Results

- Focused source/docs and release-evidence suite: `6 test files / 18 tests passed`.
- Full Vitest regression suite: `670 test files / 2,639 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Repository secret scan: `1,830 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff validation: `71 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence validation: `442 required phrases / 0 findings`.
- Next.js production build: `PASS` with Next.js `16.2.10` and all `53` static pages generated.
