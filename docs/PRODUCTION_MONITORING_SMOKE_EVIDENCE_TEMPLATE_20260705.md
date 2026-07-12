# Production Monitoring Smoke Evidence Template

Date: 2026-07-05

Status: Prepared as a non-runtime evidence template for future non-production redaction smoke and production-safe smoke runs. This template does not enable production monitoring, add production flags, wire an external observability vendor, page staff, create incidents, notify customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, or make public trust claims.

## Purpose

Use this template only after the production monitoring approval packet authorizes a specific smoke run. It records the evidence needed to prove that monitoring redacts sensitive data, uses safe fixtures, respects customer communication boundaries, and can be rolled back.

Related artifacts:

- `docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md`
- `docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md`
- `docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md`
- `docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md`
- `lib/observabilityEvent.ts`
- `lib/server/observabilityRuntimePreflight.ts`
- `lib/supportEscalationMatrix.ts`
- `lib/monitoringSupportOwnerReadiness.ts`

## Environment Identity

| Field | Evidence |
|---|---|
| Smoke type | `[FILL: non-production redaction smoke / production-safe smoke]` |
| Environment label | `[FILL: non-secret environment label]` |
| App origin label | `[FILL: public origin label or non-production app label; no secrets]` |
| Deployment/build label | `[FILL: commit, preview label, or release label]` |
| Database/project label | `[FILL: label only; no database URL, service-role key, or raw project secret]` |
| Monitoring tool label | `[FILL: approved monitoring tool label]` |
| Evidence storage label | `[FILL: approved evidence storage label]` |
| Smoke tester label | `[FILL: tester name/role]` |
| Review window | `[FILL: date, start time, end time, timezone]` |

## Owner Labels

| Role | Owner label | Approval/evidence reference |
|---|---|---|
| Product owner | `[FILL]` | `[FILL]` |
| Security/data owner | `[FILL]` | `[FILL]` |
| Monitoring owner | `[FILL]` | `[FILL]` |
| Support owner | `[FILL]` | `[FILL]` |
| Rollback owner | `[FILL]` | `[FILL]` |
| Evidence owner | `[FILL]` | `[FILL]` |
| Customer communications owner | `[FILL]` | `[FILL]` |
| Legal/data owner | `[FILL]` | `[FILL or N/A with reason]` |
| Technical lead | `[FILL]` | `[FILL]` |

## Flag States

Record labels only. Do not paste secrets, provider credentials, database URLs, service-role keys, tokens, or raw environment dumps.

| Gate or sensitive area | Expected state | Observed state | Evidence reference |
|---|---|---|---|
| Production monitoring runtime | `[FILL: off / approved smoke only / approved enabled scope]` | `[FILL]` | `[FILL]` |
| Monitoring environment scope | `[FILL: non-production / production-safe smoke]` | `[FILL]` | `[FILL]` |
| Production exports | `NO-GO / unchanged` | `[FILL]` | `[FILL]` |
| Production public intake routing | `NO-GO / unchanged` | `[FILL]` | `[FILL]` |
| Production membership-aware operational RLS promotion | `NO-GO unless separately approved` | `[FILL]` | `[FILL]` |
| Customer-facing AI | `NO-GO / unchanged` | `[FILL]` | `[FILL]` |
| Backup/restore public claims | `NO-GO / unchanged` | `[FILL]` | `[FILL]` |
| Public trust-center publishing | `NO-GO / unchanged` | `[FILL]` | `[FILL]` |

## Safe Fixture Labels

Use labels only. Evidence must not include real private document contents, raw IDs, live family portal token values, raw export files, AI prompts/outputs containing private data, Google OAuth tokens, email provider secrets, database URLs, or service-role keys.

| Fixture | Label | Approved by | Evidence reference |
|---|---|---|---|
| Safe staff account | `[FILL]` | `[FILL]` | `[FILL]` |
| Active parish | `[FILL]` | `[FILL]` | `[FILL]` |
| Safe request | `[FILL]` | `[FILL]` | `[FILL]` |
| Auth failure trigger | `[FILL]` | `[FILL]` | `[FILL]` |
| Active-parish/RLS denial trigger | `[FILL]` | `[FILL]` | `[FILL]` |
| Document portal denial trigger | `[FILL]` | `[FILL]` | `[FILL]` |
| Family portal denial trigger | `[FILL]` | `[FILL]` | `[FILL]` |
| Export denial trigger | `[FILL]` | `[FILL]` | `[FILL]` |
| AI failure trigger | `[FILL or N/A]` | `[FILL]` | `[FILL]` |
| Google Calendar/email failure trigger | `[FILL or N/A]` | `[FILL]` | `[FILL]` |
| `/api/health` baseline | `[FILL]` | `[FILL]` | `[FILL]` |

## Redaction Checks

Each check must prove that the external monitoring event contains only safe observability DTO fields and excludes forbidden payload material.

| Case | Expected forbidden data absent | Result | External event evidence label | Reviewer |
|---|---|---|---|---|
| Authentication failure | Email, password, session cookie, token, OAuth code | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |
| Active-parish/RLS denial | Raw request/person/household/document IDs, membership internals | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |
| Document portal denial | Signed URL, storage path, original filename, document content | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |
| Family portal denial | Portal token, token hash, internal notes, staff-only fields, AI material | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |
| Export denial | Raw CSV, forbidden fields, token material, private document data, raw export | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |
| AI failure | Prompt, generated output, provider payload, source body, token material | `[PASS/FAIL or N/A]` | `[FILL]` | `[FILL]` |
| Google Calendar failure | OAuth code, access/refresh token, calendar body, Google credential | `[PASS/FAIL or N/A]` | `[FILL]` | `[FILL]` |
| Email failure | Provider secret, private body content, token, unauthorized recipient list | `[PASS/FAIL or N/A]` | `[FILL]` | `[FILL]` |
| `/api/health` failure | Secret values, database URLs, service-role key, raw env dump | `[PASS/FAIL]` | `[FILL]` | `[FILL]` |

## External Event Evidence

| Field | Evidence |
|---|---|
| External event label | `[FILL: label only]` |
| Monitoring category/severity | `[FILL]` |
| Safe summary visible externally | `[FILL: short safe summary]` |
| Owner routing observed | `[FILL]` |
| Screenshot/export evidence reference | `[FILL: sanitized evidence label or path]` |
| Forbidden data review result | `[PASS/FAIL]` |
| Reviewer notes | `[FILL]` |

## Rollback Verification

| Step | Expected result | Observed result | Evidence reference |
|---|---|---|---|
| Disable monitoring runtime flag or provider configuration | Monitoring delivery stops | `[FILL]` | `[FILL]` |
| Trigger safe smoke event after rollback | No new external event delivered | `[FILL]` | `[FILL]` |
| Confirm `/api/health` | Health remains green or known safe status is documented | `[FILL]` | `[FILL]` |
| Confirm staff/customer routes | No behavior change in approved smoke scope | `[FILL]` | `[FILL]` |
| Preserve evidence | Evidence stored in approved location | `[FILL]` | `[FILL]` |

Rollback decision criteria are met if any sensitive value appears externally, the wrong owner/channel is alerted, staff workflows are slowed or broken, or monitoring changes auth, RLS, exports, AI, documents, public intake, Google Calendar, email, or family portal behavior.

## Customer Communication Boundary Confirmation

| Boundary | Confirmation |
|---|---|
| No automatic customer communication sent | `[CONFIRM]` |
| SEV-1 communication requires incident commander and legal/data owner approval | `[CONFIRM]` |
| SEV-2 communication requires support owner and security/data owner approval | `[CONFIRM]` |
| SEV-3/SEV-4 communication is not default | `[CONFIRM]` |
| Evidence does not claim public trust-center monitoring readiness | `[CONFIRM]` |

## Unresolved Risks

| Risk | Owner | Severity | Follow-up required before production enablement |
|---|---|---|---|
| `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

## Final Sign-Off

| Role | Sign-off label | Decision | Date/time |
|---|---|---|---|
| Product owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Security/data owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Monitoring owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Support owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Rollback owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Evidence owner | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |
| Technical lead | `[FILL]` | `[APPROVE / HOLD / NO-GO]` | `[FILL]` |

## Production Claim Boundary

Completing this template may support an internal production-readiness review only. It does not approve public trust-center claims, formal compliance claims, backup/restore claims, customer-facing AI, production exports, production public intake routing, or production membership-aware operational RLS promotion.

## What Changed Plain English

This template is the worksheet Vinea will use later when it tests production monitoring. It helps the team prove that monitoring catches problems without leaking private parish data, that the right people are responsible, that rollback works, and that customers are not contacted automatically.
