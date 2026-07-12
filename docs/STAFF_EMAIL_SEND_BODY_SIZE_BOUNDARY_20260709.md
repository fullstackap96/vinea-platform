# Staff Email Send Body Size Boundary

Status: `STAFF_EMAIL_SEND_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The authenticated `/api/email/send` route now enforces a 128 KiB JSON body ceiling after staff authorization and before payload validation, provider construction, or delivery.

## Implemented Behavior

- Supabase Auth and Vinea staff authorization still run before the request body is read.
- Valid JSON at or below `128 KiB` continues through the existing recipient, subject, and text validation.
- Malformed JSON returns a generic HTTP `400` response.
- Oversized JSON returns a generic HTTP `413` response.
- Neither rejected path constructs the email provider client or sends a message.
- The route uses `lib/server/boundedJsonBody.ts` and no longer calls `request.json()` directly.

## Safety Boundaries

- This change does not send a test email.
- This change does not change staff authentication or authorization.
- This change does not enable AI, exports, automation, or any production-sensitive feature flag.
- This change does not access production, apply migrations, or change operational RLS.
- This change does not make a public trust-center claim.

## Verification

Focused route tests cover authorization-before-body ordering, the 128 KiB limit, generic malformed and oversized responses, unauthenticated rejection before body parsing, and no provider construction or delivery after rejection.

## Plain-English Summary

Signed-in staff can still send normal parish emails. Vinea now refuses abnormally large or malformed send requests before they can reach the email service.
