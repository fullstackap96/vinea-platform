# Daily Office Handoff Saved-View Dashboard UI Approval Packet - 2026-07-06

Status: `PREPARED - NON-RUNTIME UI APPROVAL PACKET`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_PREPARED_20260706`

Superseded implementation note: On 2026-07-08, the read-only dashboard UI slice described here was implemented as `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_20260708.md`. The implemented slice remains limited to DTO-derived dashboard guidance only. Saved-view persistence, production deployment, public claims, automation, certificate generation, AI behavior, exports, storage, signed URLs, data mutation, and operational RLS changes remain unapproved.

This packet defines the approval boundary for a future read-only dashboard surface that may display Daily Office Handoff saved-view presets to staff. It does not implement UI, persist saved views, add preferences, query Supabase, call APIs, mutate records, apply migrations, change operational RLS, access production, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, enable automation, or make public trust claims.

## Source Context

- DTO foundation: `lib/dailyOfficeHandoffSavedViews.ts`
- DTO tests: `lib/dailyOfficeHandoffSavedViews.test.ts`
- DTO documentation: `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_PRESETS_DTO_20260705.md`
- Existing dashboard handoff card: `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`
- Existing dashboard composition point: `app/dashboard/DashboardPageCore.tsx`

## Proposed Future UI Scope

A future approved implementation may add a small read-only section to the dashboard near the Daily Office Handoff card. The section should show the saved-view presets as staff guidance only:

- Front desk opening view.
- Sacramental records handoff view.
- Administrator closeout view.

The surface should help staff understand "which lens should I use right now?" without saving a preference, changing the selected parish, filtering data by itself, or creating any new action workflow.

## Candidate Future Implementation Files

The future implementation should be limited to the smallest safe UI slice:

- `app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx`
- `app/dashboard/DashboardPageCore.tsx`
- `lib/server/dashboardDailyOfficeHandoffSavedViewsUi.test.ts`
- `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_YYYYMMDD.md`
- Optional browser QA evidence doc after implementation: `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_YYYYMMDD.md`

No API routes, migrations, database helpers, storage helpers, export routes, email routes, AI routes, certificate routes, or preference persistence files are approved by this packet.

## Required Runtime Boundaries For Future UI

- Render only data returned by `buildDailyOfficeHandoffSavedViewPlan`.
- Build that plan from the existing active-parish-scoped Daily Office Handoff Digest.
- Preserve selected active parish display context.
- Link only to existing safe staff-reviewed queues already present in DTO cue hrefs or preset recommended queue hrefs.
- Show calm empty states when a preset has no cues.
- Make the staff-reviewed/no-automation boundary visible.
- Do not add buttons, forms, save controls, preference controls, send controls, export/download controls, certificate controls, AI controls, storage/file controls, merge controls, or mutation controls.

## Browser QA Acceptance Criteria

Before treating a future UI slice as passed, browser QA must verify all of the following in a safe non-production staff session:

| Gate | Pass Criteria |
|---|---|
| Health | `/api/health` returns HTTP 200 with `checks.schema: true` |
| Staff session | Safe staff session opens `/dashboard` without using production data |
| Placement | Saved-view presets appear near the Daily Office Handoff card and do not hide Parish Health Score, Workflow Reminders, or Operational Intelligence |
| Active parish | The visible parish context matches the selected active parish |
| Parish switching | Switching between authorized parishes updates preset cues or empty states without leaking the other parish |
| Preset labels | Front desk opening, Sacramental records handoff, and Administrator closeout labels are visible |
| Safe links | Preset/cue links open existing staff-reviewed queues only |
| Empty states | A calm empty state appears when a preset has no visible cues |
| Forbidden controls | No save, send, export, download, certificate, AI, storage, signed URL, merge, automation, or mutation controls appear |
| Catholic records boundary | Records/certificate cues remain staff-reviewed and do not imply sacramental, canonical, pastoral, or eligibility decisions |
| Rollback | Removing the UI import/render or disabling the future UI slice restores the dashboard to the prior Daily Office Handoff card only |

## Required Source-Level Tests

A future implementation must include source tests proving:

- The UI imports `buildDailyOfficeHandoffSavedViewPlan`.
- The plan is derived from the existing Daily Office Handoff Digest, not new Supabase/API reads.
- The UI renders preset labels, empty states, coverage notes, and safe queue links.
- Each required preflight gate satisfies its complete marker set; a partial marker mention is not enough to pass.
- The UI does not contain `<button`, `<form`, `onClick=`, `fetch(`, `createClient(`, `.insert(`, `.update(`, `.delete(`, `createSignedUrl`, `OpenAI`, `resend`, `/api/exports`, `/api/ai`, `/api/email`, `download`, `localStorage`, or `sessionStorage`.
- The dashboard composition keeps the saved-view section close to the Daily Office Handoff Digest and before deeper review surfaces.

## Rollback / No-Op Behavior

Because this packet does not implement runtime code, rollback today is no-op.

For a future UI implementation, rollback should be a simple code removal:

- Remove the saved-view UI component import from `DashboardPageCore`.
- Remove the saved-view UI render call.
- Leave `lib/dailyOfficeHandoffSavedViews.ts` intact as a non-runtime DTO foundation unless product owner explicitly decides otherwise.

No database cleanup, migration rollback, stored preference deletion, storage cleanup, export cleanup, email cleanup, AI cleanup, or certificate cleanup should be necessary because none of those behaviors are approved.

## Production Boundary

This packet originally approved only the shape of a possible future implementation request. The 2026-07-08 implementation completed the read-only dashboard display slice only. It does not approve production deployment, runtime saved-view persistence, public claims, automation, certificate generation, AI behavior, exports, storage, signed URLs, data mutation, or operational RLS changes.

## Exact Approval Language For Future UI Wiring

To approve the future implementation, the product owner should provide language substantially like:

```text
Approve non-production implementation of the read-only Daily Office Handoff saved-view dashboard UI only. Add the smallest safe UI slice using buildDailyOfficeHandoffSavedViewPlan and the existing active-parish-scoped Daily Office Handoff Digest. Do not persist saved views, mutate records, add API routes, apply migrations, change operational RLS, access production, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, enable automation, or make public trust claims. Add source tests, prepare browser QA evidence, run checks, update docs, and keep the feature read-only.
```

## Current Decision

Current status is `READ-ONLY UI WIRED; PERSISTENCE AND PRODUCTION-SENSITIVE BEHAVIOR REMAIN NO-GO`. The safest next step is safe non-production browser QA for placement, active-parish switching, safe queue links, empty states, and forbidden-control absence.
