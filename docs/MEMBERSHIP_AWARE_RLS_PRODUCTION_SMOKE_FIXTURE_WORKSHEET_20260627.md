# Membership-Aware Operational RLS Production Smoke Fixture Worksheet - 2026-06-27

Status: Fixture worksheet prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this worksheet.

## Purpose

This worksheet captures the exact production-safe fixtures required before membership-aware operational RLS can be considered for production.

It complements, but does not replace:

- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Owner/sign-off capture packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Final readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`

This worksheet does not approve production execution.

## Safety Rules

Do not use:

- A real funeral request.
- A sensitive pastoral situation.
- A canonical case.
- A private family situation.
- Real parishioner private documents.
- A live family portal token for a real family unless explicitly approved for testing.
- Any fixture that would confuse parish staff or families.

Do not record:

- Passwords.
- Service role keys.
- Database URLs.
- Session cookies.
- Raw family portal tokens.
- Signed document URLs.
- Token hashes.
- Private document contents.
- Internal note bodies.
- AI notes.
- Audit payloads that reveal private data.

## Fixture Approval Summary

| Field | Required Value |
|---|---|
| Worksheet owner | `PENDING` |
| Product owner approval to prepare fixtures | `PENDING` |
| Security/data owner approval of fixture safety | `PENDING` |
| QA owner approval of fixture usability | `PENDING` |
| Support owner aware of fixture labels | `PENDING` |
| Evidence storage owner aware of redaction requirements | `PENDING` |
| Final worksheet status | `PENDING_COMPLETE_OR_INCOMPLETE` |

Pass criteria:

- The worksheet is complete before production approval.
- Every fixture is safe, synthetic, and reversible.
- No sensitive production content is copied into this document.

## Staff Account Fixture

| Field | Required Value |
|---|---|
| Staff account email or safe identifier | `PENDING` |
| Staff account owner | `PENDING` |
| Staff role | `PENDING` |
| Staff user is active | `PENDING` |
| Staff user belongs to active parish through membership | `PENDING` |
| Staff user has least privilege needed for smoke | `PENDING` |
| Staff user can sign in before rollout | `PENDING` |
| Staff user can sign out after smoke | `PENDING` |
| Staff user is not a shared password account | `PENDING` |
| MFA/SSO considerations reviewed | `PENDING` |

Pass criteria:

- Staff user can access only expected parish records.
- Staff user is not granted extra production permissions only for convenience.

## Active Parish Fixture

| Field | Required Value |
|---|---|
| Active parish name | `PENDING` |
| Active parish id, if safe to record | `PENDING` |
| Parish membership confirmed for staff user | `PENDING` |
| Parish switcher or active parish selection verified | `PENDING` |
| `vinea_active_parish_id` cookie expected during smoke | `PENDING` |
| No unrelated parish data should be visible | `PENDING` |

Pass criteria:

- The active parish is intentionally selected.
- The smoke proves request detail and document behavior while active parish context is present.

## Same-Parish Request Fixture

| Field | Required Value |
|---|---|
| Request id or safe label | `PENDING` |
| Request type | `PENDING` |
| Request belongs to active parish | `PENDING` |
| Request is non-sensitive and test-safe | `PENDING` |
| Request does not involve funeral, pastoral, canonical, or private family details | `PENDING` |
| Request detail page can be opened by staff user | `PENDING` |
| Request can tolerate temporary staff/family document uploads | `PENDING` |
| Request status restoration plan | `PENDING` |
| Request assignment/follow-up restoration plan, if touched | `PENDING` |
| Request label or note clearly marks it as Vinea production smoke fixture | `PENDING` |

Pass criteria:

- Request is safe for staff workflow, document, and family portal smoke.
- Request can be restored or left harmless after the rollout.

## Cross-Parish Denied Request Fixture

| Field | Required Value |
|---|---|
| Denied request id or safe label | `PENDING` |
| Denied request belongs to a different parish | `PENDING` |
| Smoke staff user must not be authorized for denied request parish | `PENDING` |
| Denied request is non-sensitive and test-safe | `PENDING` |
| Expected request detail result | `Generic denied/not found result` |
| Expected document route result | `Generic denied/not found result` |
| Expected search/report visibility | `Denied request absent` |
| Object existence leak check planned | `PENDING` |

Pass criteria:

- The denied request must not appear in request detail, document routes, search, reports, or related loaders for the smoke staff user.
- Denial evidence must not reveal private data from the other parish.

## Workflow Step Fixture

| Field | Required Value |
|---|---|
| Workflow step id or safe label | `PENDING` |
| Step belongs to same-parish request | `PENDING` |
| Step owner type is family-facing or document-safe | `PENDING` |
| Step can accept temporary test uploads | `PENDING` |
| Step required/optional status understood | `PENDING` |
| Step title is family-safe | `PENDING` |
| Step description is family-safe | `PENDING` |
| Step status restoration plan | `PENDING` |

Pass criteria:

- Step can be shown in the family portal without staff-only or private content.
- Step can be restored after smoke testing.

## Test Document Content

Use synthetic text only.

Staff test upload:

```text
Vinea production RLS smoke test staff document.
Synthetic file only.
No parishioner private data.
Generated for membership-aware RLS production smoke.
Safe to delete after verification.
```

Family test upload:

```text
Vinea production RLS smoke test family upload.
Synthetic file only.
No parishioner private data.
Generated for membership-aware RLS production smoke.
Safe to delete after verification.
```

| Field | Required Value |
|---|---|
| Staff upload filename | `vinea-production-rls-staff-smoke.txt` |
| Family upload filename | `vinea-production-rls-family-smoke.txt` |
| Staff file content contains no real personal data | `PENDING` |
| Family file content contains no real personal data | `PENDING` |
| Upload target request confirmed | `PENDING` |
| Upload target workflow step confirmed | `PENDING` |
| Staff document cleanup decision | `PENDING` |
| Family document cleanup decision | `PENDING` |

## Family Portal Token Plan

| Field | Required Value |
|---|---|
| Token generated only for production-safe same-parish request | `PENDING` |
| Token generated only during approved smoke window | `PENDING` |
| Raw token will not be stored in docs, chat, screenshots, or logs | `PENDING` |
| Token response checked for no `token_hash` exposure | `PENDING` |
| Family portal opened in clean session | `PENDING` |
| Family portal checked for only safe family-facing data | `PENDING` |
| Family upload tied only to token-scoped request | `PENDING` |
| Token revocation or expiration plan | `PENDING` |
| Token cleanup owner | `PENDING` |

Pass criteria:

- Raw token is used only during the approved smoke window.
- Token is revoked or expiration is confirmed after smoke.
- Family portal does not expose internal notes, AI notes, audit logs, token hashes, signed URLs, staff-only fields, or private parish data.

## Cleanup Plan

| Item | Owner | Required Action | Status |
|---|---|---|---|
| Staff test document | `PENDING` | Delete or explicitly retain as harmless smoke evidence | `PENDING` |
| Family test document | `PENDING` | Delete or explicitly retain as harmless smoke evidence | `PENDING` |
| Request status | `PENDING` | Restore if changed | `PENDING` |
| Assignment/follow-up | `PENDING` | Restore if changed | `PENDING` |
| Workflow step status | `PENDING` | Restore if changed | `PENDING` |
| Family portal token | `PENDING` | Revoke or confirm expiration | `PENDING` |
| Browser sessions | `PENDING` | Sign out or close clean sessions | `PENDING` |
| Evidence screenshots/logs | `PENDING` | Redact before storage | `PENDING` |

## Evidence Redaction Rules

Before storing screenshots, logs, or notes, redact:

- Parishioner names unless approved safe fixture labels.
- Family names.
- Email addresses unless approved staff fixture identifier.
- Phone numbers.
- Addresses.
- Family portal raw tokens.
- Token hashes.
- Signed URLs.
- Session cookies.
- Service role keys.
- Database URLs.
- Private document content.
- Internal notes.
- AI notes.
- Audit payload details containing private data.

Evidence may include:

- HTTP status codes.
- Route names.
- Safe fixture labels.
- Redacted screenshots.
- Pass/fail results.
- Health check booleans.
- Audit event names and timestamps without private payloads.
- Confirmation that direct storage access was denied.

## Final Fixture Readiness Decision

| Field | Required Value |
|---|---|
| Staff account fixture complete | `PENDING` |
| Active parish fixture complete | `PENDING` |
| Same-parish request fixture complete | `PENDING` |
| Cross-parish denied request fixture complete | `PENDING` |
| Workflow step fixture complete | `PENDING` |
| Staff/family test document content approved | `PENDING` |
| Family portal token plan approved | `PENDING` |
| Cleanup plan approved | `PENDING` |
| Evidence redaction rules acknowledged | `PENDING` |
| Security/data owner approval | `PENDING` |
| QA owner approval | `PENDING` |
| Product owner approval | `PENDING` |

Allowed decisions:

- `FIXTURES_READY_FOR_PRODUCTION_RLS_APPROVAL_REVIEW`
- `FIXTURES_INCOMPLETE_DO_NOT_APPLY_PRODUCTION_RLS`

Current decision: `FIXTURES_INCOMPLETE_DO_NOT_APPLY_PRODUCTION_RLS`

## Final Outcome

- Current outcome: `Production-safe smoke fixture worksheet prepared; fixtures not selected`
- Current recommendation: `Do not apply production RLS until this worksheet, owner/sign-off capture, rollout evidence ownership, smoke-test checklist, and explicit product-owner approval are complete`

## What Changed Plain English

This worksheet tells the team exactly which safe test records must be chosen before a future production RLS rollout. It keeps the team away from sensitive real parishioner data and makes cleanup clear before anyone touches production.
