# Request Schedule Mutation Body Size Boundary

Status: `REQUEST_SCHEDULE_MUTATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The five request-detail routes that save suggested dates or confirmed Baptism, Funeral, Wedding, and OCIA times now enforce a `32 KiB` JSON ceiling before request access resolution or schedule writes.

## Preserved Authorization And Behavior

- Staff authentication remains before bounded parsing.
- Active-parish request ownership and request-type checks remain before writes.
- Funeral and Wedding detail ownership checks remain unchanged.
- OCIA detail preparation remains after request authorization.
- Valid date save/clear behavior remains unchanged.
- Malformed JSON keeps each route's existing generic invalid-update response.
- Oversized JSON returns generic HTTP `413`.
- Rejected bodies do not update suggested or confirmed dates.

## Safety Boundaries

- This change does not contact Google Calendar or mutate calendar events.
- This change does not send communications or enable automation.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not alter active-parish fallback or membership behavior.
- This change does not enable production flags or make public trust claims.

## Verification

Source-level tests pin authentication-before-body ordering, the 32 KiB ceiling, service-role/request-access placement, request ownership before schedule writes, generic rejection, and no direct `request.json()` parsing.

## Plain-English Summary

Staff can save and clear normal suggested or confirmed parish dates as before. Damaged or abnormally large schedule requests now stop before Vinea opens or changes the request.
