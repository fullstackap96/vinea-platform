# Public Intake Runtime Production Enablement Checklist

Last Updated: 2026-06-26

## Status

Production enablement is not approved. Runtime public intake routing remains disabled by default and may only be enabled in production after every gate in this checklist is satisfied and the product owner records the exact approval decision below.

## Purpose

This checklist defines the production switch-on requirements for public intake runtime routing after safe QA validation has passed. It covers DNS-domain evidence, customer communication, flag rollout, monitoring, rollback, and approval gates.

## Explicit Non-Goals

- Do not enable production runtime public intake routing from this checklist alone.
- Do not apply migrations.
- Do not change operational RLS.
- Do not change public page URLs unless a separate product decision approves it.
- Do not expose raw public tokens, token hashes, DNS verification tokens, DNS verification values, stack traces, SQL errors, or internal routing diagnostics.

## Production Enablement Decision Required

The exact product-owner approval phrase required before switch-on is:

```text
Approve Production Runtime Public Intake Routing
```

Any other approval phrase means production runtime routing remains off.

The production feature flags must remain absent or disabled until that approval is recorded:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

## Required Evidence Before Approval

### 1. Safe QA Evidence

Required evidence:

- QA `/api/health` returned `checks.schema: true` with runtime flags off.
- QA `/api/health` returned `checks.schema: true` with runtime flags on.
- QA `/api/health` returned `checks.schema: true` after rollback by disabling the flags.
- Flag-off Baptism, Wedding, Funeral, OCIA, and Join Parish regression passed.
- Flag-off fake token, domain, slug, and forged staff active parish cookie signals were ignored.
- Flag-on token routing created a request under the expected parish.
- Flag-on verified domain routing created a request under the expected parish.
- Flag-on slug routing created a request under the expected parish.
- Generic error cases passed for deactivated token, deactivated domain, unverified domain, disabled parish, expired token, and mismatched request type.
- Audit metadata included `publicIntakeRouteSource` and `publicIntakeRoutingRuntimeEnabled`.
- Audit metadata did not expose raw tokens, token hashes, DNS verification values, stack traces, or internal diagnostics.
- Rollback by disabling the flags restored legacy behavior.

Evidence reference:

- Latest safe QA run: `docs/VINEA_BUILD_STATUS.md`, section `Public Intake Runtime Routing Safe QA Validation`.
- Production smoke-test evidence must be captured in `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md`.

### 2. DNS-Domain Evidence

Required for each production custom domain before that domain receives real family traffic:

- Parish name and parish id are recorded.
- Hostname is normalized to lowercase and exactly matches the `parish_public_intake_domains.hostname` row.
- Domain row is active.
- Domain row has `verified_at` populated from a successful DNS TXT verification.
- DNS TXT record name and expected value were shown to staff during setup.
- A fresh DNS TXT lookup from an external resolver confirms the expected TXT value before switch-on.
- The domain resolves to the production Vinea app or approved production proxy, not a preview, local, or QA app.
- HTTPS/TLS is valid for the production domain.
- A safe production smoke submission from that domain is routed to the expected parish before the domain is shared broadly.
- The smoke request id, audit event id, route source, and timestamp are recorded.

Fail conditions:

- `verified_at` is missing.
- Domain is inactive.
- DNS TXT lookup does not match.
- Domain points to QA, localhost, a preview deployment, or the wrong production app.
- HTTPS/TLS is invalid.
- Smoke submission routes to the wrong parish.

### 3. Slug And Token Evidence

Required before sharing parish slug links or token links:

- Parish public slug is present, lowercase, unique, and parish-approved.
- `parishes.public_intake_enabled = true` for the intended parish.
- Slug smoke submission routes to the expected parish.
- Public intake token row is active, unexpired, and scoped to the intended request type when request-type scoping is used.
- Token smoke submission routes to the expected parish and request type.
- Deactivated token and mismatched request type still return only `Public intake form is not available.`
- Raw public token is visible only once at creation time and is not copied into docs, tickets, logs, audit metadata, or staff tables.

### 4. Production Health Evidence

Required before and after switch-on:

- `/api/health` returns `ok: true`.
- `/api/health` returns `checks.schema: true`.
- `/api/health` returns `checks.supabase: true`.
- `/api/health` returns `checks.parishes: true`.
- Health response does not expose secrets or SQL diagnostics.

### 5. Staff Workflow Evidence

Required before broad customer rollout:

- Staff can view new public intake requests in dashboard/request lists.
- Staff can open request detail pages.
- Staff can update status, assignment, follow-up date, notes, and workflow steps on routed requests.
- Staff can distinguish route source in audit metadata.
- Existing legacy public forms still work.
- Existing request workflows, document workflows, and family portal access remain unchanged.

## Production Rollout Steps

1. Confirm all approval gates below are signed.
2. Confirm the production deployment being changed is the intended Vercel production environment.
3. Confirm production currently has both runtime flags absent or disabled.
4. Deploy the current reviewed code with runtime flags still disabled.
5. Confirm `/api/health` returns `checks.schema: true`.
6. Submit one legacy public intake smoke test with flags disabled.
7. Enable both exact production runtime flags.
8. Redeploy or restart the production runtime as required by the hosting environment.
9. Confirm `/api/health` still returns `checks.schema: true`.
10. Run production smoke tests in this order:
    - legacy public form path
    - parish slug route
    - verified domain route, if a production domain is approved
    - token route, if a production token is approved
    - generic error case using a deactivated token or inactive domain
11. Confirm each successful smoke request appears in staff dashboards under the expected parish.
12. Confirm each successful smoke request has audit metadata with safe route-source fields.
13. Record smoke request ids, audit event ids, route source, timestamp, and approver.
14. Monitor for at least one business day before broad parish rollout.

## Monitoring Plan

Monitor these signals during the first business day and after each new parish/domain activation:

- `/api/health` status and `checks.schema`.
- Public intake success count by request type.
- Public intake error count by status code, especially `404`, `410`, `429`, and `500`.
- Audit events where `action = public_intake.created`.
- Audit metadata counts by `publicIntakeRouteSource`: `legacy_fallback`, `token`, `domain`, and `slug`.
- Requests created with unexpected parish ids.
- Any `Public intake submission failed` server logs.
- Any public response containing a forbidden value.
- Durable rate-limit `429` volume.
- Staff reports of missing requests or wrong parish assignment.

Escalate immediately if:

- Any request routes to the wrong parish.
- Families see stack traces or internal diagnostics.
- Production `/api/health` reports `checks.schema: false`.
- Token hashes, raw tokens, DNS verification values, or private parish data appear in public responses or audit metadata.
- Public intake `500` errors rise above the agreed threshold for the launch window.

## Rollback Instructions

Runtime rollback does not require a database rollback.

1. Remove or invalidate `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME`.
2. Remove or invalidate `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK`.
3. Redeploy or restart the production runtime.
4. Confirm `/api/health` returns `checks.schema: true`.
5. Submit safe smoke tests through:
   - `/baptism-request`
   - `/wedding-request`
   - `/funeral-request`
   - `/ocia-request`
   - `/join-parish-request`
6. Submit one smoke test with token, domain, and slug signals present.
7. Confirm all smoke requests use legacy primary-parish behavior.
8. Confirm audit metadata records:
   - `publicIntakeRouteSource = legacy_fallback`
   - `publicIntakeRoutingRuntimeEnabled = false`
9. Deactivate any suspicious public tokens or domains if route abuse is suspected.
10. Notify staff that existing legacy public form URLs remain available.

Rollback succeeds only when legacy public intake works and route signals no longer affect parish assignment.

## Customer Communication Notes

### Staff-Facing Message

Use plain language:

```text
Vinea can now route public form submissions to the correct parish using approved parish links, verified domains, or one-time setup tokens. Your existing public form links continue to work. If your parish receives a new public link or domain, please use only the approved link from Vinea and report any missing or misrouted requests immediately.
```

Staff should know:

- Existing public forms continue to work.
- Parish-specific links should not be edited by hand.
- Raw setup tokens should not be emailed broadly, posted publicly, or saved in shared docs.
- Custom domains require DNS verification before they should be shared with families.
- Support should receive the request id, parish name, family name, timestamp, and public link used if a request appears missing or misrouted.

### Family-Facing Message

Keep family messaging simple:

```text
Please use the parish link provided by the parish office. If the form is unavailable, contact the parish office so staff can help you complete your request.
```

Do not expose routing concepts, token details, internal diagnostics, or parish database details to families.

### Support Internal Notes

Support should check:

- Request id and parish id.
- Audit metadata route source.
- Public link or domain used.
- Staff routing settings for public slug, domain, or token.
- Whether runtime flags are enabled.
- Whether rollback has already been triggered.

## Exact Approval Gates

Production enablement is blocked unless every gate is marked `Pass`.

| Gate | Required Result | Owner |
| --- | --- | --- |
| Product owner approval | `Approve Production Runtime Public Intake Routing` recorded | Product owner |
| Technical owner approval | Code, flags, health checks, monitoring, and rollback reviewed | Engineering owner |
| QA owner approval | Safe QA evidence and production smoke plan reviewed | QA owner |
| Rollback owner assigned | Named person can disable flags and verify rollback | Engineering owner |
| Support owner assigned | Named person can triage parish/family reports | Operations owner |
| DNS evidence complete | Every production domain has current successful verification evidence | Operations owner |
| Customer communication ready | Staff and family-facing messages approved | Product owner |
| Monitoring ready | Dashboard/log/audit checks are defined for launch window | Engineering owner |
| Production health ready | `/api/health` is green before switch-on | Engineering owner |
| Legacy smoke test ready | Current public forms pass with flags disabled | QA owner |

## Production Approval Record

Do not fill this out until the production switch-on is truly approved.

```text
Decision: Approve Production Runtime Public Intake Routing / Do Not Approve / Approve After Fixes
Approver:
Role:
Date:
Production environment:
Release/build identifier:
Safe QA evidence reviewed:
DNS evidence reviewed:
Customer communication reviewed:
Monitoring owner:
Rollback owner:
Support owner:
Production enablement explicitly approved: No
```

## Stop Conditions

Stop or roll back immediately if:

- Any smoke request routes to the wrong parish.
- Any family-facing response includes internal diagnostics.
- `/api/health` fails after switch-on.
- Staff cannot find routed requests.
- Token/domain/slug route source metadata is missing from audit logs.
- Rollback owner cannot be reached during the launch window.
- Product owner approval is missing or ambiguous.

## What Changed Plain English

Vinea now has a production launch checklist for parish-specific public forms. It says what proof is needed before turning the feature on, how to communicate the change to parish staff, what to watch after launch, and exactly how to turn the feature back off if anything looks wrong. This does not turn production routing on.
