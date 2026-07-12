# Request Communication Body Size Boundary

Status: `REQUEST_COMMUNICATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The staff-only request communication logging route now enforces a `64 KiB` JSON ceiling before request access resolution or communication-history writes.

## Preserved Authorization And Behavior

- Staff authentication remains before body parsing.
- Active-parish request ownership remains before both writes.
- Valid communication method, timestamp, and notes validation remains unchanged.
- Malformed JSON continues to return the existing generic invalid-log response.
- Oversized JSON returns generic HTTP `413`.
- Rejected bodies do not create communication rows or update request summaries.

## Safety Boundaries

- This change does not send communications.
- This change does not alter active-parish fallback or membership behavior.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not enable automation, AI, exports, or production flags.
- This change does not make a public trust claim.

## Verification

Source-level tests pin staff-auth-before-body ordering, the 64 KiB ceiling, request ownership before inserts, both write anchors after authorization, generic rejection, and the absence of direct `request.json()` parsing.

## Plain-English Summary

Staff can log normal calls, emails, texts, and visits as before. Damaged or abnormally large log requests now stop before Vinea opens the request or writes communication history.
