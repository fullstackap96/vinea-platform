# Daily Office Handoff Digest Dashboard UI

Status: IMPLEMENTED - READ-ONLY STAFF-FACING DASHBOARD CARD

Marker: DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_WIRED_20260705

Date: 2026-07-05

## Purpose

The Daily Office Handoff Digest is now visible on the main dashboard as a read-only staff-facing dashboard card. It turns the existing Parish Health Score and Operational Intelligence signals into a simple parish-office rhythm:

- Opening the office
- Midday check-in
- Before closing

The card is meant to help front-desk staff, parish secretaries, and ministry coordinators see what deserves attention today without hunting through every dashboard section.

## Scope

This slice wires the existing `buildDailyOfficeHandoffDigest` DTO into `app/dashboard/DashboardPageCore.tsx` and renders it through `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`.

The digest is derived from already scoped dashboard DTOs:

- `parishHealthScore`
- `operationalIntelligenceBrief`

Those DTOs are built from the dashboard's existing selected active parish request loaders and daily operating signals. The handoff card does not introduce a new Supabase query, external API call, export, storage access, AI call, or mutation path.

## Staff-Facing Behavior

The card shows:

- The active parish label when available.
- A plain-English headline for the day.
- Three handoff slots:
  - Opening the office: ownership, overdue care, blockers, stalled work, and first-contact gaps.
  - Midday check-in: communications, documents/checklist, dates, pastoral care cadence, records continuity, incomplete records, and certificate-ready review.
  - Before closing: duplicate review, response-time, and workload cleanup.
- Safe links to existing review queues when a source DTO already provides a link.
- Empty states when a slot has no visible item.
- Read-only boundary notes from the DTO.

## Safety Boundaries

The dashboard handoff card:

- Does not send communications.
- Does not enable automation.
- Does not mutate records.
- Does not merge duplicates.
- Does not generate certificates.
- Does not call AI.
- Does not run exports.
- Does not access storage.
- Does not create signed URLs.
- Does not apply migrations.
- Does not change operational RLS.
- Does not access production.
- Does not make sacramental, canonical, pastoral, or eligibility decisions.
- Does not make public trust claims.

Staff decide what to do next. Vinea only points to the existing safe review queue or dashboard section.

## Validation

Source-level validation now covers the dashboard card and wiring:

- `lib/server/dashboardDailyOfficeHandoffDigestUi.test.ts`
- `lib/server/dailyOfficeHandoffDigestBrowserQaEvidence.test.ts`

The test verifies:

- The card renders staff-reviewed language.
- The card exposes only safe links to existing queues.
- The component avoids buttons, forms, click handlers, direct API calls, Supabase writes, storage, signed URLs, email, AI, and export endpoints.
- The dashboard derives the digest from `parishHealthScore` and `operationalIntelligenceBrief`.
- The card appears after the Daily Work Hub overview and before Parish Health Score, Workflow Reminders, and Operational Intelligence.

## Browser QA Evidence

Browser QA passed in a safe localhost/shared-QA staff session and is recorded in:

- `docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md`

The browser run verified:

1. `/api/health` returned `checks.schema: true`.
2. The card appeared after the Daily Work Hub overview.
3. Active parish switching relabeled the card between safe QA parish labels.
4. Handoff items matched visible Parish Health Score and Operational Intelligence cues.
5. A safe queue link opened `/dashboard/requests` with selected-parish scoping copy and no 404.
6. The card had no send, export, certificate-generation, AI, automation, storage, signed URL, or mutation controls.

## Production Boundary

This is safe dashboard UI wiring only. It does not approve live reminder automation, production exports, production monitoring, public trust-center publishing, production RLS promotion, public intake routing, customer-facing AI, certificate issuance runtime, or sacramental correction/notation runtime.
