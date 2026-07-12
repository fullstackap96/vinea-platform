# Request Schedule Audit Event Ownership Boundary - 2026-07-10

Status: `REQUEST_SCHEDULE_AUDIT_EVENT_OWNERSHIP_IMPLEMENTED_20260710`

## Scope

Vinea now records confirmed Baptism, Funeral, Wedding, and OCIA schedule changes plus Google Calendar create/update/delete lifecycle events from the authenticated selected-parish route that owns the operation. Request Detail no longer posts any request audit event from the browser, and `POST /api/audit-events` rejects every request-target write generically.

## Server-Owned Schedule Events

| Owning route | Safe schedule kind | Safe operation |
|---|---|---|
| `PATCH /api/requests/[id]/confirmed-baptism-date` | `confirmed_baptism_date` | `set` or `cleared` |
| `PATCH /api/requests/[id]/confirmed-funeral-service` | `confirmed_funeral_service` | `set` or `cleared` |
| `PATCH /api/requests/[id]/confirmed-wedding-ceremony` | `confirmed_wedding_ceremony` | `set` or `cleared` |
| `PATCH /api/requests/[id]/confirmed-ocia-session` | `confirmed_ocia_session` | `set` or `cleared` |
| `POST /api/google/calendar-event/create` | `google_calendar_event` | `created` |
| `POST /api/google/calendar-event/update` | `google_calendar_event` | `updated` |
| `POST /api/google/calendar-event/delete` | `google_calendar_event` | `removed` |

Each event is written only after the protected database operation succeeds. Google lifecycle events are written only after both the existing provider operation and request-link update succeed. Existing partial-success errors remain unchanged when Google succeeds but Vinea cannot update the request.

## Privacy And Integrity Boundary

Schedule audit metadata contains only a fixed source label, allowlisted schedule kind, and allowlisted operation. It does not contain:

- dates, times, time zones, proposed schedules, or pastoral schedule notes;
- Google event ids, calendar ids, links, event content, conflict data, or OAuth material;
- request/parish identifiers supplied by the browser;
- credentials, tokens, provider payloads, document content, or secrets.

Parish id, request id, and actor identity are derived from authenticated selected-parish scope and the same-parish request operation.

## Behavior Preserved

- Existing authentication, active-parish membership, request ownership, request-type checks, and selected-parish Google integration checks remain.
- Existing conflict detection, mismatched-calendar denial, provider behavior, partial-success guidance, staff messages, and UI refresh behavior remain.
- Audit writing remains best effort and does not replay a completed database or provider operation.
- The Audit Events API remains available for authenticated reads and approved non-request admin events; request-target POST is now server-only through route/helper code.

## Verification Boundary

- Focused schedule audit ownership suite: `9 files / 57 tests passed`.
- Focused schedule ownership plus release-evidence suite: `12 files / 66 tests passed`.
- Full Vitest regression suite: `696 files / 2,763 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js production build: `PASS` with Next.js `16.2.10` and `56` static pages generated.
- Repository secret scan: `1,893` text files scanned, `26` binaries skipped, `0` findings; secret values printed: `NO`.
- Release handoff: `91` artifacts, `16` CI commands, `15` locked gates, `0` findings.
- Completed local evidence: `510` required phrases, `0` findings.
- Production gate check: `15` locked gates, `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.
- No production environment was accessed.
- No record was mutated during verification.
- No Google Calendar, email, OpenAI, export, storage, or signed URL call was made.
- No migration or operational RLS change occurred.
- No production-sensitive flag was enabled.
- Production-sensitive features approved by this boundary: `NO`.
- Public trust claims approved by this boundary: `NO`.

Safe non-production QA should exercise synthetic same-parish confirmed-date set/clear operations and use an explicitly approved safe Calendar fixture before testing provider lifecycle events. Cross-parish and mismatched-calendar attempts must remain generic and non-mutating.
