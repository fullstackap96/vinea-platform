# Dashboard Supabase Error Redaction - 2026-07-07

Status: Implemented as a scoped production-readiness hardening slice.

## Summary

`lib/dashboardSupabaseError.ts` now redacts sensitive-looking values before developer-only dashboard console logs and technical detail strings are emitted.

The helper still preserves useful development hints such as PostgREST/Postgres error codes, missing-column detection, and sanitized message/detail/hint text. Production user-facing dashboard errors remain generic.

## Redacted Values

- Database URLs
- JWT-like values
- Bearer tokens
- API/token-like values
- Email addresses

## Safety Boundary

This change does not alter dashboard data loading, selected-parish scope, authentication, operational RLS, migrations, production flags, exports, AI, storage, signed URLs, communications, certificates, Google Calendar data, or public trust-center claims.

## Verification

- Source/unit test: `lib/dashboardSupabaseError.test.ts`
- Expected behavior: developer technical details keep safe labels and error codes, while secret-like values are replaced by redaction labels.
- Expected production behavior: unchanged generic dashboard load messages.
- Focused regression bundle passed: `npm.cmd test -- lib\dashboardSupabaseError.test.ts lib\server\parishGoogleCalendarServerSafeErrors.test.ts lib\server\publicIntakeClientNotificationLogging.test.ts lib\server\releaseReadinessCheckScript.test.ts`.
- Standard checks passed: `npm.cmd run typecheck`, `npm.cmd run typecheck:all`, `npm.cmd run lint -- --quiet`, and `npm.cmd run build`.
- Full test suite passed: 465 test files, 1,969 tests.
