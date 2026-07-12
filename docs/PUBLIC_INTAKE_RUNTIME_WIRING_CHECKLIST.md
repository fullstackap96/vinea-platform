# Public Intake Runtime Wiring Checklist

Last Updated: 2026-06-26

## Status

Runtime wiring approved for safe QA. Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags.

## Purpose

This checklist defines the safety checks for the approved safe QA code path in `/api/intake` that can use parish-specific public routing by token, verified domain, or slug only when the exact runtime flags are enabled.

Detailed future insertion points, test gates, audit metadata merge rules, cleanup behavior, and rollback steps are documented in `docs/PUBLIC_INTAKE_RUNTIME_WIRING_IMPLEMENTATION_PLAN.md`.

Manual QA acceptance criteria for the future runtime wiring commit are documented in `docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md`.

## Current Legacy Behavior That Must Stay True With The Flag Off

When runtime routing is disabled:

- `/api/intake` uses the legacy primary parish id.
- Public token, domain, slug, and staff active parish cookie signals do not affect request creation.
- `parishioners.parish_id` is set from the legacy parish id.
- `requests` are linked to the parishioner created in that legacy parish.
- Type-specific request detail rows are created after the request row.
- Checklist rows are created after the request row.
- Workflow template steps are created after the request row.
- Audit events use the same legacy parish id.
- Durable public intake rate limiting runs before database writes.
- Partial request cleanup remains in place if downstream inserts fail.

## Disabled Runtime Gate Requirements

Before production enablement, tests must continue proving:

- Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` keeps legacy behavior.
- Incorrect `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` keeps legacy behavior.
- Missing `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` keeps legacy behavior.
- Incorrect `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` keeps legacy behavior.
- Domain, token, and slug signals are ignored while the gate is disabled.

## Future Enabled Runtime Requirements

Only after product-owner approval and exact feature flags:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

safe QA runtime wiring may:

- Call `getPublicIntakeRoutingRuntimeGate()`.
- Call `resolvePublicIntakeRequestParishScopeForFutureRuntime()`.
- Call `resolvePublicIntakeParishScope()` only through the adapter.
- Create request records under the adapter-returned `parishId`.
- Add audit metadata:
  - `publicIntakeRouteSource`
  - `publicIntakeRoutingRuntimeEnabled`
  - `publicIntakePublicDisplayName`
  - `publicIntakeResolvedRequestType`
- Keep raw public tokens, token hashes, DNS verification tokens, DNS verification values, and internal routing diagnostics out of audit metadata.
- Keep generic public errors for unavailable routes.

## Dry-Run Route-Signal Extraction Contract

Prepared helper:

```text
lib/server/publicIntakeRouteSignalDryRun.ts
```

This helper is imported by `/api/intake` only after safe QA route-wiring approval. It normalizes public routing signals before the adapter decides whether to use the legacy parish path or the routed resolver.

The dry-run helper may extract:

- Request hostname from `x-forwarded-host`, `host`, or the request URL host.
- Public token from URL search params or future body-like values.
- Parish slug from URL search params or future body-like values.
- Request type from URL search params or future body-like values.
- Legacy public form path from an explicit input, URL search params, body-like values, or referer path.

When the runtime gate is disabled:

- `resolverWouldRun` must be `false`.
- Extracted token, domain, slug, and legacy path signals are observational only.
- Current `/api/intake` behavior must continue using the legacy primary parish id.

The dry-run helper also returns an audit-safe signal summary. That summary may record whether a public token was present, but it must not include the raw token value.

## Flag-Off End-To-End Planning Contract

Before runtime routing is wired, tests must compose:

- The disabled runtime gate.
- The dry-run route signals from host, token, slug, request type, legacy path, and any forged staff active parish cookie.
- The future parish-scope adapter.

With the runtime gate disabled:

- `resolverWouldRun` must be `false`.
- `routeSource` must remain `legacy_fallback`.
- The selected creation `parishId` must come from the legacy primary parish loader.
- Routed parish-scope resolver must not be called.
- Public token, verified-domain, and slug signals must remain observational only.
- Forged staff active parish cookies must remain ignored public-routing input.
- Audit-safe summaries must not include raw public token values.

## Switch-On Non-Runtime Planning Contract

Before live runtime routing is wired, tests must also compose:

- The enabled runtime gate.
- Dry-run route signals.
- The future parish-scope adapter.
- Mocked successful token, domain, and slug resolver responses.

With the runtime gate enabled in planning tests:

- `resolverWouldRun` must be `true`.
- The future parish-scope adapter must call the routed resolver with the dry-run routing input.
- The legacy primary parish loader must not be called.
- The adapter-returned `parishId` must match the mocked resolver parish id.
- `publicIntakeRouteSource` must match the mocked resolver route source.
- `publicIntakeRoutingRuntimeEnabled` must be `true`.
- `publicIntakePublicDisplayName` must match the mocked resolver public display name.
- `publicIntakeResolvedRequestType` must match the mocked resolver request type.
- Raw public tokens must not appear in adapter results or audit-safe dry-run summaries.

## Switch-On Failure Planning Contract

Before live runtime routing is wired, tests must also prove generic public errors are preserved for:

- expired token
- unverified domain
- disabled parish
- mismatched request type

With the runtime gate enabled and the routed resolver returning a public failure:

- The future parish-scope adapter must return the resolver failure unchanged.
- The public error message must remain `Public intake form is not available.`
- Expired token failures may return `410`.
- Unverified domain, disabled parish, and mismatched request type failures may return `404`.
- The legacy primary parish loader must not be called.
- Raw public tokens, token hashes, DNS verification values, and internal routing diagnostics must not appear in public failure responses.

## Regression Matrix Before Enabling Runtime Routing

Manual or automated QA must pass:

| Case | Flag State | Expected Result |
| --- | --- | --- |
| Baptism public form | Off | Creates request in legacy parish |
| Wedding public form | Off | Creates request in legacy parish |
| Funeral public form | Off | Creates request in legacy parish |
| OCIA public form | Off | Creates request in legacy parish |
| Join Parish public form | Off | Creates request in legacy parish |
| Domain signal present | Off | Ignored; legacy parish used |
| Token signal present | Off | Ignored; legacy parish used |
| Slug signal present | Off | Ignored; legacy parish used |
| Forged staff active parish cookie | Off | Ignored; legacy parish used |
| Verified domain | On | Correct parish used |
| Valid token | On | Correct parish used |
| Enabled slug | On | Correct parish used |
| Expired token | On | Generic public error |
| Unverified domain | On | Generic public error |
| Disabled parish | On | Generic public error |

## Explicit Non-Goals In This Phase

- No runtime import from `/api/intake`.
- No public page route changes.
- No migration.
- No production or shared QA data changes.
- No operational RLS changes.

## What Changed Plain English

Vinea now has a final pre-flight checklist for turning on parish-specific public forms later. The checklist says the current public forms must keep working exactly as they do today while the switch is off. It also lists what must be proven before Vinea can safely route future family requests by domain, token, or parish slug.
