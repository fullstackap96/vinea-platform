# AI Summary Browser-Authenticated Fixture Rerun Evidence - 2026-06-27

Last Updated: 2026-06-27

## Status

Status: Completed as the production-readiness follow-up to the browser-authenticated `/api/ai/summary` safety-chain QA run. This rerun created confirmed safe non-production fixtures for the two weak spots from the prior evidence: a real cross-parish denied request and a valid family portal token tied to a required family document step.

Production was not accessed, production flags were not enabled, no migrations were applied, `/api/ai/reply` was not changed, and operational RLS was not changed.

## Fixture Setup Evidence

| Fixture | Result |
|---|---|
| Supabase target | Shared QA host `gnfomgsuottcuueasfvi.supabase.co` only |
| Same-parish request | Existing safe QA request confirmed |
| Cross-parish request | Safe synthetic request created in a different QA parish |
| Cross-parish request id | `3c11dd96-28bf-40d3-8a65-a5497d8c98d7` |
| Family workflow step | Required `owner_type='family'` workflow step confirmed/created |
| Family workflow step id | `983d76fe-6021-4be9-b437-3c027c8b018b` |
| Family portal token | Valid token created for rerun, raw token not written to repo docs |
| Portal token id | `70d7435b-053e-4ac0-bb6e-cd82165f8ccf` |
| Portal token cleanup | Token revoked after browser rerun |

Notes:

- The first fixture creation attempt created a safe synthetic QA parish/parishioner before stopping on the expected schema correction that `requests` is scoped through `parishioners.parish_id`, not a direct `requests.parish_id` column.
- The successful cross-parish fixture uses the existing request/parishioner scoping model.
- The family workflow-step description was initially too QA-specific and mentioned "AI summary" in family-facing text. It was corrected to neutral family-facing language before the final family portal rerun.

## Browser Rerun Evidence

| Check | Expected | Observed |
|---|---|---|
| `/api/health` before rerun | `checks.schema=true` | Passed: `Status=200`, `checks.schema=true` |
| Confirmed cross-parish request detail route | Staff must not see request details or AI controls | Passed. Route showed generic `Request not found` state for the confirmed cross-parish request. No request details, AI summary controls, source/review scaffolding, audit metadata, prompt/provider/token indicators, signed URL indicators, or token-hash indicators appeared. |
| Valid family portal page | Family-facing page loads required document controls only | Passed after neutralizing fixture wording. Page showed the document portal header, required family document step, and upload controls. It did not show staff navigation, AI controls, source/review scaffolding, audit metadata, prompt/provider/token indicators, signed URL indicators, token-hash indicators, or staff-only data indicators. |
| Token cleanup | Raw portal token should not remain usable after evidence capture | Passed. The portal token row was revoked after the browser check. |

## Safety Boundary Evidence

- Production was not accessed.
- Production flags were not enabled.
- No migrations were applied.
- `/api/ai/reply` was not changed.
- Operational RLS was not changed.
- The local app was started only for non-production browser QA and stopped after the rerun.
- Raw secrets were not printed in command output.
- The raw family portal token was not copied into this document.
- The token was present in the browser URL during the check, as expected for a tokenized portal URL, and was revoked immediately after the run.

## Final Decision

Fixture follow-up result: `PASS`

Production AI summary safety-chain enablement remains: `NO_GO`

Remaining production requirements:

- Named production approval.
- Production-safe smoke-test data.
- Production monitoring owner/channel.
- Production rollback owner.
- Production rollout window and evidence capture.
