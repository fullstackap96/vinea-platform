# AI Summary Browser-Authenticated Non-Production QA Evidence - 2026-06-27

Last Updated: 2026-06-27

## Status

Status: Completed against an explicitly approved local non-production app session at `localhost:3000` using safe QA inputs supplied outside chat. Production flags were not enabled, production was not accessed, no migrations were applied, `/api/ai/reply` was not changed, and operational RLS was not changed.

Secret values, raw prompts, generated summary text, provider payloads, session cookies, raw family portal tokens, signed URLs, document contents, and private token material were not recorded in this evidence.

## Environment Evidence

| Check | Result |
|---|---|
| QA variables rechecked by name only | Passed |
| Values visible to Codex without printing secrets | Passed via ignored `.env.ai-summary-browser-qa.local` |
| Local app URL kind | `localhost` non-production |
| `/api/health` before gate execution | `Status=200`, `checks.schema=true` |
| `/api/ai/reply` | Not changed and not tested in this run |
| Production flags | Not enabled |
| Migrations | Not applied |
| Operational RLS | Not changed |

## Gate Evidence

| Gate | Expected Result | Observed Result |
|---|---|---|
| Gate 0: flag-off legacy regression | Legacy staff-gated summary behavior works; no source/review scaffolding | Passed. Authenticated staff UI completed summary generation with no error, no `ai_retrieval_unavailable`, no source display, no staff-review scaffolding, and no leak indicators. |
| Gate 1: base safety runtime | Controlled fail-closed response before audit write/generation | Passed. Authenticated staff UI showed generic `ai_retrieval_unavailable`, no source display, no staff-review scaffolding, and no leak indicators. |
| Gate 2: audit-write approval | Safe audit metadata may be written; still fail closed before generation | Passed. Authenticated staff UI still failed closed with `ai_retrieval_unavailable`; staff audit log showed `ai.summary.audit_metadata_prepared`; no raw prompt/provider/token/signed-url leak indicators were observed. |
| Gate 3: safe-response exposure | Staff-safe source/review scaffolding may appear; generation remains off | Passed. Authenticated staff UI still failed closed with `ai_retrieval_unavailable`; source/review scaffolding indicators appeared only in the authenticated staff page; no leak indicators were observed. |
| Gate 4: generation approval | Safety-chain generation succeeds only after prior gates | Passed. Authenticated staff UI completed generation with no error, no `ai_retrieval_unavailable`, and no raw prompt/provider/token/signed-url leak indicators. |
| Rollback: flags cleared | Legacy staff-gated behavior restored | Passed. After clearing all safety-chain flags and restarting the local app, authenticated staff UI completed legacy generation with no source/review scaffolding and no leak indicators. |

## Denial And Family-Safety Evidence

| Case | Observed Result |
|---|---|
| Denied/cross-parish request route | Safe denied fixture rendered `Request not found`, did not show request details, did not show AI summary controls, and did not expose AI/internal data indicators. |
| Family portal fixture | Family portal fixture rendered without staff navigation, AI controls, source/review scaffolding, audit metadata, prompt/provider/token indicators, signed URL indicators, or staff-only data indicators. |

## Monitoring And Privacy Evidence

- No production environment was accessed.
- No production feature flags were enabled.
- Local `/api/health` returned `checks.schema=true` during the run and after rollback.
- The browser QA used authenticated staff UI actions rather than unauthenticated public calls.
- Evidence intentionally records response shape and safety indicators only, not generated summary text or private record contents.
- Temporary local QA logs were written under `.tmp/` and are not evidence artifacts.
- `.env.ai-summary-browser-qa.local` is intentionally gitignored and must not be committed.

## Follow-Up Risks

- The denied request fixture behaved safely, but appeared to be a placeholder/invalid UUID rather than a rich real cross-parish record. Before production enablement, repeat the denial case with a confirmed safe request from another parish.
- The family portal fixture behaved safely, but appeared to be a placeholder/invalid token path rather than a valid family portal token with required documents. Before production enablement, repeat the family portal safety case with a valid safe token fixture.
- The browser-authenticated run confirms non-production behavior only. Production AI summary safety-chain enablement remains `NO-GO` until named production approval, production-safe smoke data, monitoring owner, rollback owner, and production rollout evidence are complete.

## Final Decision

Browser-authenticated non-production QA result: `PASS_WITH_FOLLOW_UP_FIXTURES_REQUIRED`

Production AI summary safety-chain enablement: `NO_GO`
