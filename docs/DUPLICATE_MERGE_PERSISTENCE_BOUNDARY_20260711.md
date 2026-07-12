# Duplicate Merge Persistence Boundary

Date: 2026-07-11

Status: Implemented and locally verified.

## Purpose

People and Household duplicate merges are destructive, staff-reviewed workflows. Supabase updates and deletes can complete without an error while matching zero rows. Vinea must not move linked data, delete a duplicate, announce a completed merge, or write completion history unless each required scoped mutation is positively confirmed.

## Runtime Boundary

- Both merge routes retain staff authentication, same-origin protection, selected active-parish membership, and same-parish canonical/duplicate ownership checks.
- A People merge that must transfer `parishioner_id` positively confirms the temporary duplicate-row unlink before updating the canonical Person.
- If the canonical Person update fails after that unlink, Vinea restores the exact duplicate parishioner link and confirms the restored row before returning ordinary retry guidance.
- If restoration cannot be confirmed, staff receive explicit administrator-review guidance instead of being encouraged to retry blindly.
- The canonical Person or Household update returns only `id` and must match before any linked-row movement or destructive deletion starts.
- A replacement canonical household membership/member insert returns only `id` and must match before the corresponding duplicate relationship is deleted.
- People merges now create and confirm the canonical household relationship before deleting the duplicate Person relationship. Household merges retain the same safe insert-before-delete order.
- Every expected duplicate household-membership row or household-member row deletion returns only `id` and requires a matched row.
- The final duplicate Person or Household deletion returns only `id` and requires a matched row.
- A database error or zero-row canonical update/delete returns the existing generic merge failure guidance.
- `person.merge_completed` and `household.merge_completed` are written only after the final deletion is positively confirmed.
- Success responses are returned only after the completion audit boundary.

## Staff Experience

The visible merge review and confirmation flow is unchanged. During a rare concurrent deletion or stale-row race, staff receive honest retry-safe failure guidance instead of a misleading completed message. If a replacement insert cannot be confirmed, the original duplicate relationship remains intact rather than being silently lost. A failed canonical Person update also restores a temporarily detached parishioner relationship when Vinea can confirm the compensation; uncertain restoration is surfaced for administrator review.

## Explicit Exclusions

- No production access or merge execution.
- No migration or operational RLS change.
- No browser-side database mutation.
- No Google Calendar, communication, AI, storage, signed URL, export, or certificate behavior.
- No claim that the existing multi-step merge is transactionally atomic. If a confirmed replacement insert is followed by a delete failure, both relationships can remain for staff review. A database transaction remains a separate schema/runtime design decision.

## Verification

- Runtime tests cover successful active-parish and legacy-fallback merges.
- Runtime tests prove a zero-row canonical update stops before linked-row movement/deletion and writes no completion audit.
- Runtime tests prove the temporary parishioner unlink must match, a failed canonical update restores the original link, and uncertain restoration returns manual-recovery guidance.
- Runtime tests prove zero-row replacement inserts stop before duplicate relationship deletion and write no completion audit.
- Runtime tests prove confirmed replacement inserts occur before their corresponding duplicate relationship deletion.
- Runtime tests prove a zero-row final delete returns generic failure and writes no completion audit.
- The source-level regression guard requires canonical-update confirmation, intermediate/final delete confirmation, and ordering before completion audit/success.

## Production Boundary

This hardening does not approve production deployment or any production-sensitive feature. Existing production gates remain locked.
