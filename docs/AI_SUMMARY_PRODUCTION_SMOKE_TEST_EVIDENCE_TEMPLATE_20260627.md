# AI Summary Production Smoke-Test Evidence Template - 2026-06-27

Last Updated: 2026-06-27

## Status

Status: Template prepared only. Production was not accessed, production flags were not enabled, no migrations were applied, `/api/ai/reply` was not changed, and operational RLS was not changed.

This template is for the eventual production rollout window after named product-owner, technical, security/data, monitoring, and rollback approvals are complete.

Current outcome: `Evidence template prepared; production rollout not executed`

Current recommendation: `Do not enable production AI summary safety-chain flags until approval, smoke-test data, monitoring, rollback, and sign-off are complete`

Related docs:

- `docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md`
- `docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md`
- `docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md`
- `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`
- `docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md`

## Evidence Privacy Rules

Do not paste:

- Staff passwords.
- OpenAI API keys.
- Supabase service role keys.
- Session cookies.
- Raw family portal tokens.
- Signed document URLs.
- Token hashes.
- Raw prompt text.
- Raw generated summary text.
- Provider request or response payloads.
- Internal note bodies.
- Private communication bodies.
- Private document contents.
- Parishioner sensitive details beyond approved fixture identifiers.

Use stable identifiers, screenshots with sensitive content redacted, counts, timestamps, and pass/fail observations.

## Rollout Identity

| Field | Value |
|---|---|
| Rollout date | `PENDING` |
| Rollout window start | `PENDING` |
| Rollout window end | `PENDING` |
| Production app URL | `PENDING` |
| Deployment provider | `PENDING` |
| Deployment identifier | `PENDING` |
| Git commit or release tag | `PENDING` |
| QA operator | `PENDING` |
| Product owner | `PENDING` |
| Technical owner | `PENDING` |
| Security/data owner | `PENDING` |
| Monitoring owner | `PENDING` |
| Monitoring channel | `PENDING` |
| Rollback owner | `PENDING` |
| Final pre-rollout decision | `PENDING_GO_OR_NO_GO` |

Pass criteria:

- Every named owner is identified before production flags are enabled.
- Monitoring owner and rollback owner are reachable during the full rollout window.
- Rollout begins only after final pre-rollout decision is `GO_PRODUCTION_LIMITED_ROLLOUT`.

## Production-Safe Fixture Checklist

| Fixture | Required Evidence | Result |
|---|---|---|
| Staff account | Safe staff account email or staff user id approved for smoke testing; do not record password | `PENDING` |
| Staff parish membership | Staff account has expected active parish membership and no unintended parish access | `PENDING` |
| Active parish | Active parish id and parish name selected for same-parish smoke | `PENDING` |
| Same-parish request | Request id approved for AI summary smoke; content is non-sensitive and test-safe | `PENDING` |
| Cross-parish denied request | Request id from another parish that the staff account must not access | `PENDING` |
| Family portal token plan | Token created or planned for a request with at least one required family-owned document step; raw token not copied into evidence | `PENDING` |
| Required document fixture | Required family document step exists and uses harmless sample or synthetic document content | `PENDING` |
| Audit-log access | Staff or admin route available to verify AI summary audit events and denied access observations | `PENDING` |
| Cleanup plan | Family portal token expiration/revocation and sample document cleanup plan recorded | `PENDING` |

Pass criteria:

- Same-parish fixture can be safely summarized without exposing sensitive real parishioner content.
- Cross-parish fixture must remain inaccessible to the smoke-test staff account.
- Family portal fixture must not expose AI/internal staff data.
- Raw tokens, token hashes, signed URLs, prompts, provider payloads, and private content are not copied into evidence.

## Pre-Rollout Approval Record

| Role | Name | Approval Time | Decision | Conditions |
|---|---|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

Required decision before continuing: `GO_PRODUCTION_LIMITED_ROLLOUT`

## Pre-Rollout Health And Baseline

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| `/api/health` | HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Flag-off baseline for `/api/ai/summary` | Existing legacy staff-gated behavior works | `PENDING` | `PENDING` | `PENDING` |
| `/api/ai/reply` | Confirm unchanged and outside rollout | `PENDING` | `PENDING` | `PENDING` |
| Audit-log baseline | Current AI summary audit event count captured | `PENDING` | `PENDING` | `PENDING` |
| OpenAI baseline | Current OpenAI request count captured | `PENDING` | `PENDING` | `PENDING` |
| Error baseline | Current `/api/ai/summary` error rate captured | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Production is healthy before flag changes.
- Legacy flag-off AI summary behavior is known before rollout.
- `/api/ai/reply` remains untouched.

## Flag State Matrix

| Gate | `VINEA_AI_SUMMARY_SAFETY_RUNTIME` | `VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK` | `VINEA_AI_SUMMARY_AUDIT_WRITE` | `VINEA_AI_SUMMARY_AUDIT_WRITE_ACK` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK` | Result |
|---|---|---|---|---|---|---|---|---|---|
| Gate 0 flag-off baseline | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `PENDING` |
| Gate 1 base safety runtime | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `PENDING` |
| Gate 2 audit-write approval | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `PENDING` |
| Gate 3 safe-response exposure | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `unset / invalid` | `unset / invalid` | `PENDING` |
| Gate 4 safety-chain generation | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | `PENDING` |
| Rollback | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `PENDING` |

## Gate 0: Flag-Off Baseline Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Same-parish request AI summary | Legacy behavior works for authorized staff | `PENDING` | `PENDING` | `PENDING` |
| Source display | Not shown in legacy response | `PENDING` | `PENDING` | `PENDING` |
| Staff review scaffolding | Not shown in legacy response | `PENDING` | `PENDING` | `PENDING` |
| Audit writes | No safety-chain audit writes | `PENDING` | `PENDING` | `PENDING` |
| Forbidden evidence classes | No raw prompts, raw outputs, provider payloads, token material, signed URLs, or private content recorded | `PENDING` | `PENDING` | `PENDING` |

## Gate 1: Base Safety Runtime Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Base flags enabled | Exact base runtime flags set | `PENDING` | `PENDING` | `PENDING` |
| Same-parish request | Controlled fail-closed behavior before audit write, safe response, or generation | `PENDING` | `PENDING` | `PENDING` |
| OpenAI calls | No safety-chain OpenAI generation | `PENDING` | `PENDING` | `PENDING` |
| Audit writes | No safety-chain audit write before audit-write approval | `PENDING` | `PENDING` | `PENDING` |
| Generic blocked error | No private reason or object existence leak | `PENDING` | `PENDING` | `PENDING` |

## Gate 2: Audit-Write Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Audit flags enabled | Exact audit-write flags set after base runtime flags | `PENDING` | `PENDING` | `PENDING` |
| Safe audit event name | Approved AI summary audit event appears | `PENDING` | `PENDING` | `PENDING` |
| Safe audit metadata | Staff identity, parish scope, active parish context, target request id, feature id, input data classes, safe source references, output destination, staff disposition, model/provider family placeholder, and blocked reason only | `PENDING` | `PENDING` | `PENDING` |
| Forbidden audit data absent | No raw prompts, raw outputs, provider payloads, token material, internal note bodies, document contents, signed URLs, token hashes, or secrets | `PENDING` | `PENDING` | `PENDING` |
| OpenAI calls | No generation until generation gate is approved | `PENDING` | `PENDING` | `PENDING` |

## Gate 3: Safe-Response Exposure Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Safe-response flags enabled | Exact safe-response flags set after base runtime and audit-write flags | `PENDING` | `PENDING` | `PENDING` |
| Source display | Only approved safe source labels and permission-checked source references | `PENDING` | `PENDING` | `PENDING` |
| Staff review | Staff-only review/status scaffolding appears only for authenticated staff | `PENDING` | `PENDING` | `PENDING` |
| Family-facing allowed flag | Family-facing AI output remains disallowed | `PENDING` | `PENDING` | `PENDING` |
| Forbidden response data absent | No raw prompt, generated output, provider payload, token material, token hash, signed URL, internal note body, communication body, document content, or secret | `PENDING` | `PENDING` | `PENDING` |
| OpenAI calls | No generation until generation gate is approved | `PENDING` | `PENDING` | `PENDING` |

## Gate 4: Safety-Chain Generation Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Generation flags enabled | Exact generation flags set after base, audit-write, and safe-response flags | `PENDING` | `PENDING` | `PENDING` |
| Staff authentication | Checked before OpenAI | `PENDING` | `PENDING` | `PENDING` |
| Active parish scope | Checked before OpenAI | `PENDING` | `PENDING` | `PENDING` |
| Object-level request scope | Same-parish request scope checked before OpenAI | `PENDING` | `PENDING` | `PENDING` |
| Prompt input | OpenAI input comes only from approved DTO-backed prompt assembly | `PENDING` | `PENDING` | `PENDING` |
| Response shape | Safe summary plus approved `sourceDisplay` and `staffReview` only | `PENDING` | `PENDING` | `PENDING` |
| Evidence privacy | Raw generated summary text is not copied into evidence | `PENDING` | `PENDING` | `PENDING` |

## Cross-Parish Denial Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Cross-parish denied request route | Staff cannot view request detail or AI controls | `PENDING` | `PENDING` | `PENDING` |
| AI summary attempt with denied request id | Generic denial before audit write and before OpenAI | `PENDING` | `PENDING` | `PENDING` |
| Forged active parish context | Generic denial before audit write and before OpenAI | `PENDING` | `PENDING` | `PENDING` |
| Object existence leak | Response does not confirm whether another parish request exists | `PENDING` | `PENDING` | `PENDING` |
| Monitoring | Denial count recorded without private target details | `PENDING` | `PENDING` | `PENDING` |

## Family Portal And Document Safety Evidence

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Family portal page | Loads only safe family-facing request/document information | `PENDING` | `PENDING` | `PENDING` |
| Required document fixture | Required family document step is visible with upload controls | `PENDING` | `PENDING` | `PENDING` |
| AI/internal data absent | No AI controls, source display, staff review, audit metadata, internal notes, AI notes, staff navigation, prompt/provider/token indicators, signed URLs, token hashes, or private parish data | `PENDING` | `PENDING` | `PENDING` |
| Family portal token handling | Raw token is not copied into evidence and is revoked or expired after smoke testing | `PENDING` | `PENDING` | `PENDING` |
| Direct document privacy | Direct storage access does not expose private documents outside approved signed-url flow | `PENDING` | `PENDING` | `PENDING` |

## Audit-Log Checks

| Check | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Audit event names | Only approved AI summary event names appear | `PENDING` | `PENDING` | `PENDING` |
| Same-parish audit metadata | Staff, parish, active parish, request target, feature id, source references, disposition, and provider/model family placeholder are present | `PENDING` | `PENDING` | `PENDING` |
| Denial audit metadata | Generic blocked reason and safe target metadata only, if written by approved gate | `PENDING` | `PENDING` | `PENDING` |
| Forbidden audit fields | No raw prompts, raw outputs, provider payloads, token material, signed URLs, document contents, note bodies, communication bodies, token hashes, passwords, or API keys | `PENDING` | `PENDING` | `PENDING` |
| Audit retention decision | Production audit rows retained according to retention policy or incident evidence plan | `PENDING` | `PENDING` | `PENDING` |

## Monitoring Observations

| Observation | Value |
|---|---|
| Monitoring owner | `PENDING` |
| Monitoring channel | `PENDING` |
| Monitoring window start | `PENDING` |
| Monitoring window end | `PENDING` |
| `/api/ai/summary` request count | `PENDING` |
| `/api/ai/summary` success count | `PENDING` |
| Controlled blocked/denied count | `PENDING` |
| Unexpected `500` count | `PENDING` |
| OpenAI request count | `PENDING` |
| Audit event write count | `PENDING` |
| Family portal error count | `PENDING` |
| Cross-parish denial observations | `PENDING` |
| Forbidden data or secret leak observations | `PENDING` |

Pass criteria:

- No unexpected error spike.
- OpenAI calls match approved generation gate state only.
- Audit writes match approved audit-write gate state only.
- No forbidden data classes or secrets appear in logs, UI responses, audit rows, or evidence.

## Rollback Verification

| Step | Expected | Actual | Evidence Location | Result |
|---|---|---|---|---|
| Clear generation flags | Safety-chain generation stops | `PENDING` | `PENDING` | `PENDING` |
| Clear safe-response flags | Source display and staff review scaffolding stop | `PENDING` | `PENDING` | `PENDING` |
| Clear audit-write flags | Safety-chain audit writes stop | `PENDING` | `PENDING` | `PENDING` |
| Clear base runtime flags | Flag-off legacy behavior returns | `PENDING` | `PENDING` | `PENDING` |
| Redeploy/restart as needed | Production runtime uses flag-off state | `PENDING` | `PENDING` | `PENDING` |
| Re-run `/api/health` | HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Re-run legacy same-parish smoke | Legacy staff-gated AI summary behavior restored | `PENDING` | `PENDING` | `PENDING` |
| Post-rollback monitoring | No further safety-chain generation or unexpected audit writes | `PENDING` | `PENDING` | `PENDING` |

Rollback pass criteria:

- Rollback uses environment flags only.
- `/api/ai/reply` remains unchanged.
- No database rollback is required for flag rollback.
- Family portal token is revoked or expiration is confirmed.

## Cleanup And Deactivation

| Item | Expected | Actual | Owner | Result |
|---|---|---|---|---|
| Family portal token | Revoked or expiration confirmed | `PENDING` | `PENDING` | `PENDING` |
| Sample document | Removed or explicitly retained as harmless test data | `PENDING` | `PENDING` | `PENDING` |
| Staff test session | Signed out or session invalidated if needed | `PENDING` | `PENDING` | `PENDING` |
| Evidence redaction | Screenshots/logs reviewed for secrets and private data | `PENDING` | `PENDING` | `PENDING` |
| Open risks | Recorded with owner and decision | `PENDING` | `PENDING` | `PENDING` |

## Rollback Decision

Rollback immediately if:

- Any production flag is enabled out of order.
- `/api/ai/reply` behavior changes.
- Operational RLS behavior changes unexpectedly.
- OpenAI is called before all required gates are enabled.
- Cross-parish request scope can generate, audit unsafe metadata, or return staff scaffolding.
- Family portal surfaces expose AI/internal staff data.
- Raw prompts, raw generated outputs, provider payloads, token material, signed URLs, token hashes, internal note bodies, communication bodies, document contents, passwords, API keys, or secrets appear outside the approved boundary.
- `/api/ai/summary` has sustained unexpected `500` errors.
- Monitoring owner, rollback owner, or product owner cannot be reached during the window.

## Final Sign-Off

| Role | Name | Date/time | Decision | Conditions |
|---|---|---|---|---|
| QA operator | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Product owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

Final decision:

- `GO_PRODUCTION_LIMITED_ROLLOUT`
- `ROLLBACK_COMPLETED`
- `NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN`

## Final Outcome

Record one:

- Production rollout completed and monitored: `PENDING`
- Production rollout rolled back: `PENDING`
- Production rollout cancelled before flags changed: `PENDING`

Summary:

```text
PENDING
```

## What Changed Plain English

This template gives Vinea a safe checklist for a future production AI summary smoke test. It makes the team write down who approved the test, what safe records were used, what happened at each switch, what the audit logs showed, what monitoring saw, and how rollback was verified. It also reminds everyone not to paste private parish data, passwords, tokens, prompts, AI outputs, or document contents into the evidence.
