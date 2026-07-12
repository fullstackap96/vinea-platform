# Membership-Aware Operational RLS Production Owner And Fixture Capture Form - 2026-06-29

Status: Capture form prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, and no secrets were exposed while preparing this form.

## Purpose

This form is the single, non-secret intake sheet for the human information still blocking membership-aware operational RLS production approval.

Use this before asking for final production approval. It combines the missing owner, fixture, monitoring, support, rollback, and evidence-storage inputs from the existing production readiness packet into one place.

This form does not approve production execution. It exists to collect the values that the existing production readiness documents require.

## Source Documents

- Owner/sign-off capture packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md`
- Smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`
- Smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Final go/no-go checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- Final readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Support communication note: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`
- Blocker register: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md`

## Current Decision

Current decision: `NO-GO`

Reason: required production owners, production-safe smoke fixtures, rollout window, monitoring channel, rollback owner, support owner, evidence storage owner, and explicit product-owner approval are not yet recorded as complete.

## Forbidden Content

Do not paste or store any of the following in this form:

- Passwords.
- Database URLs or connection strings.
- Supabase service-role keys or anon keys.
- OAuth client secrets, access tokens, refresh tokens, or authorization codes.
- OpenAI API keys.
- Raw family portal tokens or token hashes.
- Signed document URLs.
- Private document contents.
- Internal note bodies.
- AI prompts, AI raw outputs, or AI private audit payloads.
- Sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents.
- Google Calendar event ids, calendar ids, or real parish calendar data unless explicitly approved for a separate safe non-production evidence record.

Record only safe labels, named owners, approved channels, and redacted evidence locations.

## Required Human Owners

Every owner row must be `COMPLETE` before production RLS can move from this capture step to final review.

| Role | Named person | Backup/contact path | Evidence reviewed | Decision | Status |
|---|---|---|---|---|---:|
| Product owner | `PENDING` | `PENDING` | Final readiness, blocker register, fixture plan | `PENDING` | `INCOMPLETE` |
| Technical owner | `PENDING` | `PENDING` | Forward migration, rollback draft, commands, health checks | `PENDING` | `INCOMPLETE` |
| QA owner | `PENDING` | `PENDING` | Disposable QA, shared QA, browser smoke evidence, fixture plan | `PENDING` | `INCOMPLETE` |
| Security/data owner | `PENDING` | `PENDING` | Cross-parish denial, document privacy, family portal safety, redaction | `PENDING` | `INCOMPLETE` |
| Rollback owner | `PENDING` | `PENDING` | Rollback SQL, rollback deadline, rollback verification | `PENDING` | `INCOMPLETE` |
| Monitoring owner | `PENDING` | `PENDING` | Health, auth, 403/404, storage, family portal, support signals | `PENDING` | `INCOMPLETE` |
| Support owner | `PENDING` | `PENDING` | Support note, escalation path, customer communication boundaries | `PENDING` | `INCOMPLETE` |
| Evidence storage owner | `PENDING` | `PENDING` | Storage location, redaction rules, retention expectations | `PENDING` | `INCOMPLETE` |

Allowed decisions:

- `Approve`
- `Approve with conditions`
- `Hold`
- `Reject`

Any `PENDING`, `Hold`, or `Reject` keeps the rollout at `NO-GO`.

## Required Production-Safe Fixtures

Every fixture must be synthetic, reversible, non-sensitive, and approved by product, QA, and security/data owners.

| Fixture | Safe value or label | Owner | Safety approval | Cleanup plan | Status |
|---|---|---|---|---|---:|
| Staff account email or safe identifier | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Staff account has membership in active parish | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Active parish display name | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Active parish id, only if safe to record | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Cross-parish denial parish or substitute | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Same-parish request safe label | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Cross-parish denied request safe label | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Workflow step safe label | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Staff-facing test document content label | `Vinea production RLS smoke test staff document - synthetic file only` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Family-facing test document content label | `Vinea production RLS smoke test family document - synthetic file only` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Family portal token creation plan | `PENDING - do not paste token` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Family portal token deactivation plan | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |
| Evidence redaction plan | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `INCOMPLETE` |

## Production Rollout Window Inputs

| Field | Required value | Current value |
|---|---|---:|
| Proposed rollout date/time window | Named low-traffic window | `PENDING` |
| Rollback decision deadline | Named time before rollout begins | `PENDING` |
| Product owner available during window | `YES` | `PENDING` |
| Technical owner available during window | `YES` | `PENDING` |
| Rollback owner available during window | `YES` | `PENDING` |
| Monitoring owner/channel active during window | `YES` | `PENDING` |
| Support owner reachable during window | `YES` | `PENDING` |
| Evidence storage owner confirms destination | `YES` | `PENDING` |

## Evidence Storage Inputs

| Field | Required value | Current value |
|---|---|---:|
| Evidence storage location | Safe internal link or folder label, no secrets | `PENDING` |
| Screenshot redaction owner | Named owner | `PENDING` |
| Command output redaction owner | Named owner | `PENDING` |
| Evidence retention expectation | Named retention expectation | `PENDING` |
| Private data exclusion acknowledged | `YES` | `PENDING` |

## Completion Checklist

All items must be `COMPLETE` before this form can be copied into the final go/no-go review.

| Check | Required status | Current status |
|---|---:|---:|
| Every required human owner is named | `COMPLETE` | `INCOMPLETE` |
| Every owner has a backup/contact path | `COMPLETE` | `INCOMPLETE` |
| Every owner decision is approve or approve-with-conditions | `COMPLETE` | `INCOMPLETE` |
| Every production-safe fixture is selected | `COMPLETE` | `INCOMPLETE` |
| Product, QA, and security/data owners approve fixture safety | `COMPLETE` | `INCOMPLETE` |
| Family portal token plan avoids storing raw tokens | `COMPLETE` | `INCOMPLETE` |
| Cleanup/deactivation plan is recorded | `COMPLETE` | `INCOMPLETE` |
| Rollout window and rollback deadline are recorded | `COMPLETE` | `INCOMPLETE` |
| Monitoring channel and owner are recorded | `COMPLETE` | `INCOMPLETE` |
| Support owner and escalation path are recorded | `COMPLETE` | `INCOMPLETE` |
| Evidence storage owner and location are recorded | `COMPLETE` | `INCOMPLETE` |
| Redaction rules are acknowledged | `COMPLETE` | `INCOMPLETE` |
| Production target identities can be recorded without secrets | `COMPLETE` | `INCOMPLETE` |
| Final checks will be run on the production-intended commit | `COMPLETE` | `INCOMPLETE` |
| Product owner will provide separate explicit production approval | `COMPLETE` | `INCOMPLETE` |

## Hard Stop Conditions

Do not proceed to production RLS approval if any of these are true:

- Any required owner is unnamed.
- Any owner decision is `PENDING`, `Hold`, or `Reject`.
- Any fixture uses a funeral, pastoral, canonical, private family, or real private document scenario.
- Any evidence requires passwords, connection strings, service-role keys, raw tokens, token hashes, signed URLs, private documents, internal notes, AI notes, private audit payloads, or customer secrets.
- Rollout window, monitoring owner/channel, rollback owner, support owner, or evidence storage owner is missing.
- Production target identity cannot be recorded without secrets.
- The product owner has not issued a separate explicit production approval prompt.

## Final Capture Decision

Allowed decisions:

- `READY_FOR_FINAL_GO_NO_GO_REVIEW`
- `NO_GO_MISSING_OWNER`
- `NO_GO_MISSING_FIXTURE`
- `NO_GO_MISSING_MONITORING_OR_SUPPORT`
- `NO_GO_MISSING_ROLLOUT_OR_ROLLBACK`
- `NO_GO_FORBIDDEN_CONTENT_PRESENT`
- `HOLD_FOR_PRODUCT_OWNER_DECISION`

Current decision: `NO_GO_MISSING_OWNER`

## What Changed Plain English

This form gives Vinea one safe place to collect the human names, safe test records, monitoring plan, support owner, rollback owner, and evidence location needed before a future production database-security rollout. It keeps passwords, tokens, private parish data, and real sensitive records out of the planning document.
