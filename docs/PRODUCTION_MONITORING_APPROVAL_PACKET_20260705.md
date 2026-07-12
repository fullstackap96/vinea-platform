# Production Monitoring Approval Packet

Date: 2026-07-05

Status: Prepared as a non-runtime product-owner approval packet. This packet does not enable production monitoring, add production flags, wire an external observability vendor, page staff, create incidents, notify customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, or make public trust claims.

## Purpose

This packet defines the exact approval gates required before Vinea may implement or enable production monitoring. It ties together:

- `docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md`
- `docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md`
- `docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md`
- `lib/observabilityEvent.ts`
- `lib/server/observabilityRuntimePreflight.ts`
- `lib/supportEscalationMatrix.ts`
- `lib/monitoringSupportOwnerReadiness.ts`

## Current Decision State

Current production monitoring decision: `NO-GO`

Production monitoring remains blocked until:

1. The monitoring/support owner intake worksheet is filled with non-secret labels.
2. The filled intake passes validation with no missing labels and no secret-like values.
3. Product owner approves production monitoring scope.
4. Security/data owner approves redaction, forbidden payloads, and evidence rules.
5. Monitoring owner approves alert routing, coverage window, and tool label.
6. Support owner approves escalation workflow and response expectations.
7. Rollback owner approves disable/rollback procedure.
8. Evidence owner approves evidence storage location.
9. Non-production redaction smoke passes.
10. Production-safe smoke fixture labels are approved.
11. Production smoke is approved separately.

## Required Owner Approvals

The following approvals are required before runtime monitoring may be implemented or enabled:

| Role | Required approval |
|---|---|
| Product owner | Approves monitoring scope, rollout boundary, and production NO-GO exceptions |
| Security/data owner | Approves redaction contract, forbidden payload list, evidence handling, and customer data boundaries |
| Monitoring owner | Approves monitoring tool label, alert routing, severity mapping, and coverage window |
| Support owner | Approves support escalation workflow and expected response handling |
| Rollback owner | Approves disable/rollback process and rollback decision criteria |
| Evidence owner | Approves evidence storage location and redaction requirements |
| Customer communications owner | Approves customer communication boundary and escalation handoff |
| Legal/data owner | Approves incident communication and privacy review boundary when needed |
| Technical lead | Approves runtime source preflight and non-production smoke results |

## Non-Production Redaction Smoke Tests

Before any production runtime monitoring is enabled, non-production smoke must prove that external monitoring receives only safe observability DTO output.

Required non-production redaction cases:

1. Authentication failure: no email, token, OAuth code, or password appears externally.
2. Active-parish or RLS denial: no raw request/person/household/document ID appears externally.
3. Document portal denial: no signed URL, storage path, original filename, or document content appears externally.
4. Family portal denial: no portal token value, token hash, internal note, staff-only field, or AI material appears externally.
5. Export denial: no raw CSV, forbidden field values, token material, private document data, or raw export appears externally.
6. AI failure: no prompt, generated output, provider payload, source body, token material, or staff-only material appears externally.
7. Google Calendar failure: no OAuth code, refresh token, access token, calendar event body, or Google credential appears externally.
8. Email failure: no email provider secret, private body content, token, or unauthorized recipient list appears externally.
9. `/api/health` failure: only safe env/schema labels appear externally; no secret values appear.

Each smoke case must capture:

- Environment label.
- Feature category.
- Synthetic/safe trigger label.
- Expected redactions.
- External event screenshot or exported event summary with private data redacted.
- Pass/fail result.
- Reviewer label.

## Production-Safe Smoke Fixture Requirements

Production smoke must use synthetic or explicitly approved production-safe fixtures only.

Required fixture labels:

- Safe staff account label.
- Active parish label.
- Synthetic or safe request label.
- Safe denied active-parish/RLS fixture label.
- Safe document-portal denial fixture label.
- Safe family-portal denial fixture label.
- Safe export denial fixture label.
- Safe AI failure fixture label.
- Safe Google Calendar/email failure fixture label, if integration monitoring is in scope.
- `/api/health` baseline label.

Production smoke must not use:

- Real private document contents.
- Raw IDs pasted into evidence.
- Live family portal token values.
- Raw export files.
- AI prompts or outputs containing private data.
- Google OAuth tokens.
- Email provider secrets.
- Database URLs.
- Service-role keys.

## Rollback Behavior

Runtime monitoring must be disableable by configuration without code rollback.

Required rollback evidence:

1. Disable the runtime monitoring flag or provider configuration.
2. Confirm no new external monitoring events are delivered.
3. Preserve internal evidence of the rollback.
4. Confirm app health remains green.
5. Confirm customer-facing routes are unchanged.

Rollback decision criteria:

- Any sensitive value appears in external monitoring.
- Any alert pages the wrong owner or public channel.
- Any monitoring behavior slows or breaks staff workflows.
- Any monitoring behavior changes auth, RLS, exports, AI, documents, public intake, Google Calendar, email, or family portal behavior.

## Monitoring Coverage Expectations

Initial production monitoring scope should be deliberately narrow:

- `/api/health` failures.
- Authentication/staff authorization failures.
- Active-parish/RLS denial anomalies.
- Document/family portal denial anomalies.
- Export denial anomalies.
- AI safety-chain failure anomalies.
- Google Calendar/email integration failures only after integration owner approval.

Initial production monitoring scope should exclude:

- Raw request bodies.
- Raw response bodies.
- Private documents.
- Raw exports.
- AI prompts or outputs.
- Provider payloads.
- Background jobs or external integrations not covered by smoke tests.

## Customer Communication Boundaries

Monitoring must not automatically contact customers.

- `SEV-1`: prepare customer communication, but do not send until incident commander and legal/data owner approve facts, scope, timing, and wording.
- `SEV-2`: customer communication may be needed after triage; support owner and security/data owner must approve before sending.
- `SEV-3` and `SEV-4`: no customer communication by default; reassess if triage finds parish impact.

## Exact Approval Language For Future Use

The product owner must provide explicit approval in this form before implementation or runtime enablement:

```text
I approve non-production implementation of production monitoring runtime wiring only, behind disabled-by-default flags, using the approved observability DTO, source preflight, support escalation matrix, and monitoring/support owner intake labels. Do not enable production monitoring yet.
```

For production smoke only:

```text
I approve production smoke testing for Vinea production monitoring using only the approved production-safe fixture labels, approved monitoring/support owners, approved rollback owner, approved evidence owner, and approved monitoring coverage window. Do not expand monitoring scope, send customer communication, access private documents, run exports, call AI with private data, mutate records, change operational RLS, or make public trust claims.
```

For production enablement only:

```text
I approve enabling Vinea production monitoring for the explicitly approved scope only, using the approved runtime flags, monitoring owner, support owner, rollback owner, evidence owner, customer communication boundary, production-safe smoke evidence, non-production redaction smoke evidence, and rollback plan. Production monitoring remains limited to the approved scope and does not approve production exports, public intake routing, production RLS promotion, customer-facing AI, backup/restore claims, or public trust-center claims.
```

## Post-Approval NO-GO Boundaries

Even after this packet is approved, the following remain separate approval tracks:

- Production exports.
- Production public-intake routing.
- Production membership-aware operational RLS promotion.
- Customer-facing AI.
- Backup/restore public claims.
- Public trust-center publishing.
- MFA/SSO/RBAC changes.
- Data retention/deletion automation.

## What Changed Plain English

This packet is the final checklist before Vinea can even ask to build or turn on production monitoring. It says who must approve it, what must be tested in non-production, what can be used safely in production smoke tests, how rollback works, what customer communication is allowed, and the exact approval words needed later.
