# Request Confirmed Schedule Clear Persistence UI Boundary - 2026-07-11

Decision: `REQUEST_CONFIRMED_SCHEDULE_CLEAR_PERSISTENCE_UI_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally.

## Problem Closed

Request Detail cleared the visible confirmed Baptism date, Funeral service, Wedding ceremony, or OCIA meeting field before the active-parish API confirmed persistence. A rejected or interrupted request could therefore leave a blank field on screen while the stored schedule remained unchanged.

## Confirmed-Persistence Behavior

- Each clear action retains the visible confirmed value while its scoped API request is pending.
- Rejected, malformed, or thrown failures preserve that value and show the existing curated retry guidance.
- The local field is blanked only after the route returns an exact successful result.
- Existing staff confirmation controls, active-parish request ownership, server validation, audit metadata, loading states, and refresh behavior remain unchanged.

## Safety Boundary

- No schedule, request, audit event, or record was mutated during verification.
- No production/shared-QA access, migration, operational RLS change, communication, provider call, Google Calendar action, AI call, export, storage access, signed URL, certificate action, sensitive flag change, or public trust claim occurred.
- The separately approval-gated `proxy.ts` authorization change remains untouched.

## Rollback

This is client-only persistence truthfulness. Rollback requires no data or infrastructure action.
