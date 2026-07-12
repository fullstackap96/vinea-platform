# Request Pastoral Detail Body Size Boundary

Status: `REQUEST_PASTORAL_DETAIL_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The staff-only Funeral and Wedding request-detail routes now enforce a `128 KiB` JSON ceiling before request access resolution, detail-table reads, or upserts.

## Preserved Authorization And Behavior

- Staff authentication remains before bounded parsing.
- Active-parish ownership and Funeral/Wedding request-type checks remain before upserts.
- Existing field validation remains unchanged.
- Existing confirmed service or ceremony timestamps remain preserved during detail saves.
- Malformed JSON keeps the existing generic invalid-detail response.
- Oversized JSON returns generic HTTP `413`.
- Rejected bodies do not read or upsert Funeral or Wedding detail rows.

## Safety Boundaries

- This change does not make canonical, sacramental, pastoral, or eligibility decisions.
- This change does not contact or mutate Google Calendar.
- This change does not send communications or enable automation.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not enable production flags or make public trust claims.

## Verification

Source-level tests pin authentication-before-body ordering, the 128 KiB ceiling, service-role/request-access placement, request ownership before detail upserts, confirmed-date preservation, generic rejection, and no direct `request.json()` parsing.

## Plain-English Summary

Staff can save normal Funeral and Wedding planning details as before. Damaged or abnormally large saves now stop before Vinea opens or changes those pastoral records.
