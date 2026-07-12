# Public Intake Runtime Wiring Acceptance Criteria

Last Updated: 2026-06-26

## Status

Acceptance criteria for safe QA runtime wiring. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.

## Purpose

This document defines the manual QA steps and pass/fail criteria required before runtime routing can be accepted beyond the safe QA wiring phase.

## Explicit Non-Goals

- Do not enable runtime public intake routing in production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not touch production data.
- Do not expose public tokens, token hashes, DNS verification tokens, DNS verification values, stack traces, or internal routing diagnostics.

## Required Environment States

### Flag Off

Use this state for legacy regression:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME unset or any value other than ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK unset or any value other than APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

Expected result: `/api/intake` must use the legacy primary parish behavior.

### Flag On

Use this state only in a safe QA or disposable environment after product-owner approval:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

Expected result: `/api/intake` may resolve parish scope by valid token, verified domain, enabled slug, or approved legacy fallback.

## Flag-Off Public Form Regression

Run these steps with runtime routing disabled.

1. Start the app with both runtime routing flags unset or invalid.
2. Confirm `/api/health` reports `checks.schema: true` in the QA environment being tested.
3. Submit safe test data through `/baptism-request`.
4. Submit safe test data through `/wedding-request`.
5. Submit safe test data through `/funeral-request`.
6. Submit safe test data through `/ocia-request`.
7. Submit safe test data through `/join-parish-request`.
8. Repeat one public form with a fake token signal in the URL.
9. Repeat one public form with a fake slug signal in the URL.
10. Repeat one public form from a host/domain signal that should not be trusted while the flag is off.
11. Repeat one public form with a forged staff active parish cookie.
12. Confirm normal public intake rate limiting allows ordinary safe submissions.
13. Confirm repeated submissions eventually receive the expected public `429` rate-limit response.

Pass criteria:

- Every public form creates the same type of request it created before routing work began.
- All created records use the legacy primary parish id.
- Token, domain, slug, and forged staff active parish cookie signals are ignored.
- Durable rate limiting still runs before request body parsing and before database inserts.
- No public response includes raw routing diagnostics.

Fail criteria:

- Any form stops creating a request that worked before.
- Any flag-off request is created under a token, domain, slug, or cookie-selected parish.
- Rate limiting is bypassed or only runs after database writes.
- Any public response exposes internal routing details.

## Flag-On Token Routing

Run these steps with runtime routing enabled in a safe QA or disposable environment.

1. Create or identify an active public intake token for a safe parish and allowed request type.
2. Copy the one-time visible token value at creation time.
3. Submit the matching public form with the token signal.
4. Confirm the request is created under the token's parish.
5. Confirm the request type matches the token's allowed request type.
6. Confirm the raw token and stored token hash are not visible in public responses, staff UI tables, or audit metadata.
7. Deactivate the token.
8. Submit the same token again.

Pass criteria:

- Active valid token creates the request under the expected parish.
- Deactivated token returns only the generic public error.
- Audit metadata records `publicIntakeRouteSource` for token routing.
- Audit metadata records `publicIntakeRoutingRuntimeEnabled = true`.
- Raw token values and token hashes are never exposed.

## Flag-On Domain Routing

Run these steps with runtime routing enabled in a safe QA or disposable environment.

1. Create or identify a verified active public intake domain for a safe parish.
2. Submit a public form from that host or from a QA host simulation that uses the same normalized domain signal.
3. Confirm the request is created under the verified domain's parish.
4. Deactivate the domain.
5. Submit from the same domain again.

Pass criteria:

- Verified active domain creates the request under the expected parish.
- Deactivated domain returns only the generic public error.
- Audit metadata records `publicIntakeRouteSource` for domain routing.
- DNS verification tokens and DNS verification values are not exposed in public responses or audit metadata.

## Flag-On Slug Routing

Run these steps with runtime routing enabled in a safe QA or disposable environment.

1. Create or identify an enabled public intake slug for a safe parish.
2. Submit a public form with that slug signal.
3. Confirm the request is created under the slug's parish.
4. Disable the parish or disable the slug route.
5. Submit with the same slug again.

Pass criteria:

- Enabled slug creates the request under the expected parish.
- Disabled parish or disabled slug returns only the generic public error.
- Audit metadata records `publicIntakeRouteSource` for slug routing.

## Generic Error Cases

Run these cases with runtime routing enabled in a safe QA or disposable environment.

| Case | Expected HTTP Result | Expected Public Error |
| --- | --- | --- |
| Expired public token | `410` or documented gone response | `Public intake form is not available.` |
| Unverified domain | `404` or documented not-found response | `Public intake form is not available.` |
| Disabled parish | `404` or documented not-found response | `Public intake form is not available.` |
| Mismatched request type | `404` or documented not-found response | `Public intake form is not available.` |

Pass criteria:

- Every public failure returns the generic error message only.
- Public failures do not create parishioners, requests, details, checklist rows, workflow steps, documents, or audit events for a request.
- Public failures do not expose raw public tokens, token hashes, DNS verification values, stack traces, table names, policy names, or internal routing diagnostics.

## Audit-Log Verification

Run these checks after successful flag-off and flag-on submissions.

1. Open the request audit trail as authenticated staff.
2. Confirm flag-off submissions include:
   - `publicIntakeRouteSource = legacy_fallback`
   - `publicIntakeRoutingRuntimeEnabled = false`
3. Confirm flag-on successful submissions include:
   - `publicIntakeRouteSource`
   - `publicIntakeRoutingRuntimeEnabled = true`
   - `publicIntakePublicDisplayName`
   - `publicIntakeResolvedRequestType`
4. Confirm existing audit metadata is preserved:
   - `requestType`
   - `fullName`
   - `workflowStepsCreated`
5. Search audit metadata for forbidden values.

Pass criteria:

- Audit metadata explains how the request was routed without exposing secrets.
- `requestType`, `fullName`, and `workflowStepsCreated` remain present.
- Raw public tokens, token hashes, DNS verification tokens, DNS verification values, internal routing diagnostics, and stack traces are absent.

## Rollback Verification

Run these steps in a safe QA or disposable environment after a flag-on pass.

1. Remove or disable `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME`.
2. Remove or invalidate `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK`.
3. Restart the app.
4. Submit safe test data through `/baptism-request`.
5. Submit safe test data through `/wedding-request`.
6. Submit safe test data through `/funeral-request`.
7. Submit safe test data through `/ocia-request`.
8. Submit safe test data through `/join-parish-request`.
9. Submit one form with token, domain, and slug signals present.
10. Confirm all created requests use the legacy primary parish id.
11. Confirm audit metadata records:
    - `publicIntakeRouteSource = legacy_fallback`
    - `publicIntakeRoutingRuntimeEnabled = false`

Pass criteria:

- Runtime routing can be turned off using environment configuration only.
- Public forms keep working after rollback.
- Token, domain, and slug signals no longer affect request creation.
- No database rollback is required for the runtime feature toggle rollback.

## Final Approval Criteria Before Live Wiring

The safe QA `/api/intake` runtime wiring implementation is not accepted until all are true:

- Flag-off public form regression passes.
- Flag-on token routing passes.
- Flag-on domain routing passes.
- Flag-on slug routing passes.
- Generic public error cases pass.
- Audit-log verification passes.
- Rollback verification passes.
- Source-level preflight tests pass.
- Product owner approves enabling live runtime public intake routing.

## What Changed Plain English

Vinea now has a plain checklist for proving parish-specific public forms are safe after the intake route is wired for QA. It says exactly what to test while the feature is off, what to test when it is turned on in a safe environment, what errors families should see, what audit records staff should see, and how to turn the feature back off.
