# Request Checklist Item Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail checklist toggles.

## What Changed

- Added `app/api/requests/[id]/checklist-items/[itemId]/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx` so checklist toggles call the staff-authenticated route instead of mutating `checklist_items` directly from the browser.
- Updated `lib/requestDetailClientMessages.ts` with curated checklist-update API and fallback messages.
- Added `lib/server/requestChecklistItemActiveParishMutationRoute.test.ts`.

## Safety Boundary

The route requires staff authentication, reads the selected active parish cookie, validates staff membership through `loadStaffScopedRequestDetailAccess`, verifies the request belongs to that active parish context, and verifies the checklist item belongs to that scoped request before updating `is_complete`.

The route preserves the existing staff-reviewed checklist action. It does not send communications, generate certificates, call AI, run exports, access storage, create signed URLs, access production, apply migrations, or change operational RLS.

## Why This Matters

Before this slice, the checklist read path was active-parish-aware, but the browser could still attempt a direct update by checklist item id. Now the server confirms the selected parish and request ownership before changing the checklist state.

## Manual QA Notes

Use a safe non-production staff session:

1. Open a same-parish request detail page with checklist items.
2. Toggle one checklist item.
3. Confirm the item updates and the existing request activity note still appears.
4. Switch to another authorized parish and confirm the original request is not accessible in that parish context.
5. Confirm no migrations, RLS changes, exports, AI calls, storage access, signed URLs, communications, or certificate generation occur.

## Production Boundary

This is safe runtime hardening for an existing staff action. It does not apply migrations or change operational RLS.

## Completion Integrity

The update requires the returned checklist-item id before success or audit history. If the owned item disappears between lookup and update, Vinea returns generic checklist-item not-found guidance and does not write a false completion event.
