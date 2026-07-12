# Parish Settings Mutation Single-Flight Boundary

Decision: `PARISH_SETTINGS_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without saving settings or sending email.

## Protected Configuration And Delivery

Parish Settings save and manual Daily Brief delivery now share one synchronous browser lock. A settings save acquires it before `PATCH /api/parish/settings`; staff-confirmed manual delivery acquires it before `POST /api/parish/daily-brief`. Neither operation can begin while the other is in flight.

This prevents a Daily Brief recipient or enablement setting from changing in the browser while delivery is resolving the selected parish's stored configuration. It also prevents a manual send from starting against stale server settings while a configuration update is unconfirmed.

The form exposes accessible busy state and freezes the complete staff-reviewed configuration snapshot: parish name, onboarding state, default notification email, Daily Brief enablement/recipient, response targets, staff names, priest names, save, and manual-send controls. Existing operation-specific progress labels remain visible.

## Preserved Server Authority

The settings and Daily Brief routes remain authoritative for same-origin enforcement, staff authentication, selected-parish membership/write scope, validation, recipient derivation, provider confirmation, persisted-row confirmation, safe audit metadata, and partial-success guidance. Scheduled-delivery behavior is unchanged.

## Boundary

This is immediate same-screen mutual exclusion. It is not provider-level or durable server idempotency, cross-tab/device replay protection, optimistic concurrency control, or a transaction spanning settings persistence and provider delivery.

No production or shared-QA access, settings mutation, email or communication send, credential/provider/Calendar call, migration, operational RLS change, AI call, export, storage access, certificate action, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/parishSettingsMutationSingleFlightBoundary.test.ts` verifies shared lock ordering before both routes, `finally` release, complete form freezing, accessible busy state, and operation-specific progress. Existing settings, Daily Brief, same-origin, selected-parish, validation, safe-error, and delivery-persistence suites remain authoritative for server behavior.

Completed local checks:

- focused settings, Daily Brief, authorization, body-size, safe-error, same-origin, and delivery-persistence suite: 10 files / 79 tests passed;
- ESLint passed;
- all-file TypeScript check passed;
- all 15 production-sensitive gate artifacts remained linked and locked;
- Next.js 16.2.10 production build passed with all 56 static pages generated; and
- `git diff --check` passed.

The latest repository-wide regression baseline remains 775 files / 3,276 tests passed.
