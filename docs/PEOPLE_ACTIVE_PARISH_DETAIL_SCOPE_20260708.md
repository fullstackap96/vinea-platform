# People Active Parish Detail Scope - 2026-07-08

Status: Implemented as **SERVER-SCOPED PEOPLE DETAIL/EDIT HARDENING**.

## What Changed

- Added `lib/server/loadPersonDetail.ts` as the server-owned People detail/edit loader.
- Updated `app/dashboard/people/[id]/page.tsx` and `app/dashboard/people/[id]/edit/page.tsx` to await Next.js route `params` and load the person through the server loader.
- Updated the People detail and edit views so they render authorized props instead of querying `people` directly from the browser.
- Updated `updatePerson` so saves require staff write parish context and update only rows matching both `id` and selected `parish_id`.
- Added focused tests for loader behavior, source boundaries, and People update parish scoping.

## Safety Boundary

This slice is read/write hardening for an existing staff workflow. It does not access production, apply migrations, does not change operational RLS, send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, generate certificates, or make public trust claims.

## Staff Experience

Staff still open and edit People profiles in the same place. The page now shows the selected-parish scope when available, and saves fail safely when the selected parish does not own the person.

## Completion Marker

`PEOPLE_ACTIVE_PARISH_DETAIL_SCOPE_20260708`
