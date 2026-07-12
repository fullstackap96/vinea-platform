# AI Source Path Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - NON-RUNTIME AI SOURCE-DISPLAY LINK HARDENING`

Completion marker: `AI_SOURCE_PATH_SAFE_LINK_BOUNDARY_20260708`

This slice hardens the internal source-display paths prepared by the disabled AI summary and reply safety chains. It does not call OpenAI, return generated output, write audit events, or expose AI source-display paths to family-facing surfaces.

## What Changed

- AI summary safety-chain sources now build request source paths through `requestDetailHref`.
- AI reply safety-chain sources now build request source paths through `requestDetailHref`.
- Unsafe-shaped request IDs in source-display DTO preparation are encoded before becoming dashboard request paths.
- A source-level guard now blocks future reintroduction of raw request-path interpolation in these adapters.

## Why This Matters

Future source-cited AI summaries and reply drafts should only point staff back into safe Vinea dashboard request pages. Even though the AI runtime path remains disabled and fail-closed, the prepared DTO chain now follows the same dashboard-only request navigation boundary as the rest of the staff experience.

## Safety Boundary

This change:

- does not enable AI generation.
- does not call OpenAI.
- does not write audit events.
- does not return generated output.
- does not expose raw prompts, raw outputs, provider payloads, token material, storage paths, signed URLs, document contents, or original filenames.
- does not mutate records.
- does not send communications.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

## Verification

Focused tests prove:

- AI summary source paths encode unsafe-shaped request IDs through the shared request detail helper.
- AI reply source paths encode unsafe-shaped request IDs through the shared request detail helper.
- Source-level guards require both adapters to import and use `requestDetailHref`.
- Source-level guards reject the previous raw `/dashboard/requests/${input.requestId}` interpolation pattern.

Command:

```powershell
npm.cmd test -- lib/server/aiSummarySafetyChainAdapter.test.ts lib/server/aiReplySafetyChainAdapter.test.ts lib/server/aiSourcePathSafeLinkBoundary.test.ts
```

Expected result: pass.
