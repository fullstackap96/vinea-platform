# Sacramental Records List Safe Errors - 2026-07-07

Status: Implemented as a scoped Catholic-records production-readiness hardening slice.

## Summary

`lib/server/loadSacramentalRecordsList.ts` now maps the main Sacramental Records list query failure through the shared dashboard-safe Supabase error helper before showing an error on the staff-facing Records page. Raw Supabase/database error text is no longer used as the page `errorMessage` for the main records query.

## Covered Behavior

- Staff authentication and selected active parish resolution are unchanged.
- The records query still uses the validated active parish context before loading records.
- Main `sacramental_records` query failures return `Could not load sacramental records. Please try again or contact support if this continues.`
- Sensitive-looking raw error text such as database URLs, token-like values, bearer tokens, and provider details remains out of the staff-facing page message.
- Continuity summary partial-load guidance remains unchanged: `Could not load all continuity signals. Parish-scoped records are still shown.`

## Safety Boundary

This change does not mutate records, link records automatically, generate certificates, make sacramental/canonical eligibility decisions, alter selected active parish scope, apply migrations, change operational RLS, enable production flags, call AI, run exports, access storage, create signed URLs, send communications, touch Google Calendar data, or make public trust claims.

## Verification

- `npm.cmd test -- lib\server\loadSacramentalRecordsList.test.ts lib\server\sacramentalRecordsSelectedParishScopeUi.test.ts lib\server\sacramentalRecordsListSafeErrorsDoc.test.ts lib\server\readmeProductionReadiness.test.ts`

Manual safe non-production QA should open `/dashboard/records` for an authorized staff session, switch between authorized parishes, and confirm normal record loading and continuity filters still work. If practical, simulate a main records query failure and confirm staff see only the stable retry/support message above.
