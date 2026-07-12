# Membership-Aware Operational RLS Production Support Communication Note - 2026-06-27

Status: Communication note prepared only. No customer communication was sent, production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this note.

## Purpose

This note prepares Vinea support, product, and engineering for customer-facing questions during a future membership-aware operational RLS production rollout.

It is not a production approval, not an incident declaration, not legal advice, and not permission to apply production RLS.

Use this note only after the production rollout has been separately approved through:

- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`

## Communication Boundaries

Do not include in support notes, screenshots, or customer messages:

- Passwords.
- Session cookies.
- Supabase service role keys.
- Database URLs.
- Raw family portal tokens.
- Signed document URLs.
- Token hashes.
- Private document contents.
- Internal note bodies.
- AI notes or AI prompts.
- Audit payload details that reveal private records.
- Other parish names or cross-parish object identifiers unless approved by the security/data owner.

Do not claim:

- Production diocesan readiness.
- A completed incident investigation.
- A breach or no-breach conclusion.
- Certification, compliance, or legal conclusions.
- Root cause before engineering/security review is complete.

## Internal Support Brief

Use this internally before the rollout window.

```text
Subject: Internal support brief - Vinea membership-aware RLS rollout

Vinea is preparing a controlled production rollout of membership-aware operational RLS. This changes how the database enforces parish membership for operational records.

Expected customer-visible behavior:
- Staff should continue seeing only records for parishes they are authorized to access.
- Staff with multiple authorized parishes should use the active parish context as expected.
- Family portal document access should remain limited to token-scoped family-facing request details and required document uploads.

Do not ask customers to test with sensitive real parishioner data.
Do not request passwords, raw family portal tokens, signed URLs, or private document contents.

Escalate immediately if a parish reports:
- Staff can see another parish's records.
- Staff cannot see records they could access before.
- Request detail, documents, or family portal routes show unexpected 403/404 errors.
- Family portal shows internal notes, AI notes, audit logs, staff-only fields, token hashes, signed URLs, or private parish data.
- Document upload, signed URL access, or direct storage privacy behaves unexpectedly.
```

## Customer Holding Reply - Permission Or Missing Data Report

Use this when a parish reports access, missing record, request detail, document, or family portal behavior and the issue is still under investigation.

```text
Subject: We are checking your Vinea access report

Hello [Name],

Thank you for reporting this. We are reviewing the Vinea access behavior you described involving [brief area: request detail / documents / family portal / parish selection].

Please do not send passwords, private documents, family portal tokens, or screenshots that include sensitive parishioner information. If a screenshot is helpful, please redact names and private details first.

What would help us investigate:
- The page or workflow where you noticed the issue.
- The approximate time it happened.
- The parish you expected to be working in.
- Whether the issue is missing access, unexpected access, or an error message.

We are checking this carefully and will follow up by [time/time zone] or sooner if we have an update.

The Vinea Team
```

## Customer No-Impact / Resolved Reply

Use this after investigation confirms either expected behavior or a resolved issue with no data exposure.

```text
Subject: Update on your Vinea access report

Hello [Name],

We completed our review of the access behavior you reported involving [brief area].

Outcome:
- Data exposure found: [No / Pending approved language]
- Current status: [Expected behavior / Resolved / Monitoring]
- Customer action needed: [None / Specific action]

What we checked:
- Staff authorization and parish membership.
- Active parish context.
- Request/document access, if applicable.
- Family portal behavior, if applicable.
- Relevant audit and error observations.

Thank you for flagging this. Please contact us if you notice anything else unusual.

The Vinea Team
```

## Customer Escalation Notice - Possible Exposure

Use this only with incident commander and security/data owner approval.

```text
Subject: Vinea is reviewing a possible access issue

Hello [Name],

We are reviewing a possible access issue involving [brief area]. We are still confirming the facts and do not want to speculate before the review is complete.

What we know right now:
- Area under review: [request access / documents / family portal / parish context]
- Current status: [investigating / contained / monitoring]
- Parish action needed right now: [none / specific action]
- Next update: [time/time zone]

Please do not send passwords, family portal tokens, signed URLs, or private document contents by email.

We are preserving relevant audit evidence and will provide another update as soon as we can share confirmed information.

The Vinea Team
```

## Support Triage Matrix

| Reported symptom | First check | Escalation owner | Rollback relevance |
|---|---|---|---|
| Staff cannot sign in | Auth status, staff user active flag, session state | Technical owner | Rollback only if correlated with rollout |
| Staff can sign in but dashboard is empty | Active parish context, parish membership, request list filter | Technical owner and QA owner | Possible rollback if widespread after rollout |
| Staff sees another parish's record | Request/record parish, membership, RLS policy evidence | Security/data owner immediately | Rollback candidate |
| Request detail returns 403/404 unexpectedly | Active parish cookie, request parish, staff membership | Technical owner | Rollback candidate if production-safe smoke also fails |
| Document list/upload/signed URL fails | Request document route, storage path, RLS policy, signed URL route | Technical owner and QA owner | Rollback candidate if route regression |
| Direct storage access succeeds without signed URL | Storage privacy check | Security/data owner immediately | Rollback candidate and incident escalation |
| Family portal exposes internal data | Portal page/API response, token scope, document step ownership | Security/data owner immediately | Rollback candidate and incident escalation |
| Family upload fails | Token status, workflow step, document route | QA owner | Rollback if widespread |
| Settings/reports/search shows wrong parish data | Active parish context, membership, loader scope | Security/data owner and technical owner | Rollback candidate |

## Evidence To Collect

Record without secrets:

- Reporter name and parish.
- Time and timezone.
- Page or API route.
- Expected behavior.
- Actual behavior.
- Active parish selected, if known.
- Safe request/document/record identifier, if approved to record.
- HTTP status code.
- Screenshot with names/private details redacted, if needed.
- Audit event timestamp and event type, without private payloads.
- Whether the issue reproduces with production-safe smoke data.
- Whether rollback criteria are met.

## Rollback Escalation Triggers

Escalate to rollback owner immediately if any of these are reported and confirmed or strongly suspected:

- Cross-parish record visibility.
- Family portal staff-only data visibility.
- Direct storage access without approved signed URL flow.
- Widespread staff loss of access to valid same-parish requests or documents.
- Sustained spike in request/document 403 or 404 after rollout.
- Sustained Supabase policy errors tied to membership-aware RLS.
- Monitoring owner or rollback owner cannot be reached during the rollout window.

## Approval Before Sending Customer Messages

| Message type | Required approval |
|---|---|
| Routine acknowledgement for missing access or error report | Customer support owner |
| Holding reply for possible access issue | Customer support owner and technical owner |
| Possible exposure notice | Incident commander and security/data owner |
| Resolution or no-impact reply | Customer support owner and technical owner; security/data owner if exposure was suspected |
| Diocese or cluster coordination | Product owner, customer support owner, and security/data owner |

## Final Outcome

- Current outcome: `Production support communication note prepared; no customer communication sent`
- Current recommendation: `Do not apply production RLS until sign-offs, smoke-test data, rollout evidence ownership, support readiness, and explicit product-owner approval are complete`

## What Changed Plain English

This note gives the Vinea team safe words and escalation steps for the future production RLS rollout. If a parish says records are missing, documents are not loading, or the family portal looks wrong, support will know what to ask, what not to ask for, who to escalate to, and when rollback should be considered.
