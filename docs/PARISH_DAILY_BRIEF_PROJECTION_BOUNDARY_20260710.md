# Parish Daily Brief Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

The parish Daily Brief now uses explicit request, parishioner, Funeral, Wedding, and OCIA read contracts instead of broad supporting-detail reads.

## Implemented Boundary

- Parishioner lookup contains only id, display name, and email.
- Request lookup contains only identity, status, ownership, contact, follow-up, blocker, Baptism schedule, and parishioner-link fields consumed by the brief.
- Request notes, reply drafts, preferred-date text, and person links no longer enter the brief loader.
- Funeral detail contains only request id, deceased name, and confirmed service time.
- Wedding detail contains only request id, partner names, and confirmed ceremony time.
- OCIA detail contains only request id and confirmed session time.
- Each type-specific query uses an explicit compile-time Supabase branch, preserving schema inference rather than weakening the result to an untyped dynamic query.
- Existing parish scoping, checklist counts, staff workload, command-center scoring, headings, blockers, schedules, recipient resolution, and send behavior remain unchanged.

## Verification

- Focused Daily Brief route and operations-brief tests passed with 11 tests.
- Source assertions reject wildcard selection and forbidden request/parishioner fields.
- Standard and all-file TypeScript checks passed, including compile-time Supabase query parsing.

## Safety And Rollback

- No email was sent and no production environment, database mutation, migration, RLS change, or external service was used.
- Rollback is code-only by restoring the prior loader projections.
- Synthetic non-production QA should compare generated brief counts, focus rows, headings, schedule cues, and recipient fallback before deployment evidence is claimed.

## Production Boundary

This data-minimization control does not approve scheduled production sends, production monitoring, automated communication, exports, or public trust claims.
