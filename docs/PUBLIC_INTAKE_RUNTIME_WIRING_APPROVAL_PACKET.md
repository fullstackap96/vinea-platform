# Public Intake Runtime Wiring Approval Packet

Last Updated: 2026-06-26

## Status

Safe QA route wiring approved. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.

## Purpose

This packet records the completed safety work, remaining risks, and product-owner decision for safe QA route wiring. It does not approve production enablement.

## Explicit Non-Goals

- Do not enable runtime public intake routing in production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not touch production or shared QA data.
- Do not expose public tokens, token hashes, DNS verification tokens, DNS verification values, stack traces, or internal routing diagnostics.

## Product Decision Needed

Product owner has approved one decision for the current implementation phase:

```text
Approve runtime public intake route wiring for safe QA only.
```

This approval permits `/api/intake` to be wired behind disabled-by-default runtime flags, then tested in a safe QA environment. It does not approve production enablement.

The required runtime flags for any safe QA switch-on are:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

## Decision Options

| Decision | Meaning | Recommended When |
| --- | --- | --- |
| `Approve Safe QA Route Wiring` | The current commit may wire `/api/intake` to the prepared adapter behind the exact feature flags, then run QA with runtime routing enabled only in safe QA. | Product owner accepts the remaining risks and wants to validate real request creation by token, verified domain, and slug. |
| `Do Not Approve` | Runtime routing remains unwired. Continue improving docs, tests, or settings UX only. | Family-facing routing behavior is not yet approved or risks are unacceptable. |
| `Approve After Fixes` | Runtime routing remains unwired until named gaps are resolved. | One or more evidence gaps must be closed before touching `/api/intake`. |

## Completed Readiness Evidence

### Schema Readiness

Evidence:

- `supabase/migrations/20260625193000_public_intake_parish_routing.sql`
- `supabase/migrations/20260626103000_public_intake_domain_verification.sql`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `lib/server/healthCheck.test.ts`
- `lib/server/publicIntakeRoutingPromotedMigration.test.ts`
- `lib/server/publicIntakeDomainVerificationMigration.test.ts`

Summary:

- Public intake routing schema has been promoted into migrations.
- `/api/health` now expects public intake routing schema.
- Health-check failure labels are safe and do not expose SQL, tokens, hostnames, or private parish data.
- Domain verification schema is covered by migration tests.

### Disposable App QA

Evidence:

- `docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md`
- `lib/server/publicIntakeRoutingCompletedAppQaEvidence.test.ts`

Summary:

- Disposable app `/api/health` returned `checks.schema: true`.
- Baptism, Wedding, Funeral, OCIA, and Join Parish public intake regression passed.
- Normal public intake submissions passed.
- Durable public intake `429` behavior passed.
- Runtime public intake routing remained unwired during disposable QA.

### Staff Settings QA And Management Readiness

Evidence:

- `docs/PUBLIC_INTAKE_ROUTING_SETTINGS_MANUAL_QA_CHECKLIST.md`
- `lib/server/publicIntakeRoutingSettingsManualQaChecklist.test.ts`
- `lib/server/publicIntakeRoutingRoute.test.ts`

Summary:

- Staff-only metadata management exists for public display name, slug, and readiness flag.
- Staff-only domain management supports add, activate, deactivate, verification token metadata, verification reset, and DNS verification attempts.
- Staff-only token management supports one-time visible token creation, hashed token storage, activate, and deactivate.
- Management actions are audited.
- Normal metadata responses must not expose token hashes or raw tokens after creation.

### Resolver And Adapter Planning

Evidence:

- `docs/PUBLIC_INTAKE_REQUEST_PARISH_SCOPE_ADAPTER_PLAN.md`
- `lib/server/publicIntakeParishScope.test.ts`
- `lib/server/publicIntakeRequestParishScopeAdapter.test.ts`
- `lib/server/publicIntakeRoutingRuntimeGate.test.ts`
- `lib/server/publicIntakeRouteSignalDryRun.test.ts`
- `lib/server/publicIntakeRuntimePlanning.test.ts`

Summary:

- Public resolver logic has non-runtime tests for token, verified domain, slug, legacy fallback, disabled parish, expired token, mismatched request type, and forged staff active parish cookie cases.
- Runtime routing gate is disabled by default.
- Future adapter preserves legacy primary-parish behavior while runtime routing is disabled.
- Planning tests prove flag-off legacy fallback remains selected even when route signals are present.
- Planning tests prove flag-on token/domain/slug success metadata can be preserved.
- Planning tests prove flag-on failure cases keep generic public errors.

### Source Preflight Tests

Evidence:

- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_IMPLEMENTATION_PLAN.md`
- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_CHECKLIST.md`
- `lib/server/publicIntakeRuntimeWiringPreflight.test.ts`
- `lib/server/publicIntakeRuntimeWiringImplementationPlan.test.ts`
- `lib/server/publicIntakeRuntimeWiringScaffold.test.ts`

Summary:

- Future `/api/intake` wiring must keep durable rate limiting before body parsing.
- Route-scope resolution must happen before inserts.
- Runtime routing must stay behind the exact feature flags.
- Audit metadata must merge adapter metadata with current public intake metadata.
- Partial cleanup must remain intact.
- Current tests prove the live route uses the runtime routing helpers only through the approved disabled-by-default gate.

### Acceptance Criteria

Evidence:

- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md`
- `lib/server/publicIntakeRuntimeWiringAcceptanceCriteria.test.ts`

Summary:

- Manual QA criteria exist for flag-off public form regression.
- Manual QA criteria exist for flag-on token, domain, and slug routing.
- Manual QA criteria exist for generic error cases.
- Manual QA criteria exist for audit-log verification.
- Manual QA criteria exist for rollback verification.

## Remaining Risks

- Runtime public intake routing is wired into the live `/api/intake` route behind disabled-by-default flags.
- Flag-on live HTTP behavior must be proven in safe QA before production enablement.
- A real successful DNS TXT verification path remains untested unless a safe controllable domain is available.
- Production enablement would require a separate approval after safe QA route wiring passes.
- Public intake route wiring changes family-facing behavior, so any implementation must preserve generic errors and must not expose parish-private data.
- If QA uses shared data, test records and audit entries must be clearly marked as safe test data and cleaned up according to the QA plan.

## Required Implementation Boundaries After Approval

Because product owner chose `Approve Safe QA Route Wiring`, the implementation phase must:

1. Wire `/api/intake` to the prepared runtime gate and parish-scope adapter.
2. Keep runtime routing disabled by default.
3. Preserve legacy primary-parish behavior when the flags are off.
4. Require both exact flags before token/domain/slug routing can run.
5. Resolve parish scope before any database inserts.
6. Keep durable public intake rate limiting before body parsing and database writes.
7. Merge adapter audit metadata into `public_intake.created`.
8. Keep raw public tokens, token hashes, DNS verification values, stack traces, and internal routing diagnostics out of public responses and audit metadata.
9. Preserve partial cleanup behavior.
10. Add or update automated tests for flag-off and flag-on behavior.
11. Run manual QA from `docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md`.

## Required QA After Route Wiring

Safe QA route wiring is not accepted until all pass:

- `/api/health` returns `checks.schema: true`.
- Flag-off Baptism, Wedding, Funeral, OCIA, and Join Parish public form regression passes.
- Flag-off token, domain, slug, and forged staff active parish cookie signals are ignored.
- Flag-on valid token routes to the correct parish.
- Flag-on verified domain routes to the correct parish.
- Flag-on enabled slug routes to the correct parish.
- Expired token returns only `Public intake form is not available.`
- Unverified domain returns only `Public intake form is not available.`
- Disabled parish returns only `Public intake form is not available.`
- Mismatched request type returns only `Public intake form is not available.`
- Audit metadata includes `publicIntakeRouteSource`, `publicIntakeRoutingRuntimeEnabled`, `publicIntakePublicDisplayName`, and `publicIntakeResolvedRequestType`.
- Audit metadata preserves `requestType`, `fullName`, and `workflowStepsCreated`.
- Audit metadata does not expose raw public tokens, token hashes, DNS verification tokens, DNS verification values, stack traces, or internal routing diagnostics.
- Rollback by disabling `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` and `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` restores legacy behavior.

## Production Enablement Is A Separate Decision

This packet does not approve production switch-on.

Production enablement will require a future packet after safe QA wiring passes, including:

- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`.
- Safe QA flag-off evidence.
- Safe QA flag-on token/domain/slug evidence.
- Safe QA generic error evidence.
- Safe QA audit-log evidence.
- Safe QA rollback evidence.
- Deployment owner.
- Rollback owner.
- Customer communication plan if public URLs or parish domains are exposed to real families.

## Final Approval Record

Use this section when product owner is ready to decide.

```text
Decision: Approve Safe QA Route Wiring / Do Not Approve / Approve After Fixes
Approver:
Role:
Date:
Evidence reviewed:
Remaining required fixes, if any:
Rollback owner for QA:
Production enablement explicitly approved: No
```

## Decision

Decision: `Approve Safe QA Route Wiring`.

Reason: The schema, settings management, resolver planning, adapter planning, source preflight tests, and acceptance criteria are prepared. The remaining evidence gap is live flag-on behavior, which requires `/api/intake` to be wired behind the disabled-by-default runtime gate in a safe QA-only phase.

## What Changed Plain English

Vinea now has an approval record for safely wiring the public form routing switch into the intake route for QA only. The switch is still off by default and production use is not approved.
