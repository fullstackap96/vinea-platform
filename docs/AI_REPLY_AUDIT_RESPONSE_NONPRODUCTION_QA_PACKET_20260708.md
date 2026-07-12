# AI Reply Audit-Write And Safe-Response Non-Production QA Packet - 2026-07-08

## Status

Prepared as a non-runtime QA and acceptance packet only.

This packet defines the future non-production QA run for `/api/ai/reply` audit-write and safe-response exposure after product-owner implementation approval. It does not wire runtime routes, does not enable flags, does not write audit events, does not expose source display to clients, does not call OpenAI, does not send email, does not mutate records, does not apply migrations, does not change operational RLS, and does not change production behavior.

## Related Artifacts

- `docs/AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md`
- `docs/AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_20260707.md`
- `docs/AI_REPLY_SAFE_AUDIT_EVENT_VALIDATOR_20260708.md`
- `docs/AI_REPLY_SAFE_RESPONSE_EXPOSURE_VALIDATOR_20260708.md`
- `lib/server/aiReplyAuditResponseGatePreflight.ts`
- `lib/aiReplyAuditEventSafety.ts`
- `lib/aiReplySafeResponseExposure.ts`

## Required Future Non-Production Target

Use only an explicitly approved non-production target.

Required label-only inputs:

| Field | Required Label |
|---|---|
| Non-production app target | `[approved non-production app URL or local test harness label]` |
| QA operator | `[non-secret operator label]` |
| Safe staff fixture | `[safe staff account label, no password]` |
| Active parish fixture | `[safe active parish label]` |
| Same-parish request fixture | `[same-parish request label]` |
| Cross-parish denied request fixture | `[cross-parish or forged-active-parish denial label]` |
| Family/unauthenticated denial fixture | `[family portal or unauthenticated denial label]` |
| Audit inspection method | `[safe audit log inspection label]` |
| Monitoring/log inspection method | `[redacted non-production monitoring label]` |
| Rollback owner | `[owner label]` |
| Evidence storage location | `[repo evidence file or tracker label]` |

Do not record raw passwords, service-role keys, access tokens, JWTs, cookie values, raw request ids from production, signed URLs, storage paths, raw prompts, generated reply text, provider payloads, internal note bodies, communication bodies, private document contents, or original filenames.

## Required Future Flags

The future QA run may use only these non-production flags:

```text
VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION
VINEA_AI_REPLY_AUDIT_WRITE=ENABLED
VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA
```

Production must remain blocked even if these values are accidentally present.

## Source-Level Acceptance Criteria

Before live QA starts, the future runtime implementation must pass source-level checks proving:

- staff authentication happens before any AI reply safety-chain work;
- the existing disabled AI reply runtime gate preserves legacy behavior when off;
- `buildAiReplySafetyChainAdapter(...)` runs before audit-write or safe-response gates;
- blocked safety-chain results return only `ai_reply_unavailable`;
- `validateAiReplyAuditEventForSafeWrite(...)` runs before `writeAiReplyAuditMetadata(...)`;
- audit writes use only the validated safe event;
- safe-response exposure requires `safeAuditMetadataWritten = true` after the validated audit write completes;
- `validateAiReplyResponseScaffoldForSafeExposure(...)` runs before `buildSafeAiReplyResponse(...)`;
- safe-response exposure returns only the validated scaffold;
- OpenAI generation remains disabled;
- outbound email remains disabled;
- storage access and signed URL creation remain absent;
- rollback by disabling flags returns to fail-closed behavior.

Required checks:

- `npm.cmd test -- lib/server/aiReplyAuditResponseGatePreflight.test.ts`
- `npm.cmd test -- lib/aiReplyAuditEventSafety.test.ts lib/aiReplySafeResponseExposure.test.ts`

## Gate Sequence

Run gates in order. Stop immediately on any failed pass criteria.

### Gate 0: Flag-Off Baseline

Flag state:

```text
VINEA_AI_REPLY_RUNTIME_ENV unset or invalid
VINEA_AI_REPLY_AUDIT_WRITE unset or invalid
VINEA_AI_REPLY_AUDIT_WRITE_ACK unset or invalid
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
```

Pass criteria:

- Existing `/api/ai/reply` legacy behavior is preserved for authorized staff.
- No safety-chain audit event is written.
- No source-display scaffold is returned.
- No staff-review scaffold is returned.
- No OpenAI behavior changes from the existing flag-off path.
- No email is sent automatically.

### Gate 1: Safety Runtime With Audit Gate Off

Flag state:

```text
VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION
VINEA_AI_REPLY_AUDIT_WRITE unset or invalid
VINEA_AI_REPLY_AUDIT_WRITE_ACK unset or invalid
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
```

Pass criteria:

- Same-parish request reaches the safety-chain path and fails closed with generic `ai_reply_unavailable`.
- `writeAiReplyAuditMetadata(...)` is not called.
- `buildSafeAiReplyResponse(...)` is not called.
- OpenAI is not called from the safety-chain path.
- Email is not sent.
- The response does not contain prompt text, generated text, source-display scaffolding, staff-review scaffolding, audit metadata, provider payloads, tokens, signed URLs, storage paths, note bodies, communication bodies, or document contents.

### Gate 2: Audit-Write Approval

Flag state:

```text
VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION
VINEA_AI_REPLY_AUDIT_WRITE=ENABLED
VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE unset or invalid
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK unset or invalid
```

Pass criteria:

- Same-parish request still returns generic `ai_reply_unavailable` while safe-response exposure is off.
- Exactly one safe audit event may be written for the same-parish fixture.
- The audit write uses only the event accepted by `validateAiReplyAuditEventForSafeWrite(...)`.
- The route records `safeAuditMetadataWritten = true` only after the safe audit write succeeds.
- Audit metadata includes safe labels for staff identity, active parish scope, target communication draft, request label, feature id, safe source references, output destination, staff review status, and model/provider family placeholder.
- Audit metadata records raw prompt, raw output, provider payload, token material, prompt text storage, autonomous send, and family-facing output as false or disabled.
- Audit metadata does not include raw prompt text, generated text, provider payloads, token material, signed URLs, storage paths, document contents, original filenames, note bodies, communication bodies, or secrets.
- OpenAI is not called.
- Email is not sent.

### Gate 3: Safe-Response Exposure Approval

Flag state:

```text
VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION
VINEA_AI_REPLY_AUDIT_WRITE=ENABLED
VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA
```

Pass criteria:

- Same-parish request may return only the safe source-display and staff-review scaffold accepted by `validateAiReplyResponseScaffoldForSafeExposure(...)`.
- Same-parish safe-response exposure must fail closed if the safe audit write fails or `safeAuditMetadataWritten = true` is not recorded after the write.
- The response keeps the generic fail-closed status while generation remains disabled.
- Source cards are display-only safe labels/references.
- Staff review states human approval is required and family-facing output is disabled.
- No generated reply text is returned.
- No raw prompt text, provider payload, token material, audit event raw JSON, source rows, storage paths, signed URLs, document contents, original filenames, note bodies, communication bodies, or send controls are returned.
- OpenAI is not called.
- Email is not sent.

## Denial Cases

Run denial cases after Gate 3 in the same non-production target.

| Case | Expected Result |
|---|---|
| Cross-parish request or forged active parish | Generic denial before audit write, safe-response exposure, OpenAI, and email |
| Family portal or unauthenticated request | HTTP authorization denial or generic AI unavailable response before safety-chain data exposure |
| Unsafe response scaffold fixture | `validateAiReplyResponseScaffoldForSafeExposure(...)` blocks response exposure |
| Unsafe audit-event fixture | `validateAiReplyAuditEventForSafeWrite(...)` blocks audit write |
| Production-like runtime environment | All gates remain blocked |

Forbidden denial evidence:

- Do not reveal whether a cross-parish request exists.
- Do not include raw ids, emails, tokens, signed URLs, storage paths, prompt text, generated text, provider payloads, or private document contents.

## Monitoring And Evidence Capture

Record label-only evidence:

| Evidence Field | Value |
|---|---|
| Environment identity | `[fill during run]` |
| Flag state per gate | `[fill during run]` |
| Health check result | `[fill during run]` |
| Staff auth result | `[fill during run]` |
| Same-parish audit event count | `[fill during run]` |
| Same-parish safe response result | `[fill during run]` |
| Cross-parish denial result | `[fill during run]` |
| Family/unauthenticated denial result | `[fill during run]` |
| OpenAI call count | `[fill during run]` |
| Email send count | `[fill during run]` |
| Storage/signed URL call count | `[fill during run]` |
| Forbidden payload inspection | `[fill during run]` |
| Monitoring/log observations | `[fill during run]` |
| Rollback result | `[fill during run]` |
| Unresolved risks | `[fill during run]` |
| Final sign-off | `[fill during run]` |

Pass criteria:

- No production data is used.
- No production flags are enabled.
- No production environment is contacted.
- No migrations are applied.
- No operational RLS changes are made.
- No record mutations occur except the approved safe non-production audit metadata write in Gate 2/Gate 3.
- No OpenAI call occurs from the safety-chain path.
- No email is sent.
- No storage access or signed URL creation occurs.
- Evidence contains labels and pass/fail outcomes only.

## Rollback

Rollback is flag-only:

1. Remove or invalidate `VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE`.
2. Remove or invalidate `VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK`.
3. Remove or invalidate `VINEA_AI_REPLY_AUDIT_WRITE`.
4. Remove or invalidate `VINEA_AI_REPLY_AUDIT_WRITE_ACK`.
5. Remove or invalidate `VINEA_AI_REPLY_RUNTIME_ENV`.
6. Restart the non-production app or test harness.
7. Re-run Gate 0.

Pass criteria:

- `/api/ai/reply` returns to flag-off legacy behavior.
- No safe-response scaffold is returned.
- No safety-chain audit event is written.
- OpenAI and email behavior match the pre-run flag-off baseline.

## Production Boundary

Production AI reply remains `NO-GO`.

This packet does not approve:

- production AI reply audit writes;
- production safe-response exposure;
- OpenAI generation through the reply safety chain;
- outbound email sending;
- staff disposition persistence;
- staff-facing UI exposure;
- customer-facing AI claims.

## Exact Future Approval Language

Use this only after the runtime implementation exists and source-level checks pass:

```text
I approve non-production QA execution for the AI reply audit-write and safe-response gates only.
Use an explicitly approved non-production target, keep production blocked, run flag-off baseline first, enable only VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION, VINEA_AI_REPLY_AUDIT_WRITE=ENABLED, VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA, VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED, and VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA, validate audit events with validateAiReplyAuditEventForSafeWrite, validate response scaffolds with validateAiReplyResponseScaffoldForSafeExposure, do not call OpenAI, do not send email, do not access storage or signed URLs, capture label-only evidence, and rollback by disabling flags.
```

## Next Safe Step

After this packet, the next safe step is either:

- request product-owner approval to implement the non-production runtime gates and helpers listed in `docs/AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md`; or
- continue another production-readiness track while AI reply runtime remains unapproved.
