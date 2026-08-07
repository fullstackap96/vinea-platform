# Vinea Repository Audit

Last updated: 2026-07-11

This audit is a living map of the current repository. It should be refreshed when routes, APIs, data model, RLS posture, docs, tests, or known risks materially change.

## Audit Scope

Sources reviewed during this first VAOS pass:

- `README.md`.
- `project-status.md`.
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
- `docs/VINEA_ROADMAP.md`.
- `docs/VINEA_BUILD_STATUS.md`.
- `docs/VINEA_AI_CONTEXT.md`.
- `deep-research-report.md`.
- `package.json`.
- Current route, docs, migration, and test inventory.
- Recent git status and log.

The worktree had many pre-existing uncommitted changes. This audit records current observed structure and risks without reverting or judging ownership of those changes.

## Application Stack

- Next.js 16.3.0 App Router.
- React 19.2.4.
- TypeScript.
- Tailwind CSS 4.
- Supabase Auth and Postgres.
- OpenAI SDK.
- Resend email.
- Google APIs for Calendar OAuth and sync.
- Vitest.

## Top-Level Structure

| Path | Purpose |
|---|---|
| `app/` | App Router pages, layouts, protected dashboard, public forms, family portal, and API routes. |
| `lib/` | Shared product logic, dashboard models, DTOs, Supabase/server helpers, email templates, tests, and source-validation tests. |
| `supabase/migrations/` | Database migrations and RLS policy evolution. 40 SQL migrations were present during this audit. |
| `docs/` | Product, roadmap, QA, evidence, safety, runbook, readiness, and operating-manual documentation. A 2026-07-10 inventory found 494 recursive markdown files under `docs/`, including the dedicated documentation/operations index and many active evidence/readiness slices. |
| `scripts/` | Non-production QA, environment, disposable database, and smoke helper scripts. |
| `public/` | Static images, logos, screenshots, and generated Open Graph assets. |
| `.github/` | CI workflow assets, currently present as untracked or in-progress work in this worktree. |

## Public Routes

Observed public pages:

- `/`.
- `/login`.
- `/baptism-request`.
- `/funeral-request`.
- `/wedding-request`.
- `/ocia-request`.
- `/join-parish-request`.
- `/family/request/[token]`.

Public intake routes submit through server APIs rather than direct anonymous table writes.

## Protected Dashboard Routes

Observed protected staff pages:

- `/dashboard`.
- `/dashboard/requests`.
- `/dashboard/requests/[id]`.
- `/dashboard/people`.
- `/dashboard/people/new`.
- `/dashboard/people/[id]`.
- `/dashboard/people/[id]/edit`.
- `/dashboard/people/duplicates`.
- `/dashboard/households`.
- `/dashboard/households/new`.
- `/dashboard/households/[id]`.
- `/dashboard/households/[id]/edit`.
- `/dashboard/households/duplicates`.
- `/dashboard/records`.
- `/dashboard/records/new`.
- `/dashboard/records/[id]`.
- `/dashboard/records/[id]/edit`.
- `/dashboard/intentions`.
- `/dashboard/intentions/new`.
- `/dashboard/intentions/[id]`.
- `/dashboard/intentions/[id]/edit`.
- `/dashboard/reports`.
- `/dashboard/imports`.
- `/dashboard/calendar`.
- `/dashboard/communications`.
- `/dashboard/settings`.
- `/dashboard/onboarding`.
- `/dashboard/search`.
- `/dashboard/admin/audit-log`.
- `/dashboard/admin/export-audit-reviewer`.

## API Routes

Observed API areas:

- Intake: `/api/intake`.
- AI: `/api/ai/summary`, `/api/ai/reply`.
- Email: `/api/email/send`, `/api/request-notifications`, `/api/parish/daily-brief`.
- Google: OAuth start/callback and calendar event create/update/delete.
- Dashboard data: notifications and search.
- Parish administration: settings, staff users, workflow templates, public intake routing.
- Requests: documents, document detail, portal token, detail access.
- Family portal: request portal documents.
- People and household duplicate routes.
- Records certificate route.
- Imports.
- Audit events.
- Export audit reviewer and request exports.
- Health check: `/api/health`.

## Core Product Domains

### Public Intake

Request types include baptism, funeral, wedding, OCIA, and join parish. The SSoT says `/api/intake` validates request type, required fields, email format, rate limiting, parish routing, service-role writes, detail rows, checklist rows, and audit events.

### Requests And Follow-Up

Request workflows include ownership, first contact, next follow-up, waiting-on state, status, checklist, communication history, notes, schedule confirmation, documents, Google Calendar sync, AI summary/reply draft, and completion readiness.

### People And Households

The repo includes people, households, household members, duplicate review helpers, duplicate routes, and list/detail forms. Family and duplicate intelligence remains a P1/P0 adjacent differentiator.

### Sacramental Records And Certificates

The repo includes sacramental records, append-only events, baptism certificate generation, record detail pages, continuity UI, a Records dashboard continuity summary/filter, read-only continuity handoff links for unlinked records, DTO foundations, approval packets, and QA templates for future certificate issuance logging and correction/notation workflows. Runtime certificate issuance logging and correction/notation remain gated.

### Mass Intentions

Mass intention pages and helpers exist. Stipend/payment depth appears intentionally limited and should not be expanded into billing without owner approval.

### Dashboard And Operating System

The dashboard includes command-center and daily operating-system surfaces: role work hub, Daily Work Hub overview, visible Daily Office Handoff Digest UI for opening/midday/before-close staff rhythm, Daily Office Handoff saved-view preset DTOs for future front desk, sacramental records, and administrator handoff views, a Daily Office Handoff saved-view dashboard UI approval packet for the future read-only dashboard surface, a Daily Office Handoff saved-view dashboard UI source preflight for future implementation guardrails, passed Daily Office Handoff Digest Browser QA, 2026-07-05 and 2026-07-06 Daily Office Handoff Digest browser QA recheck blocker notes, a Daily Office Handoff Digest dashboard browser QA readiness worksheet, Parish Health Score, Workflow Reminders preview, Operational Intelligence Brief, ready-for-staff-review signals, request-to-record continuity cues, the Records dashboard continuity summary/filter, Records continuity handoff links, a prepared and passed browser QA checklist for the Parish Health Score / Operational Intelligence continuity cues, historical blocked preflight evidence, read-only localhost/shared-QA recheck evidence, continuity empty-state polish that explains when no selected-parish records need request-link review, a zero-continuity empty-state browser QA readiness worksheet, a passed zero-continuity empty-state localhost/shared-QA browser QA evidence file, and a repeated blocker-only availability note for a later unavailable localhost recheck. Staging or owner-reviewed continuity evidence remains future optional strengthening work.

### Reports, Search, Imports, Audit

Reports, global search, import history, audit log, export review, and request export surfaces exist. Global search shows selected-parish context, includes a read-only request-scope cue explaining that request matches follow linked parishioners in the selected parish, and explicitly scopes request results through the active parish's `parishioners.parish_id` before returning request matches. Permission-aware reporting and saved/natural-language reporting remain future depth.

## Database And Security Posture

Observed architecture:

- Supabase Auth.
- `staff_users` authorization and allowlist patterns.
- Parish membership and active parish context helpers are in progress.
- RLS hardening and disposable/shared QA evidence exist.
- Public intake direct anonymous writes have been removed in favor of server-mediated writes.
- The public demo-request route now uses a shared safe error logging helper for Resend provider failures and unexpected exceptions.
- The authenticated staff email send route now uses the shared safe error logging helper for Resend provider failures and unexpected exceptions.
- The public request notification route now uses the shared safe error logging helper for Resend provider failures and unexpected exceptions.
- The authenticated audit events route now uses the shared safe error logging helper for unexpected audit-event read/write failures.
- The public intake route now uses the shared safe error logging helper for unexpected submission failures.
- The request detail access route now uses the shared safe error logging helper for unexpected access-verification failures.
- The request portal-token route now uses the shared safe error logging helper for unexpected family portal token creation failures.
- The request document list, upload, download, and review routes now use the shared safe error logging helper for unexpected database, storage, signed URL, and review failures.
- The family portal document upload route now uses the shared safe error logging helper for unexpected storage, insert, and upload failures.
- The Staff Access route now uses the shared safe error logging helper for unexpected staff access list, create, current-record lookup, and update failures.
- The Workflow Templates route now uses the shared safe error logging helper for unexpected template load, current-step lookup, template ownership lookup, and workflow step update failures.
- The Imports route now uses the shared safe error logging helper for unexpected import history, preview, commit, row insert, failed-batch recording, and completed-batch recording failures.
- The Daily Brief route now uses the shared safe error logging helper for unexpected manual-send, cron-list, cron-send, and Resend provider failures.
- The Google OAuth start/callback routes now use the shared safe error logging helper for unexpected OAuth configuration, state, provider, token, userinfo, integration, and callback failures without direct raw OAuth/token/provider payload logging.
- The Google Calendar event create/update/delete routes now use the shared safe error logging helper for unexpected event operation failures without direct raw Google exception or serialized provider payload logging.

Known security/product gates:

- Production membership-aware operational RLS is not approved for promotion.
- Production monitoring runtime is not enabled.
- Public trust-center claims are no-go until approved.
- Runtime reminders remain unimplemented and gated.
- Certificate issuance logging runtime and correction/notation runtime remain gated.
- Remaining raw server-route error logs should be migrated one route family at a time with focused tests.

## Test And QA Inventory

A 2026-07-10 inventory found 689 `lib/**/*.test.ts` files after adding the documentation/operations index guard and other in-progress worktree tests. The latest completed full regression run remains the SSoT operating-manual consolidation run, which passed 687 files and 2,711 tests; the newer docs-only slice passed its focused suite, lint, and production build. The repo uses tests for:

- Product logic.
- DTO shape.
- Route source validation.
- Migration source validation.
- Documentation/evidence source validation.
- Non-production QA helper scripts.

This is a strength. New safety-critical docs should receive focused source-validation tests.

## Documentation Inventory

Core docs:

- `README.md`.
- `docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md`.
- `project-status.md`.
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
- `docs/VINEA_ROADMAP.md`.
- `docs/VINEA_BUILD_STATUS.md`.
- `docs/VINEA_AI_CONTEXT.md`.
- `deep-research-report.md`.
- `CODEX_AUTONOMOUS_INSTRUCTIONS.md`.
- `docs/autonomous-os/`.

There are many evidence packets and readiness docs. Future sessions should avoid adding redundant packets unless they close a specific approval, QA, safety, or roadmap gap.

## Recent Git Context

Recent commits before this audit:

- `f5ee00b` Document durable rate limit QA blocker.
- `deb9408` Add durable public intake rate limiting.
- `67970c2` Restore QA migration security parity.
- `3db5d0d` Add schema readiness health check.
- `e648fb6` Document QA migration blocker.

The current worktree had many modified and untracked files before VAOS edits. Future work should inspect `git status` before editing.

## Current Risks And Unfinished Work

- Authenticated preview health and staff smoke remain blocked by Vercel Deployment Protection; weakening protection is not an acceptable evidence shortcut.
- Human branch review and merge approval remain pending for the release candidate.
- Production RLS promotion is gated by approvals and safe smoke evidence.
- Runtime workflow reminders are valuable but gated.
- Certificate issuance logging runtime and correction/notation runtime are gated.
- Production monitoring runtime and public trust claims are gated.
- Backup/restore SLA, production support contacts, pricing, production domains, and owner labels need verification.
- Some older docs may be stale relative to newer migrations and code.
- The worktree is large and should be handled carefully.

## Maintenance Protocol

Update this audit when:

- New top-level app areas are added.
- Routes or APIs materially change.
- Supabase schema, RLS, or auth posture changes.
- Major docs are added, retired, or superseded.
- A previously blocked runtime gate moves to approved, implemented, or completed.
- Known risks are resolved or new risks appear.
