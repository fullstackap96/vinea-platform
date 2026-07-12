# AI Summary Browser-Authenticated Non-Production QA Plan And Evidence Template - 2026-06-27

Last Updated: 2026-06-27

## Status

Status: Prepared as a production-readiness planning and evidence template only. This phase does not run a browser session, does not enable production flags, does not apply migrations, does not change `/api/ai/reply`, does not change operational RLS, and does not change runtime behavior.

Use this document for the next live non-production QA run of `/api/ai/summary` safety-chain behavior after the local route/test-harness gate evidence has passed.

Related evidence:

- `docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md`
- `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`
- `docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md`
- `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`
- `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`
- `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`
- `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`

## Required Safety Boundaries

- Use only an explicitly approved non-production environment.
- Do not use production parishioner data.
- Do not enable production flags.
- Do not apply migrations.
- Do not change `/api/ai/reply`.
- Do not change operational RLS.
- Do not record raw prompts, generated outputs, provider payloads, service role keys, session cookies, family portal raw tokens, signed URLs, internal note bodies, communication bodies, private document contents, token hashes, or secrets in this evidence.
- Stop immediately if a public or family-facing surface exposes AI source display, staff review status, internal audit metadata, generated summary text, raw prompt material, or private content.

## Environment Approval

| Field | Required Value | Actual Evidence |
|---|---|---|
| Environment name | Explicit non-production only | `[fill during run]` |
| App URL | Non-production URL only | `[fill during run]` |
| Supabase project ref or host, no credentials | Non-production only | `[fill during run]` |
| Deployment identifier | Preview/staging build identifier | `[fill during run]` |
| Git branch/SHA | Exact branch and commit under test | `[fill during run]` |
| QA window start/end | Timestamped | `[fill during run]` |
| QA operator | Named person | `[fill during run]` |
| Technical owner | Named person | `[fill during run]` |
| Security/data owner | Named person | `[fill during run]` |
| Product owner | Named person | `[fill during run]` |
| Rollback owner | Named person reachable during test | `[fill during run]` |
| Monitoring owner/channel | Named person and channel | `[fill during run]` |

Approval gates:

- Product owner approves non-production browser QA: `[approved / not approved]`
- Technical owner confirms runtime flags are non-production only: `[approved / not approved]`
- Security/data owner confirms safe test records only: `[approved / not approved]`
- Rollback owner confirms availability: `[approved / not approved]`

## Safe Test Data Requirements

| Data Item | Requirement | Actual Evidence |
|---|---|---|
| Safe staff account | Authenticated staff user with access to the active parish only | `[fill during run]` |
| Active parish | Non-production parish with safe fixture data | `[fill during run]` |
| Same-parish request | Safe request ID visible to staff through active parish context | `[fill during run]` |
| Request type | Include at least one Catholic workflow request such as Baptism, Wedding, Funeral, or OCIA | `[fill during run]` |
| Workflow context | Request detail page loads normally before AI test | `[fill during run]` |
| Audit log inspection access | Staff/admin can verify safe AI audit metadata after approved gate | `[fill during run]` |
| Cross-parish denied request | Safe request ID outside active parish scope or forged active parish context | `[fill during run]` |
| Family portal token plan | Safe family portal fixture; no raw token recorded | `[fill during run]` |
| OpenAI provider setting | Approved non-production key/project only | `[fill during run]` |
| Cleanup plan | Safe test audit rows and generated summaries retained or cleaned according to QA policy | `[fill during run]` |

Pass criteria:

- All records are synthetic or explicitly safe non-production records.
- No real parishioner data appears in screenshots, logs, audit evidence, or copied text.
- No family portal raw token or signed document URL is recorded.

## Browser Setup

1. Start or open the approved non-production app.
2. Confirm the app is not production by checking environment banner, deployment URL, or deployment metadata.
3. Sign in with the safe staff account.
4. Select the approved active parish, if the parish switcher is present.
5. Open the same-parish safe request detail page.
6. Confirm the request detail page shows only expected safe test data.
7. Open browser developer tools or approved network capture.
8. Prepare audit-log inspection in a separate staff/admin tab.
9. Prepare monitoring logs for `/api/ai/summary`, OpenAI provider calls, and audit writes.

Evidence to capture:

- Browser URL with no session tokens.
- Staff account identifier without session cookie.
- Active parish identifier.
- Safe request ID.
- Pre-run `/api/health` result.
- Confirmation that `/api/ai/reply` is not part of this run.

## Flag State Matrix

| Gate | `VINEA_AI_SUMMARY_SAFETY_RUNTIME` | `VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK` | `VINEA_AI_SUMMARY_AUDIT_WRITE` | `VINEA_AI_SUMMARY_AUDIT_WRITE_ACK` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK` | Required Result |
|---|---|---|---|---|---|---|---|---|---|
| Gate 0 flag-off legacy regression | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | Legacy behavior preserved |
| Gate 1 base safety runtime | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | Controlled fail-closed response |
| Gate 2 audit-write approval | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | Safe audit metadata written; still fail-closed |
| Gate 3 safe-response exposure | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `unset / invalid` | `unset / invalid` | Safe source/review scaffolding only; no generation |
| Gate 4 generation approval | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | Safe generated summary plus source/review scaffolding |
| Rollback | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | Legacy behavior restored |

## Gate 0 Evidence: Flag-Off Legacy Regression

| Check | Expected | Actual | Result |
|---|---|---|---|
| Request detail page AI summary action | Legacy staff-gated behavior works | `[fill during run]` | `[pass/fail]` |
| `/api/ai/summary` response | Existing `{ summary }` shape only | `[fill during run]` | `[pass/fail]` |
| Source display | Not present | `[fill during run]` | `[pass/fail]` |
| Staff review | Not present | `[fill during run]` | `[pass/fail]` |
| Safety-chain audit row | Not written | `[fill during run]` | `[pass/fail]` |
| `/api/ai/reply` | Not changed and not tested in this run | `[fill during run]` | `[pass/fail]` |

Stop condition:

- Stop if source display, staff review, safety-chain audit metadata, or safety-chain generation appears while the base safety flags are off.

## Gate 1 Evidence: Base Safety Runtime Fail-Closed

| Check | Expected | Actual | Result |
|---|---|---|---|
| Same-parish request | HTTP `503` with generic `ai_retrieval_unavailable` | `[fill during run]` | `[pass/fail]` |
| OpenAI provider call | No safety-chain provider call | `[fill during run]` | `[pass/fail]` |
| Audit row | No safety-chain audit row | `[fill during run]` | `[pass/fail]` |
| Source display | Not returned | `[fill during run]` | `[pass/fail]` |
| Staff review | Not returned | `[fill during run]` | `[pass/fail]` |
| User-facing error | Generic and parish-safe | `[fill during run]` | `[pass/fail]` |

Stop condition:

- Stop if OpenAI is called, an audit row is written, or private/internal data appears.

## Gate 2 Evidence: Audit-Write Approval

| Check | Expected | Actual | Result |
|---|---|---|---|
| Same-parish request | Still HTTP `503` with generic error | `[fill during run]` | `[pass/fail]` |
| Audit row count | Exactly one approved safe AI summary audit row for the test request | `[fill during run]` | `[pass/fail]` |
| Audit metadata | Staff identity, parish scope, active parish context, request target, AI feature id, safe source references, output destination, staff disposition, model/provider family placeholder, blocked reason | `[fill during run]` | `[pass/fail]` |
| Forbidden audit fields | No raw prompt, generated output, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret | `[fill during run]` | `[pass/fail]` |
| OpenAI provider call | No safety-chain provider call | `[fill during run]` | `[pass/fail]` |

Stop condition:

- Stop if audit metadata stores raw prompt text, generated output, provider payload, token material, private content, or secrets.

## Gate 3 Evidence: Safe-Response Exposure

| Check | Expected | Actual | Result |
|---|---|---|---|
| Same-parish request | Still controlled fail-closed while generation is off | `[fill during run]` | `[pass/fail]` |
| Source display | Safe labels and permission-checked source references only | `[fill during run]` | `[pass/fail]` |
| Staff review | Staff-only review guidance only | `[fill during run]` | `[pass/fail]` |
| Forbidden response fields | No prompt assembly, audit preparation envelope, future audit event envelope, raw prompt, generated output, provider payload, token material, private material policy details, note body, communication body, document content, signed URL, hash, or secret | `[fill during run]` | `[pass/fail]` |
| OpenAI provider call | No safety-chain provider call | `[fill during run]` | `[pass/fail]` |

Stop condition:

- Stop if source/review response exposes private content or if OpenAI is called before generation approval.

## Gate 4 Evidence: Safety-Chain Generation

| Check | Expected | Actual | Result |
|---|---|---|---|
| Staff auth | Staff is authenticated before provider call | `[fill during run]` | `[pass/fail]` |
| Active parish scope | Active parish is validated before provider call | `[fill during run]` | `[pass/fail]` |
| Request scope | Request belongs to active parish before provider call | `[fill during run]` | `[pass/fail]` |
| Audit write | Approved safe audit row written before provider call | `[fill during run]` | `[pass/fail]` |
| OpenAI input | Input comes only from `safetyChain.promptAssembly.prompt` | `[fill during run]` | `[pass/fail]` |
| Response body | Generated `summary` plus safe `sourceDisplay` and `staffReview` only | `[fill during run]` | `[pass/fail]` |
| Forbidden response fields | No raw prompt, raw provider response, provider payload, token material, audit preparation envelope, private material policy details, note body, communication body, document content, signed URL, hash, or secret | `[fill during run]` | `[pass/fail]` |

Stop condition:

- Stop if provider call occurs before staff/parish/request/audit/source/review checks are confirmed.

## Denial Evidence

| Case | Expected | Actual | Result |
|---|---|---|---|
| Cross-parish request | Generic denial before audit write and before OpenAI | `[fill during run]` | `[pass/fail]` |
| Forged active parish cookie | Generic denial before audit write and before OpenAI | `[fill during run]` | `[pass/fail]` |
| Unauthenticated browser request | HTTP `401` or equivalent staff-auth denial before safety chain and OpenAI | `[fill during run]` | `[pass/fail]` |
| Family portal page | Does not call `/api/ai/summary` and exposes no AI/internal staff data | `[fill during run]` | `[pass/fail]` |
| Family portal API | Does not expose AI source display, staff review, audit metadata, prompt text, generated summary, provider payloads, internal notes, document contents, signed URLs, hashes, or secrets | `[fill during run]` | `[pass/fail]` |

Pass criteria:

- Denials are generic and do not reveal whether another parish request exists.
- Family-facing surfaces remain free of AI/internal staff data.

## Monitoring Evidence

| Observation | Required Evidence | Actual |
|---|---|---|
| Pre-run `/api/health` | `checks.schema: true` in approved non-production environment | `[fill during run]` |
| Post-run `/api/health` | `checks.schema: true` after rollback | `[fill during run]` |
| `/api/ai/summary` request count | Counts by gate and status | `[fill during run]` |
| Unexpected `500` errors | `0` unexpected errors | `[fill during run]` |
| OpenAI provider calls | `0` before Gate 4; expected count during Gate 4 only | `[fill during run]` |
| Audit row count | Expected safe audit rows only | `[fill during run]` |
| App logs | No secrets, raw prompts, provider payloads, private content, signed URLs, or token material | `[fill during run]` |
| Browser screenshots | Safe synthetic data only; no secrets or private content | `[fill during run]` |

## Rollback Evidence

Rollback steps:

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
11. Confirm `/api/health` still returns `checks.schema: true`.
12. Confirm no new safety-chain audit rows or OpenAI calls occur after rollback.

| Rollback Check | Expected | Actual | Result |
|---|---|---|---|
| Flags disabled | All safety-chain flags unset or invalid | `[fill during run]` | `[pass/fail]` |
| App restarted | Non-production app restarted cleanly | `[fill during run]` | `[pass/fail]` |
| Legacy behavior restored | `/api/ai/summary` returns legacy `{ summary }` behavior | `[fill during run]` | `[pass/fail]` |
| `/api/ai/reply` unchanged | No reply route behavior change | `[fill during run]` | `[pass/fail]` |
| Health check | `checks.schema: true` | `[fill during run]` | `[pass/fail]` |
| Audit/provider quiet | No new safety-chain audit rows or provider calls | `[fill during run]` | `[pass/fail]` |

## Final Sign-Off

| Role | Name | Date/time | Decision | Conditions |
|---|---|---|---|---|
| QA operator | `[fill during run]` | `[fill during run]` | `[go/no-go]` | `[fill during run]` |
| Technical owner | `[fill during run]` | `[fill during run]` | `[go/no-go]` | `[fill during run]` |
| Security/data owner | `[fill during run]` | `[fill during run]` | `[go/no-go]` | `[fill during run]` |
| Product owner | `[fill during run]` | `[fill during run]` | `[go/no-go]` | `[fill during run]` |
| Rollback owner | `[fill during run]` | `[fill during run]` | `[confirmed/not confirmed]` | `[fill during run]` |

Final decision:

- `GO_BROWSER_AUTH_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN`: `[yes/no]`
- `NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN`: `Yes until separate production approval`

## Production Readiness Boundary

Passing this browser-authenticated non-production QA does not approve production enablement.

Production enablement still requires:

- Named product-owner approval.
- Named technical owner approval.
- Named security/data owner approval.
- Production-safe staff account and test request plan.
- Production monitoring owner and rollback owner.
- Production rollout window.
- Production flag rollout instructions.
- Production rollback instructions.
- Confirmation that production membership-aware operational RLS status is understood and does not create an unresolved AI safety risk.
