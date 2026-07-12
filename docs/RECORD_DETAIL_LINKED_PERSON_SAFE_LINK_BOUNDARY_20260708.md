# Record Detail Linked-Person Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY LINK HARDENING`

This slice keeps the sacramental record detail page's linked-person handoff on the shared dashboard entity-navigation helper.

## What Changed

- Updated `app/dashboard/records/[id]/RecordDetailPage.tsx`.
- Reused `personDetailHref` from `lib/dashboardEntityNavigation.ts`.
- Added `lib/server/recordDetailLinkedPersonSafeLinkBoundary.test.ts`.
- Updated the Safe Dashboard Href utility documentation and current-state docs.

## What Changed In Plain English

When staff view a sacramental record that is linked to a People profile, the “View profile” link now uses the same safe People link helper as request-detail handoffs. If an unexpected blank person ID reaches the page, the helper falls back to the People list.

## Safety Boundary

This change:

- does not mutate records.
- does not change record links.
- does not generate certificates.
- does not make canonical, sacramental, pastoral, or eligibility decisions.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

The linked-person handoff remains staff-reviewed navigation only.

## Verification

Focused tests cover source-level proof that the sacramental record linked-person handoff uses `personDetailHref`, plus the shared entity-navigation unit tests for safe encoding and fallback behavior.

Command:

```powershell
npm.cmd test -- lib\dashboardEntityNavigation.test.ts lib\server\recordDetailLinkedPersonSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
