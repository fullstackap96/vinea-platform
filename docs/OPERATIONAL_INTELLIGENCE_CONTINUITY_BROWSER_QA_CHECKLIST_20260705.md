# Operational Intelligence Continuity Browser QA Checklist

Status: Executed as a safe local non-production browser QA checklist. Browser QA passed from this document on 2026-07-05.

Date prepared: 2026-07-05

Completion marker: `OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_CHECKLIST_20260705`

## Current Decision State

`BROWSER_QA_PASSED_LOCAL_SHARED_QA; PRODUCTION_NOT_ACCESSED; READ_ONLY_CONTINUITY_CUES_ONLY`

This checklist verifies that the Parish Health Score and Operational Intelligence Brief surface request-to-record continuity bottlenecks when existing read-only `unlinkedSacramentalRecordCount` signals are present. It also verifies that both surfaces point staff to `/dashboard/records?continuity=needs_review`.

This checklist does not approve production access, migrations, operational RLS changes, record mutation, automatic request linking, certificate generation, AI calls, exports, storage access, signed URL creation, outbound communications, automation, public trust claims, or canonical/sacramental eligibility decisions.

Use non-secret labels and pass/fail outcomes only. Do not paste raw IDs, raw register notes, private document contents, storage paths, signed URLs, original filenames, token material, database URLs, service-role keys, OpenAI keys, Google credentials, family portal secrets, raw exports, raw metadata, or private communication content into this evidence.

## Related Materials

- Build status: `docs/VINEA_BUILD_STATUS.md`
- Roadmap: `docs/VINEA_ROADMAP.md`
- Single source of truth: `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`
- Parish Health Score helper: `lib/parishHealthScore.ts`
- Operational Intelligence Brief helper: `lib/operationalIntelligenceBrief.ts`
- Home dashboard source: `app/dashboard/DashboardPageCore.tsx`
- Records continuity filter source: `app/dashboard/records/RecordsListFilters.tsx`
- Records continuity queue: `/dashboard/records?continuity=needs_review`
- Focused tests: `lib/parishHealthScore.test.ts`, `lib/operationalIntelligenceBrief.test.ts`, `lib/server/parishHealthScoreSource.test.ts`, `lib/server/operationalIntelligenceBriefSource.test.ts`

## Required Non-Production Fixture Labels

| Fixture | Non-secret label | Required evidence |
|---|---|---|
| QA app target | Localhost Vinea dev app on port 3000 | Safe local non-production browser target |
| Supabase/project label | Shared QA Supabase project label | Confirmed not production |
| QA operator | Codex local QA operator | Browser check completed |
| Safe staff user | Safe shared-QA staff browser session | Staff dashboard access verified without recording credentials |
| Active parish | St Ann active parish label | Parish with visible continuity review signal |
| Unlinked sacramental record fixture | Visible dashboard signal: 2 sacramental records need request-to-record review | Label/count only; no raw ID or private register values |
| Optional linked sacramental record fixture | Not used in this browser run | Linked comparison was not required for pass criteria |
| Evidence storage owner | Repository docs evidence owner | Results recorded in this checklist |

## Preflight Checks

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Non-production target confirmed | Target is safe QA/staging or local non-production | Localhost Vinea dev app on port 3000 | PASS |
| Production boundary confirmed | Production app, production database, and production data are not accessed | Shared QA project label only | PASS |
| Health check | `/api/health` returns HTTP 200 with `checks.schema: true` | Health returned HTTP 200 with schema, Supabase, and parishes true | PASS |
| Safe staff sign-in | Staff session opens `/dashboard` without using or recording secrets | Safe shared-QA staff browser session | PASS |
| Active parish selected | Dashboard is scoped to the intended active parish label | St Ann active parish label | PASS |
| Continuity signal fixture exists | Existing read-only data produces `unlinkedSacramentalRecordCount` greater than zero | Visible signal: 2 records need request-to-record review | PASS |

## Browser QA Steps

| Step | Expected result | Evidence label | Result |
|---|---|---|---|
| Open dashboard | `/dashboard` renders without error | Dashboard rendered in safe staff session | PASS |
| Find Parish Health Score | Score card is visible on the home dashboard | Parish Health Score visible | PASS |
| Verify health factor | Parish Health Score shows `Request-to-record continuity` when unlinked record signals exist | Health factor visible with 2 records needing review | PASS |
| Verify health reason | Reason uses plain-English continuity review language and does not say Vinea changed records | Reason says records need request-to-record continuity review | PASS |
| Verify health recommendation | Recommendation tells staff to verify originating request links manually before certificate work | Recommendation requires manual request-link verification before certificate work | PASS |
| Verify health link | Health recommendation opens `/dashboard/records?continuity=needs_review` | Exact Records continuity review queue URL opened | PASS |
| Find Operational Intelligence Brief | Brief is visible on the home dashboard | Records and documents insight visible in Operational Intelligence area | PASS |
| Verify records insight | Records/documents insight includes request-to-record continuity review items | Insight mentions 2 request-to-record continuity review items | PASS |
| Verify records recommendation | Recommended action points staff to the Records continuity review queue | Recommendation points staff to continuity review before certificate work | PASS |
| Verify records link | Insight or next action opens `/dashboard/records?continuity=needs_review` | Exact Records continuity review queue URL available | PASS |
| Verify Records queue | Records page loads with the `Needs request review` continuity filter selected for `needs_review` | Records queue loaded with Needs request review selected | PASS |
| Verify selected parish context | Dashboard and Records queue remain scoped to the selected active parish label | St Ann active parish label remained in session context | PASS |

## Forbidden Behavior Checks

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Record mutation | No sacramental records are inserted, updated, linked, corrected, deleted, or automatically matched | Browser used dashboard and Records queue read paths only | PASS |
| Certificate generation | No certificate or certificate PDF is generated | No certificate route or generation action invoked | PASS |
| Canonical/pastoral decision | No canonical, sacramental eligibility, or pastoral decision is made | UI language remained staff-review guidance only | PASS |
| Communications | No email, SMS, reminder, or family notification is sent | No communication send path invoked | PASS |
| Automation | No workflow automation, reminder runtime, or suppression/dismissal persistence is enabled | No automation or persistence action invoked | PASS |
| Migrations/RLS | No migrations are applied and operational RLS is not changed | No migration command or RLS change run | PASS |
| AI/export/storage | No AI route, export route, storage access, document file access, or signed URL path is invoked | Local server log showed only GET reads for health, dashboard, parish settings/staff, notifications, and Records queue | PASS |
| Public claims | No public trust-center, backup/restore, export, RLS, monitoring, or compliance claim is made | No public claim made | PASS |

## Sanitized Evidence Snapshot

```json
{
  "status": "PASSED",
  "appTargetLabel": "Localhost Vinea dev app on port 3000",
  "supabaseTargetLabel": "Shared QA Supabase project label",
  "health": {
    "statusCode": 200,
    "checks": {
      "schema": true,
      "supabase": true,
      "parishes": true
    }
  },
  "activeParishLabel": "St Ann active parish label",
  "continuityFixtureLabel": "Visible signal: 2 sacramental records need request-to-record review",
  "parishHealthScore": {
    "factorVisible": true,
    "reasonMentionsContinuityReview": true,
    "recommendationRequiresManualReview": true,
    "href": "/dashboard/records?continuity=needs_review"
  },
  "operationalIntelligenceBrief": {
    "recordsInsightMentionsContinuity": true,
    "recommendationRequiresManualReview": true,
    "href": "/dashboard/records?continuity=needs_review"
  },
  "recordsQueue": {
    "url": "/dashboard/records?continuity=needs_review",
    "needsRequestReviewFilterVisible": true,
    "needsRequestReviewFilterSelected": true
  },
  "forbiddenBehavior": {
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

## Pass Criteria

The browser QA passes only if all of these are true:

- The test target is non-production.
- `/api/health` returns `checks.schema: true`.
- The dashboard is visible to an authenticated safe staff user.
- The Parish Health Score shows a request-to-record continuity factor when unlinked record signals exist.
- The Operational Intelligence Brief records/documents insight mentions continuity review when unlinked record signals exist.
- Both surfaces direct staff to `/dashboard/records?continuity=needs_review`.
- The Records continuity review queue opens without mutating records.
- No certificate generation, record linking, record correction, notation, communication send, automation, AI call, export, storage access, signed URL creation, migration, operational RLS change, production access, or public trust claim occurs.
- Evidence contains labels and pass/fail outcomes only.

## Failure Criteria

The browser QA fails if any of these occur:

- The target is production or cannot be confirmed as non-production.
- The health check fails or `checks.schema` is not true.
- Parish Health Score does not show the continuity cue when the fixture signal is present.
- Operational Intelligence does not show the continuity cue when the fixture signal is present.
- A link does not open `/dashboard/records?continuity=needs_review`.
- Any path mutates records, automatically links records, generates certificates, sends communications, enables automation, calls AI, runs exports, accesses storage, creates signed URLs, applies migrations, changes operational RLS, or makes public trust claims.
- Evidence includes secrets, raw IDs, raw metadata, private register values, document contents, storage paths, signed URLs, token material, database URLs, service-role keys, provider keys, or family portal secrets.

## Final Sign-Off

| Role | Label | Decision | Notes |
|---|---|---|---|
| QA operator | Codex local QA operator | PASS | Browser QA completed with label-only evidence. |
| Product owner | Product owner label | Pending review | Owner review was not requested for this read-only QA pass. |
| Catholic records owner | Catholic records owner label | Pending review | Owner review remains available before any stronger records-readiness claim. |
| Security/data owner | Security/data owner label | Pending review | No production/security-sensitive runtime gate was enabled. |

## Outcome

Current status: `OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_PASSED_LOCAL_SHARED_QA_20260705`

Browser QA passed in a local non-production Vinea staff session backed by the shared-QA project. The run verified `/api/health`, Parish Health Score, Operational Intelligence, and the Records continuity review queue. It did not mutate records, apply migrations, change operational RLS, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, access production, or make public trust claims.
