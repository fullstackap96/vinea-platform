# Parish Health And Operational Intelligence Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY DASHBOARD LINK HARDENING`

Completion marker: `PARISH_HEALTH_OPERATIONAL_INTELLIGENCE_SAFE_LINK_BOUNDARY_20260708`

This slice hardens the read-only Parish Health Score and Operational Intelligence DTOs so staff-facing recommendation links remain dashboard-internal. Both DTO builders preserve only links that normalize under `/dashboard` and drop external URLs, protocol-relative URLs, API paths, JavaScript URLs, dashboard-lookalike paths, dot-segment traversal, raw or encoded backslashes, and other non-dashboard destinations before they can become dashboard recommendations, factors, insights, or next actions.

## What Changed

- Updated `lib/parishHealthScore.ts`.
- Updated `lib/parishHealthScore.test.ts`.
- Updated `lib/operationalIntelligenceBrief.ts`.
- Updated `lib/operationalIntelligenceBrief.test.ts`.

## Why This Matters

Parish Health Score and Operational Intelligence are high-trust morning dashboard surfaces. They should guide staff to normal Vinea queues, not to exports, API routes, external websites, storage, signed URLs, or action-like destinations.

This keeps the dashboard practical and safer:

- Staff can still open existing Vinea queues.
- Unsafe destinations are not exposed as recommendation links.
- The score, reasons, and next actions still render even when a link is unavailable.

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

Catholic records and certificate recommendations remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- Parish Health Score factor and recommendation links are dashboard-only after shared helper normalization.
- Operational Intelligence insight and next-action links are dashboard-only after shared helper normalization.
- Dashboard-lookalike, traversal, raw or encoded backslash, API, external, and JavaScript-style destinations are dropped by the shared helper.
- The source contains a `safeDashboardHref` boundary before recommendations/actions are emitted.
- The source does not add API, export, email, AI, storage, signed URL, certificate, mutation, or production behavior.

Command:

```powershell
npm.cmd test -- lib/parishHealthScore.test.ts lib/operationalIntelligenceBrief.test.ts lib/server/parishHealthOperationalIntelligenceSafeLinkBoundary.test.ts
```

Expected result: pass.

## Follow-Up

Future safe browser QA for Parish Health Score and Operational Intelligence should confirm visible links open only staff dashboard queues and that the read-only score/reasons/next actions still render without exposing unsafe controls.
