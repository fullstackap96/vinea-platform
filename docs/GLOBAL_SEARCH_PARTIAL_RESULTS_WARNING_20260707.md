# Global Search Partial Results Warning - 2026-07-07

Status: Implemented as a scoped daily operating-system and production-readiness UX hardening slice.

## Summary

Global Search now distinguishes between a blocking search failure and a partial category failure. If one search category fails while the rest of the selected-parish search can still run, Vinea returns a staff-safe warning instead of silently treating the failed category as empty.

## Covered Behavior

- Selected active parish scope remains the source of truth for people, household, sacramental record, parishioner, and request search filters.
- Full blocking errors still use `errorMessage`.
- Partial category failures now use `warningMessage`: `Some search results may be missing. Please try again if you do not see what you expected.`
- The full search page shows the warning above the result count.
- The dashboard search dropdown shows the warning inside the compact result group.
- Warning text does not include raw Supabase/database/provider messages, database URLs, token-shaped values, raw IDs, or credentials.

## Safety Boundary

This change does not mutate records, alter selected active parish scope, apply migrations, change operational RLS, enable production flags, send communications, call AI, run exports, access storage, create signed URLs, touch Google Calendar data, generate certificates, make sacramental/canonical eligibility decisions, or make public trust claims.

## Verification

- `npm.cmd test -- lib\server\loadGlobalSearch.test.ts lib\globalSearch\globalSearch.test.ts lib\server\globalSearchSelectedParishScopeUi.test.ts lib\server\globalSearchPartialResultsWarningDoc.test.ts lib\server\readmeProductionReadiness.test.ts`

Manual safe non-production QA should search from the dashboard dropdown and `/dashboard/search` for a known parish-scoped term, confirm normal results still display, then simulate or observe a partial category failure if practical and confirm staff see only the stable partial-results warning.
