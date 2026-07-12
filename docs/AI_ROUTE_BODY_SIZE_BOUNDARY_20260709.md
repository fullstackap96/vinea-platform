# AI Route Body Size Boundary

Status: `AI_ROUTE_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The staff-only `/api/ai/summary` and `/api/ai/reply` routes now enforce a `256 KiB` JSON ceiling after staff authentication and before safety-chain gate evaluation, prompt assembly, audit preparation, or OpenAI calls.

## Preserved Safety Chain

- Authentication remains before body parsing.
- All summary/reply safety-chain gates remain after bounded parsing and before OpenAI.
- Valid flag-off legacy behavior remains unchanged.
- Valid enabled-gate behavior still requires the existing active-parish, request-object, source-display, audit, staff-review, family-exclusion, and explicit approval checks.
- Malformed JSON returns generic HTTP `400`; oversized JSON returns generic HTTP `413`.
- Rejected bodies cannot reach prompt assembly, audit writes, safe-response exposure, or OpenAI.

## Safety Boundaries

- This change does not call OpenAI during verification.
- This change does not enable production AI flags or approve production AI use.
- This change does not alter the configured model, provider, prompts, source display, audit metadata, or staff disposition behavior for valid requests.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not make a public trust claim.

## Verification

Source-level tests pin authentication-before-body ordering, the 256 KiB ceiling, generic 400/413 outcomes, safety-gate placement, and OpenAI placement after all protected steps. Existing AI runtime, preflight, audit, safe-response, generation, cross-parish, and family-safety tests remain in force.

## Plain-English Summary

Staff AI tools still behave the same for normal requests. Damaged or abnormally large requests now stop before Vinea prepares sensitive context or contacts the AI provider.
