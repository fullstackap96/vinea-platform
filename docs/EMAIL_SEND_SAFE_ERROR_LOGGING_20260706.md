# Email Send Safe Error Logging - 2026-07-06

Status: `IMPLEMENTED - STAFF ROUTE ERROR REDACTION`

Completion marker: `EMAIL_SEND_SAFE_ERROR_LOGGING_IMPLEMENTED_20260706`

## Scope

The authenticated staff email send API now uses the shared safe server error logger when Resend provider delivery fails or the route catches an unexpected exception.

## What Changed

- `app/api/email/send/route.ts` imports `logServerError` from `lib/server/safeErrorLogging.ts`.
- Resend provider errors are logged with redaction and returned to staff as a generic send-failed message.
- Unexpected exceptions are logged with redaction and returned as a generic `Could not send email.` response.
- Request JSON is narrowed through `unknown` before field access instead of relying on an implicit loose body shape.

## Safety Boundaries

- Does not send any new communication types.
- Does not change staff authentication or authorization.
- Does not enable production monitoring.
- Does not add production flags.
- Does not access production.
- Does not apply migrations.
- Does not change operational RLS.
- Does not mutate records beyond the already-approved email send operation when the route is called by authenticated staff.
- Does not call AI, run exports, access storage, create signed URLs, generate certificates, enable automation, or make public trust claims.

## Verification

- Focused route/source tests cover provider failure redaction, unexpected exception redaction, and source-level safe logger usage.
- Existing production build and full-suite checks should remain green after this scoped route hardening.

## Remaining Follow-Up

Other server routes still have raw `console.error` calls or return direct provider/database error messages. Continue migrating those routes in small, reviewed slices.
