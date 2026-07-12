# AI Safety Chain Active Parish Request Lookup - 2026-07-08

## Status

Implemented as a safe production-readiness hardening slice for the disabled-by-default AI summary and AI reply safety-chain adapters.

## What Changed

- Updated `lib/server/aiSummarySafetyChainAdapter.ts`.
- Updated `lib/server/aiReplySafetyChainAdapter.ts`.
- Updated focused adapter tests:
  - `lib/server/aiSummarySafetyChainAdapter.test.ts`
  - `lib/server/aiReplySafetyChainAdapter.test.ts`

## What Changed In Plain English

When the disabled AI safety-chain path checks whether staff may summarize or draft a reply for a request, it now looks up the request contact only inside the selected active parish. If the request is from another parish, the safety chain stops earlier and returns the same generic blocked response.

## Safety Boundary

This does not enable AI in production, call OpenAI differently, expose source display to staff, write AI audit events, persist staff dispositions, send communications, apply migrations, change operational RLS, access production, access storage, create signed URLs, run exports, generate certificates, or make public trust claims.

## Verification

- `npm.cmd test -- lib\server\aiSummarySafetyChainAdapter.test.ts lib\server\aiReplySafetyChainAdapter.test.ts` - passed 2 files / 19 tests.

## Follow-Up

Run broader typecheck, lint, build, and full tests before closing the production-readiness loop. Manual non-production QA should later verify the disabled AI summary/reply safety-chain paths still fail closed for cross-parish request ids and still preserve legacy behavior when gates are off.
