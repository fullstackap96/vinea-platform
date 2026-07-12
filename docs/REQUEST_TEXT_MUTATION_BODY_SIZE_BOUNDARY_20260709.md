# Request Text Mutation Body Size Boundary

Status: `REQUEST_TEXT_MUTATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The request-detail routes that save staff notes, AI summary text, and reply drafts now enforce a `256 KiB` JSON ceiling before request access resolution or database updates.

## Preserved Authorization And Behavior

- Staff authentication remains before bounded parsing.
- Active-parish request ownership remains before database updates.
- Valid string payloads continue to use the existing staff-reviewed save behavior.
- Malformed JSON keeps each route's existing generic invalid-update response.
- Oversized JSON returns generic HTTP `413`.
- Rejected bodies do not update staff notes, saved AI summaries, or reply drafts.

## Safety Boundaries

- This change does not call AI or send communications.
- This change does not generate or autonomously approve text.
- This change does not alter active-parish fallback or membership behavior.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not enable production flags or make public trust claims.

## Verification

Source-level tests pin authentication-before-body ordering, the 256 KiB ceiling, service-role/request-access placement, active-parish ownership before updates, generic rejection, and no direct `request.json()` parsing.

## Plain-English Summary

Staff can save ordinary notes and drafts as before. Damaged or abnormally large save requests now stop before Vinea opens or changes the parish request.
