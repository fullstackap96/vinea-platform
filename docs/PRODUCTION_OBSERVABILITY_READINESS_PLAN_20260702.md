# Production Observability Readiness Plan

Date: 2026-07-02

Status: Prepared as a non-runtime production-readiness plan. No external error-reporting vendor is enabled, no production flag is added, no runtime route is wired, no logs are exported, no migrations are applied, no operational RLS is changed, and no public trust claim is made.

## Purpose

Vinea needs production observability before broader parish pilots, but observability must not become a back door for private parish data. This plan defines the safe event contract, redaction expectations, owner workflow, and future approval gates before any runtime error-reporting service is connected.

## Implemented Non-Runtime Contract

File: `lib/observabilityEvent.ts`

The DTO can prepare a safe internal observability event with:

- Severity: `info`, `warning`, `error`, or `critical`.
- Category: authentication, authorization, database, public intake, request workflow, document portal, family portal, export, AI, Google Calendar, email, storage, health check, or unknown.
- Safe message text after redaction.
- Safe tags and safe context fields after redaction and truncation.
- Recommended owner label.
- Customer-impact label.
- Explicit redaction metadata proving raw message, raw context, raw prompt, raw output, and token material are not stored by the DTO.
- Production boundaries that state no external service is wired and future production observability requires approval.

## Source-Level Runtime Preflight Scaffold

File: `lib/server/observabilityRuntimePreflight.ts`

The preflight scaffold is non-runtime. It does not inspect live routes, send events, import an external vendor, or enable monitoring. It defines source-level rules for a future implementation:

- Runtime observability must be disabled by default.
- Production and non-production approval scopes must be explicit.
- `buildObservabilityEvent` and `redactObservabilityText` must appear before any external reporting send.
- Forbidden payload checks must appear before any external reporting send.
- Owner and customer-impact labels must be preserved before sending.
- Rollback must be possible by disabling configuration.
- Every marker in each required preflight gate must appear before any external reporting send; a partial marker match is not enough.
- Future source must not include raw provider capture calls, raw prompt/output markers, signed URL creation, or direct secret names in outbound reporting paths.

## Required Redactions

The observability DTO must redact:

- Email addresses.
- UUID-style identifiers.
- Database URLs.
- JWT-like token material.
- Sensitive URL query values such as `token`, `code`, `access_token`, `refresh_token`, `password`, `api_key`, `apikey`, `service_role`, and `anon_key`.
- Storage paths for request, family, portal, private, or document objects.
- Long context values through truncation.

## Forbidden Payloads

Future production observability must not store or send:

- Raw prompts.
- Generated AI outputs.
- Provider payloads.
- Token material.
- Signed URLs.
- Storage paths.
- Database URLs.
- Raw export files.
- Document contents.
- Internal note bodies.
- Communication bodies.
- Family portal token values or token hashes.
- Original uploaded filenames.
- Private sacramental or canonical decision material.

## Owner Workflow

Recommended owner mapping:

| Event area | Owner |
|---|---|
| Authorization, exports, document portal, family portal, storage, AI | Security/data owner |
| Google Calendar and email | Integration owner |
| Database and health checks | Engineering owner |
| Public intake and request workflow | Parish success owner |
| Unknown category | Product/support owner |

## Future Runtime Approval Gates

Before any external error-reporting service or production runtime logger is enabled:

1. Product owner approves the vendor and scope.
2. Security/data owner approves the redaction contract.
3. Support owner approves escalation labels and response workflow.
4. Monitoring owner approves alert routing and hours.
5. Rollback owner confirms how to disable runtime reporting.
6. Source-level tests prove only `buildObservabilityEvent` output can be sent externally.
7. Non-production smoke proves redaction for auth, RLS, document, export, AI, Google Calendar, public intake, and health-check errors.
8. Production smoke uses synthetic or non-sensitive errors only.

## Manual QA Checklist For Future Runtime Wiring

- Trigger a synthetic auth failure and confirm no email address or token appears externally.
- Trigger a synthetic active-parish denial and confirm no raw request ID appears externally.
- Trigger a synthetic document-portal denial and confirm no signed URL, storage path, filename, or document content appears externally.
- Trigger a synthetic export denial and confirm no raw CSV/export fields beyond safe labels appear externally.
- Trigger a synthetic AI failure and confirm no prompt, output, provider payload, or token material appears externally.
- Trigger a synthetic Google Calendar failure and confirm no OAuth code, refresh token, access token, or calendar event body appears externally.
- Trigger `/api/health` failure against a non-production target and confirm only schema/env names or labels appear.

## Rollback Plan

Future runtime observability must be disabled by configuration without code rollback. If any sensitive data appears in the external destination:

1. Disable runtime reporting immediately.
2. Preserve internal evidence.
3. Remove or quarantine the external event.
4. Run incident response if parish data, token material, or private document material escaped.
5. Do not re-enable until security/data owner approves a fix and non-production redaction smoke passes.

## What Changed Plain English

Vinea now has a safety plan and a small helper for future error reporting. It says what kind of error information is safe to collect, what must be hidden, and who should review each kind of issue. Nothing is being sent to an outside monitoring service yet.

## Production Claim Boundary

Vinea may say internally that production observability planning and redaction DTOs are prepared.

Vinea must not claim that production error monitoring, incident alerting, external observability, formal uptime monitoring, or compliance-grade logging is live until runtime wiring, approvals, smoke tests, and owner sign-off are complete.
