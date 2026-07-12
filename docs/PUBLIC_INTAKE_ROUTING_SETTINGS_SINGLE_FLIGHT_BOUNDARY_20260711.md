# Public Intake Routing Settings Single-Flight Boundary

Decision: `PUBLIC_INTAKE_ROUTING_SETTINGS_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without enabling runtime public intake routing.

## Protected Management Actions

Parish Settings now uses one synchronous browser lock across public-intake routing metadata save, domain add/activate/deactivate, DNS verification/reset, token creation, and token activate/deactivate. Every handler acquires the shared lock before calling the existing authenticated selected-parish API and releases it through `finally` after success or handled failure.

A rapid repeated action or a competing action elsewhere in the management surface is now a no-op before network dispatch. The whole management area exposes accessible busy state and freezes metadata, domain, verification, and token controls while one staff-reviewed command settles.

The one-time token value remains read-only and selectable so staff can secure it without the value being regenerated, mutated, or hidden by unrelated control state.

## Preserved Security And Product Boundaries

The existing server route remains authoritative for staff authentication, selected-parish membership, administrator authorization, input validation, token hashing, one-time token exposure, domain verification, safe audit metadata, and generic failures. Runtime public intake routing remains disabled and unwired unless its separate production approval gates are completed.

## Boundary

This is immediate same-screen exclusion. It is not durable server idempotency, cross-tab/device replay protection, DNS transactionality, or token-operation transactionality.

No production or shared-QA access, runtime public routing enablement, public request creation, record mutation, DNS/provider call, communication send, migration, operational RLS change, AI call, export, storage access, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/publicIntakeRoutingSettingsSingleFlightBoundary.test.ts` verifies one shared lock, acquisition before all seven management command families, `finally` release, globally frozen controls, selectable one-time token display, and the prepared-not-live boundary. Existing public-intake routing route and QA suites continue to cover active-parish authorization, admin checks, token hashing/redaction, domain verification, safe audit events, and runtime-routing separation.

Completed local checks:

- focused Settings, route, authorization, safe-message, and QA suite: 6 files / 68 tests passed;
- ESLint passed;
- all-file TypeScript check passed;
- all 15 production-sensitive gate artifacts remained linked and locked;
- Next.js 16.2.10 production build passed with all 56 static pages generated; and
- `git diff --check` passed.

The latest repository-wide regression baseline remains 775 files / 3,276 tests passed.
