# Membership-Aware Operational RLS Production Blocker Register - 2026-06-28

Status: Blocker register prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed while preparing this register.

## Purpose

This register is the short, owner-friendly list of the exact blockers that still keep membership-aware operational RLS at `NO-GO` for production.

It does not approve production execution. It exists so the product owner, technical owner, QA owner, security/data owner, support owner, monitoring owner, rollback owner, and evidence owner can see what must be filled before the final production approval packet can move forward.

## Current Decision

Current decision: `NO-GO`

Reason: production-safe owners, production-safe smoke fixtures, production rollout window, evidence storage, monitoring, rollback ownership, and final production-intended checks are still not complete.

## Completed Evidence Now Available

| Evidence | Source | Status | Notes |
|---|---|---:|---|
| Disposable forward/rollback validation | `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Supports policy correctness before production. |
| Disposable cross-parish allow/deny QA | `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Covers operational tables and deny cases. |
| Disposable route/document/family portal QA | `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md` | `COMPLETE` | Covers route/browser safety before shared QA. |
| Non-production promotion evidence | `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md` | `COMPLETE` | Supports controlled promotion planning. |
| Shared QA promotion and smoke evidence | `docs/VINEA_BUILD_STATUS.md` | `COMPLETE` | Shared QA application, health, workflow, document, and family portal smokes passed. |
| Active-parish selector display verification | `docs/QA_PARISH_SELECTOR_BROWSER_VERIFICATION_20260628.md` | `COMPLETE` | Cleaned QA parish names display correctly and Parish A/B switching works. |
| Production rollout/rollback packet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md` | `PREPARED` | Needs production-specific owner/window values. |
| Final approval readiness record | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md` | `NO-GO` | Remains the authoritative production decision summary. |

## Blocking Items

Every item below must be resolved before the final go/no-go review can become `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`.

| Blocker ID | Category | Required owner | Current status | Exact resolution required |
|---|---|---|---:|---|
| `RLS-PROD-BLOCKER-001` | Product ownership | Product owner | `PENDING` | Named product owner records approval or explicit hold in the sign-off packet. |
| `RLS-PROD-BLOCKER-002` | Technical ownership | Technical owner | `TECHNICAL_APPROVAL_COMPLETE; PRODUCTION OPERATOR PENDING` | Engineering approved the hash-bound forward/rollback candidate for final human go/no-go in `docs/MEMBERSHIP_AWARE_RLS_ENGINEERING_QA_TECHNICAL_APPROVAL_20260711.md`; name the production operator and backup for the rollout window. |
| `RLS-PROD-BLOCKER-003` | QA ownership | QA owner | `NONPRODUCTION_EVIDENCE_ACCEPTED; PRODUCTION SMOKE OWNER PENDING` | QA accepted disposable/shared-QA/active-parish/document/family evidence in the technical approval record; name the production smoke owner and complete approved production-safe smoke evidence. |
| `RLS-PROD-BLOCKER-004` | Security/data ownership | Security/data owner | `PENDING` | Named owner reviews cross-parish denial, document privacy, family portal safety, and evidence redaction rules. |
| `RLS-PROD-BLOCKER-005` | Rollback ownership | Rollback owner | `PENDING` | Named rollback owner confirms availability for the rollout window and ability to execute rollback SQL. |
| `RLS-PROD-BLOCKER-006` | Monitoring ownership | Monitoring owner | `PENDING` | Named owner confirms monitoring channel and watches health, auth, 403/404, storage, and family portal error signals. |
| `RLS-PROD-BLOCKER-007` | Support ownership | Support owner | `PENDING` | Named owner confirms support escalation path and forbidden-content rules. |
| `RLS-PROD-BLOCKER-008` | Evidence ownership | Evidence storage owner | `PENDING` | Named owner confirms where rollout evidence will be stored and how private material will be redacted. |
| `RLS-PROD-BLOCKER-009` | Smoke fixture selection | Product owner + QA owner + security/data owner | `PENDING` | Complete the production-safe smoke fixture worksheet with staff account, active parish, same-parish request, cross-parish denied request, workflow step, document plan, family portal token plan, cleanup, and redaction. |
| `RLS-PROD-BLOCKER-010` | Smoke-test data checklist | QA owner | `PENDING` | Complete the smoke-test data checklist without passwords, raw tokens, signed URLs, database URLs, private documents, internal notes, AI notes, or cross-parish identifiers. |
| `RLS-PROD-BLOCKER-011` | Rollout window | Product owner + technical owner + rollback owner | `PENDING` | Choose production rollout window, rollback decision deadline, and named rollback availability. |
| `RLS-PROD-BLOCKER-012` | Target identity | Technical owner | `PENDING` | Record production app host and database host without credentials or connection strings. |
| `RLS-PROD-BLOCKER-013` | Final checks | Technical owner + QA owner | `PENDING` | Run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build` on the exact production-intended commit. |
| `RLS-PROD-BLOCKER-014` | Pre-apply health | Technical owner | `PENDING` | Confirm production `/api/health` is healthy immediately before any approved rollout. |
| `RLS-PROD-BLOCKER-015` | Explicit product-owner approval | Product owner | `PENDING` | Product owner provides a separate production approval prompt naming target, rollout window, production-intended commit, rollback owner, monitoring owner/channel, and out-of-scope confirmations. |

## Hard Stop Rules

Production must not be touched if any of these are true:

- Any blocker above remains `PENDING`.
- Any owner decision is `Hold` or `Reject`.
- Any production fixture uses a sensitive funeral, pastoral, canonical, private family, or real private document scenario.
- Any evidence record would require copying passwords, database URLs, service role keys, raw family portal tokens, signed URLs, token hashes, private documents, internal notes, AI notes, private audit payloads, or customer secrets.
- Runtime public intake routing, AI production flag enablement, Google Calendar mutation, staff membership data changes, or unrelated deployments are bundled into the RLS rollout.
- The final automated checks are not run on the exact production-intended commit.
- The product owner has not issued a separate explicit production approval prompt.

## Next Safe Action

Recommended next action: fill this blocker register from human-provided owner and fixture selections only. Until those values are supplied, continue non-production tenant-readiness work or trust-center readiness work that does not access production, apply migrations, change operational RLS, mutate Google Calendar data, or expose secrets.

## What Changed Plain English

This is a plain checklist of what is still missing before Vinea can safely consider the production database security rollout. The software evidence is strong, but production still needs named people, safe test records, monitoring, support, rollback, evidence storage, and a final explicit approval.

## Final Outcome

- Current outcome: `Production blocker register prepared`
- Current recommendation: `NO-GO - do not apply production RLS`
