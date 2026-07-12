# Global Search Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY GLOBAL SEARCH LINK HARDENING`

Completion marker: `GLOBAL_SEARCH_SAFE_LINK_BOUNDARY_20260708`

This slice hardens staff-facing Global Search result links so request, person, household, and sacramental record results stay dashboard-internal.

## What Changed

- Global Search result links now use a shared `resultHref` helper backed by `safeDashboardHrefOrFallback`.
- Request, person, household, and record identifiers are trimmed and encoded before search results render their `href`.
- Blank identifiers fall back to the safe category dashboard queue instead of emitting malformed detail links.
- Existing partial-results warning behavior is preserved.

## Why This Matters

Global Search is one of the fastest ways staff move around Vinea. Search results should never create unsafe or malformed destinations, especially when imported data, test fixtures, or future integrations provide unusual identifiers.

## Safety Boundary

This change:

- does not mutate records.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Global Search remains selected-parish scoped through the existing loaders and does not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- request, person, and record search-result ids encode special characters.
- blank household ids fall back to `/dashboard/households`.
- source-level guard tests keep Global Search result links on the shared dashboard-only href utility.
- partial-results warnings remain separate from blocking errors.

Command:

```powershell
npm.cmd test -- lib/globalSearch/globalSearch.test.ts lib/server/globalSearchSafeLinkBoundary.test.ts lib/server/safeDashboardHrefUtility.test.ts
```

Expected result: pass.
