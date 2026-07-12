# Daily Brief Safe Error Logging - 2026-07-06

Status: Implemented as a scoped daily-operations email production-readiness hardening slice.

## Scope

The `/api/parish/daily-brief` route now logs unexpected manual-send, cron-list, cron-send, and Resend provider failures through the shared safe error logging helper.

## Staff And Cron Error Boundary

Manual staff-triggered daily brief failures return:

- `Could not send daily brief.`

Cron-level failures return:

- `Daily brief cron failed.`

Per-parish cron send failures persist and return the generic status:

- `Daily brief send failed.`

No raw Resend provider, configuration, or database error messages are returned to staff clients, cron responses, or `daily_ops_brief_last_error` by these unexpected failure paths.

## Preserved Behavior

- Staff authentication is still required for manual daily brief sends.
- Manual daily brief sends still resolve the selected active parish through authenticated staff parish context.
- Cron sends still require cron authorization and remain all-enabled-parish scoped.
- Daily brief email rendering, subject generation, recipient selection, successful sent tracking, and last-sent updates are unchanged.
- The existing staff validation message for a missing daily brief email is preserved.

## Non-Goals

- No production access.
- No production flags.
- No migrations.
- No operational RLS changes.
- No Google Calendar changes.
- No AI calls.
- No export runtime changes.
- No storage or signed URL changes.
- No certificate generation.
- No automation expansion beyond the existing daily brief send behavior.
- No public trust claims.

## Verification

- Focused source tests validate that the Daily Brief route imports `logServerError`, logs manual, cron, and provider failure actions, returns generic staff/cron messages, persists generic per-parish cron send errors, removes `console.error`, and does not return or persist raw provider messages.
- Docs validation tests confirm this evidence file documents the generic messages, no-go boundaries, and raw-provider-message exclusion.
