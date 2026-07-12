# Household Member Primary-Contact Ownership Order - 2026-07-11

Decision: `HOUSEHOLD_MEMBER_PRIMARY_CONTACT_OWNERSHIP_ORDER_IMPLEMENTED_20260711`

Status: Implemented and verified without production access or schema changes.

## Problem

When staff marked an existing Household member as the primary contact, the Server Action previously cleared other primary-contact flags before the submitted member id had been proven to belong to the selected household and parish. A forged, stale, or cross-parish member id could therefore cause a partial mutation even though the final member update returned not found.

## Fix

`updateHouseholdMember` now performs an explicit selected-parish ownership lookup using member id, household id, and parish id before any primary-contact clearing or member update. Missing or mismatched targets return the existing safe `Household member not found for the selected parish.` guidance with no write.

The current sequential behavior for a valid primary-contact change is otherwise preserved. No migration or transactional database function was introduced.

## Verification

Focused runtime tests prove:

- same-parish member updates still succeed;
- ownership lookup occurs before the first primary-contact update;
- forged or cross-parish member ids return generic selected-parish not-found guidance; and
- denial performs no update and no primary-contact clearing query.

## Preserved Boundaries

- No production access or database mutation during verification.
- No migration or operational RLS change.
- No communication, provider, Calendar, AI, export, storage, signed URL, or certificate action.
- No production-sensitive flag change.

Rollback is code-only. Existing Household data is not automatically changed or repaired by this slice.
