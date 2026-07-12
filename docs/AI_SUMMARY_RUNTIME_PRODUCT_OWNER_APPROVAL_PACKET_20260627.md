# AI Summary Runtime Product-Owner Approval Packet

Last Updated: 2026-06-27

## Status

Status: Product-owner approval packet only. Runtime AI summary safety-chain generation is not approved by this document.

This packet defines the approval evidence required before turning on `/api/ai/summary` safety-chain runtime gates in a non-production environment.

Do not enable production flags.

Do not apply migrations.

Do not change `/api/ai/reply`.

Do not change operational RLS.

## Linked Evidence

Required source documents:

- Runtime gate scaffold plan: `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`
- Audit-write approval plan: `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`
- Safe-response exposure acceptance criteria: `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`
- Generation approval plan: `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`
- Non-production QA checklist: `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`
- Non-production QA evidence template: `docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md`
- Browser-authenticated non-production QA evidence: `docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md`
- Confirmed fixture rerun evidence: `docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md`
- Production smoke-test evidence template: `docs/AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md`

## Production Approval Update

Status: Production AI summary safety-chain enablement remains `NO_GO`.

Completed evidence:

- Browser-authenticated non-production QA passed with flag-off regression, base fail-closed behavior, audit-write evidence, safe-response exposure evidence, generation evidence, monitoring, and rollback.
- Confirmed fixture rerun passed with a real safe cross-parish denied request.
- Confirmed fixture rerun passed with a valid safe family portal token tied to a required family document step.
- The family-facing fixture wording was corrected so family portal content did not mention AI summary QA.
- The temporary non-production family portal token was revoked after evidence capture.

Remaining production-only approval gates:

- Named product-owner approval for production enablement.
- Named technical owner approval for the production flag rollout.
- Named security/data owner approval for production parish-data exposure risk.
- Named monitoring owner and monitoring channel.
- Named rollback owner with authority to disable flags during the rollout window.
- Production-safe staff account and request records approved for smoke testing.
- Production-safe cross-parish denied request fixture approved for smoke testing.
- Production-safe family portal token fixture with required documents approved for smoke testing.
- Production rollout window with start time, end time, and go/no-go checkpoint.
- Production rollback decision criteria acknowledged by all owners.

## Production-Safe Smoke-Test Data Requirements

Before production flags can be enabled, prepare and record:

- Safe staff account email or staff user id with explicit permission to test AI summary.
- Active parish id and parish name for the same-parish request smoke.
- Same-parish request id with non-sensitive test-safe request content.
- Cross-parish request id that the safe staff account must not be able to access.
- Family portal token plan for a request with at least one required family-owned document step.
- Document content plan using only harmless sample or synthetic files.
- Audit-log observation plan for AI summary events and denied access attempts.
- Confirmation that raw prompt text, generated summary text, provider payloads, token material, signed URLs, document contents, and secrets will not be copied into evidence.
- Cleanup plan for expiring or revoking production smoke-test family portal tokens.

## Production Flag Rollout Steps

Run these steps only after named production approval:

1. Capture flag-off baseline.
2. Confirm `/api/health` returns `checks.schema=true`.
3. Confirm `/api/ai/reply` remains unchanged and is not part of the rollout.
4. Enable base runtime gate:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
```

5. Run same-parish request fail-closed smoke.
6. Enable audit-write gate:

```text
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
```

7. Verify only approved safe audit metadata is written.
8. Enable safe-response exposure gate:

```text
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
```

9. Verify only approved `sourceDisplay` and `staffReview` scaffolding is returned to authenticated staff.
10. Enable generation gate:

```text
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION=ENABLED
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK=APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION
```

11. Verify generation succeeds only for same-parish authenticated staff and uses approved DTO-backed prompt input.
12. Verify cross-parish request denial returns a generic blocked result before audit write and before OpenAI generation.
13. Verify family portal pages do not expose AI/internal staff data.
14. Confirm monitoring shows expected request, audit, OpenAI, and error counts.
15. Record final decision: `GO_PRODUCTION_LIMITED_ROLLOUT` or `ROLLBACK`.

## Production Rollback Steps

Rollback is environment-flag-only unless a separate production incident response decision is made.

1. Clear generation gate:

```text
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION unset
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK unset
```

2. Clear safe-response exposure gate:

```text
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE unset
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK unset
```

3. Clear audit-write gate:

```text
VINEA_AI_SUMMARY_AUDIT_WRITE unset
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK unset
```

4. Clear base runtime gate:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME unset
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK unset
```

5. Redeploy or restart the production runtime as required by the hosting environment.
6. Re-run flag-off legacy smoke.
7. Confirm `/api/health` returns `checks.schema=true`.
8. Confirm no further safety-chain audit writes or OpenAI safety-chain generations occur.
9. Record rollback owner, time, reason, monitoring observations, and final state.

## Production Monitoring And Owner Requirements

Required before production enablement:

- Monitoring owner:
- Monitoring channel:
- Rollback owner:
- Technical owner:
- Security/data owner:
- Product owner:

Monitor during rollout:

- `/api/ai/summary` status codes and error rate.
- OpenAI request count and unexpected spikes.
- Audit event write count and event names.
- Cross-parish denied attempts.
- Family portal traffic and errors.
- Any logs or UI responses containing forbidden data classes.

## Approval Scope

Approval is for non-production validation only.

Approval does not authorize:

- Production flag enablement.
- Production data access.
- `/api/ai/reply` changes.
- Operational RLS changes.
- Database migrations.
- Autonomous AI actions.
- Family-facing AI output.

## Required Approval Sequence

Product-owner approval must be staged in this order:

1. Approve flag-off legacy regression.
2. Approve base safety runtime fail-closed behavior.
3. Approve audit-write gate validation.
4. Approve safe-response exposure gate validation.
5. Approve generation gate validation.
6. Approve cross-parish denial validation.
7. Approve family portal denial validation.
8. Approve monitoring and rollback validation.

## Required Flag States

### Flag-Off Baseline

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

### Base Safety Runtime

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
```

### Audit Write

```text
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
```

### Safe Response Exposure

```text
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
```

### Safety-Chain Generation

```text
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION=ENABLED
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK=APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION
```

## Go/No-Go Criteria

### GO

All must be true:

- Flag-off legacy regression passed.
- Base safety runtime fails closed before OpenAI.
- Audit-write gate writes only approved safe metadata, if enabled for the QA run.
- Safe-response exposure returns only safe `sourceDisplay` and `staffReview`, if enabled for the QA run.
- Generation gate uses only `safetyChain.promptAssembly.prompt` as OpenAI input, if enabled for the QA run.
- Cross-parish attempts fail before audit write and before OpenAI.
- Family portal surfaces do not call or display AI data.
- `/api/ai/reply` is unchanged.
- No raw prompt, raw provider response, provider payload, token material, audit preparation envelope, internal note body, communication body, document content, signed URL, hash, or secret appears in audit rows, HTTP responses, logs, or UI.
- Rollback returns the app to flag-off legacy behavior.
- Monitoring owner confirms no unexpected errors, OpenAI calls, or audit writes.

### NO-GO

Any of these blocks approval:

- Any production flag is enabled.
- Any production data is used.
- `/api/ai/reply` changes.
- Operational RLS changes.
- A migration is applied.
- OpenAI is called before audit-write, safe-response exposure, and generation approvals are all satisfied.
- Cross-parish request scope can generate, audit, or return scaffolding.
- Family portal surfaces expose AI/internal staff data.
- Raw prompt, generated output, provider payload, token material, internal note body, communication body, document content, signed URL, hash, or secret appears anywhere outside the approved DTO boundary.
- Rollback cannot restore flag-off legacy behavior.

## Evidence Capture

Attach or link:

```text
Environment:
App URL:
Commit SHA:
Date/time window:
QA operator:
Technical owner:
Security/data owner:
Product owner:
Safe staff account:
Same-parish request id:
Cross-parish request id:
Family portal token/route fixture:
Flag-off screenshots/logs:
Audit-write evidence:
Safe-response evidence:
Generation evidence:
Cross-parish denial evidence:
Family portal denial evidence:
Monitoring evidence:
Rollback evidence:
Open risks:
Final decision: GO_NONPRODUCTION_ONLY / NO_GO
```

## Monitoring Expectations

Monitor:

- HTTP status codes for `/api/ai/summary`.
- OpenAI request count.
- Audit event write count.
- Error logs.
- Family portal traffic.
- Cross-parish denial attempts.
- Any response containing forbidden data classes or secrets.

## Rollback Decision Criteria

Rollback immediately if:

- Unexpected OpenAI calls occur.
- Unexpected audit rows are written.
- Any cross-parish or family-facing exposure occurs.
- Any raw prompt, generated output, provider payload, token material, note body, document content, signed URL, hash, or secret appears outside the approved boundary.
- Any sustained `500` errors appear after flags are enabled.

Rollback uses environment configuration only and must follow `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`.

## Sign-Off

```text
QA operator sign-off:
Technical owner sign-off:
Security/data owner sign-off:
Product owner sign-off:
Decision:
Date:
Conditions:
```

## What Changed Plain English

Vinea now has a product-owner approval packet for testing the safer AI summary path outside production. It says what proof is needed, who must sign off, what would block approval, and how to roll back. It does not approve production use or turn on any AI generation.
