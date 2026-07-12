# Production Monitoring Non-Production Redaction Smoke QA Packet

Date: 2026-07-05

Status: Prepared as a non-runtime QA packet for a future non-production production-monitoring redaction smoke run. This packet does not implement runtime monitoring, enable production monitoring, add production flags, wire an external observability vendor, page staff, create incidents, notify customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, or make public trust claims.

## Purpose

This packet defines the first future non-production QA run that must happen after production monitoring runtime scaffolding is separately approved and implemented. It uses the existing readiness chain:

- `docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md`
- `docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md`
- `docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md`
- `docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md`
- `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`
- `docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md`
- `lib/observabilityEvent.ts`
- `lib/productionMonitoringRedactionSmokeCases.ts`
- `lib/server/productionMonitoringRuntimePreflight.ts`

Current production monitoring decision: `NO-GO`

## Run Preconditions

Do not run this QA packet until all preconditions are true:

1. Non-production runtime implementation has explicit product-owner approval.
2. Runtime implementation passes `lib/server/productionMonitoringRuntimePreflight.ts`.
3. Runtime implementation remains disabled by default.
4. The smoke target is explicitly labeled non-production.
5. Monitoring/support owner labels are filled with non-secret labels only.
6. The external monitoring destination is approved for non-production redaction smoke only.
7. Evidence storage is approved and does not require secrets in the evidence file.
8. Rollback owner confirms how to disable runtime delivery.

## Required Environment Labels

Use labels only. Do not paste secrets, raw environment dumps, provider credentials, database URLs, service-role keys, anon keys, tokens, OAuth codes, raw IDs, storage paths, signed URLs, original filenames, private document contents, raw exports, AI prompts, AI outputs, or provider payloads.

| Field | Non-secret label |
|---|---|
| Non-production app target | `[FILL]` |
| Non-production database/project label | `[FILL]` |
| Monitoring destination label | `[FILL]` |
| Runtime build/commit label | `[FILL]` |
| Runtime gate state before smoke | `[FILL: expected disabled]` |
| Runtime gate state during smoke | `[FILL: approved non-production only]` |
| Runtime gate state after rollback | `[FILL: disabled]` |
| Evidence file | `docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_EVIDENCE_YYYYMMDD.md` |

## Required Owner Labels

| Role | Label | Approval evidence |
|---|---|---|
| Product owner | `[FILL]` | `[FILL]` |
| Security/data owner | `[FILL]` | `[FILL]` |
| Monitoring owner | `[FILL]` | `[FILL]` |
| Support owner | `[FILL]` | `[FILL]` |
| Rollback owner | `[FILL]` | `[FILL]` |
| Evidence owner | `[FILL]` | `[FILL]` |
| Technical lead | `[FILL]` | `[FILL]` |

## Smoke Fixture Labels

Use synthetic or safe non-production fixtures only.

| Fixture | Required label | Forbidden evidence |
|---|---|---|
| Safe staff account | `[FILL]` | Email/password/token values |
| Safe active parish | `[FILL]` | Raw parish IDs |
| Safe request | `[FILL]` | Raw request IDs or private request details |
| Auth failure trigger | `[FILL]` | Passwords, session cookies, OAuth codes |
| Active-parish/RLS denial trigger | `[FILL]` | Raw request/person/household/document IDs |
| Document portal denial trigger | `[FILL]` | Signed URLs, storage paths, original filenames, document contents |
| Family portal denial trigger | `[FILL]` | Portal token values, token hashes, internal notes |
| Export denial trigger | `[FILL]` | Raw CSV, raw export rows, forbidden field values |
| AI failure trigger | `[FILL or N/A]` | Prompts, generated outputs, provider payloads |
| Google Calendar/email failure trigger | `[FILL or N/A]` | OAuth tokens, calendar bodies, email provider secrets |
| `/api/health` failure trigger | `[FILL]` | Database URLs, service-role keys, raw env dumps |

## QA Sequence

### 1. Flag-Off Baseline

- Confirm runtime monitoring is disabled.
- Trigger one safe synthetic error or denied request path.
- Confirm no external monitoring event is delivered.
- Confirm staff/customer behavior is unchanged.
- Record result in the smoke evidence template.

### 2. Enable Non-Production Smoke Scope

- Enable only the approved non-production runtime smoke scope.
- Confirm environment scope is labeled `NON_PRODUCTION`.
- Confirm production scope remains unavailable.
- Confirm production exports, production public intake routing, production RLS promotion, customer-facing AI, backup/restore public claims, and public trust-center publishing remain `NO-GO`.

### 3. Redaction Cases

Run each case and record evidence in `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`. The non-runtime DTO matrix in `lib/productionMonitoringRedactionSmokeCases.ts` defines the same cases as executable pre-smoke coverage before any runtime monitoring is approved.

| Case | Expected safe event category | Must be absent from external event |
|---|---|---|
| Authentication failure | `authentication` | Email, password, session cookie, token, OAuth code |
| Active-parish/RLS denial | `authorization` | Raw request/person/household/document IDs, membership internals |
| Document portal denial | `document_portal` | Signed URL, storage path, original filename, document content |
| Family portal denial | `family_portal` | Portal token value, token hash, internal notes, staff-only fields, AI material |
| Export denial | `export` | Raw CSV, forbidden fields, token material, private document data, raw export |
| AI failure | `ai` | Prompt, generated output, provider payload, source body, token material |
| Google Calendar failure | `google_calendar` | OAuth code, access token, refresh token, calendar body, Google credential |
| Email failure | `email` | Provider secret, private body content, token, unauthorized recipient list |
| `/api/health` failure | `health_check` | Secret values, database URLs, service-role key, raw env dump |

### 4. Owner Routing Check

- Confirm each safe external event includes only safe category/severity labels.
- Confirm owner/support routing maps to the support escalation matrix.
- Confirm no customer communication is sent automatically.
- Confirm `customerCommunicationAllowed: false` or the equivalent safe label is preserved.

### 5. Rollback Check

- Disable runtime monitoring by configuration.
- Trigger one safe synthetic event.
- Confirm no new external event is delivered.
- Confirm `/api/health` remains in the expected state.
- Confirm staff/customer routes remain unchanged.
- Record rollback evidence.

## Stop Conditions

Stop the smoke run immediately if any of these occur:

- Any email, token, password, OAuth code, database URL, service-role key, storage path, signed URL, original filename, document content, raw export, prompt, generated output, provider payload, raw ID, or raw environment dump appears externally.
- Any production target or production scope is selected accidentally.
- Any customer communication is sent automatically.
- Any record is mutated outside approved safe audit metadata for the future runtime smoke.
- Any route behavior changes outside the approved smoke scope.
- Runtime rollback does not stop external event delivery.

## Evidence Requirements

Evidence must be label-only and should include:

- Environment identity.
- Owner labels.
- Flag states before, during, and after smoke.
- Safe fixture labels.
- External event evidence labels or redacted screenshots.
- Redaction pass/fail results.
- Owner routing pass/fail results.
- Rollback pass/fail results.
- Customer communication boundary confirmation.
- Unresolved risks.
- Final sign-off.

Use `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md` as the evidence structure.

## Production Boundary

Passing this non-production redaction smoke does not approve production monitoring, production smoke, production enablement, public trust-center monitoring claims, production exports, public intake routing, production membership-aware operational RLS promotion, customer-facing AI, backup/restore public claims, migrations, operational RLS changes, or customer communication automation.

## Exact Future Approval Language

The product owner must provide this exact approval before this non-production redaction smoke is run:

```text
I approve running the non-production production-monitoring redaction smoke QA packet only, against the explicitly approved non-production target, using approved owner labels, approved safe fixtures, approved evidence storage, and disabled-by-default monitoring runtime gates. Do not access production, enable production monitoring, run production smoke, send customer communication, mutate records beyond approved safe audit metadata, apply migrations, change operational RLS, run exports, call AI with private data, touch Google Calendar data, or make public trust claims.
```

## What Changed Plain English

This packet is the step-by-step checklist for the first future monitoring safety test. It tells the team how to prove, in a non-production environment, that monitoring reports only safe labels and does not leak private parish data before anyone even considers production smoke testing.
