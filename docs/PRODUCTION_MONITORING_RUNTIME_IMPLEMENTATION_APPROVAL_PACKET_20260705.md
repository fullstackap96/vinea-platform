# Production Monitoring Runtime Implementation Approval Packet

Date: 2026-07-05

Status: Prepared as a non-runtime product-owner approval packet for future production monitoring runtime implementation. This packet does not enable production monitoring, add production flags, wire an external observability vendor, page staff, create incidents, notify customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, or make public trust claims.

## Purpose

This packet defines the exact approval boundary for a future implementation slice that may add disabled-by-default monitoring runtime code. It uses the existing readiness chain:

- `docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md`
- `docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md`
- `docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md`
- `docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md`
- `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`
- `lib/observabilityEvent.ts`
- `lib/server/observabilityRuntimePreflight.ts`
- `lib/server/productionMonitoringRuntimePreflight.ts`
- `lib/supportEscalationMatrix.ts`
- `lib/monitoringSupportOwnerReadiness.ts`

Current production monitoring decision: `NO-GO`

## Required Approval Before Runtime Code

Runtime implementation may not begin until the product owner explicitly approves non-production implementation with the exact approval language below.

Required approvals before implementation:

| Role | Required approval |
|---|---|
| Product owner | Approves implementation scope and confirms production monitoring remains off |
| Security/data owner | Approves redaction, forbidden payload blocking, and evidence boundaries |
| Monitoring owner | Approves monitoring tool label, event destination boundary, and non-production smoke plan |
| Support owner | Approves severity mapping, owner routing, and response expectations |
| Rollback owner | Approves disable/no-op behavior and rollback checks |
| Evidence owner | Approves smoke evidence location and redaction requirements |
| Technical lead | Approves source-level preflight expectations and test plan |

## Exact Candidate Implementation Files

The future runtime implementation should be limited to the smallest useful set of files:

| Candidate file | Purpose | Boundary |
|---|---|---|
| `lib/server/observabilityRuntimeGate.ts` | Evaluate disabled-by-default runtime gates and environment scope | Must default to disabled and must not read or print secrets |
| `lib/server/sendObservabilityEvent.ts` | Send only safe `buildObservabilityEvent` DTO output to an approved provider adapter | Must not accept raw errors, request bodies, prompts, outputs, exports, document payloads, signed URLs, or token material |
| `lib/server/observabilityProviderAdapter.ts` | Isolate approved provider-specific delivery code | Must be vendor-swappable and disabled when no approved provider label/config is present |
| `lib/server/observabilityRuntime.ts` | Compose gate, safe DTO, support escalation labels, and provider delivery | Must run redaction and forbidden payload checks before any external send |
| `lib/server/productionMonitoringRuntimePreflight.ts` | Source-level scaffold that validates future runtime code before implementation is accepted | Must remain non-runtime and must not import providers, send events, mutate data, or access secrets |
| `lib/server/observabilityRuntimeRoutePreflight.test.ts` | Source-level tests for every future route or server hook that calls runtime monitoring | Must fail if external delivery appears before gates, redaction, owner labels, and rollback control |
| `lib/server/observabilityRuntimeGate.test.ts` | Unit tests for disabled-by-default and production/non-production scope behavior | Must prove QA/non-production flags cannot enable production behavior |
| `lib/server/sendObservabilityEvent.test.ts` | Unit tests for safe payload delivery and forbidden data blocking | Must prove raw payloads and secret-shaped material are rejected |

Routes or server hooks should be instrumented only after a separate approval identifies the first narrow surface. The first candidate surface should be `/api/health` failure monitoring or another synthetic-safe server path; it should not start with AI, exports, documents, family portal, Google Calendar, email, public intake, or RLS-sensitive flows unless separately approved.

## Disabled-By-Default Gates

Future runtime code must require explicit approval gates before any external delivery:

| Gate | Required behavior |
|---|---|
| Runtime enabled gate | Defaults to disabled in every environment |
| Non-production approval gate | Requires a non-production acknowledgement phrase for non-production smoke only |
| Production implementation gate | Requires a separate product-owner approval before production smoke code can be exercised |
| Production enablement gate | Requires a separate product-owner approval after completed smoke evidence and owner sign-off |
| Environment scope gate | Distinguishes `NON_PRODUCTION`, `PRODUCTION_SMOKE`, and `PRODUCTION_ENABLED` scopes |
| Provider configured gate | No-ops unless an approved provider label/config is present |
| Rollback gate | Disabling the runtime gate or provider config must stop external delivery without code rollback |

This packet does not add these gates. It only defines what a future implementation must include.

## Non-Production Redaction Smoke Requirements

Before any production smoke, non-production redaction smoke must pass and be recorded in `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`.

Required cases:

1. Authentication failure: no email, password, session cookie, token, or OAuth code appears externally.
2. Active-parish/RLS denial: no raw request/person/household/document ID or membership internals appear externally.
3. Document portal denial: no signed URL, storage path, original filename, or document content appears externally.
4. Family portal denial: no portal token value, token hash, internal notes, staff-only fields, or AI material appear externally.
5. Export denial: no raw CSV, forbidden fields, private document data, or raw export appears externally.
6. AI failure: no prompt, generated output, provider payload, source body, or token material appears externally.
7. Google Calendar failure: no OAuth code, refresh token, access token, calendar body, or Google credential appears externally.
8. Email failure: no provider secret, private body content, token, or unauthorized recipient list appears externally.
9. `/api/health` failure: no secret values, database URLs, service-role keys, or raw env dumps appear externally.

## Production-Safe Smoke Boundaries

Production smoke remains separately approved and must use synthetic or explicitly approved production-safe fixtures only.

Production-safe smoke must not:

- Use real private document contents.
- Paste raw IDs into evidence.
- Use live family portal token values.
- Include raw export files.
- Include AI prompts or outputs containing private data.
- Include Google OAuth tokens.
- Include email provider secrets.
- Include database URLs, service-role keys, anon keys, or environment dumps.
- Trigger customer communication.
- Expand monitoring scope beyond the approved route/surface.

## Runtime Safety Requirements

Any future implementation must prove these source-level conditions:

- Authentication, authorization, and active-parish/membership behavior remain unchanged.
- `buildObservabilityEvent` and `redactObservabilityText` run before any external delivery.
- Forbidden payload assertions run before any external delivery.
- Support escalation labels are derived from `lib/supportEscalationMatrix.ts` before delivery.
- Owner labels and customer-impact labels are preserved.
- External delivery receives only safe DTO fields.
- Every required marker in each runtime preflight gate appears before any external monitoring send; one partial marker is not enough to pass a gate.
- Provider-specific code is isolated behind a small adapter.
- Runtime no-ops safely when disabled, unconfigured, or missing approval.
- Rollback works by disabling configuration without a code rollback.
- Tests fail if raw prompt/output, token material, signed URL creation, storage paths, raw exports, private documents, service-role keys, OpenAI keys, Google secrets, or Resend secrets appear in outbound reporting paths.

## Rollback / No-Op Behavior

The future runtime must no-op when:

- Runtime monitoring is disabled.
- Environment scope is missing or mismatched.
- Required acknowledgement phrase is missing.
- Provider configuration is absent.
- Owner labels are missing.
- The event fails redaction or forbidden-payload checks.

Rollback evidence must show:

1. Disable runtime monitoring by configuration.
2. Trigger an approved safe smoke event.
3. Confirm no new external event is delivered.
4. Confirm `/api/health` remains in the expected state.
5. Confirm staff/customer routes behave the same.
6. Preserve smoke evidence in the approved evidence location.

## Customer Communication Boundaries

Runtime monitoring must not automatically contact customers.

- `SEV-1`: prepare a communication draft only after incident commander and legal/data owner review.
- `SEV-2`: communication may be needed after triage; support owner and security/data owner must approve.
- `SEV-3` and `SEV-4`: no customer communication by default.
- No monitoring implementation may publish public trust-center claims, uptime claims, incident claims, or compliance claims.

## Production NO-GO Criteria

Production runtime monitoring remains `NO-GO` if any of the following are true:

- Owner intake worksheet is incomplete or contains secret-like values.
- Product, security/data, monitoring, support, rollback, evidence, or technical lead approval is missing.
- Non-production redaction smoke is incomplete or failed.
- Production-safe smoke fixtures are not approved.
- Rollback evidence is missing or failed.
- Any sensitive value appears externally.
- Any customer communication boundary is unclear.
- Runtime source preflight fails.
- Production RLS, exports, public intake routing, customer-facing AI, backup/restore public claims, or public trust-center publishing are being bundled into the same approval.

## Exact Approval Language

The product owner must provide this exact approval before non-production runtime implementation begins:

```text
I approve non-production implementation of production monitoring runtime scaffolding only, behind disabled-by-default gates, using the approved observability DTO, observability runtime preflight, support escalation matrix, monitoring/support owner intake worksheet, production monitoring approval packet, and production monitoring smoke evidence template. Do not enable production monitoring, production smoke, customer communication, public trust-center claims, production exports, public intake routing, production RLS promotion, customer-facing AI, migrations, or operational RLS changes.
```

Separate future approval is required for production smoke:

```text
I approve production-safe smoke testing for Vinea production monitoring using only the approved owner labels, approved monitoring scope, approved production-safe fixture labels, approved rollback owner, approved evidence owner, and completed non-production redaction smoke evidence. Do not enable ongoing production monitoring after the smoke window, expand monitoring scope, send customer communication, access private documents, run exports, call AI with private data, mutate records, change operational RLS, or make public trust claims.
```

Separate future approval is required for production enablement:

```text
I approve enabling Vinea production monitoring for the explicitly approved scope only, using the completed non-production redaction smoke evidence, completed production-safe smoke evidence, approved runtime gates, approved monitoring owner, approved support owner, approved rollback owner, approved evidence owner, and approved customer communication boundary. This does not approve production exports, public intake routing, production RLS promotion, customer-facing AI, backup/restore public claims, or public trust-center claims.
```

## What Changed Plain English

This packet is the permission slip for a future engineering task. It says exactly what files could be created, what safety switches must exist, what tests must pass, what evidence must be collected, and what still cannot be turned on. It prepares Vinea to build monitoring carefully without accidentally enabling it.
