# Daily Office Handoff Digest Dashboard Browser QA Readiness - 2026-07-05

Status: `PREPARED - LABEL-ONLY DAILY OFFICE HANDOFF DASHBOARD BROWSER QA READINESS WORKSHEET`

Completion marker: `DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_PREPARED_20260705`

Latest status note: Superseded by the passed browser QA evidence in `docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md`. This worksheet remains historical evidence for the earlier blocked preflight.

This worksheet prepares a future safe non-production browser QA run for the Daily Office Handoff Digest dashboard card. The card should appear on `/dashboard` after the Daily Work Hub overview, show the selected active parish label when available, group work into `Opening the office`, `Midday check-in`, and `Before closing`, link only to existing safe review queues, and avoid send, export, certificate, AI, automation, storage, signed URL, or mutation controls.

This worksheet does not record a completed browser QA run. The local app target was not reachable at `http://localhost:3000/api/health` during this run, so browser QA was not opened and no safe staff session, active parish label, or parish-switching behavior was confirmed.

This worksheet does not approve production access, migrations, operational RLS changes, record mutation, automatic linking, certificate generation, AI calls, exports, storage access, signed URL creation, outbound communications, automation, public trust claims, or canonical, sacramental, pastoral, or eligibility decisions.

Use non-secret labels and pass/fail outcomes only. Do not paste raw IDs, private register notes, family details, request details, document contents, storage paths, signed URLs, original filenames, token material, database URLs, service-role keys, provider keys, raw exports, raw metadata, browser cookies, or private communication content into future evidence.

## Current Decision State

`BROWSER_QA_NOT_RUN; DAILY_OFFICE_HANDOFF_DASHBOARD_QA_READINESS_PREPARED; PRODUCTION_NOT_ACCESSED; READ_ONLY_PREP_ONLY`

## Preflight Result

| Check | Result | Evidence label |
|---|---|---|
| Local app target reachable | `BLOCKED` | `http://localhost:3000/api/health` returned a connection failure |
| Health check schema ready | `NOT RUN` | Health endpoint unavailable |
| Safe staff browser session confirmed | `NOT CONFIRMED` | Not checked because the app target was unavailable |
| Dashboard access confirmed | `NOT CONFIRMED` | Not checked because the app target was unavailable |
| Active parish label confirmed | `NOT CONFIRMED` | Not checked because no dashboard session was opened |
| Parish switching behavior confirmed | `NOT CONFIRMED` | Not checked because no dashboard session was opened |
| Browser QA executed | `NO` | Stopped before browser access |

## Related Materials

- Build status: `docs/VINEA_BUILD_STATUS.md`
- Roadmap: `docs/VINEA_ROADMAP.md`
- Single source of truth: `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`
- Repo audit: `docs/VINEA_REPO_AUDIT.md`
- Dashboard UI packet: `docs/DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_20260705.md`
- Dashboard card: `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`
- Dashboard wiring: `app/dashboard/DashboardPageCore.tsx`
- Digest DTO: `lib/dailyOfficeHandoffDigest.ts`
- Focused source test: `lib/server/dashboardDailyOfficeHandoffDigestUi.test.ts`

## Required Non-Production Fixture Labels

| Fixture | Required label | Status |
|---|---|---|
| QA app target | Localhost, preview, or staging target confirmed as non-production | `NEEDED` |
| Safe staff user | Safe staff browser session label, with no credentials recorded | `NEEDED` |
| Active parish | Selected active parish label visible on the dashboard | `NEEDED` |
| Optional second parish | Authorized alternate parish label for switch behavior | `OPTIONAL` |
| Digest source state | Label describing whether handoff slots have visible items or empty states | `NEEDED` |
| Evidence owner | Repository docs evidence owner label | `NEEDED` |

## Future Browser QA Steps

| Step | Expected result | Evidence label to capture |
|---|---|---|
| Open safe app target | Non-production dashboard target loads without production access | App target label only |
| Check health | `/api/health` returns HTTP 200 with `checks.schema: true` | Health pass/fail only |
| Open dashboard | `/dashboard` renders for an authenticated safe staff session | Safe staff session label only |
| Confirm placement | Daily Office Handoff appears after Daily Work Hub overview and before Parish Health Score | Placement pass/fail only |
| Confirm active parish label | Card shows the selected active parish label when available | Active parish label only |
| Confirm parish switching | If an authorized alternate parish is available, switching parishes updates the card label and visible items | Parish switch pass/fail only |
| Confirm slot headings | Card shows `Opening the office`, `Midday check-in`, and `Before closing` | Slot headings pass/fail only |
| Confirm safe links | Links go only to existing review queues already supplied by the read-only DTO | Link labels only |
| Confirm empty states | Slots with no visible items show calm empty-state text | Empty-state pass/fail only |
| Confirm forbidden controls absent | No send, export, certificate, AI, automation, storage, signed URL, download, form, or mutation controls are visible | Forbidden-control pass/fail only |
| Check route activity if available | Only read-style dashboard, health, settings, staff, and notification paths are observed, plus safe active-parish context updates if switching | No mutation/export/AI/storage/certificate routes invoked |

## Future Pass Criteria

The future browser QA passes only if all of these are true:

- The target is confirmed non-production.
- `/api/health` returns HTTP 200 with `checks.schema: true`.
- The dashboard is visible to an authenticated safe staff user.
- The Daily Office Handoff card appears after Daily Work Hub overview and before Parish Health Score.
- The active parish label is visible when available.
- Optional parish switching updates the card without exposing private data.
- The card shows `Opening the office`, `Midday check-in`, and `Before closing`.
- Any links go only to existing safe review queues.
- Empty states are clear when a slot has no visible handoff item.
- No send, export, certificate-generation, AI, automation, storage, signed URL, download, form, direct API, Supabase write, or mutation controls are visible.
- Evidence contains labels and pass/fail outcomes only.

## Future Failure Criteria

The future browser QA fails or stops if any of these occur:

- The target is production or cannot be confirmed as non-production.
- The health check fails or `checks.schema` is not true.
- A safe staff session is unavailable.
- The dashboard cannot be opened safely.
- The Daily Office Handoff card is missing from the expected placement.
- The active parish label is missing when the dashboard has a selected parish context.
- Parish switching shows cross-parish leakage, stale labels, or private data in evidence.
- Any link points outside existing safe review queues.
- Any path mutates records, sends communications, enables automation, calls AI, runs exports, accesses storage, creates signed URLs, generates certificates, applies migrations, changes operational RLS, accesses production, or makes public trust claims.
- Evidence includes secrets, raw IDs, private register values, request details, document contents, storage paths, signed URLs, token material, database URLs, service-role keys, provider keys, raw exports, raw metadata, browser cookies, or private communication content.

## Forbidden Behavior Checks For This Prepared Worksheet

| Check | Result |
|---|---|
| Production app or production database accessed | `NO` |
| Browser QA executed | `NO` |
| Dashboard opened in a staff browser session | `NO` |
| Records inserted, updated, linked, corrected, deleted, or automatically matched | `NO` |
| Certificate or certificate PDF generated | `NO` |
| Email, SMS, reminder, or family notification sent | `NO` |
| Workflow automation, reminder runtime, or persistence enabled | `NO` |
| Migration applied or operational RLS changed | `NO` |
| AI route, export route, storage path, document file, or signed URL invoked | `NO` |
| Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO` |
| Secrets printed into evidence | `NO` |

## Sanitized Evidence Snapshot

```json
{
  "status": "BLOCKED_PREPARED",
  "browserQaExecuted": false,
  "decisionState": "BROWSER_QA_NOT_RUN; DAILY_OFFICE_HANDOFF_DASHBOARD_QA_READINESS_PREPARED; PRODUCTION_NOT_ACCESSED; READ_ONLY_PREP_ONLY",
  "appTargetLabel": "Localhost Vinea app on port 3000",
  "health": {
    "reachable": false,
    "statusCode": null,
    "checks": {
      "schema": null,
      "supabase": null,
      "parishes": null
    }
  },
  "missingLabels": [
    "safe staff session label",
    "active parish label",
    "optional alternate parish label",
    "digest source state label"
  ],
  "futureExpectedUi": {
    "route": "/dashboard",
    "cardTitle": "Daily office handoff",
    "placement": "after Daily Work Hub overview and before Parish Health Score",
    "slots": [
      "Opening the office",
      "Midday check-in",
      "Before closing"
    ],
    "safeLinkBoundary": "existing review queues only"
  },
  "forbiddenBehavior": {
    "productionAccessed": false,
    "recordsMutated": false,
    "certificatesGenerated": false,
    "communicationsSent": false,
    "automationEnabled": false,
    "migrationsApplied": false,
    "operationalRlsChanged": false,
    "aiCalled": false,
    "exportsRun": false,
    "storageAccessed": false,
    "signedUrlsCreated": false,
    "publicClaimsMade": false,
    "secretsPrinted": false
  }
}
```

## Final Sign-Off

| Role | Label | Decision | Notes |
|---|---|---|---|
| QA operator | Codex local QA operator | PREPARED | Browser QA stopped before browser access because the app target was unavailable. |
| Product owner | Product owner label | Pending review | Owner review can provide or approve a safe running app target and staff session. |
| Security/data owner | Security/data owner label | Pending review | Owner review can confirm non-production target and no-secret evidence boundaries. |

## Outcome

Current status: `DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_PREPARED_20260705`

The safe browser QA run for the Daily Office Handoff Digest dashboard card was not executed. The local app target was unreachable and the safe staff session, active parish label, and optional alternate parish label were not available in this session. This worksheet prepares the exact label-only inputs and pass/fail criteria needed for a future read-only browser run without mutating records, applying migrations, changing operational RLS, sending communications, calling AI, running exports, accessing storage, creating signed URLs, generating certificates, accessing production, enabling automation, or making public trust claims.
