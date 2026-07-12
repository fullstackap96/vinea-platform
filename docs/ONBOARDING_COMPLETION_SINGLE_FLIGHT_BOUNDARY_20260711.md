# Onboarding Completion Single-Flight Boundary

Decision: `ONBOARDING_COMPLETION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without marking a parish complete.

## Protected Completion Action

The Onboarding page now acquires a synchronous browser lock after its existing readiness prerequisites pass and before calling the authenticated selected-parish Settings PATCH. A rapid repeat click cannot dispatch a second completion request before React renders pending state.

The readiness summary exposes accessible busy state. Settings and setup-step navigation are temporarily removed from keyboard/pointer interaction while completion and its post-save refresh settle, preventing a same-screen navigation from abandoning the staff-reviewed operation. Navigation returns after success or handled failure through the existing `finally` path.

## Preserved Server And Product Boundaries

The existing Settings route remains authoritative for same-origin enforcement, staff authentication, selected-parish membership/write scope, validation, persisted-row confirmation, safe audit metadata, and generic failure behavior. Existing readiness prerequisites remain mandatory before completion.

The go-live panel remains advisory. Completion does not approve production deployment, production-sensitive features, public trust claims, exports, AI, public intake routing, operational RLS rollout, or unsupervised customer use. The existing supervised pilot wording is unchanged.

## Boundary

This is immediate same-screen exclusion. It is not durable server idempotency, cross-tab/device replay protection, optimistic concurrency control, or a production approval gate.

No production or shared-QA access, onboarding/settings mutation, migration, operational RLS change, communication send, provider or Calendar call, AI call, export, storage access, certificate action, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/onboardingCompletionSingleFlightBoundary.test.ts` verifies lock ordering before PATCH, prerequisite preservation, `finally` release, accessible busy state, temporary navigation hold, selected-parish payload preservation, and safe result guidance. Existing onboarding, go-live readiness, Settings route, selected-parish, safe-message, same-origin, and persistence suites remain authoritative for behavior.

- Focused onboarding and Settings regression: 8 test files and 59 tests passed.
- ESLint passed.
- Full TypeScript checking passed.
- Production-sensitive gate validation passed with all 15 artifacts linked and production-sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed.
- The latest full repository regression baseline remains 775 test files and 3,276 tests passed.
