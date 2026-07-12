# AI Routes Safe Error Logging - 2026-07-06

Status: `IMPLEMENTED - STAFF AI ROUTE ERROR REDACTION`

## Scope

This slice hardens unexpected failure handling for:

- `POST /api/ai/summary`
- `POST /api/ai/reply`

## What Changed

- The AI summary and AI reply routes now use `logServerError` for unexpected catch-path failures.
- The legacy AI summary route now awaits its legacy generation helper so provider failures are caught by the outer route error boundary.
- Staff-facing 500 responses are generic:
  - `Summary is temporarily unavailable.`
  - `Reply draft is temporarily unavailable.`
- The routes no longer use direct raw `console.error` catch-path logging.

## Safety Boundaries

- No production flags were enabled.
- No OpenAI model, prompt, or provider behavior was changed by this safe-error-logging slice.
- `/api/ai/reply` now has a separate disabled-by-default safety gate scaffold as of 2026-07-07, but no permission-scoped reply adapter, audit-write path, safe-response exposure, or safety-chain generation path is implemented.
- No migrations were applied.
- No operational RLS changes were made.
- No records, exports, storage objects, signed URLs, Google Calendar data, public intake behavior, certificate generation, automations, or public trust claims were changed.

## Why This Matters

AI route failures can contain provider details, prompt-adjacent input, emails, or tokens. These routes now keep troubleshooting detail in the server log through the shared redacting logger while showing staff only a calm generic failure message.

## Verification

- Focused AI route safe logging, AI summary gate, AI route preflight, and shared redaction tests passed:
  - `npm.cmd test -- lib\server\aiRouteSafeErrors.test.ts lib\server\aiSummaryRouteGateWiring.test.ts lib\server\aiRouteRuntimeWiringPreflight.test.ts lib\server\safeErrorLogging.test.ts`
  - Result: 4 test files, 18 tests.

## Manual Testing Needed

- Optional non-production smoke: sign in as safe staff, trigger summary and reply draft generation against a safe request, then force a safe non-production provider failure and confirm the UI shows only the generic failure text while server logs use the `[ai/summary]` or `[ai/reply]` safe envelope.
