# Daily Office Handoff Saved-View Dashboard UI Preflight - 2026-07-06

Status: `PREPARED - SOURCE-LEVEL PREFLIGHT`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_PREPARED_20260706`

This source-level preflight prepares the next safe guardrail for a future read-only Daily Office Handoff saved-view dashboard UI. It does not implement UI, persist saved views, add dashboard runtime behavior, call APIs, query Supabase, mutate records, apply migrations, change operational RLS, access production, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, enable automation, or make public trust claims.

## Source Context

- Approval packet: `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_20260706.md`
- Preflight validator: `lib/server/dailyOfficeHandoffSavedViewDashboardUiPreflight.ts`
- Preflight tests: `lib/server/dailyOfficeHandoffSavedViewDashboardUiPreflight.test.ts`
- Saved-view DTO foundation: `lib/dailyOfficeHandoffSavedViews.ts`
- Current handoff digest UI: `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`
- Future dashboard composition point: `app/dashboard/DashboardPageCore.tsx`

## Required Future UI Gates

Any future Daily Office Handoff saved-view dashboard implementation should pass the preflight before browser QA:

Each required gate must satisfy its complete marker set before it can pass. A partial marker mention is not enough: for example, naming the builder without the plan type and preset rendering, or naming one preset label without the other approved labels, must still fail source-level review.

| Gate | Required Evidence |
|---|---|
| Saved-view plan | Source references `buildDailyOfficeHandoffSavedViewPlan`, a typed `DailyOfficeHandoffSavedViewPlan` plan, and `plan.presets`. |
| Digest-derived data | Source derives from the existing Daily Office Handoff Digest instead of new Supabase/API reads. |
| Active parish context | Source visibly preserves selected active parish context. |
| Staff-reviewed boundary | Source includes read-only, staff-reviewed, no-automation language. |
| Preset labels | Source renders Front desk opening, Sacramental records handoff, and Administrator closeout labels. |
| Safe queue links | Source uses DTO queue hrefs such as `recommendedQueueHref` and `cue.href`. |
| Empty states | Source shows calm empty states when a preset has no visible cue. |
| Dashboard placement | Dashboard composition keeps saved views after the Daily Office Handoff Digest and before Parish Health Score. |

## Forbidden Future UI Markers

The preflight rejects future UI source that includes buttons, forms, click handlers, action handlers, direct API calls, direct Supabase clients, inserts, updates, deletes, upserts, storage/signed URL calls, AI calls, export/email/Google routes, email sends, local/session storage, cookies, router pushes, certificate generation helpers, or duplicate merge helpers.

## Current Boundary

Current status remains `NO-GO FOR UI WIRING`. The preflight is only a source-level safety net for a later explicitly approved implementation. It does not approve production exposure, runtime saved-view persistence, public claims, automation, certificate generation, AI behavior, exports, storage, signed URLs, data mutation, or operational RLS changes.

## Next Safe Step

If the product owner later approves UI implementation, add the smallest read-only dashboard slice and run:

```text
npm.cmd test -- lib\server\dailyOfficeHandoffSavedViewDashboardUiPreflight.test.ts lib\server\dailyOfficeHandoffSavedViewDashboardUiApprovalPacket.test.ts lib\dailyOfficeHandoffSavedViews.test.ts
```

Then run browser QA from the approval packet in a safe non-production staff session before claiming the future UI passed.
