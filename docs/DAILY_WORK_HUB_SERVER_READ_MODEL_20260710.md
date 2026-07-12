# Daily Work Hub Server Read Model

Date: 2026-07-10

Status: Implemented and locally verified.

## Purpose

The Daily Work Hub previously assembled its main request queue, parishioner contacts, checklist summary, funeral/wedding/OCIA details, and relationship suggestions through browser-side Supabase queries. `GET /api/dashboard/work-hub` now returns the existing staff-facing queue and safe suggested-action DTOs from an authenticated server-owned read path.

## Authorization

- Staff authentication runs before parish resolution or operational reads.
- The httpOnly active-parish cookie takes precedence over the browser hint.
- A supplied parish must resolve through exact active staff membership.
- Forged or cross-parish selections receive a generic not-found response before the loader runs.
- Primary-parish compatibility fallback remains available only when no selected parish signal exists.
- The route uses the authenticated staff read client and never creates a service-role client.

## Data Boundaries

- Request, parishioner, checklist, and funeral/wedding/OCIA enrichment is assembled on the server.
- Funeral, wedding, and OCIA queries use explicit field projections; wildcard detail projections are forbidden.
- Relationship-intelligence reads explicitly constrain parishioners, people, sacramental records, baptism candidates, and certificate events to the validated active parish.
- Household membership reads are limited to person IDs already returned by the active-parish people query.
- The browser no longer imports the Supabase client for Daily Work Hub data, performs operational table reads, or renders database technical details.

## Behavior

- Existing staff-reviewed queue, filters, follow-up controls, care plans, reminder cues, and suggested actions remain unchanged.
- Daily operating supporting signals remain on their separate minimal aggregate endpoint.
- Request queue failures return stable staff guidance without technical detail.
- Relationship-suggestion failures keep the queue available with a generic partial-data warning.

## Explicit Non-Goals

- No records are mutated.
- No communication, Google Calendar, storage, export, AI, or external provider is called.
- No migration or operational RLS policy is added or changed.
- No production-sensitive flag, production approval, or public trust claim is enabled.

## Verification

- Focused Work Hub, Notifications Center, selected-parish, projection, and source suite: `9 files / 29 tests passed`.
- Full Vitest regression suite: `683 files / 2,693 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Next.js production build: `PASS` with Next.js `16.2.10`, the dynamic Work Hub route, and `56` static pages generated.
- Repository secret scan: `1,863 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff: `80 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence: `510 required phrases / 0 findings`.
- `git diff --check`: `PASS`.
