# Global Search Abortable Response Boundary - 2026-07-11

Status: `GLOBAL_SEARCH_ABORTABLE_RESPONSE_IMPLEMENTED_20260711`

## What Changed

- Each debounced compact search owns an abort controller.
- Query changes and unmount cancel both the pending timer and any in-flight request.
- Expected cancellation stays quiet and cannot replace newer search state.
- Responses must match the current query before rendering.
- The client validates every result group, count, message, display field, and dashboard-internal link.
- Malformed, mismatched, external, traversal, or sensitive-link responses fail closed with existing safe search guidance.
- The compact search placeholder now uses stable ASCII text.

## Plain-English Result

Fast typing no longer leaves unnecessary older searches running. Vinea displays results only when they belong to the current query and contain safe staff-dashboard destinations.

## Preserved Boundaries

- Existing staff authentication and selected-parish server search scope remain authoritative.
- Search remains read-only.
- No record mutation occurred.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication, provider, Calendar, AI, export, storage, or signed-URL action occurred.

## Rollback

Revert the response parser and abort-controller wiring. No schema, data, environment, or feature-flag rollback is required.
