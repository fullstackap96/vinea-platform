# Daily Office Handoff Digest Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY LINK HARDENING`

Completion marker: `DAILY_OFFICE_HANDOFF_DIGEST_SAFE_LINK_BOUNDARY_20260708`

This slice hardens the Daily Office Handoff Digest so cue links are sanitized before the dashboard can render them. The digest now preserves only dashboard-internal links that start with `/dashboard` and drops external URLs, protocol-relative URLs, API paths, JavaScript URLs, and other non-dashboard destinations.

## What Changed

- Updated `lib/dailyOfficeHandoffDigest.ts`.
- Updated `lib/dailyOfficeHandoffDigest.test.ts`.

## Why This Matters

The Daily Office Handoff Digest is built from Parish Health Score and Operational Intelligence signals. Those signals should guide staff to existing Vinea review queues, not to exports, API routes, external websites, storage, signed URLs, or action-like paths.

This keeps the morning handoff card simple and safe:

- staff can open normal dashboard queues.
- unsafe or non-dashboard links are quietly removed.
- the cue text still renders even if a link is dropped.

## Safety Boundary

This change:

- does not mutate records.
- does not persist saved views.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Catholic records and certificate cues remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

The focused test proves:

- `/dashboard` cue links are preserved.
- external URLs are dropped.
- `/api` paths are dropped.
- JavaScript URLs are dropped.
- protocol-relative URLs are dropped.
- cue text remains available when a link is removed.

Command:

```powershell
npm.cmd test -- lib/dailyOfficeHandoffDigest.test.ts lib/dailyOfficeHandoffSavedViews.test.ts
```

Expected result: pass.

## Follow-Up

Future safe browser QA for the Daily Office Handoff Digest and saved-view card should confirm that visible links open only staff dashboard queues and that cues without safe links still render as read-only staff guidance.
