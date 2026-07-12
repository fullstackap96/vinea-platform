# Public Intake Runtime Production Smoke-Test Evidence Template

Status: Blank evidence template. Complete this only during an approved production runtime public intake routing smoke test after product-owner approval has been recorded.

Related docs:

- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`
- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md`
- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_APPROVAL_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_RUNTIME_GUARD_PLAN.md`
- `docs/VINEA_BUILD_STATUS.md`

## Safety Confirmation

- Product-owner approval phrase recorded: `Yes / No`
- Approval phrase used exactly: `Approve Production Runtime Public Intake Routing / Other`
- Production environment confirmed: `Yes / No`
- Production runtime flags were disabled before baseline test: `Yes / No`
- No migrations applied during this smoke test: `Yes / No`
- Operational RLS unchanged during this smoke test: `Yes / No`
- No raw public tokens copied into this evidence document: `Yes / No`
- No token hashes copied into this evidence document: `Yes / No`
- No DNS verification secret values copied into this evidence document unless explicitly approved for launch evidence: `Yes / No`
- No private parishioner notes, internal notes, AI notes, audit log internals, or staff-only data copied into this document: `Yes / No`

## Environment Identity

- Production app URL:
- Production deployment provider:
- Production deployment identifier:
- Git branch:
- Git commit SHA:
- Date/time smoke test started:
- Date/time smoke test completed:
- Person running smoke test:
- Product owner:
- Engineering owner:
- QA owner:
- Rollback owner:
- Support owner:
- Parish or pilot group:
- Notes:

## Approval Evidence

- Production enablement checklist reviewed: `Yes / No`
- Checklist location: `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`
- Approval record location:
- Product-owner approval timestamp:
- Technical owner approval timestamp:
- QA owner approval timestamp:
- Rollback owner confirmed reachable during launch window: `Yes / No`
- Support owner confirmed reachable during launch window: `Yes / No`
- Customer communication approved: `Yes / No`
- Monitoring plan approved: `Yes / No`

## DNS And TLS Evidence Attachments

Complete one row per production custom domain.

| Parish | Parish ID | Hostname | Domain row active | `verified_at` present | Fresh DNS TXT lookup attached | Host resolves to production | HTTPS/TLS valid | Evidence location | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | `Pass / Fail / N/A` | `Pass / Fail / N/A` | `Pass / Fail / N/A` | `Pass / Fail / N/A` | `Pass / Fail / N/A` |  | `Pass / Fail / N/A` |

DNS/TLS notes:

- External resolver used:
- DNS lookup command or tool:
- TLS verification command or tool:
- Screenshots or logs attached:
- Any domain excluded from launch:

## Flag-Off Baseline

Run before enabling production runtime flags.

- `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` absent or disabled: `Pass / Fail`
- `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` absent or invalid: `Pass / Fail`
- `/api/health` returned `ok: true`: `Pass / Fail`
- `/api/health` returned `checks.schema: true`: `Pass / Fail`
- `/api/health` returned `checks.supabase: true`: `Pass / Fail`
- `/api/health` returned `checks.parishes: true`: `Pass / Fail`
- Health response exposed no secrets or SQL diagnostics: `Pass / Fail`

Flag-off baseline public form results:

| Workflow | URL tested | HTTP status | Request ID | Parish ID | Audit Event ID | `publicIntakeRouteSource` | `publicIntakeRoutingRuntimeEnabled` | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baptism | `/baptism-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Wedding | `/wedding-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Funeral | `/funeral-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| OCIA | `/ocia-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Join Parish | `/join-parish-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |

Flag-off route-signal rejection:

- Fake token signal ignored: `Pass / Fail`
- Fake slug signal ignored: `Pass / Fail`
- Fake domain signal ignored: `Pass / Fail`
- Forged staff active parish cookie ignored: `Pass / Fail`
- Notes:

## Flag-On Switch-On Record

- Exact runtime flag set: `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED`: `Yes / No`
- Exact acknowledgement flag set: `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME`: `Yes / No`
- Runtime restarted/redeployed after flag change: `Yes / No`
- Switch-on timestamp:
- Person who changed flags:
- Change ticket or deployment record:
- `/api/health` after switch-on returned `checks.schema: true`: `Pass / Fail`

## Flag-On Slug Smoke Test

- Parish:
- Parish ID:
- Public slug:
- `parishes.public_intake_enabled = true`: `Pass / Fail`
- Public form/request type:
- URL tested:
- HTTP status:
- Request ID:
- Parishioner ID:
- Audit Event ID:
- Request appears in staff dashboard under expected parish: `Pass / Fail`
- Audit metadata `publicIntakeRouteSource = slug`: `Pass / Fail`
- Audit metadata `publicIntakeRoutingRuntimeEnabled = true`: `Pass / Fail`
- Audit metadata `publicIntakePublicDisplayName` present: `Pass / Fail`
- Audit metadata `publicIntakeResolvedRequestType` present or intentionally null: `Pass / Fail`
- Public response exposed no internal diagnostics: `Pass / Fail`
- Result: `Pass / Fail`
- Notes:

## Flag-On Token Smoke Test

- Parish:
- Parish ID:
- Token label:
- Token request type:
- Token active: `Pass / Fail`
- Token unexpired: `Pass / Fail`
- Raw token was not recorded in this evidence document: `Pass / Fail`
- URL tested:
- HTTP status:
- Request ID:
- Parishioner ID:
- Audit Event ID:
- Request appears in staff dashboard under expected parish: `Pass / Fail`
- Audit metadata `publicIntakeRouteSource = token`: `Pass / Fail`
- Audit metadata `publicIntakeRoutingRuntimeEnabled = true`: `Pass / Fail`
- Token hash absent from public response and audit metadata: `Pass / Fail`
- Raw token absent from public response and audit metadata: `Pass / Fail`
- Result: `Pass / Fail`
- Notes:

## Flag-On Verified Domain Smoke Test

- Parish:
- Parish ID:
- Hostname:
- Domain active: `Pass / Fail`
- Domain `verified_at` present: `Pass / Fail`
- DNS/TLS evidence row completed above: `Pass / Fail`
- URL tested:
- HTTP status:
- Request ID:
- Parishioner ID:
- Audit Event ID:
- Request appears in staff dashboard under expected parish: `Pass / Fail`
- Audit metadata `publicIntakeRouteSource = domain`: `Pass / Fail`
- Audit metadata `publicIntakeRoutingRuntimeEnabled = true`: `Pass / Fail`
- DNS verification value absent from public response and audit metadata: `Pass / Fail`
- Result: `Pass / Fail`
- Notes:

## Generic Error Smoke Tests

Use safe negative cases only. Do not expose raw token values in this document.

| Case | Expected Status | Actual Status | Expected Public Error | Request Created | Parishioner Created | Internal Details Exposed | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Deactivated token | `410` |  | `Public intake form is not available.` | `No` | `No` | `No` | `Pass / Fail` |
| Inactive or deactivated domain | `404` |  | `Public intake form is not available.` | `No` | `No` | `No` | `Pass / Fail` |
| Unverified domain | `404` |  | `Public intake form is not available.` | `No` | `No` | `No` | `Pass / Fail` |
| Disabled parish slug | `404` |  | `Public intake form is not available.` | `No` | `No` | `No` | `Pass / Fail` |
| Mismatched request type | `404` |  | `Public intake form is not available.` | `No` | `No` | `No` | `Pass / Fail` |

Generic error notes:

- Any unexpected request IDs:
- Any unexpected parishioner IDs:
- Any exposed details:

## Audit Metadata Capture

For each successful smoke request, capture only safe metadata.

| Request ID | Audit Event ID | Parish ID | Request Type | Route Source | Runtime Enabled | Public Display Name Present | Resolved Request Type | Forbidden Values Absent | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | `legacy_fallback / slug / token / domain` | `true / false` | `Pass / Fail / N/A` |  | `Pass / Fail` | `Pass / Fail` |

Forbidden values to check:

- Raw public tokens absent: `Pass / Fail`
- Token hashes absent: `Pass / Fail`
- DNS verification tokens absent: `Pass / Fail`
- DNS verification values absent: `Pass / Fail`
- Stack traces absent: `Pass / Fail`
- SQL diagnostics absent: `Pass / Fail`
- Staff-only/internal notes absent: `Pass / Fail`
- AI notes absent: `Pass / Fail`

## Monitoring Observations

Capture observations for the launch window.

- Monitoring window start:
- Monitoring window end:
- `/api/health` stayed green: `Pass / Fail`
- Public intake success count:
- Public intake error count:
- `404` count:
- `410` count:
- `429` count:
- `500` count:
- Audit count for `publicIntakeRouteSource = legacy_fallback`:
- Audit count for `publicIntakeRouteSource = slug`:
- Audit count for `publicIntakeRouteSource = token`:
- Audit count for `publicIntakeRouteSource = domain`:
- Any unexpected parish ids: `Yes / No`
- Any `Public intake submission failed` server logs: `Yes / No`
- Any staff reports of missing or misrouted requests: `Yes / No`
- Any family-facing support reports: `Yes / No`
- Monitoring notes:

## Rollback Verification

Run this after switch-on validation or immediately if any stop condition is met.

- `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` removed or invalidated: `Pass / Fail`
- `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` removed or invalidated: `Pass / Fail`
- Runtime restarted/redeployed after rollback flag change: `Pass / Fail`
- `/api/health` after rollback returned `checks.schema: true`: `Pass / Fail`

Rollback public form results:

| Workflow | URL tested | HTTP status | Request ID | Parish ID | Audit Event ID | `publicIntakeRouteSource` | `publicIntakeRoutingRuntimeEnabled` | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baptism | `/baptism-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Wedding | `/wedding-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Funeral | `/funeral-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| OCIA | `/ocia-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |
| Join Parish | `/join-parish-request` |  |  |  |  | `legacy_fallback` | `false` | `Pass / Fail` |

Rollback route-signal test:

- Token signal ignored after rollback: `Pass / Fail`
- Domain signal ignored after rollback: `Pass / Fail`
- Slug signal ignored after rollback: `Pass / Fail`
- Forged staff active parish cookie ignored after rollback: `Pass / Fail`
- Legacy behavior restored: `Pass / Fail`
- No database rollback required: `Pass / Fail`
- Rollback notes:

## Stop Conditions Review

- Any request routed to wrong parish: `Yes / No`
- Any family response exposed internal diagnostics: `Yes / No`
- `/api/health` failed after switch-on: `Yes / No`
- Staff could not find routed requests: `Yes / No`
- Audit route-source metadata missing: `Yes / No`
- Rollback owner unavailable: `Yes / No`
- Product-owner approval missing or ambiguous: `Yes / No`
- Stop condition triggered: `Yes / No`
- Action taken:

## Automated Check Outputs

- Focused production evidence-template tests:

```text

```

- Full test suite:

```text

```

- Lint:

```text

```

- Build:

```text

```

## Unresolved Risks

- Open defects:
- Deferred fixes:
- Manual QA gaps:
- Security concerns:
- Product/UX concerns:
- Customer communication concerns:
- Monitoring concerns:
- Rollback concerns:

## Sign-Off

| Role | Name | Decision | Date/Time | Notes |
| --- | --- | --- | --- | --- |
| Product owner |  | `Approve / Do Not Approve / Approve After Fixes` |  |  |
| Engineering owner |  | `Approve / Do Not Approve / Approve After Fixes` |  |  |
| QA owner |  | `Approve / Do Not Approve / Approve After Fixes` |  |  |
| Rollback owner |  | `Ready / Not Ready` |  |  |
| Support owner |  | `Ready / Not Ready` |  |  |

## Final Decision

- Production runtime routing remains enabled after smoke test: `Yes / No`
- Production runtime routing was rolled back after smoke test: `Yes / No`
- Customer rollout approved: `Yes / No`
- Additional fixes required:
- Follow-up owner:
- Follow-up due date:

## What Changed Plain English

This template is where Vinea records proof from a future production smoke test. It gives the team one place to capture baseline behavior, parish-specific slug/token/domain tests, audit details, DNS and HTTPS proof, monitoring observations, rollback proof, and final sign-off. This template does not turn routing on.
