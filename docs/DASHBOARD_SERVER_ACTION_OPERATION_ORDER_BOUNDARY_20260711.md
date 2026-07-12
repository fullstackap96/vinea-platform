# Dashboard Server Action Operation-Order Boundary - 2026-07-11

Decision: `DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified, including one runtime ordering fix.

## Automatic Coverage

The repository guard discovers **21 operational Server Actions** across People, Households, Mass Intentions, Sacramental Records, and Request Detail. Every discovered action must establish an authenticated user, resolve active-parish or request-ownership scope, reject failed scope, and finish that boundary before the first operational side effect.

This complements the Route Handler origin, authentication, tenant-order, and request-order guards. Server Actions do not use the browser `Origin` helper because Next.js provides their own transport boundary; their authenticated Supabase user and tenant/target scoping remain explicit and tested.

## Household Primary-Contact Fix

The audit found that `updateHouseholdMember` could clear the current Household primary contact before proving that the submitted member belonged to the selected household and parish. The action now performs a scoped member lookup first. A forged, stale, or cross-parish member id returns selected-parish not-found guidance without clearing or updating any member row.

The guard locks the ownership lookup and denial before both the Household primary-contact clear and target-member update.

## Limits

The source guard does not replace runtime RLS, input normalization, relationship validation, safe-error tests, audit metadata checks, or route-specific partial-success tests. Sequential multi-row Household primary-contact changes remain non-transactional because this slice adds no migration or database function.

## Preserved Boundaries

- No production access.
- No real record mutation during verification.
- No migration or operational RLS change.
- No communication, provider, Calendar, AI, export, storage, signed URL, or certificate action.
- No production-sensitive flag change.

Rollback is code-only. No schema or data rollback is required for the guard itself.
