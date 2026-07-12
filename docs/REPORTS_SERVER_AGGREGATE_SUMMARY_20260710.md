# Reports Server Aggregate Summary

Date: 2026-07-10

Status: Implemented and locally verified.

## Purpose

The Reports page previously loaded full dashboard request rows plus parishioner, checklist, and pastoral detail enrichment in the browser, then calculated four read-only report sections locally. `GET /api/dashboard/reports-summary` now returns only the finished request analytics, parish insights/trends, and staff workload DTOs.

## Authorization

- Staff authentication runs before parish resolution or report reads.
- The httpOnly active-parish cookie takes precedence over the server-resolved browser hint.
- A supplied parish must resolve through exact active staff membership.
- Forged or cross-parish selections receive a generic not-found response before report loading.
- Primary-parish compatibility fallback remains available only when no selected parish signal exists.
- The route uses the authenticated staff read client and does not create a service-role client.

## Data Minimization

The report loader selects only:

- Request identity, type, status, creation time, staff assignee, follow-up time, last-contact time, waiting-on state, and confirmed baptism date.
- Request identity plus the confirmed funeral, wedding, or OCIA schedule timestamp when applicable.

The browser no longer receives source request rows for reporting. Parishioner names/contact details, request notes, reply drafts, preferred dates, checklist rows, pastoral detail fields, documents, storage data, signed URLs, token material, or raw audit metadata are not part of the report summary response.

## Behavior

- Existing request count/type, open/completed, weekly intake, age, follow-up, unassigned, workload, blocked, aging, and upcoming schedule rules remain unchanged.
- All report DTOs use one server timestamp so tiles agree with each other.
- A missing schedule-detail source yields a generic partial-data warning while the remaining report metrics stay available.
- Unexpected failures produce stable report guidance with no browser-rendered technical detail.

## Explicit Non-Goals

- No records are mutated.
- No export, AI, communication, storage, signed URL, Google Calendar, or external provider is called.
- No migration or operational RLS policy is added or changed.
- No production-sensitive flag or public trust claim is enabled or approved.

## Verification

- Loader tests cover analytics parity, minimal request/detail projections, active-parish scope, partial schedule warnings, and blank-context no-read behavior.
- Route tests cover staff authentication, exact membership, forged-parish denial, cookie precedence, read-client use, and absence of mutation/service-role paths.
- Client source tests prove the Reports page uses the aggregate endpoint and no longer imports the raw dashboard request loader or renders technical details.
- Focused Reports aggregate suite: `5 files / 19 tests passed`.
- Expanded Reports and release-evidence suite: `8 files / 28 tests passed`.
- Full Vitest regression suite: `680 files / 2,682 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Next.js production build: `PASS` with Next.js `16.2.10`, the dynamic Reports summary route, and `55` static pages generated.
- Repository secret scan: `1,858 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff: `79 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence: `510 required phrases / 0 findings`.
- `git diff --check`: `PASS`.
