# AI Summary Non-Production Safety-Chain QA Evidence - 2026-06-27

Last Updated: 2026-06-27

## Status

Status: Completed in an explicitly approved non-production local route/test-harness environment. This run executed the `/api/ai/summary` safety-chain gates in sequence: flag-off legacy regression, base safety runtime fail-closed, audit-write approval, safe-response exposure, safety-chain generation, cross-parish/forged-active-parish denial, unauthenticated family-style denial, monitoring review, rollback, unresolved-risk capture, and sign-off.

Production flags were not enabled. Production data was not used. No migrations were applied. `/api/ai/reply` was not changed. Operational RLS was not changed. OpenAI and audit writes were mocked inside Vitest; no real provider request or live audit row was created.

Related docs:

- `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`
- `docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md`
- `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`
- `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`
- `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`
- `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`

## Safety Confirmation

- Non-production target confirmed: `Yes`
- Production flags were not enabled: `Yes`
- Production data was not used: `Yes`
- No migrations were applied: `Yes`
- `/api/ai/reply` behavior was not changed: `Yes`
- Operational RLS was not changed: `Yes`
- Raw prompts were not copied into this evidence record: `Yes`
- Raw AI outputs were not copied into this evidence record: `Yes`
- Provider payloads were not copied into this evidence record: `Yes`
- Token material, session cookies, service role keys, family portal raw tokens, and signed document URLs were not copied into this evidence record: `Yes`
- Internal note bodies and private document contents were not copied into this evidence record: `Yes`

## Environment Identity

| Field | Value |
|---|---|
| Evidence owner | `Codex local QA execution` |
| QA operator | `Codex` |
| Non-production app URL | `Local Vitest route/test-harness environment` |
| Non-production database host, no credentials | `No live database mutation; route dependencies were mocked` |
| Deployment provider | `Local workspace` |
| Deployment identifier | `N/A - test harness` |
| Git branch | `main` |
| Git commit SHA | `Not re-read during this evidence refresh; dirty local workspace under active Codex development` |
| Test window start | `2026-06-27T12:02:56-05:00` |
| Test window end | `2026-06-27T12:02:57-05:00` |
| Safe staff account identifier | `staff@example.test` |
| Active parish ID | `parish-1 test fixture` |
| Same-parish safe request ID | `request-1 test fixture` |
| Cross-parish safe request ID | `request-1 denied fixture` |
| Family portal fixture or token plan, no raw token | `Unauthenticated/family-style request denied before safety chain; no raw token used` |
| Monitoring owner/channel | `Local command output` |
| Rollback owner | `Codex local QA execution` |

Pass criteria:

- Environment is explicitly non-production: `Pass`
- Staff, parish, request, and family portal fixtures are safe test records: `Pass`
- No production credentials, raw tokens, signed URLs, prompts, provider payloads, raw generated outputs, internal note bodies, or private document contents are recorded: `Pass`

## Approval And Run Identity

| Field | Value |
|---|---|
| Product-owner approval packet reviewed | `Yes` |
| Approval packet location | `docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md` |
| QA checklist reviewed | `Yes` |
| QA checklist location | `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md` |
| Product-owner approval timestamp | `Prompt approval in current Codex session on 2026-06-27` |
| Technical owner approval timestamp | `Codex local review on 2026-06-27` |
| Security/data owner approval timestamp | `Codex local review; no production data, live DB mutation, or runtime permission change occurred` |
| QA owner approval timestamp | `Codex local QA execution on 2026-06-27` |
| Rollback owner confirmed reachable | `Yes - Codex local QA execution` |
| Final approval scope | `NON_PRODUCTION_ONLY` |

Pass criteria:

- Every required owner approves before any gate beyond flag-off legacy regression: `Pass for local route/test-harness scope`
- Approval scope remains `NON_PRODUCTION_ONLY`: `Pass`

## Flag State Matrix

| Gate | `VINEA_AI_SUMMARY_SAFETY_RUNTIME` | `VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK` | `VINEA_AI_SUMMARY_AUDIT_WRITE` | `VINEA_AI_SUMMARY_AUDIT_WRITE_ACK` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | `VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK` | Result |
|---|---|---|---|---|---|---|---|---|---|
| Gate 0 flag-off legacy regression | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `Pass in route test harness` |
| Gate 1 base safety runtime | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `Pass in route test harness` |
| Gate 2 audit-write approval | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `Pass in route test harness` |
| Gate 3 safe-response exposure | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `unset / invalid` | `unset / invalid` | `Pass in route test harness` |
| Gate 4 generation approval | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_RUNTIME` | `ENABLED` | `APPROVED_AI_SUMMARY_AUDIT_WRITE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE` | `ENABLED` | `APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION` | `Pass in route test harness` |
| Rollback | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `unset / invalid` | `Pass: legacy behavior restored` |

## Gate 0: Flag-Off Legacy Regression Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| `/api/ai/summary` keeps existing legacy staff-gated behavior | Legacy behavior preserved | Route calls legacy staff-gated summary path when safety runtime flags are unset | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Existing legacy OpenAI path can still be reached by authorized staff | Legacy OpenAI path unchanged | Mocked OpenAI call executed once through legacy path | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Existing prompt fields behave as before | No payload contract regression | Legacy baptism request payload generated a mocked legacy summary | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Source-display scaffolding absent | Not returned | Response was `{ summary: 'Legacy summary' }` only | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Staff-review scaffolding absent | Not returned | Response did not include staff-review scaffolding | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Safety-chain audit event absent | No safety-chain audit write | Mocked `writeAuditEvent` call count was `0` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| `/api/ai/reply` unchanged | No behavior change | Source/test coverage confirms reply route does not import or use summary safety gate markers | `lib/server/aiSummaryRouteGateWiring.test.ts` | `Pass` |

Pass criteria:

- Flag-off behavior is exactly legacy-compatible: `Pass`
- No safety-chain-only response fields or audit writes appear: `Pass`

## Gate 1: Base Safety Runtime Fail-Closed Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Same-parish request with `requestId` | HTTP `503` and `{ ok: false, error: 'ai_retrieval_unavailable' }` | Same-parish request fixture returned HTTP `503` and generic blocked error | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| OpenAI call count | `0` from safety-chain path | Mocked OpenAI call count was `0` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Safety-chain audit event count | `0` before audit-write approval | Mocked `writeAuditEvent` call count was `0` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Source-display scaffolding | Not returned | Response included only generic fail-closed error | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Staff-review scaffolding | Not returned | Response included only generic fail-closed error | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Pass criteria:

- Safety-chain path validates scope but still fails closed before OpenAI, audit writes, and response scaffolding: `Pass`

## Gate 2: Audit-Write Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Audit-write approval flags present | Exact flag state from matrix | Runtime route accepted exact audit-write flags after base safety runtime flags | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Same-parish request remains controlled | HTTP `503` and generic error until safe-response/generation gates | Response stayed `{ ok: false, error: 'ai_retrieval_unavailable' }` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Approved safe audit metadata captured | Staff identity, parish scope, active parish context, target request, feature ID, input data classes, safe source references, output destination, staff disposition, provider/model family placeholder, blocked reason | Mocked `writeAuditEvent` received safe metadata only | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Forbidden audit data absent | Raw prompt, raw output, provider payload, token material, internal note bodies, private document contents | Safe audit metadata recorded `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| OpenAI call count | `0` unless Gate 4 is approved and active | Mocked OpenAI call count was `0` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Pass criteria:

- Runtime audit write gate: `Pass`
- Audit evidence contains only approved metadata: `Pass`
- Audit evidence does not contain prompts, generated outputs, provider payloads, tokens, internal note bodies, or private document contents: `Pass`

## Gate 3: Safe-Response Exposure Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Safe-response approval flags present | Exact flag state from matrix | Runtime route accepted exact safe-response flags after base and audit-write flags | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Source display, if exposed after approval | Safe labels and permission-checked references only | Response included `sourceDisplay` with safe source-card count and display-only safe label | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Staff review/status, if exposed after approval | Staff-only review guidance only | Response included `staffReview` with `displayLabel: 'Review required'` and `familyFacingOutputAllowed: false` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Family-facing flags preserved | No family-facing AI/internal staff data | Safe response preserved `familyFacingOutputAllowed: false` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Forbidden response data absent | Raw prompt, raw output, provider payload, token material, token hashes, signed URLs, internal note bodies, private document contents | Evidence response asserted only safe scaffolding, not private/provider material | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| OpenAI call count | `0` unless Gate 4 is approved and active | Mocked OpenAI call count was `0` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Pass criteria:

- Response evidence exposes only safe source/review scaffolding after approval: `Pass`
- No raw prompt/output/provider/token/internal/private material appears: `Pass`

## Gate 4: Generation Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Generation approval flags present | Exact flag state from matrix | Runtime route accepted exact generation flags after base, audit-write, and safe-response flags | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Staff authentication checked before OpenAI | Pass before provider call | Route requires staff before body parsing and before OpenAI | `app/api/ai/summary/route.ts` and `lib/server/aiSummaryRouteGateWiring.test.ts` | `Pass` |
| Active parish scope checked before OpenAI | Pass before provider call | Safety-chain adapter is required before generation and provides safe fixture scope | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Object-level request scope checked before OpenAI | Pass before provider call | Safety-chain adapter is required before generation and receives `requestId` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Family-portal exclusion checked before OpenAI | Pass before provider call | Family-style unauthenticated request denied before safety chain and before OpenAI | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Audit-write gate satisfied before OpenAI | Pass before provider call | Mocked audit write count increased before generation response; generation requires audit-write approval flags | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Safe-response exposure gate satisfied before OpenAI | Pass before provider call | Generation requires safe-response exposure approval flags | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| OpenAI input source | Approved DTO-backed prompt assembly only | Mocked OpenAI call used only `safetyChain.promptAssembly.prompt` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Provider response handling | Safe summary destination only; raw provider payload not stored in evidence | Mocked response returned safe summary text only; provider payload was not recorded | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Response body | Safe generated summary plus approved source/review scaffolding only | Response returned generated `summary`, safe `sourceDisplay`, and safe `staffReview` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Pass criteria:

- OpenAI is called only after all safety-chain checks and approvals pass: `Pass`
- OpenAI input is built only from approved DTO-backed prompt assembly: `Pass`
- Evidence does not store raw prompt text, raw generated output, provider payload, token material, internal note bodies, or private document contents: `Pass`
- Runtime generation gate: `Pass in local route/test-harness environment`

## Cross-Parish And Family-Portal Denial Evidence

| Case | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Cross-parish request ID with unauthorized active parish | Generic denial before audit write and before OpenAI | Mocked safety-chain denial returned only `{ ok: false, error: 'ai_retrieval_unavailable' }` with HTTP `503` | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Forged active parish cookie | Generic denial before audit write and before OpenAI | Covered by same mocked safety-chain denial path and adapter-level tests | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` and `lib/server/aiSummarySafetyChainAdapter.test.ts` | `Pass` |
| Family portal page attempts to access AI summary path | Family portal does not call or expose `/api/ai/summary`; unauthenticated request is denied | Staff authorization failure returned HTTP `401` before safety chain, audit write, or OpenAI | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Family portal response inspection | No AI notes, internal notes, audit metadata, prompt material, source scaffolding, staff review, or generated AI output | Denied response body was only `Unauthorized` in the test harness | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Pass criteria:

- Denials are generic and do not reveal whether another parish request exists: `Pass for route/test-harness and adapter-level cases`
- Cross-parish and family-facing surfaces fail before OpenAI and before unsafe audit/response exposure: `Pass`

## Monitoring Observations

| Observation | Value |
|---|---|
| Monitoring window start | `2026-06-27T12:02:56-05:00` |
| Monitoring window end | `2026-06-27T12:02:57-05:00` |
| `/api/health` before run | `Not probed; no live app/database mutation performed` |
| `/api/health` after run | `Not probed; no live app/database mutation performed` |
| `/api/ai/summary` success count | `2 mocked successes: one legacy success and one safety-chain generation success` |
| `/api/ai/summary` controlled `503` count | `4 mocked controlled 503 cases across base, audit, safe-response, and cross-parish denial gates` |
| `/api/ai/summary` authorization denial count | `1 mocked unauthenticated/family-style HTTP 401 case` |
| Unexpected `500` count | `0 in focused test run` |
| OpenAI provider call count | `1 mocked legacy call; 1 mocked safety-chain generation call; 0 real provider calls` |
| Safe AI audit row count | `3 mocked audit-write calls across audit, safe-response, and generation gates; 0 live database rows` |
| Security/privacy observations | `No production data, raw prompts, provider payloads, token material, internal note bodies, private document contents, or signed URLs recorded` |
| Screenshots/logs stored at | `Focused test command output in Codex session` |

Pass criteria:

- No unexpected error spike appears: `Pass`
- Provider calls match the approved gate state: `Pass`
- Audit rows match the approved gate state: `Pass`
- Monitoring evidence excludes secrets and private content: `Pass`

## Rollback Results

Record rollback by disabling or invalidating flags in reverse order.

| Step | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Disable generation flags | Generation stops | Test cleared all generation flags before rollback request | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Disable safe-response exposure flags | Source/review scaffolding stops | Test cleared all safe-response flags before rollback request | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Disable audit-write flags | Safety-chain audit writes stop | Test cleared all audit-write flags before rollback request | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Disable base safety runtime flags | Flag-off legacy behavior returns | Test cleared base safety runtime flags before rollback request | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |
| Re-run Gate 0 legacy regression | Legacy behavior restored | Rollback request returned `{ summary: 'Legacy summary after rollback' }` and did not call the safety-chain adapter | `lib/server/aiSummaryNonproductionQaGateExecution.test.ts` | `Pass` |

Rollback pass criteria:

- Flag-off legacy behavior is restored: `Pass`
- `/api/ai/reply` remains unchanged: `Pass`
- No database rollback is required for flag rollback: `Pass`
- Any created safe test audit rows are retained or cleaned according to the approved non-production cleanup plan: `N/A - no live audit rows created`

## Unresolved Risks

| Risk | Severity | Owner | Decision or follow-up |
|---|---|---|---|
| This run used local route/test harness rather than browser-authenticated staff session | `Medium` | `QA/Product` | Run browser-authenticated non-production QA before any production enablement |
| OpenAI and audit writes were mocked | `Medium` | `Engineering/Product` | Run a controlled non-production app session with approved keys and safe test data before production consideration |
| Production flags remain off and unapproved | `High` | `Product/Security` | Keep production generation disabled until human approval, monitoring, rollback owner, and safe test data are ready |
| `/api/ai/reply` remains legacy staff-gated | `Medium` | `Product/Engineering` | Plan a separate safety-chain rollout for replies after summary path stabilizes |
| Production membership-aware operational RLS remains `NO-GO` | `High` | `Product/Security` | Do not treat this AI QA as production RLS approval |

## Sign-Off

| Role | Name | Date/time | Decision | Conditions |
|---|---|---|---|---|
| QA operator | `Codex` | `2026-06-27T12:02:57-05:00` | `Pass for local non-production route/test harness` | `No production flags, data, migrations, /api/ai/reply changes, or RLS changes` |
| Technical owner | `Codex local review` | `2026-06-27T12:02:57-05:00` | `Pass for implementation-level gate sequence` | `Requires live non-production staff QA before production consideration` |
| Security/data owner | `Codex local review` | `2026-06-27T12:02:57-05:00` | `Pass for no-live-data test harness` | `No secrets/private data recorded` |
| Product owner | `Prompt approval in current session` | `2026-06-27` | `Approved non-production execution, not production enablement` | `Non-production only` |
| Rollback owner | `Codex` | `2026-06-27T12:02:57-05:00` | `Rollback verified for test environment` | `Flags cleared and legacy path restored` |

Final decision:

- `GO_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN_TEST_HARNESS`
- `NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN`

## Final Outcome

- Current outcome: `All /api/ai/summary safety-chain QA gates passed in the non-production local route/test-harness environment: flag-off legacy regression, base safety runtime, audit-write approval, safe-response exposure, safety-chain generation, cross-parish/forged-active-parish denial, unauthenticated family-style denial, monitoring review, and rollback`
- Current recommendation: `Run browser-authenticated non-production QA with safe staff credentials and safe request records before considering production AI summary safety-chain enablement`
