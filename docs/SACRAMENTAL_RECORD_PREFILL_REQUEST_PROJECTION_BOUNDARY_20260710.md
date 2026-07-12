# Sacramental Record Prefill Request Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

The staff-reviewed request-to-record prefill action now loads only the request fields used to prepare the Sacramental Record form after active-parish request access has already been verified.

## Implemented Boundary

- The request query uses an explicit eight-field projection for request type, completion state, prefill names/date/notes, linked person, assigned priest label, and parishioner relationship.
- Unrelated request fields such as reply drafts, staff-only operational fields, future columns, and provider data cannot enter the prefill action through wildcard selection.
- Existing staff authentication, selected active-parish request authorization, primary-parish fallback boundary, supporting Funeral/Wedding/OCIA lookups, duplicate-record check, staff-safe errors, and prefill behavior remain unchanged.

## Verification

- Focused runtime tests assert the exact projection and existing active-parish access call.
- Source guards reject a return to wildcard selection.
- Standard TypeScript verification passed.

## Safety And Rollback

- No record was created or changed, no migration or RLS change occurred, and no production or external service was accessed.
- Rollback is code-only by restoring the previous request projection.
- Synthetic non-production QA should confirm Baptism, Wedding, Funeral, and OCIA prefill values plus cross-parish denial before deployment evidence is claimed.

## Production Boundary

This data-minimization change does not approve automatic record linking, certificate generation, canonical decisions, operational RLS promotion, or public trust claims.
