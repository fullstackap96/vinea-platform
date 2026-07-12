# Dashboard Parish Switch Sensitive Tool Reset - 2026-07-11

Decision: `DASHBOARD_PARISH_SWITCH_SENSITIVE_TOOL_RESET_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Problem Closed

The parish selector previously changed its visible active parish optimistically before the server confirmed the signed active-parish cookie. During that brief transition, Global Search results and Notifications Center rows loaded for the prior parish could remain visible beside the newly selected parish label.

## Confirmed-Context Behavior

- The selector displays the staff member's pending choice while keeping the confirmed active parish id separate.
- Global Search and Notifications Center are replaced with an accessible `Updating parish workspace…` status while the Server Action validates membership and persists the selected-parish cookie.
- After successful confirmation, both tenant-sensitive tools remount under the confirmed parish id with empty client state and load through the existing active-parish-scoped APIs.
- Structured denial or an unexpected failure clears the pending choice, restores the prior confirmed parish, shows curated guidance, and refreshes server-rendered state.
- The existing server action remains authoritative for staff authentication, active membership, allowed parish selection, and cookie persistence.

## Safety Boundary

- No authorization policy, operational RLS, database query, API payload, record, or cookie implementation changed.
- No production or shared-QA environment was accessed.
- No migration, communication, AI, export, storage, signed URL, certificate, Google Calendar, or production-sensitive flag action occurred.
- The separately approval-gated `proxy.ts` authorization change remains untouched and production deployment remains `NO-GO` where already documented.

## Rollback

This is client-only state isolation. Rollback restores the prior optimistic selector behavior and requires no data or infrastructure action.
