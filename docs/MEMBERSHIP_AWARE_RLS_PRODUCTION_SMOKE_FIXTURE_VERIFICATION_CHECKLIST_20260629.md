# Membership-Aware Operational RLS Production Smoke Fixture Verification Checklist - 2026-06-29

Status: Fixture verification checklist prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this checklist.

## Purpose

Use this checklist during a future approved production rollout to map the safe fixture labels from `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` to the exact evidence that must be captured.

This checklist does not approve production work. It does not identify real production records. It only defines what evidence must exist later before the production RLS rollout can be considered verified.

## Source Inputs

- Filled intake checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`
- Validation gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md`
- Final approval prompt template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md`
- Smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`

## Safety Boundaries

Do not use this checklist to access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

Do not paste:

- Passwords.
- Database URLs or connection strings.
- Supabase service-role keys or anon keys.
- OAuth secrets, access tokens, refresh tokens, authorization codes, or Google Calendar ids.
- OpenAI API keys.
- Raw family portal tokens, token hashes, or signed document URLs.
- Private document contents, internal note bodies, AI prompts, AI outputs, or private audit payloads.
- Sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents.

Allowed evidence labels:

- HTTP status codes.
- Health-check booleans.
- Safe fixture labels.
- Redacted screenshot labels.
- Redacted command-output labels.
- Audit event names and timestamps without private payloads.
- Confirmation that a raw secret was not recorded.
- Confirmation that cleanup happened.

## Fixture-To-Evidence Map

Every row below must be completed during the future approved rollout window before production RLS can be considered smoke-verified.

| Safe fixture label | Required evidence during rollout | Pass criteria | Cleanup / redaction evidence |
|---|---|---|---|
| `Production RLS Smoke Staff Account - no password recorded` | Staff sign-in result, dashboard load result, membership in active parish confirmed by safe label, least-privilege role label | Staff can sign in, access dashboard, and is authorized only for expected parish scope | No password recorded; sign-out or session cleanup noted |
| `Production RLS Smoke Parish A` | Active parish selector or active parish context evidence; `vinea_active_parish_id` presence recorded as a redacted/boolean observation | Selected parish context is present and matches the intended safe parish label | Active parish id redacted unless approved; no unrelated parish data visible |
| `REDACTED` active parish id | Evidence that id was intentionally redacted | Evidence preserves privacy while confirming selected parish behavior | Screenshots/output redact raw ids if required by security/data owner |
| `Production RLS Denial Parish B` | Cross-parish denial setup note and expected denied parish label | Smoke staff user is not authorized for the denied parish or documented substitute | No denied parish private details or object ids recorded |
| `Production RLS Smoke Request A - non-sensitive` | Request detail HTTP result, request list visibility result, safe request type label, same-parish ownership confirmation | Same-parish request detail loads for authorized staff and does not show unauthorized/login shell | Restore request status, assignment, follow-up, or notes only if changed |
| `Production RLS Denied Request B - generic denial expected` | Request detail denial result, document route denial result, search/report absence result | Denied request returns generic denied/not-found behavior and does not leak object existence or private data | No denied request id, private parish data, or parishioner details stored |
| `Production RLS Smoke Workflow Step - document safe` | Workflow step appears on same-parish request; owner type and family-facing/document-safe status recorded by safe label | Step can be used for staff/family document smoke without exposing staff-only content | Restore step status if changed |
| `Vinea production RLS smoke test staff document - synthetic file only` | Staff upload result, document list result, signed URL route result, signed URL fetch result, direct storage denial result | Staff upload works, authorized signed URL access works, direct storage access is denied | Delete or explicitly retain harmless synthetic document; redact signed URL |
| `Vinea production RLS smoke test family document - synthetic file only` | Family upload result, staff document visibility result, family-facing document scope evidence | Family upload is tied only to token-scoped request and staff can see the uploaded safe file | Delete or explicitly retain harmless synthetic document; redact file path if needed |
| `Create during smoke window; do not record raw token; deactivate immediately after smoke` | Portal token creation result, no `token_hash` exposure result, clean-session portal load result, token deactivation/expiration result | Raw token is used only during the smoke window, not stored in docs/chat/screenshots/logs, and token is deactivated or expiration is confirmed | Token redaction confirmation and deactivation/expiration evidence |
| `Delete synthetic docs, deactivate token, restore request status if changed` | Cleanup checklist completion note, cleanup owner, timestamp, unresolved cleanup exceptions | Synthetic docs, portal token, request status, workflow step status, assignment, and follow-up are cleaned up or explicitly retained as harmless | Redacted cleanup evidence stored in approved evidence location |

## Required Route And Data-Safety Evidence

Capture safe pass/fail notes for each item:

| Area | Evidence required | Pass criteria |
|---|---|---:|
| `/api/health` before apply | HTTP status, `ok`, `checks.schema`, `checks.supabase` | HTTP `200`, `ok: true`, `checks.schema: true`, `checks.supabase: true` |
| `/api/health` after apply | HTTP status, `ok`, `checks.schema`, `checks.supabase` | HTTP `200`, `ok: true`, `checks.schema: true`, `checks.supabase: true` |
| Request detail | Same-parish request detail result and cross-parish denied result | Same-parish loads; cross-parish is generic denied/not-found |
| Request documents | Same-parish document list/upload/signed URL result and cross-parish document denial result | Authorized staff succeeds; unauthorized/cross-parish route denies generically |
| Direct storage privacy | Direct storage access attempt result | Direct storage access is denied |
| Family portal | Clean-session portal load, safe family-facing fields, upload result | Portal shows only token-scoped family-facing data |
| Family portal exclusions | Internal notes, staff-only notes, AI notes, audit logs, token hashes, private parish data | All absent |
| Search/report visibility | Same-parish visibility and cross-parish absence | Same-parish safe records visible; denied request absent |
| Audit evidence | Audit event names/timestamps only, no private payloads | Events exist where expected and contain no secret/private data in stored evidence |
| Monitoring | 30-minute observation for health/auth/request/document/family portal/RLS errors | No unexplained spike or privacy/access issue |

## Redaction Rules For Evidence

Redact or omit:

- Raw production ids unless the security/data owner explicitly approves safe recording.
- Parishioner names.
- Family names.
- Email addresses except approved staff fixture labels.
- Phone numbers.
- Addresses.
- Family portal raw tokens.
- Token hashes.
- Signed URLs.
- Session cookies.
- Database URLs.
- Service-role keys.
- Private document contents.
- Internal notes.
- AI notes or raw AI outputs.
- Audit payload details containing private data.
- Google Calendar ids or event ids.

## Completion Table For Future Rollout

Use this table during the future approved production rollout. Leave it blank until then.

| Verification item | Result | Evidence label | Cleanup complete | Owner initials |
|---|---|---|---|---|
| Staff account fixture verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Active parish fixture verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Cross-parish denial parish/substitute verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Same-parish request fixture verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Cross-parish denied request verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Workflow step fixture verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Staff synthetic document verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Family synthetic document verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Family portal token lifecycle verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Cleanup and redaction verified | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

## Hard Stops

Do not proceed with production RLS verification if any of these occur:

- The staff account cannot sign in.
- The active parish cannot be selected or confirmed.
- Same-parish request detail fails unexpectedly.
- Cross-parish request/document access reveals private data or object existence beyond generic denied/not-found behavior.
- Staff document upload, signed URL, or direct storage privacy behaves unexpectedly.
- Family portal exposes internal notes, staff-only notes, AI notes, audit logs, token hashes, signed URLs, or private parish data.
- Raw family portal token, token hash, signed URL, database URL, service-role key, OAuth token, private document content, or private parish data appears in evidence.
- Cleanup cannot be completed or intentionally deferred with named owner approval.
- Monitoring shows a health, auth, request, document, family portal, or RLS/policy error spike.

## Current Decision

Current decision: `CHECKLIST_READY_FOR_FUTURE_APPROVED_ROLLOUT`

This means the evidence checklist is ready. It does not mean production fixtures have been verified, production has been accessed, or production RLS has been approved.

## What Changed Plain English

This checklist explains what proof to collect later for each safe test label. It tells the rollout operator what should be screenshotted, checked, redacted, cleaned up, and treated as a stop sign. It helps make the future production RLS smoke test safer without touching production today.
