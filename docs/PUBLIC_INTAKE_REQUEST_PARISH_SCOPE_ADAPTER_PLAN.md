# Public Intake Request Parish Scope Adapter Plan

Last Updated: 2026-06-26

## Status

Runtime wiring approved for safe QA. The adapter contract is implemented, tested, and wired into `/api/intake` behind disabled-by-default flags.

## Purpose

Runtime public intake routing uses a small server-side adapter between `/api/intake` and the public parish-scope resolver. The adapter protects current flag-off behavior while making the route source visible for audit and QA.

## Current Behavior To Preserve

When `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` is not fully enabled:

- `/api/intake` must keep using the legacy primary parish path.
- Public tokens, domains, slugs, and staff active parish cookies must not affect request creation.
- Audit metadata should record `publicIntakeRouteSource = legacy_fallback`.
- Audit metadata should record `publicIntakeRoutingRuntimeEnabled = false`.
- If no legacy parish exists, the adapter must fail closed with a generic public error.

## Future Enabled Behavior

Only after product-owner approval and exact runtime flags:

```text
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED
VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME
```

the `/api/intake` wiring may pass explicit public route signals to `resolvePublicIntakeParishScope()`:

- Public token.
- Verified active domain.
- Enabled parish slug.
- Legacy public form path.

When routing is enabled, the adapter must pass through:

- `parishId`
- `routeSource`
- `publicDisplayName`
- resolved request type
- audit metadata:
  - `publicIntakeRouteSource`
  - `publicIntakeRoutingRuntimeEnabled`
  - `publicIntakePublicDisplayName`
  - `publicIntakeResolvedRequestType`

## Required Route-Source Metadata

Public intake audit entries should include:

```json
{
  "publicIntakeRouteSource": "token | domain | slug | legacy_fallback",
  "publicIntakeRoutingRuntimeEnabled": true,
  "publicIntakePublicDisplayName": "St. Example Parish",
  "publicIntakeResolvedRequestType": "baptism"
}
```

When runtime routing is disabled, audit metadata should include:

```json
{
  "publicIntakeRouteSource": "legacy_fallback",
  "publicIntakeRoutingRuntimeEnabled": false,
  "publicIntakePublicDisplayName": null,
  "publicIntakeResolvedRequestType": null
}
```

## Future `public_intake.created` Audit Event

The `/api/intake` runtime wiring merges adapter audit metadata into the existing `public_intake.created` audit event without removing the current request context.

Required metadata shape:

```json
{
  "requestType": "baptism",
  "fullName": "Family Contact Name",
  "workflowStepsCreated": 6,
  "publicIntakeRouteSource": "token | domain | slug | legacy_fallback",
  "publicIntakeRoutingRuntimeEnabled": true,
  "publicIntakePublicDisplayName": "St. Example Parish",
  "publicIntakeResolvedRequestType": "baptism"
}
```

Do not include:

- Raw public intake tokens.
- Token hashes.
- Domain verification tokens.
- DNS verification values.
- Internal routing errors or stack traces.

## Safety Rules

- Do not trust staff active parish cookies in public intake.
- Do not expose token hashes, verification tokens, or internal routing diagnostics to families.
- Use generic public errors for missing, expired, disabled, inactive, unverified, or mismatched route signals.
- Keep the durable public intake rate limit before database writes.
- Keep cleanup behavior for partial request creation.
- Keep Workflow Template step creation after the request row is created.
- Do not change operational RLS for this wiring.

## Validation Before Production Enablement

Before enabling runtime routing beyond safe QA, verify:

- Legacy public forms still create requests for Baptism, Wedding, Funeral, OCIA, and Join Parish with the feature flag off.
- Feature flag off ignores domain, token, and slug signals.
- Feature flag on routes verified domain submissions to the correct parish.
- Feature flag on routes valid public token submissions to the correct parish.
- Feature flag on routes valid slug submissions to the correct parish.
- Expired tokens return a generic public error.
- Unverified domains return a generic public error.
- Disabled parishes return a generic public error.
- Audit events include route-source metadata.
- No runtime response exposes private routing fields.

## What Changed Plain English

Vinea now has a written and tested plan for how public forms will eventually choose the right parish. The important part is that the current forms stay unchanged while the switch is off. Later, if the switch is deliberately turned on, Vinea will be able to record whether a request came through a token, a verified domain, a parish slug, or the old fallback path.
