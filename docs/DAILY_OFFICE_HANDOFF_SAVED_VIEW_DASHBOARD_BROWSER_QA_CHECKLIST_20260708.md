# Daily Office Handoff Saved-View Dashboard Browser QA Checklist - 2026-07-08

Status: `PREPARED - SAFE NON-PRODUCTION BROWSER QA CHECKLIST`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_PREPARED_20260708`

This checklist prepares a future safe browser QA run for the Daily Office Handoff saved-view dashboard card. It is label-only and non-mutating. It does not execute browser QA, access production, apply migrations, change operational RLS, mutate records, persist saved views, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, or make public trust claims.

Explicit boundary: this checklist does not access production, does not mutate records, does not persist saved views, does not send communications, does not call AI, does not run exports, does not access storage, does not create signed URLs, does not generate certificates, does not make public trust claims, and does not approve any production-sensitive gate.

## Approved Scope

- App target label: `[FILL: safe non-production app target label only]`
- Staff session label: `[FILL: safe authenticated staff session label only]`
- Active parish A label: `[FILL: authorized active parish A display label only]`
- Active parish B label: `[FILL: authorized active parish B display label only or NOT_AVAILABLE]`
- Optional empty-state fixture label: `[FILL: fixture parish or scenario label with no visible handoff cues, or NOT_AVAILABLE]`
- Evidence owner label: `[FILL: evidence owner role/name label only]`

## Preflight

| Gate | Pass Criteria | Evidence Label |
|---|---|---|
| Non-production target | Browser target is explicitly non-production | `[PASS/FAIL + label only]` |
| Health | `/api/health` returns HTTP 200 and `checks.schema: true` | `[PASS/FAIL + label only]` |
| Staff session | Safe staff session can open `/dashboard` | `[PASS/FAIL + label only]` |
| Production boundary | No production URL, production credentials, production data, or production flags are used | `[PASS/FAIL]` |

## Dashboard Placement

| Gate | Pass Criteria | Evidence Label |
|---|---|---|
| Handoff digest visible | Daily Office Handoff Digest is visible on `/dashboard` | `[PASS/FAIL]` |
| Saved-view card placement | Saved-view presets appear after the Daily Office Handoff Digest and before Parish Health Score | `[PASS/FAIL]` |
| Preset labels | Front desk opening view, Sacramental records handoff view, and Administrator closeout view are visible | `[PASS/FAIL]` |
| Staff-reviewed boundary | Card shows read-only/staff-reviewed/no-automation language | `[PASS/FAIL]` |

## Active-Parish Scope

| Gate | Pass Criteria | Evidence Label |
|---|---|---|
| Parish A scope | Card text references the selected active parish A label or active parish context | `[PASS/FAIL + label only]` |
| Parish A cue safety | Cue titles/counts match the visible Daily Office Handoff Digest and do not show another parish's work | `[PASS/FAIL]` |
| Parish B switch | If parish B is available, switching to parish B updates the visible parish context and cues/empty states | `[PASS/FAIL/NOT_AVAILABLE + label only]` |
| Parish A restore | If parish B is available, switching back to parish A restores parish A context and cues/empty states | `[PASS/FAIL/NOT_AVAILABLE + label only]` |

## Safe Links And Empty States

| Gate | Pass Criteria | Evidence Label |
|---|---|---|
| Preset links | Preset links open only existing staff-reviewed queues | `[PASS/FAIL]` |
| Cue links | Cue links open only existing queue/detail paths already present in the Daily Office Handoff Digest | `[PASS/FAIL]` |
| Empty state | If a no-cue fixture is available, each empty preset shows a calm empty state rather than a missing-data error | `[PASS/FAIL/NOT_AVAILABLE + label only]` |
| Catholic records boundary | Sacramental/certificate cues remain staff-reviewed and do not imply canonical, pastoral, eligibility, certificate-generation, or register-mutation decisions | `[PASS/FAIL]` |

## Forbidden Behavior Checks

The browser run must verify the saved-view card exposes none of the following:

- save controls.
- preference persistence controls.
- send or email controls.
- export or download controls.
- AI controls.
- storage, file, or signed URL controls.
- certificate generation controls.
- duplicate merge controls.
- automation controls.
- forms or mutation controls.
- raw metadata, raw IDs, secrets, storage paths, token material, original filenames, private document contents, or raw exports.

Forbidden behavior evidence: `[PASS/FAIL + notes label only]`

## Rollback / No-Op Verification

Rollback for this slice is code removal only:

1. Remove the `DashboardDailyOfficeHandoffSavedViews` import from `app/dashboard/DashboardPageCore.tsx`.
2. Remove the `DashboardDailyOfficeHandoffSavedViews` render call.
3. Leave `lib/dailyOfficeHandoffSavedViews.ts` intact unless a separate product-owner decision says otherwise.

Rollback evidence for a future QA run should confirm that disabling/removing the card restores the prior dashboard shape and requires no database, storage, migration, export, AI, email, certificate, or cleanup action.

Rollback verification evidence: `[PASS/FAIL/NOT_RUN + label only]`

## Final Outcome

- Browser QA decision: `[PASS / BLOCKED / FAIL]`
- Unresolved risks: `[FILL: label-only risk notes or NONE]`
- Evidence stored at: `[FILL: docs path or evidence location label only]`
- Product owner review needed before pilot-ready wording: `YES`
- Production-sensitive gates remain closed: `YES`
- Public trust claims approved: `NO`

## Exact Future Evidence Language

Use language like this only after the browser run actually passes:

```text
Daily Office Handoff saved-view dashboard browser QA passed in a safe non-production staff session. The card appeared after the Daily Office Handoff Digest and before Parish Health Score, followed selected active parish context, showed the three approved preset labels, linked only to existing staff-reviewed queues, preserved calm empty states, and exposed no save/send/export/AI/storage/signed URL/certificate/automation/mutation controls. Production-sensitive gates and public trust claims remained closed.
```
