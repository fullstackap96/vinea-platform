# Staff Authorization Multi-Parish Active Rows - 2026-07-08

Status: Implemented as a safe multi-parish tenant-readiness hardening slice.

## What Changed

- Database-backed staff authorization now checks active `staff_users` rows by staff email across all staff rows instead of looking only inside the first parish row.
- If any active row for the staff email is `admin`, the staff session keeps the `admin` role.
- If no matching staff row exists, Vinea still preserves the existing development fallback behavior when explicitly allowed.
- The existing "Parish is not configured" message is preserved when no parish row exists.

## Why This Matters

In a multi-parish setup, valid staff can belong to Parish B without also having a staff row in the oldest Parish A row. Vinea should not deny that staff member just because the database contains another parish that was created first.

The selected active parish and membership-scoped route helpers still decide which parish data the staff session may access. This change only makes staff authentication aware that active staff rows can exist in more than one parish.

## Safety Boundary

- No production access.
- No migrations.
- No operational RLS changes.
- No record mutation.
- No Google Calendar data touch.
- No exports.
- No AI calls.
- No storage or signed URL access.
- No public trust claims.

## Verification

- Focused tests prove an active staff row in a non-oldest parish can authenticate.
- Focused tests prove multiple staff rows resolve to `admin` when any active row is admin.
- Focused tests prove the no-parish configured message remains intact.
- Source guard tests prove the old `.eq('parish_id', parishId)` and first-parish ordering pattern are not present in `requireStaff.ts`.

## Follow-Up

Continue production-readiness hardening by reviewing any remaining selected-parish or integration helpers that still contain compatibility fallback behavior outside an explicit migration boundary.
