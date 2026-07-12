# Daily Office Handoff Saved-View Presets DTO - 2026-07-05

Status: `IMPLEMENTED - READ-ONLY NON-RUNTIME DTO FOUNDATION`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_PRESETS_DTO_IMPLEMENTED_20260705`

This slice adds a read-only planning DTO that turns the existing Daily Office Handoff Digest into role-friendly saved-view presets for future staff workflow polish.

It does not persist saved views, change dashboard runtime behavior, query Supabase, call APIs, mutate records, apply migrations, change operational RLS, access production, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, or make public trust claims.

## Why This Exists

The Daily Office Handoff Digest now tells staff what needs attention during the office day. The next safe polish step is to define how those cues could become plain-English staff handoff views without storing preferences or adding new controls yet.

This gives future UI work a clear, tested shape while preserving the current staff-reviewed and read-only boundary.

## Presets

| Preset | Audience | Purpose |
|---|---|---|
| Front desk opening view | Front desk | Start with families waiting, unassigned requests, overdue follow-up, blocked work, and first-contact gaps |
| Sacramental records handoff view | Sacramental coordinator | Review request-to-record continuity, missing documents, incomplete sacramental records, and certificate-ready work |
| Administrator closeout view | Administrator | Clean up duplicate review, workload balance, response time, and ownership gaps before the day ends |

Each preset returns:

- A plain-English label.
- The intended staff audience.
- When to use it.
- A recommended existing queue link.
- A calm empty state.
- Read-only cues derived from the already active-parish-scoped Daily Office Handoff Digest.

## Safe Boundaries

- Planning-only: no saved views are persisted.
- Staff-reviewed: staff decide what to do next.
- Active-parish scoped: the DTO consumes the already scoped Daily Office Handoff Digest rather than reading data directly.
- No runtime wiring: no dashboard controls, API route, database call, automation, export, AI call, storage access, signed URL, certificate generation, or public trust claim is introduced.
- Catholic records boundaries remain intact: record and certificate cues are not sacramental, canonical, pastoral, or eligibility decisions.

## Implementation Files

- DTO helper: `lib/dailyOfficeHandoffSavedViews.ts`
- Focused tests: `lib/dailyOfficeHandoffSavedViews.test.ts`
- Source/docs validation: `lib/server/dailyOfficeHandoffSavedViewsSource.test.ts`
- Build status: `docs/VINEA_BUILD_STATUS.md`
- Roadmap: `docs/VINEA_ROADMAP.md`
- SSoT: `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

## Future UI Acceptance Criteria

A future UI slice may choose to display these presets as staff handoff view suggestions only after a separate implementation decision. That future UI should:

- Show the presets as read-only staff guidance.
- Preserve active parish scoping through the existing dashboard loaders.
- Avoid save, edit, send, export, AI, certificate, merge, storage, signed URL, and automation controls.
- Keep empty states visible so staff know when a view is calm.
- Link only to existing staff-reviewed queues.
- Require a separate approval if persistence or user preferences are introduced.

## Production Boundary

This DTO is safe for internal product planning and focused source tests. It is not a production-sensitive runtime gate, approval, or public claim. Production-sensitive features remain NO-GO unless separately approved through their existing packets.
