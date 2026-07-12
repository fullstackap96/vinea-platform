# Membership-Aware Operational RLS Production Smoke-Test Data Checklist - 2026-06-26

Status: Checklist prepared only. Production was not accessed, no migrations were applied, and runtime behavior was not changed.

## Purpose

This checklist defines the exact production-safe test data and monitoring readiness needed before any production approval for membership-aware operational RLS.

Related docs:

- Production smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production readiness gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- Promotion readiness checklist: `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`

## Safety Rules

- Do not use real parishioner private documents.
- Do not use a request involving a sensitive pastoral, funeral, canonical, or private family situation.
- Do not create a family portal token for a real family unless the family has explicitly agreed to testing.
- Prefer a clearly marked internal test request owned by an authorized staff/test account.
- Keep all test file content synthetic and harmless.
- Do not store passwords, service role keys, database URLs, or raw portal tokens in this checklist.
- Do not bundle runtime public intake routing or unrelated deployment work into this production RLS smoke.

## Required Production-Safe Staff Account

Record before approval:

| Field | Required value |
|---|---|
| Staff account email | `PENDING` |
| Staff account owner | `PENDING` |
| Account is authorized for active parish | `PENDING` |
| Account has least privilege needed for smoke | `PENDING` |
| Account can sign in before rollout | `PENDING` |
| Account can sign out after smoke | `PENDING` |
| Account is not a shared password account | `PENDING` |
| MFA/SSO implications understood | `PENDING` |

Pass criteria:

- Staff user can sign in before rollout.
- Staff user belongs to the target active parish through the approved production membership path.
- Staff user can open dashboard and request list before rollout.
- Staff user is not granted broader access only for convenience.

## Required Active Parish

Record before approval:

| Field | Required value |
|---|---|
| Active parish name | `PENDING` |
| Active parish ID, if safe to record | `PENDING` |
| Staff user is authorized for this parish | `PENDING` |
| Parish switcher or active parish selection path verified | `PENDING` |
| `vinea_active_parish_id` cookie can be present during smoke | `PENDING` |
| No unrelated parish data should be visible | `PENDING` |

Pass criteria:

- The smoke can prove request detail/document behavior with `vinea_active_parish_id` present.
- The active parish is known and intentionally selected.
- The selected parish is not chosen because it has unusually broad test data.

## Required Production-Safe Request

Record before approval:

| Field | Required value |
|---|---|
| Request ID or safe label | `PENDING` |
| Request type | `PENDING` |
| Request belongs to active parish | `PENDING` |
| Request is safe for smoke testing | `PENDING` |
| Request does not involve sensitive pastoral/private details | `PENDING` |
| Request can tolerate a temporary test document | `PENDING` |
| Request status can be safely updated or restored | `PENDING` |
| Staff assignment/follow-up changes are safe or not needed | `PENDING` |

Preferred request shape:

- A dedicated internal test request.
- A non-sensitive public-intake-style request created for staff QA.
- A request whose notes clearly identify it as a Vinea production smoke test.

Do not use:

- A real funeral request.
- A request with sensitive family notes.
- A request that would confuse parish staff or families.
- A request requiring urgent pastoral follow-up.

## Required Workflow Step

Record before approval:

| Field | Required value |
|---|---|
| Workflow step ID or safe label | `PENDING` |
| Step belongs to production-safe request | `PENDING` |
| Step owner type is family-facing or document-safe | `PENDING` |
| Step can accept a temporary test upload | `PENDING` |
| Step required/optional status understood | `PENDING` |
| Step status can be restored after smoke | `PENDING` |

Pass criteria:

- Staff can tie a test document to the step.
- Family portal can show the step without exposing internal content.
- The step title/description does not expose private staff-only notes.

## Safe Document Content

Use synthetic text only.

Staff upload file:

```text
Vinea production RLS smoke test staff document.
Synthetic file only.
No parishioner private data.
Generated for membership-aware RLS production smoke.
```

Family upload file:

```text
Vinea production RLS smoke test family upload.
Synthetic file only.
No parishioner private data.
Generated for membership-aware RLS production smoke.
```

Record before approval:

| Field | Required value |
|---|---|
| Staff upload filename | `vinea-production-rls-staff-smoke.txt` |
| Family upload filename | `vinea-production-rls-family-smoke.txt` |
| File content contains no real personal data | `PENDING` |
| Upload destination request/step confirmed | `PENDING` |
| Post-smoke document cleanup decision | `PENDING` |

## Family Portal Token Plan

Record before approval:

| Field | Required value |
|---|---|
| Token generated only for production-safe request | `PENDING` |
| Token generated during approved smoke window | `PENDING` |
| Raw token will not be stored in docs or chat | `PENDING` |
| Response checked for no `token_hash` exposure | `PENDING` |
| Family portal checked in clean session | `PENDING` |
| Portal page checked for internal notes leakage | `PENDING` |
| Portal token deactivation/expiration plan | `PENDING` |

Pass criteria:

- Portal URL is used only by the tester during the approved smoke window.
- Raw token is not pasted into repo docs or long-lived chat.
- Family portal shows only safe family-facing details.
- Family upload is tied only to the token-scoped request.

## Monitoring Owner And Channel

Record before approval:

| Field | Required value |
|---|---|
| Monitoring owner | `PENDING` |
| Monitoring channel/tool | `PENDING` |
| `/api/health` observation path | `PENDING` |
| Auth failure observation path | `PENDING` |
| Request/document `403` or `404` observation path | `PENDING` |
| Family portal error observation path | `PENDING` |
| Supabase RLS/policy error observation path | `PENDING` |
| Parish staff support contact path | `PENDING` |
| Monitoring duration | `At least 30 minutes after apply` |

Minimum monitoring checks:

- `/api/health` remains `ok: true` and `checks.schema: true`.
- No spike in staff sign-in failures.
- No spike in request detail `403` or `404`.
- No spike in document route `403` or `404`.
- No direct storage privacy failures.
- No family portal exposure or upload failures.
- No broad Supabase RLS errors.

## Cleanup And Evidence Notes

Record before approval:

| Field | Required value |
|---|---|
| Staff test document cleanup plan | `PENDING` |
| Family test document cleanup plan | `PENDING` |
| Request status restoration plan | `PENDING` |
| Workflow step status restoration plan | `PENDING` |
| Portal token deactivation/expiration plan | `PENDING` |
| Evidence owner | `PENDING` |
| Evidence storage location | `PENDING` |
| Screenshots/logs will exclude secrets/tokens | `PENDING` |

Evidence to capture:

- Pre-apply `/api/health`.
- Post-apply `/api/health`.
- Active parish cookie present during request detail/document smoke.
- Request detail page HTTP `200`.
- Staff document upload success.
- Staff signed URL route success.
- Direct storage access denied.
- Family portal token response does not expose `token_hash`.
- Family portal page does not expose internal notes, AI notes, audit logs, token hashes, or private parish data.
- Family upload success.
- Monitoring result.
- Cleanup/deactivation result.

## Final Approval Dependency

Production approval remains blocked until:

- This checklist is completed.
- The production smoke fixture worksheet is completed.
- The production sign-off template has named approvals.
- The rollout/rollback packet has a rollout window and rollback owner.
- Final automated checks pass on the production-intended commit.
- Product owner gives a separate explicit approval to apply production RLS.

## Final Outcome

- Current outcome: `Checklist prepared; production-safe smoke-test data still pending`
- Current recommendation: `Do not apply production RLS`
