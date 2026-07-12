# Request Detail Browser Mutation Boundary - 2026-07-08

## Status

Implemented as a production-readiness regression guard.

The Request Detail client page no longer imports the browser Supabase client for direct table reads or
writes. Sensitive Request Detail data loading and mutations now flow through staff-authenticated
server routes or existing Server Actions that can enforce active parish, membership, and request
ownership checks.

## What Changed

- Removed the stale browser Supabase client import from `app/dashboard/requests/[id]/page.tsx`.
- Added a source-level regression test that rejects direct browser Supabase table access from the
  Request Detail page.
- The guard also checks that the page continues to reference the active-parish-aware route/action
  surfaces used for request detail access, workflow support, communication history/logging, notes,
  request-type support, checklist items, AI summary saves, reply drafts, staff notes, suggested
  dates, confirmed dates, funeral/wedding details, request assignment, status, follow-up, waiting-on,
  playbook, and request notes.

## What Changed In Plain English

The request detail screen is where staff do a lot of sensitive work. This guard helps keep that page
from quietly going back to direct browser database writes. Instead, request-detail work should pass
through server routes or Server Actions where Vinea can check the selected parish and request
ownership.

## Safety Boundary

This slice does not change staff-facing behavior, send communications, call AI, run exports, touch
Google Calendar, access storage, create signed URLs, generate certificates, apply migrations, change
operational RLS, access production, or make public trust claims.

## Manual QA Checklist

- Open a request detail page in a safe non-production staff session.
- Confirm request overview, workflow support, notes, communication history, and request-type details
  still load.
- Save a safe staff note, manual communication log, suggested date, and request detail update.
- Confirm selected active parish switching still controls whether the request is accessible.
- Confirm no family-facing behavior changes.

## Verification

- `lib/server/requestDetailBrowserMutationBoundary.test.ts` guards against direct browser Supabase
  table reads/writes in the Request Detail client page.
