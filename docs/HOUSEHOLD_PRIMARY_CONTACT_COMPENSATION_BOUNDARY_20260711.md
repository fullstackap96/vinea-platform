# Household Primary Contact Compensation Boundary

Date: 2026-07-11

Status: Implemented and locally verified.

## Purpose

The database permits only one primary contact per household. Adding or promoting a new primary therefore clears the prior primary before the final member write. Vinea must detect every stage and restore the prior state when the replacement write fails.

## Runtime Boundary

- Household/member and Person ownership remain authenticated and selected-parish scoped before primary-contact work.
- Clearing a prior primary now returns the exact cleared member id and treats database errors as failure.
- New Household Member inserts return only `id` and require a matched row.
- Household Member updates continue to return only `id` and require a matched row.
- If the member insert/update fails or matches no row, Vinea attempts to restore the previously cleared member using household, parish, and member id scope.
- Restoration must itself return the restored id.
- If restoration fails, staff receive explicit refresh-before-retry guidance rather than a misleading ordinary save error.

## Staff Experience

Normal add/edit behavior is unchanged. Failure messages now distinguish an ordinary unsuccessful member save from the rarer case where the previous primary contact could not be restored.

## Explicit Exclusions

- No production access or Household mutation execution.
- No migration or operational RLS change.
- No claim of database-transaction atomicity; the compensation path reduces risk within the current schema.
- No communications, Calendar, AI, exports, storage, signed URLs, certificate behavior, or public trust claims.

## Verification

- Runtime tests cover normal add/update, forged member denial, clear failure, successful restoration after insert failure, and explicit guidance after restoration failure.
- Source-level tests require scoped clear/restore persistence and compensation ordering.

## Production Boundary

This hardening does not approve production deployment. Existing production-sensitive gates remain locked.
