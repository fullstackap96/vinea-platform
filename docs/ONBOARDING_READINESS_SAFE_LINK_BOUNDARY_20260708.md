# Onboarding Readiness Safe Link Boundary - 2026-07-08

Status: Implemented as a read-only onboarding/go-live readiness hardening slice.

## Scope

The parish onboarding readiness checklist now routes setup item links through the shared dashboard href utility. The current setup items still point to Parish Settings, but the helper makes the boundary explicit for future checklist expansion.

## Staff Experience

Staff still see the same setup checklist and go-live readiness guidance. The links remain simple: setup work points staff to the dashboard Settings page, while go-live remains blocked until required setup signals are complete.

## Production Safety

This slice does not:

- execute imports,
- apply migrations,
- mutate records,
- enable production flags,
- add integrations,
- change operational RLS,
- send communications,
- call AI,
- access storage,
- run exports,
- make production readiness or public trust claims.

## Verification

- `lib/parishOnboardingReadiness.test.ts`
- `lib/parishGoLiveReadiness.test.ts`
- `lib/server/parishGoLiveReadinessSource.test.ts`
