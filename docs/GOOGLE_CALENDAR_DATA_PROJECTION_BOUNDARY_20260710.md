# Google Calendar Data Projection Boundary - 2026-07-10

Decision: `GOOGLE_CALENDAR_DATA_PROJECTION_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and fully verified locally without Google Calendar calls or production access.

## Scope

Google Calendar event create, update, and delete preparation now loads request and parishioner rows through explicit field projections instead of wildcard reads. Funeral, Wedding, and OCIA event assembly also loads only the type-specific fields the existing event builder consumes.

The selected fields remain intentionally sufficient to preserve the existing staff-reviewed event title and description. This slice minimizes database reads; it does not change which approved request details the existing provider payload may contain.

## Boundaries

- Staff authentication, selected active-parish membership, request ownership, parish integration selection, and mismatched-calendar protections remain unchanged.
- Provider create, update, and delete behavior remains unchanged.
- No Google Calendar API call was made during verification.
- No event was created, updated, or deleted.
- No browser operational Supabase read or write was added. Browser Supabase imports remain limited to login/logout authentication surfaces.
- No production access, migration, operational RLS change, feature flag, storage access, export, AI call, or outbound communication was used.

## Explicit Projections

The shared request projection contains request identity/type, parishioner relationship, existing confirmed Baptism scheduling fields, the existing notes used by event assembly, and stored Google Calendar linkage fields.

The parishioner projection contains identity, parish ownership, display name, email, and phone because those values are already used by the existing event description and same-parish ownership check.

Funeral, Wedding, and OCIA detail projections contain only the fields currently consumed by `buildCalendarEventFromRequest`. No `select('*')` remains in the Calendar event lifecycle routes or the type-specific event-assembly reads.

The projection strings are compile-time literals so Supabase's TypeScript field parser validates returned row shapes during typecheck.

## Verification

`lib/server/googleCalendarDataProjectionBoundary.test.ts` proves:

- the exact shared request and parishioner projection field sets;
- create, update, and delete routes contain no wildcard operational reads;
- all three routes use the shared explicit projections before ownership checks;
- Funeral, Wedding, and OCIA event assembly uses explicit detail projections; and
- operational browser components do not import the browser Supabase client.

Current local verification:

- focused projection and active-parish route suite passed;
- full Vitest regression suite passed: 697 files / 2,767 tests;
- standard and all-file TypeScript checks passed;
- quiet lint passed; and
- Next.js 16.2.10 production build passed with 56 static pages generated.

## Manual QA Still Recommended

Use an explicitly approved synthetic non-production Calendar fixture to confirm create, update, and delete payloads remain behaviorally identical for Baptism, Funeral, Wedding, and OCIA requests. This local source/test evidence is not a substitute for provider smoke evidence and does not approve production Calendar operations.
