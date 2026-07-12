# AI Summary Required Audit Persistence Boundary - 2026-07-11

Decision: `AI_SUMMARY_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally behind the existing disabled-by-default non-production AI summary gates.

## Boundary

The `/api/ai/summary` safety-chain path now advances only when the approved safe audit event returns a positively persisted result.

`safeAuditMetadataWritten` is assigned directly from `writeAuditEvent(...)`. A returned or thrown audit failure produces the existing generic `503` response and prevents:

- safe source-display exposure;
- staff-review response scaffolding exposure; and
- `openai.responses.create`.

The generation source validator now requires the audit result assignment, a checked use of that result, and ordering before OpenAI.

## Preserved Boundaries

- Exact legacy behavior remains selected when the base safety runtime gate is off.
- All non-production safety, audit-write, safe-response, and generation flags remain disabled by default.
- Production flags remain off and production AI summary generation remains NO-GO.
- `/api/ai/reply`, staff UI behavior, prompt DTOs, model selection, operational RLS, and schema remain unchanged.

## Verification Boundary

- No production access, OpenAI call, audit write, record mutation, migration, operational RLS change, export, storage access, provider call, production-sensitive flag enablement, or public trust claim.
- Rollback is limited to the checked audit result, generation validator, tests, and documentation.
