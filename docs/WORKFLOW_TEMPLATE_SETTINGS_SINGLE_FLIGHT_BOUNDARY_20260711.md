# Workflow Template Settings Single-Flight Boundary

Decision: `WORKFLOW_TEMPLATE_SETTINGS_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without changing workflow data.

## Protected Staff Workflow

Workflow Template Settings now acquires a synchronous browser lock before the existing authenticated selected-parish PATCH route. A rapid repeat click or save on another visible step cannot dispatch a competing update before React renders pending state.

While one staff-reviewed step saves, Vinea freezes workflow-type switching, manual refresh, every editable field, required-step selection, and every Save step button. The section exposes accessible busy state and releases the lock through `finally` after success or handled failure.

## Preserved Server Authority

The existing route remains authoritative for same-origin enforcement, staff authentication, selected-parish membership/write scope, step-to-template ownership, bounded validation, minimal persisted-row confirmation, safe audit metadata, and generic failure behavior. Existing templates still apply only to new requests created after a saved change.

## Boundary

This is immediate same-screen exclusion. It is not durable server idempotency, cross-tab/device replay protection, optimistic concurrency control, version conflict detection, or a database transaction.

No production or shared-QA access, workflow-template mutation, migration, operational RLS change, communication send, provider or Calendar call, AI call, export, storage access, certificate action, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/workflowTemplateSettingsSingleFlightBoundary.test.ts` verifies lock ordering before PATCH, `finally` release, accessible busy state, frozen type/refresh/field controls, and preserved staff guidance. Existing route and selected-parish suites continue to cover authentication, membership, template ownership, validation, persistence, audit history, same-origin enforcement, and safe errors.

Completed local checks:

- focused client, route, selected-parish, body-size, same-origin, and operation-order suite: 7 files / 56 tests passed;
- ESLint passed;
- all-file TypeScript check passed;
- all 15 production-sensitive gate artifacts remained linked and locked;
- Next.js 16.2.10 production build passed with all 56 static pages generated; and
- `git diff --check` passed.

The latest repository-wide regression baseline remains 775 files / 3,276 tests passed.
