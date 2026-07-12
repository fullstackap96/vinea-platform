# Care Timeline Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY CARE TIMELINE LINK HARDENING`

Completion marker: `CARE_TIMELINE_SAFE_LINK_BOUNDARY_20260708`

This slice hardens the read-only Care Timeline link helpers used on person and household care-history surfaces so staff-facing links stay dashboard-internal.

## What Changed

- Care Timeline request, follow-up, communication-history, sacramental record, household detail, and household edit links now pass through local helpers backed by the shared `safeDashboardHrefOrFallback` utility.
- Request, record, and household identifiers are trimmed and encoded before staff-facing links are emitted.
- Blank identifiers fall back to safe dashboard queues instead of emitting malformed detail links.

## Why This Matters

Person and household care timelines help staff understand pastoral history at a glance. Those links should always point to normal Vinea dashboard pages, even when upstream fixture or database values are missing or contain special characters.

## Safety Boundary

This change:

- does not mutate records.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Care Timeline cues remain read-only staff guidance and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- request, record, household, and household-edit links encode special characters.
- blank request ids fall back to the Requests dashboard.
- source-level guard tests keep Care Timeline links on the shared dashboard-only href utility.

Command:

```powershell
npm.cmd test -- lib/careTimeline.test.ts lib/server/careTimelineSafeLinkBoundary.test.ts lib/server/safeDashboardHrefUtility.test.ts
```

Expected result: pass.
