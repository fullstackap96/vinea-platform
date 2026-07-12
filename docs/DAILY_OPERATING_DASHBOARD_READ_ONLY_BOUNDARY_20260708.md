# DAILY_OPERATING_DASHBOARD_READ_ONLY_BOUNDARY_20260708

Status: `READ-ONLY DASHBOARD SURFACE GUARD PREPARED`

Date: 2026-07-08

## Purpose

The Daily Work Hub, Daily Office Handoff Digest, Daily Office Handoff saved-view presets, Parish Health Score, Operational Intelligence Brief, and Workflow Reminder Preview are the first staff-facing operating-system surfaces a parish office sees each day.

These cards should stay warm, practical, and actionable while remaining read-only. They may point staff to existing dashboard queues, summarize visible signals, and explain what needs review. They must not perform work automatically.

## Guarded Dashboard Surfaces

- `app/dashboard/DashboardDailyWorkHubOverview.tsx`
- `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`
- `app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx`
- `app/dashboard/DashboardParishHealthScore.tsx`
- `app/dashboard/DashboardOperationalIntelligenceBrief.tsx`
- `app/dashboard/DashboardWorkflowReminderPreview.tsx`

## Allowed Behavior

- Display selected active-parish context passed from existing loaders.
- Show read-only metrics, cues, handoff steps, reminders, score factors, and recommendations.
- Link only to existing staff dashboard queues and review pages.
- Explain that staff review is required.
- Show loading, unavailable, and empty states.
- Preserve the staff-reviewed and no-automation boundary.

## Forbidden Behavior

These dashboard surfaces must not:

- mutate records;
- send communications;
- enable automation;
- call AI;
- run exports;
- access storage;
- create signed URLs;
- generate certificates;
- apply migrations;
- change operational RLS;
- access production;
- make public trust claims;
- make sacramental, canonical, pastoral, or eligibility decisions;
- expose raw metadata, raw exports, token material, storage paths, original filenames, private document contents, or secrets.

## Source-Level Preflight

`lib/server/dailyOperatingDashboardReadOnlyBoundary.test.ts` validates that the guarded dashboard components stay free of obvious side-effect primitives and production-sensitive controls.

The guard is intentionally conservative. If a future approved runtime feature needs one of these primitives, it should move through a separate approval packet, feature gate, non-production QA evidence, and production NO-GO boundary before any staff-facing dashboard control is added.

## Current Production Boundary

This slice does not access production, does not apply migrations, does not change operational RLS, does not mutate records, does not call AI, does not send communications, does not run exports, does not access storage, does not create signed URLs, does not generate certificates, does not enable automation, and does not make public trust claims.
