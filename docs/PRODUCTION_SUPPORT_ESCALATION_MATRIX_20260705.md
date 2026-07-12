# Production Support Escalation Matrix

Date: 2026-07-05

Status: Prepared as a non-runtime production-readiness artifact. No production monitoring is enabled, no customer notification workflow is automated, no runtime incident creation is wired, no migrations are applied, no operational RLS is changed, no production data is accessed, and no public trust-center claim is made.

## Purpose

Vinea needs a clear way to turn future safe observability events into support ownership and response expectations. This matrix connects the non-runtime observability DTO to support severity, required roles, evidence rules, customer communication boundaries, and first actions.

Implemented support model:

- `lib/supportEscalationMatrix.ts`
- `lib/supportEscalationMatrix.test.ts`

## Severity Matrix

| Support severity | Meaning | Response target | Examples |
|---|---|---|---|
| `SEV-1` | Critical parish data or privacy risk | Assign incident commander and technical lead within 30 minutes | Cross-parish request/document visibility, public storage exposure, family portal exposing staff-only data, production RLS bypass |
| `SEV-2` | High-impact workflow, privacy, or integration issue | Triage within 2 hours during support coverage | Google Calendar reconnect failure, email delivery failure, limited family portal issue, export denial/safety concern |
| `SEV-3` | Medium-risk degraded behavior or near miss | Triage same business day | Warning-level health degradation, suspicious but contained denial path, missing integration status |
| `SEV-4` | Low-risk support follow-up | Track in normal support and product queue | Informational health event, documentation gap, low-risk setup issue |

## Owner Routing

| Event area | Primary owner |
|---|---|
| Authorization, storage, document portal, family portal, exports, AI | Security/data owner |
| Google Calendar, email | Integration owner |
| Database, schema, health checks | Engineering owner |
| Public intake and request workflow | Parish success owner |
| Unknown category | Product/support owner |

## Production Monitoring Routing Map

File: `lib/supportEscalationMatrix.ts`

The support model now includes `mapObservabilityEventToSupportEscalation(event)` for future monitoring runtime code. It returns label-only routing fields:

- `supportSeverity`
- `monitoringOwnerLabel`
- `supportOwnerLabel`
- `supportRequiredRoleLabels`
- `customerImpact`
- `customerCommunicationAllowed: false`
- incident commander and legal/data owner approval booleans
- `responseTarget`
- `safeEscalationSummary`
- `rollbackByDisablingFlags: true`

The routing map is non-runtime. It does not send monitoring events, page staff, create incidents, notify customers, mutate records, or make production trust claims.

## Required Roles

`SEV-1` requires:

- Incident commander.
- Technical lead.
- Security/data owner when data privacy or authorization is involved.
- Customer communications owner.
- Legal/data owner.
- Evidence owner.
- Support owner.

`SEV-2` usually requires:

- Support owner.
- Technical lead.
- Evidence owner.
- Security/data owner for privacy-sensitive categories.
- Integration owner for Google Calendar or email issues.

`SEV-3` and `SEV-4` can begin with support owner triage unless scope escalates.

## Evidence Rules

Evidence should preserve:

- Safe event summary.
- Timestamp.
- Environment label.
- Route label.
- Safe category and severity.
- Safe owner labels.
- Relevant audit-event references where safe.
- Screenshots or response summaries with private data redacted.

Evidence must not preserve:

- Secrets.
- Raw IDs when labels are sufficient.
- Token material.
- Database URLs.
- Signed URLs.
- Storage paths.
- Original uploaded filenames.
- Private document contents.
- Raw export files.
- Internal note bodies.
- Communication bodies.
- AI prompts.
- AI outputs.
- Provider payloads.

## Customer Communication Boundary

No customer communication is sent automatically from this matrix.

- `SEV-1`: prepare communication, but do not send until incident commander and legal/data owner approve facts, scope, timing, and wording.
- `SEV-2`: customer communication may be needed after triage; support owner and security/data owner must approve before sending.
- `SEV-3` and `SEV-4`: no customer communication by default; reassess if triage finds parish impact.

## First Actions

For every event:

1. Record the safe event summary and timestamp.
2. Confirm environment identity before touching data or settings.
3. Preserve evidence before cleanup unless containment is urgent.

For privacy-sensitive events:

1. Check whether containment is needed for access, document, token, or parish-scope boundaries.
2. Follow the incident response runbook if exposure is confirmed or likely.

For integrations:

1. Check integration status.
2. Avoid mutating Google Calendar or email state until owner review.

For AI:

1. Confirm no raw prompt, output, provider payload, or staff-only source material is stored or shown.

For exports:

1. Confirm no raw export, forbidden field, token material, or private document material was delivered.

## Related Docs

- `docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

## Production Claim Boundary

Vinea may say internally that a support escalation matrix is prepared for future production monitoring and support workflows.

Vinea must not claim live production monitoring, automated incident response, 24/7 paging, formal SLA coverage, public trust-center readiness, or compliance-grade incident handling until runtime monitoring, named owner coverage, support hours, tabletop evidence, and production smoke evidence are approved.

## What Changed Plain English

Vinea now has a clear support playbook for future monitoring alerts. If Vinea later sees a safe error event, this matrix says how serious it is, who should look first, how quickly it should be reviewed, what evidence should be saved, and when customer communication is allowed. It does not send alerts or contact customers yet.
