# Membership-Aware Operational RLS Production Final Go/No-Go Review Checklist - 2026-06-27

Status: Final go/no-go review checklist prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this checklist.

## Purpose

This checklist is the final cross-check before any future production approval for membership-aware operational RLS.

It does not approve production execution. It exists to prove that every separate production-readiness artifact agrees before the product owner is asked for a final production decision.

## Source Documents To Cross-Check

Required production approval artifacts:

- Owner/sign-off capture packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md`
- Smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`
- Smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Support communication note: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`

Technical references:

- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Non-Negotiable Scope Rules

The review must stop with `NO_GO_REVIEW_INCOMPLETE` if any of these are false:

- Production access has not started before the final approval prompt.
- No migration has been applied during review.
- Runtime public intake routing is out of scope.
- Runtime feature flags are out of scope.
- Operational RLS is unchanged during review.
- Staff membership data is unchanged during review.
- No unrelated production deployment is bundled into the RLS rollout.
- No secrets, database URLs, service role keys, session cookies, raw portal tokens, signed URLs, token hashes, private documents, internal notes, AI notes, or private audit payloads are copied into approval records.

## Artifact Cross-Check Matrix

Every row must be `COMPLETE` before this review can recommend `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`.

| Artifact | Required evidence | Required status before GO | Current status |
|---|---|---:|---:|
| Owner/sign-off capture packet | Every owner named, backup/contact path present, evidence reviewed, no `Hold` or `Reject` | `COMPLETE` | `INCOMPLETE` |
| Smoke fixture worksheet | Staff account, active parish, same-parish request, cross-parish denied request, workflow step, document content, token plan, cleanup, redaction | `COMPLETE` | `INCOMPLETE` |
| Smoke-test data checklist | Staff account, active parish, safe request, workflow step, documents, token plan, monitoring, cleanup/evidence | `COMPLETE` | `INCOMPLETE` |
| Support communication note | Support owner named, message approvers named, escalation paths confirmed, forbidden-content rules acknowledged | `COMPLETE` | `INCOMPLETE` |
| Rollout evidence template | Evidence owner/storage, target identities without secrets, health, migration output, smoke, monitoring, cleanup, rollback decision | `COMPLETE` | `INCOMPLETE` |
| Final approval readiness record | Current decision can move from `NO-GO` only after all go criteria are true | `GO_READY` | `NO-GO` |
| Rollout/rollback packet | Rollout window, rollback owner, rollback deadline, commands, health checks, smoke steps, rollback criteria | `COMPLETE` | `INCOMPLETE` |
| Sign-off template | Product, technical, QA, security/data, rollback decisions recorded and approved | `COMPLETE` | `INCOMPLETE` |

## Owner And Sign-Off Cross-Check

Required before go:

| Check | Required result | Status |
|---|---|---:|
| Product owner named | `YES` | `PENDING` |
| Technical owner named | `YES` | `PENDING` |
| QA owner named | `YES` | `PENDING` |
| Security/data owner named | `YES` | `PENDING` |
| Rollback owner named and reachable | `YES` | `PENDING` |
| Monitoring owner named and channel active | `YES` | `PENDING` |
| Support owner named and escalation path ready | `YES` | `PENDING` |
| Evidence storage owner named and storage location ready | `YES` | `PENDING` |
| Every approval decision is approve or approve-with-conditions | `YES` | `PENDING` |
| Every approval condition is satisfied before execution | `YES_OR_NOT_APPLICABLE` | `PENDING` |

Hard stop:

- Any missing owner, missing backup/contact path, `PENDING`, `Hold`, or `Reject` keeps the review at `NO_GO_REVIEW_INCOMPLETE`.

## Fixture And Smoke-Test Cross-Check

Required before go:

| Check | Required result | Status |
|---|---|---:|
| Staff account is production-safe and least-privilege | `YES` | `PENDING` |
| Active parish is intentionally selected and staff membership is confirmed | `YES` | `PENDING` |
| Same-parish request is safe, reversible, and not sensitive | `YES` | `PENDING` |
| Cross-parish denied request is safe and proves generic denial/no leak | `YES` | `PENDING` |
| Workflow step is family-facing or document-safe | `YES` | `PENDING` |
| Staff test document content is synthetic | `YES` | `PENDING` |
| Family test document content is synthetic | `YES` | `PENDING` |
| Family portal token plan avoids raw token storage | `YES` | `PENDING` |
| Cleanup plan covers documents, request state, workflow step, token, sessions, and evidence | `YES` | `PENDING` |
| Evidence redaction rules are acknowledged | `YES` | `PENDING` |

Hard stop:

- Any fixture involving a funeral, sensitive pastoral situation, canonical case, private family situation, real private document, or confusing parish workflow keeps the review at `NO_GO_REVIEW_INCOMPLETE`.

## Support And Monitoring Cross-Check

Required before go:

| Check | Required result | Status |
|---|---|---:|
| Support communication note owner is named | `YES` | `PENDING` |
| Support message approvers are named | `YES` | `PENDING` |
| Support escalation paths are known | `YES` | `PENDING` |
| Monitoring owner and channel are named | `YES` | `PENDING` |
| Monitoring covers `/api/health` | `YES` | `PENDING` |
| Monitoring covers sign-in failures | `YES` | `PENDING` |
| Monitoring covers request/document `403` and `404` spikes | `YES` | `PENDING` |
| Monitoring covers family portal errors | `YES` | `PENDING` |
| Monitoring covers broad Supabase RLS/policy errors | `YES` | `PENDING` |
| Rollback escalation triggers are understood | `YES` | `PENDING` |

Hard stop:

- Missing monitoring, unavailable support owner, unclear escalation paths, or support instructions that ask for forbidden sensitive content keeps the review at `NO_GO_REVIEW_INCOMPLETE`.

## Rollout Evidence And Rollback Cross-Check

Required before go:

| Check | Required result | Status |
|---|---|---:|
| Evidence owner is named | `YES` | `PENDING` |
| Evidence storage location is ready | `YES` | `PENDING` |
| Production app host can be recorded without secrets | `YES` | `PENDING` |
| Production database host can be recorded without credentials | `YES` | `PENDING` |
| Rollout window is chosen | `YES` | `PENDING` |
| Rollback decision deadline is chosen | `YES` | `PENDING` |
| Rollback owner is present during rollout window | `YES` | `PENDING` |
| Forward migration command is reviewed | `YES` | `PENDING` |
| Rollback SQL command is reviewed | `YES` | `PENDING` |
| Pre-apply health check path is ready | `YES` | `PENDING` |
| Post-apply health check path is ready | `YES` | `PENDING` |
| Active-parish-cookie request/document smoke steps are ready | `YES` | `PENDING` |
| Family portal safety smoke steps are ready | `YES` | `PENDING` |
| Direct storage privacy smoke step is ready | `YES` | `PENDING` |
| Cleanup/deactivation steps are ready | `YES` | `PENDING` |

Hard stop:

- Missing rollback owner, missing rollback SQL review, missing evidence storage, or unclear production target identity keeps the review at `NO_GO_REVIEW_INCOMPLETE`.

## Final Automated Check Cross-Check

These must run on the exact production-intended commit before the final production approval prompt:

| Check | Required command | Required result | Status |
|---|---|---:|---:|
| Test suite | `npm.cmd test` | `PASS` | `PENDING` |
| Lint | `npm.cmd run lint` | `PASS_WITH_NO_ERRORS` | `PENDING` |
| Build | `npm.cmd run build` | `PASS` | `PENDING` |

Hard stop:

- Any failing test, lint error, or build failure keeps the review at `NO_GO_REVIEW_INCOMPLETE`.

## Final Review Decision

Allowed decisions:

- `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`
- `NO_GO_REVIEW_INCOMPLETE`
- `NO_GO_MISSING_OWNER`
- `NO_GO_MISSING_FIXTURE`
- `NO_GO_MISSING_SMOKE_DATA`
- `NO_GO_MISSING_SUPPORT_OR_MONITORING`
- `NO_GO_MISSING_ROLLOUT_OR_ROLLBACK`
- `NO_GO_FINAL_CHECKS_NOT_RUN`
- `NO_GO_SCOPE_DRIFT`

Current decision: `NO_GO_REVIEW_INCOMPLETE`

## Product Owner Approval Boundary

Even if this checklist reaches `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`, production still must not be touched until the product owner gives a separate explicit production approval prompt naming:

- The production target.
- The approved rollout window.
- The approved production-intended commit or release.
- The named rollback owner.
- The named monitoring owner/channel.
- Confirmation that public intake runtime routing and unrelated deployments remain out of scope.
- Confirmation that the final readiness record decision is `GO`.

## Final Outcome

- Current outcome: `Final go/no-go review checklist prepared; production approval package incomplete`
- Current recommendation: `Do not apply production RLS until this checklist, owner/sign-off packet, smoke fixture worksheet, smoke-test data checklist, support readiness, rollout evidence template, final readiness record, and separate product-owner production approval are complete`

## What Changed Plain English

This checklist is the final safety review before a future production database security rollout. It gathers all the separate readiness documents into one pass/fail review so Vinea does not touch production while owners, test records, support plans, rollback plans, monitoring, or final approvals are still missing.
