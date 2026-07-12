# Daily Office Handoff Saved-View Safe Link Boundary

Current decision state: `READ-ONLY SAVED-VIEW LINK BOUNDARY IMPLEMENTED; PERSISTENCE AND PRODUCTION-SENSITIVE BEHAVIOR REMAIN NO-GO`

Date: 2026-07-08

## Purpose

The Daily Office Handoff saved-view dashboard card uses cues from the existing Daily Office Handoff Digest. Those cues are intended to point staff only to existing dashboard review queues.

This slice makes that boundary explicit in the saved-view DTO: cue links are preserved only when they are dashboard-internal paths that start with `/dashboard`. External URLs, API paths, protocol URLs, and `javascript:`-style links are dropped before the dashboard card can render them.

## What Changed

- `lib/dailyOfficeHandoffSavedViews.ts` now filters cue `href` values through a dashboard-internal allowlist.
- `lib/dailyOfficeHandoffSavedViews.test.ts` now proves external URLs, API paths, and script-like links are removed while valid dashboard queue links remain.

## Staff Experience

Staff still see the same calm saved-view card. Safe queue links still work. If a future signal accidentally provides an unsafe or non-dashboard link, the cue appears without an action link instead of sending staff somewhere unexpected.

## Safety Boundary

This does not persist saved views, mutate records, apply migrations, change operational RLS, access production, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, or make public trust claims.

Production-sensitive gates remain closed.
