# AI Summary Non-Production Runtime Gate QA Checklist

Last Updated: 2026-06-27

## Status

Status: Manual QA checklist only. The live route remains fail-closed and this phase does not enable any runtime flags.

This checklist covers the safe non-production sequence for validating `/api/ai/summary` safety-chain runtime gates.

Do not use production data.

Do not enable these flags in production.

Do not apply migrations.

Do not change `/api/ai/reply`.

Do not change operational RLS.

## Required Non-Production Environment

Use a disposable or explicitly approved non-production environment with:

- A safe staff account.
- A same-parish safe request with a known `requestId`.
- A cross-parish safe request that the staff account must not access through the active parish context.
- A safe family portal token or family portal route fixture that must not expose AI data.
- Access to audit-log inspection for safe test records.
- Monitoring/log access for the test window.
- A named rollback owner.

## Gate Sequence

Run the gates in this order. Stop if any gate fails.

### Gate 0: Flag-Off Legacy Regression

Environment:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME unset or invalid
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK unset or invalid
VINEA_AI_SUMMARY_AUDIT_WRITE unset or invalid
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK unset or invalid
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK unset or invalid
```

Pass criteria:

- `/api/ai/summary` uses the existing legacy staff-gated summary behavior.
- Existing staff summary requests still call the legacy OpenAI path.
- Existing prompt fields still behave as before.
- No source-display scaffolding is returned.
- No staff-review scaffolding is returned.
- No AI audit event is written by the safety-chain path.
- `/api/ai/reply` behavior is unchanged.

### Gate 1: Base Safety Runtime Enabled, Still Fail-Closed

Environment:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
VINEA_AI_SUMMARY_AUDIT_WRITE unset or invalid
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK unset or invalid
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK unset or invalid
```

Pass criteria:

- Same-parish request returns `{ ok: false, error: 'ai_retrieval_unavailable' }` with HTTP `503`.
- No OpenAI call is made from the safety-chain path.
- No audit event is written by the safety-chain path.
- No source-display scaffolding is returned.
- No staff-review scaffolding is returned.
- Safe internal logs show the adapter reached or blocked the safety chain without exposing raw prompt text, request note bodies, provider payloads, tokens, signed URLs, hashes, or secrets.

### Gate 2: Audit-Write Approval Enabled

Environment:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK unset or invalid
```

Pass criteria:

- Same-parish request still returns `{ ok: false, error: 'ai_retrieval_unavailable' }` with HTTP `503`.
- Exactly one approved safe AI summary audit event may be written after product-owner approval for this gate.
- Audit metadata uses only `safetyChain.auditPreparation.futureAuditEvent`.
- Audit metadata includes staff identity, parish scope, active parish context, target request, AI feature id, safe source references, output destination, staff disposition, model/provider family placeholder, and blocked reason.
- Audit metadata records `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false`.
- No raw prompt, generated output, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret appears in the audit row.
- No OpenAI call is made from the safety-chain path.
- No source-display scaffolding is returned.
- No staff-review scaffolding is returned.

### Gate 3: Safe-Response Exposure Approval Enabled

Environment:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION unset or invalid
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK unset or invalid
```

Pass criteria:

- Same-parish request still returns a fail-closed `ai_retrieval_unavailable` response while generation is off.
- Response may include only safe `sourceDisplay` and `staffReview` scaffolding after product-owner approval for this gate.
- No prompt assembly, audit preparation envelope, future audit event envelope, raw prompt, generated output, provider payload, token material, private material policy details, note body, communication body, document content, signed URL, hash, or secret is returned.
- No OpenAI call is made from the safety-chain path.

### Gate 4: Generation Approval Enabled

Environment:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION=ENABLED
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK=APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION
```

Pass criteria:

- Same-parish request validates staff identity, active parish scope, request scope, safe source display, audit metadata, staff review status, family/cross-parish safety, safe audit write, and safe response scaffolding before OpenAI.
- OpenAI input is exactly `safetyChain.promptAssembly.prompt`.
- OpenAI is not called before the approved safe audit write.
- Response includes generated summary text plus safe `sourceDisplay` and `staffReview` scaffolding only.
- No raw prompt, raw provider response, provider payload, token material, audit preparation envelope, private material policy details, note body, communication body, document content, signed URL, hash, or secret is returned.

## Denial Cases

Run these in the same non-production environment.

### Cross-Parish Denial

Pass criteria:

- Staff cannot generate or receive scaffolding for a request outside the validated active parish scope.
- Cross-parish attempt fails before audit write and before OpenAI.
- Public error remains generic: `ai_retrieval_unavailable`.
- Logs and audit metadata do not expose internal parish ids to the user-facing response.

### Forged Active Parish Cookie Denial

Pass criteria:

- Forged or unauthorized active parish cookie fails before audit write and before OpenAI.
- Public error remains generic: `ai_retrieval_unavailable`.

### Family Portal Denial

Pass criteria:

- Family portal pages and APIs do not call `/api/ai/summary`.
- Family portal responses do not include AI summaries, AI source-display scaffolding, staff-review scaffolding, audit metadata, prompt text, generated output, provider payloads, token material, internal notes, communication bodies, document contents, signed URLs, hashes, or secrets.

## Monitoring

During each gate, record:

- Environment name and URL.
- Flag state.
- Staff account used.
- Request ids used.
- HTTP status and response shape.
- OpenAI call count or provider log observation.
- Audit row count and metadata inspection result.
- Application errors or warnings.
- Security/privacy observations.

Pass criteria:

- No unexpected `500` errors.
- No unexpected OpenAI calls.
- No unexpected audit writes.
- No public or family-facing exposure of internal AI data.

## Rollback

Rollback is environment-only while these gates remain disabled-by-default:

1. Remove or invalidate `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION`.
2. Remove or invalidate `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK`.
3. Remove or invalidate `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE`.
4. Remove or invalidate `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK`.
5. Remove or invalidate `VINEA_AI_SUMMARY_AUDIT_WRITE`.
6. Remove or invalidate `VINEA_AI_SUMMARY_AUDIT_WRITE_ACK`.
7. Remove or invalidate `VINEA_AI_SUMMARY_SAFETY_RUNTIME`.
8. Remove or invalidate `VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK`.
9. Restart the non-production app.
10. Re-run Gate 0 flag-off legacy regression.

Rollback pass criteria:

- `/api/ai/summary` returns to legacy staff-gated behavior.
- `/api/ai/reply` remains unchanged.
- No database rollback is required for flag rollback.

## Sign-Off Fields

```text
QA operator:
Technical owner:
Security/data owner:
Product owner:
Environment:
Date/time:
Flag-off regression result:
Audit-write gate result:
Safe-response exposure gate result:
Generation gate result:
Cross-parish denial result:
Family portal denial result:
Monitoring result:
Rollback result:
Open risks:
Decision: APPROVE_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN / DO_NOT_APPROVE
```

## What Changed Plain English

Vinea now has a step-by-step checklist for safely testing the future AI summary safety switches outside production. It explains what to turn on first, what should still be blocked, what can be checked in the audit log, what families must never see, and how to turn everything back off.
