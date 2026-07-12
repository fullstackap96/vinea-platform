# Core Dashboard Mutation Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice.

## Scope

The People, Households, Household Members, and Mass Intentions dashboard Server Actions now log unexpected mutation failures through the shared safe server logging helper and return stable staff-safe messages instead of raw Supabase/database `.message` text.

## Staff-Safe Messages

- `Could not create person.`
- `Could not update person.`
- `Could not create household.`
- `Could not update household.`
- `Could not add household member.`
- `Could not update household member.`
- `Could not create Mass intention.`
- `Could not update Mass intention.`

## Preserved Behavior

- Existing staff authentication checks are unchanged.
- Existing active-parish write context for create actions is unchanged.
- Existing primary-parish fallback remains only where no active parish cookie exists.
- Existing validation messages from the normalizers remain unchanged.
- Existing database mutations remain unchanged.

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, enable production flags, change exports, call AI, touch Google Calendar data, access storage, create signed URLs, send communications, generate certificates, enable automation, mutate unrelated records, or make public trust claims.

## Verification

- `lib/server/coreDashboardMutationSafeErrors.test.ts` verifies these actions import `logServerError`, keep the stable staff-safe messages, and do not return raw database/provider `.message` text in mutation failure responses.
