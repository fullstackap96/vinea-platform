# Request Workflow Support Active Parish Read Route - 2026-07-08

## Status

Implemented as a read-only Request Detail checklist and workflow-step hardening slice.

## What Changed

- Added `app/api/requests/[id]/workflow-support/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx`.
- Updated `lib/requestDetailClientMessages.ts`.
- Added `lib/server/requestWorkflowSupportActiveParishReadRoute.test.ts`.

## Boundary

The Request Detail page no longer performs the initial checklist-item or workflow-step reads directly from the browser. It now calls `app/api/requests/[id]/workflow-support/route.ts`, which requires staff authentication, reads the active parish cookie, and reuses `loadStaffScopedRequestDetailAccess` before loading workflow support data.

The route queries both `checklist_items` and `request_workflow_steps` with the authorized `access.requestId`, not the raw route id. It also returns server-owned field allowlists:

- Checklist items: `id`, `item_name`, `is_complete`, `created_at`.
- Workflow steps: `id`, `phase`, `title`, `description`, `owner_type`, `required`, `status`, `due_date`, `sort_order`, `created_at`.

## Plain-English Summary

When staff open a request, Vinea now checks on the server that the request belongs to the selected parish before loading its checklist and workflow steps. If that check fails, those support lists stay hidden.

## Safety Notes

- This is read-only.
- It does not mutate checklist items or workflow steps.
- It does not change existing checklist/workflow-step write behavior.
- It does not send communications.
- It does not apply migrations.
- It does not change operational RLS.
- It does not access production.
- It does not touch Google Calendar, storage, signed URLs, exports, AI, certificate generation, or public trust claims.

## Verification

- Focused source coverage: `lib/server/requestWorkflowSupportActiveParishReadRoute.test.ts`.
- The route uses safe server logging through `logServerError`.
- The client uses curated `loadWorkflowSupport` request-detail messages instead of raw API/database text.
