# Notifications Center Safe Link Boundary - 2026-07-08

Status: Implemented as read-only staff notification link hardening.

## Scope

The Notifications Center now keeps these staff-facing links dashboard-internal and safely encoded:

- overdue follow-up request links,
- due-today follow-up request links,
- new request review links,
- recommended record-creation links,
- recommended certificate-review links,
- recommended person-match review links.

## Staff Experience

Staff still see the same notification groups and suggested next-step labels. Normal request and record links continue to work. Unusual identifier values are encoded before being placed into staff-facing dashboard links.

## Production Safety

This slice does not mutate records and does not:

- send communications,
- enable automation,
- call AI,
- run exports,
- access storage,
- create signed URLs,
- generate certificates,
- apply migrations,
- change operational RLS,
- access production,
- make public trust claims.

Recommended actions remain staff-reviewed and do not make sacramental, canonical, pastoral, eligibility, or duplicate-merge decisions.

## Verification

- `lib/notificationsCenter/buildNotificationsCenter.test.ts`
- `lib/relationshipIntelligence/relationshipIntelligence.test.ts`
- `lib/server/notificationsCenterSafeLinkBoundary.test.ts`
