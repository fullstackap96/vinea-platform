# Multi-Parish Remaining Read/Write Path Inventory

Status: Inventory only. Do not change runtime behavior or operational RLS from this document.

Related docs:

- `docs/VINEA_ROADMAP.md`
- `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`
- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md`
- `docs/GOOGLE_CALENDAR_ACTIVE_PARISH_QA_CHECKLIST_20260627.md`
- `docs/GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_TEMPLATE_20260627.md`
- `scripts/set-google-calendar-browser-qa-env.ps1`
- `scripts/check-google-calendar-browser-qa-env.ps1`

## Purpose

This inventory identifies the remaining runtime app paths that still use `primary_parish_id()`, `fetchPrimaryParishId()`, or oldest-parish lookup behavior directly.

Update 2026-07-08: the unused `lib/intakeParishScope.ts` public-intake helper has been removed. Current public intake legacy scoping lives only in the live `/api/intake` compatibility loader and the `lib/server/publicIntakeParishScope.ts` adapter path.

The goal is to define the next safe migration order before operational RLS is applied. This is not a code-change plan for this phase; it is a control document to avoid moving broad tenancy behavior blindly.

## Scan Scope

Runtime scan command:

```bash
rg -n "fetchPrimaryParishId|rpc\('primary_parish_id'|primaryParishId\(|function primaryParishId|primary_parish_id" app lib -g "*.ts" -g "*.tsx" --glob "!**/*.test.ts"
```

Intentional exclusions:

- Historical Supabase migrations.
- RLS draft/rollback/candidate SQL.
- Tests.
- Build status history.
- Strategic docs that intentionally describe known limitations.

## Priority Summary

| Priority | Area | Reason |
| --- | --- | --- |
| Complete | Staff document and portal-token staff authorization | Staff document access now matches the selected/authorized parish before operational RLS changes. |
| Complete | Workflow template settings API | Parish-specific workflow configuration now follows the selected/authorized parish. |
| Complete | Staff management API | Multi-parish staff administration now manages the selected/authorized parish. |
| Complete | Data imports API | Imports now preview and commit under the selected/authorized parish. |
| Complete | Request audit writing | Request action audit events now resolve parish context from the request's parishioner relationship. |
| Complete | Request detail parish guard | Request detail access now uses an active-parish-aware server scoped loader before client-side detail loading. |
| Complete | Audit Events API | Audit log list scope and writes now use active parish context, with request-target writes attributed to the request's actual parish. |
| Complete | Duplicate detection APIs | People/Household duplicate reads now follow the selected active parish. |
| Complete | People duplicate merge POST | People duplicate merge writes now resolve the selected/authorized parish through the staff write parish context helper. |
| Complete | Household duplicate merge POST | Household duplicate merge writes now resolve the selected/authorized parish through the staff write parish context helper. |
| Complete | Parish settings API | Core parish settings now load/save the selected/authorized parish instead of the oldest parish row. |
| Complete | Parish daily brief manual send API | Staff-triggered daily brief sends now target the selected/authorized parish instead of the oldest parish row. |
| Complete | Google Calendar create-event API | Staff-created Google Calendar events now require selected/authorized parish, request parish ownership, and selected-parish calendar integration before insertion. |
| Complete | Google Calendar update-event API | Staff-updated Google Calendar events now require selected/authorized parish, request parish ownership, and selected-parish calendar integration before patching. |
| Complete | Google Calendar delete-event API | Staff-removed Google Calendar events now require selected/authorized parish, request parish ownership, and selected-parish calendar integration before deletion and field clearing. |
| Complete | Google Calendar OAuth connection routes | Staff Google Calendar reconnect now binds the signed OAuth state to the selected/authorized parish instead of the oldest parish row. |
| Complete, production-gated | Public intake parish assignment strategy and safe QA runtime routing | Slug/domain/token runtime routing is wired behind disabled-by-default flags, safe QA passed, and production switch-on remains separately gated. |
| Compatibility | Shared fallback helpers | Keep fallback helpers until the final RLS migration is applied and rollback readiness is proven. |
| RLS readiness gate | Operational RLS promotion evidence | Duplicate merge reads/writes are now active-parish aware; operational RLS still requires disposable forward/rollback evidence and manual workflow QA before promotion. |

## Remaining Runtime Inventory

### Completed: Staff Document And Portal Token Authorization

Files:

- `lib/server/requestDocumentAccess.ts`
- `app/api/requests/[id]/documents/route.ts`
- `app/api/requests/[id]/documents/[documentId]/route.ts`
- `app/api/requests/[id]/portal-token/route.ts`

Current behavior:

- `loadStaffScopedRequestDocumentAccess()` accepts the active parish cookie value and validates it through the authenticated staff membership context.
- Document list, upload, signed download, review, and portal-token routes pass the active parish cookie and staff Supabase client into that helper.
- If an active parish cookie is present, the helper requires an exact membership-validated match and fails closed for stale or unauthorized selections.
- `primary_parish_id()` fallback remains explicit and is used only when no active parish cookie exists.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase rather than a database policy migration.

Completed phase:

- Active parish context is wired into staff document and portal-token authorization.
- Focused tests cover helper fallback behavior and route wiring.

### Completed: Workflow Template Settings API

Files:

- `app/api/parish/workflow-templates/route.ts`

Current behavior:

- GET uses the active staff parish context before listing active workflow templates.
- PATCH uses the staff write parish context helper before updating template steps.
- If an active parish cookie is present, GET requires a membership-backed exact active parish match.
- PATCH preserves `primary_parish_id()` fallback only when no active parish cookie exists.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.

Completed phase:

- Active parish context is wired into workflow template read/update authorization.
- Focused tests cover exact active parish authorization, no-cookie fallback, unauthorized cookie denial, and route wiring.

### Completed: Staff Management API

Files:

- `app/api/parish/staff-users/route.ts`

Current behavior:

- GET uses the active staff parish context before listing staff access.
- POST and PATCH use the staff write parish context helper before changing staff access.
- If an active parish cookie is present, GET requires a membership-backed exact active parish match.
- POST and PATCH preserve `primary_parish_id()` fallback only when no active parish cookie exists.
- Admin permission is checked against the selected parish's `staff_users` row before staff management writes.
- Existing database triggers keep `staff_users` and `parish_memberships` synchronized after staff writes.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.

Completed phase:

- Active parish context is wired into staff management read/write authorization.
- Focused tests cover exact active parish authorization, no-cookie fallback, unauthorized cookie denial, selected-parish admin checks, and route wiring.

### Completed: Data Imports API

Files:

- `app/api/imports/route.ts`

Current behavior:

- GET uses the active staff parish context before listing import batches.
- POST previews use the active staff parish context before loading existing rows for duplicate/warning checks.
- Committed POST imports use the staff write parish context helper before inserting People, Households, or Sacramental Records.
- POST preserves `primary_parish_id()` fallback only when no active parish cookie exists.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.

Completed phase:

- Active parish context is wired into import history and preview authorization.
- Staff write parish context is wired into committed imports.
- Focused tests cover exact active parish authorization, no-cookie fallback, unauthorized cookie denial, committed write helper use, and route wiring.

### Completed: Request Audit Writing

Files:

- `app/dashboard/requests/actions.ts`
- `lib/server/requestAuditParish.ts`

Current behavior:

- Shared request action audit writing no longer uses `fetchPrimaryParishId()`.
- Request audit parish context is resolved from `requests.parishioner_id` to `parishioners.parish_id`.
- If the request parish cannot be resolved, the audit event is still written without a parish id and includes resolution metadata instead of falling back to the wrong parish.
- Status, assignment, follow-up, notes, workflow-step, and playbook audit writes continue to use the shared request audit helper.

Risk:

- Operational RLS is still unchanged, so this remains an application-layer audit attribution phase before the future database policy migration.
- Request actions still rely on existing request-level authorization from the authenticated Supabase client.

Completed phase:

- Request audit writing now derives parish context from the request's actual parishioner relationship.
- Focused tests cover request parish resolution, no primary-parish lookup, and key request audit metadata wiring.

### Completed: Request Detail Parish Guard

Files:

- `app/dashboard/requests/[id]/page.tsx`
- `app/api/requests/[id]/detail-access/route.ts`
- `lib/server/requestDetailAccess.ts`

Current behavior:

- The request detail page calls a server route before loading request detail data in the browser.
- The server route validates staff access, reads the active parish cookie, and uses `loadStaffScopedRequestDetailAccess()`.
- If an active parish cookie is present, request detail access requires an exact membership-backed active parish match.
- `primary_parish_id()` fallback is preserved only when no active parish cookie exists.
- The browser-side request detail page no longer imports `fetchPrimaryParishId()` or performs the old primary-parish guard.

Risk:

- Operational RLS is still unchanged, so the page still relies on existing authenticated Supabase queries after the server-side access check.
- This phase improves the request detail entry guard but does not migrate all request detail sub-actions.

Completed phase:

- Request detail parish guard now uses active parish context through a server scoped loader.
- Focused tests cover active parish authorization, no-cookie fallback, unauthorized-cookie denial, and page/route wiring.

### Completed: Audit Events API

Files:

- `app/api/audit-events/route.ts`

Current behavior:

- GET resolves the selected parish through active staff parish context before listing audit events.
- GET preserves `primary_parish_id()` compatibility fallback only when no active parish cookie exists.
- GET fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- POST uses the selected active parish for non-request admin audit events.
- POST derives request-target audit parish attribution from the target request's actual parishioner relationship.
- POST rejects request-target writes when the request parish does not match the active staff parish context.

Risk:

- Operational RLS is still unchanged, so this remains an application-layer scope and attribution phase before the future database policy migration.

Completed phase:

- Audit Events API now uses active parish context for reads and request-derived parish attribution for request-target writes.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, non-request write scope, request-target parish derivation, request parish mismatch denial, and route wiring.

### Completed: Duplicate Detection APIs

Files:

- `app/api/people/duplicates/route.ts`
- `app/api/households/duplicates/route.ts`

Current behavior:

- GET reads the active parish cookie and resolves it through active staff parish context before finding duplicates.
- GET preserves `primary_parish_id()` compatibility fallback only when no active parish cookie exists.
- GET fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- People duplicate POST merge writes now resolve parish context through `resolveStaffWriteParishContext()`.
- People duplicate POST requires exact membership authorization when an active parish cookie is present.
- People duplicate POST preserves `primary_parish_id()` compatibility fallback only when no active parish cookie exists.
- Household duplicate POST merge writes now resolve parish context through `resolveStaffWriteParishContext()`.
- Household duplicate POST requires exact membership authorization when an active parish cookie is present.
- Household duplicate POST preserves `primary_parish_id()` compatibility fallback only when no active parish cookie exists.

Risk:

- Operational RLS is still unchanged, so this remains an application-layer duplicate-read and merge-write scope phase before the future database policy migration.

Completed phase:

- Active parish context is wired into People and Household duplicate detection GET routes.
- Active parish context is wired into the People duplicate merge POST route.
- Active parish context is wired into the Household duplicate merge POST route.
- Focused tests cover active parish selection, no-cookie fallback, unauthorized-cookie denial, and merge write parish filters for both People and Household duplicate routes.

### Completed: Public Intake Parish Assignment Strategy

Files:

- `app/api/intake/route.ts`
- `lib/server/publicIntakeParishScope.ts`
- `lib/server/publicIntakeRequestParishScopeAdapter.ts`
- `lib/server/publicIntakeRouteSignalDryRun.ts`
- `lib/server/publicIntakeRoutingRuntimeGate.ts`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`
- `docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md`
- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`
- `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md`

Current behavior:

- Runtime public intake is wired into `/api/intake` behind disabled-by-default flags.
- When the runtime flags are absent or invalid, `/api/intake` preserves legacy primary-parish behavior.
- When both exact safe QA flags are enabled in a non-production environment, `/api/intake` can resolve parish scope by public token, verified domain, enabled slug, or approved legacy fallback.
- Production runtime routing is not approved and remains blocked by production enablement and smoke-test evidence gates.
- The old unused `lib/intakeParishScope.ts` helper is removed and must not return; legacy scoping should stay isolated in the live `/api/intake` compatibility loader and `lib/server/publicIntakeParishScope.ts` adapter path.
- The future routing strategy is documented in `docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md`.
- Production enablement gates are documented in `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`.
- Production smoke-test evidence is templated in `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md`.

Risk:

- Production public intake routing is still not approved.
- A real production custom-domain launch still requires current DNS TXT evidence, HTTPS/TLS evidence, monitoring, rollback owner availability, and product-owner approval.
- Operational RLS is still unchanged; public intake uses server-controlled service-role writes rather than direct anonymous table access.

Completed phase:

- Designed parish slug, domain/host, and signed public token routing options.
- Defined `resolvePublicIntakeParishScope` as the future resolver boundary.
- Documented data model changes, security guardrails, and a non-applied migration/API plan.
- Explicitly documented that staff active parish cookies must not influence public intake routing.
- Added disposable QA preflight checks, forward validation, rollback validation, public intake regression checks, resolver test matrix, and approval gates.
- Added a non-applied rollback draft for the public intake parish routing foundation.
- Added the non-runtime `resolvePublicIntakeParishScope` helper and unit tests for token, domain, slug, legacy fallback, disabled parish, expired token, and forged staff active parish cookie cases.
- Added future public intake routing `/api/health` criteria, schema object labels, failure messaging, and promotion gates without changing current runtime health checks.
- Added a disposable QA evidence template for migration apply, rollback, health expectations, resolver cases, public intake regression, unresolved risks, cleanup, and sign-off.
- Added a disposable Supabase execution packet for exact SQL execution order, verification queries, rollback commands, health-check observations, and evidence capture.
- Added a promotion readiness checklist for moving the public intake routing candidate into `supabase/migrations` only after disposable evidence, rollback evidence, health-check criteria, manual public intake QA, rollback ownership, and sign-off are complete.
- Promoted and QA-verified the schema migrations for public intake routing and domain verification.
- Wired `/api/intake` to the disabled-by-default runtime gate, route signal helper, parish-scope adapter, and resolver.
- Safe QA verified flag-off regression, flag-on token/domain/slug routing, generic error cases, audit metadata, durable `429`, and rollback-by-disabling-flags.
- Added production enablement and production smoke-test evidence gates without enabling production routing.
- Removed the unused `lib/intakeParishScope.ts` helper and added source/docs validation so future public intake work follows the live route boundary.

### Completed: Duplicate Merge Write Actions

Files:

- `app/api/people/duplicates/route.ts`
- `app/api/households/duplicates/route.ts`

Current behavior:

- People and Household GET duplicate detection are active-parish scoped.
- People and Household POST merge writes resolve parish context through `resolveStaffWriteParishContext()`.
- When a staff active parish cookie is present, merge writes require membership authorization for that exact parish.
- When no active parish cookie is present, merge writes preserve explicit `primary_parish_id()` compatibility fallback.
- Merge operations continue filtering updates, deletes, inserts, and link transfers by the resolved parish id.

Risk:

- Duplicate merge writes are now application-layer active-parish aware, but operational RLS is still unchanged.
- Before operational RLS promotion, disposable forward/rollback validation and manual workflow QA still need to prove duplicate merge behavior under membership-aware policies.

Completed phase:

- Wired active parish context into People duplicate merge POST.
- Wired active parish context into Household duplicate merge POST.
- Added focused tests proving unauthorized active parish selections fail before merge queries run.

### Completed: Parish Settings API

Files:

- `app/api/parish/settings/route.ts`

Current behavior:

- GET reads the active parish cookie and resolves it through active staff parish context before loading core parish settings and Google Calendar status.
- GET preserves `primary_parish_id()` compatibility fallback only when no active parish cookie exists.
- GET fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- PATCH reads the active parish cookie and resolves it through `resolveStaffWriteParishContext()` before saving parish name, notification email, daily brief settings, directories, onboarding, and SLA settings.
- PATCH preserves explicit `primary_parish_id()` compatibility fallback only when no active parish cookie exists.
- Settings audit events are attributed to the selected/authorized parish id.

Risk:

- Operational RLS is still unchanged, so this remains an application-layer settings read/write scope phase before the future database policy migration.
- Some consumer pages still call `/api/parish/settings` without displaying the active parish name directly; they now benefit from the route-level active parish context.

Completed phase:

- Active parish context is wired into core parish settings GET.
- Staff write parish context is wired into core parish settings PATCH.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, primary-fallback denial when a cookie exists, selected-parish Google integration loading, and route wiring.

### Completed: Parish Daily Brief Manual Send API

Files:

- `app/api/parish/daily-brief/route.ts`
- `lib/server/loadParishDailyBrief.ts`

Current behavior:

- Staff-triggered POST reads the active parish cookie and resolves it through active staff parish context before loading and sending a daily brief.
- POST preserves explicit `primary_parish_id()` compatibility fallback only through the staff parish context helper when no active parish cookie exists.
- POST fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- POST loads the daily brief by the resolved parish id, not by oldest parish row.
- Cron GET remains intentionally all-enabled-parish scoped and still requires cron authorization.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.
- Google Calendar event create/update/delete routes have now received separate request-level and integration-level parish scoping passes.

Completed phase:

- Active parish context is wired into manual parish daily brief sends.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, primary-fallback denial when a cookie exists, selected-parish daily brief loading, and route wiring.

### Completed: Google Calendar Create Event API

Files:

- `app/api/google/calendar-event/create/route.ts`
- `lib/parishGoogleCalendarServer.ts`

Current behavior:

- Google Calendar create-event POST now requires staff authorization.
- POST reads the active parish cookie and resolves it through active staff parish context before loading the request or parish Google integration.
- POST preserves explicit `primary_parish_id()` compatibility fallback only through the staff parish context helper when no active parish cookie exists.
- POST fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- POST checks the request's parishioner row and returns `Request not found` if the request does not belong to the selected/authorized parish.
- POST loads the Google Calendar integration by the selected/authorized parish id before any Google Calendar client or event insertion is created.
- Existing Google conflict detection, event insertion, request event-id update, and OAuth error marking remain unchanged after the scope checks pass.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.
- Google Calendar update-event and delete-event routes have now received separate request-level and integration-level parish scoping passes.

Completed phase:

- Active parish context is wired into Google Calendar event creation.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, primary-fallback denial when a cookie exists, request parish ownership checks, selected-parish Google integration loading, and route source-order wiring.

### Completed: Google Calendar Update Event API

Files:

- `app/api/google/calendar-event/update/route.ts`
- `lib/parishGoogleCalendarServer.ts`

Current behavior:

- Google Calendar update-event POST now requires staff authorization.
- POST reads the active parish cookie and resolves it through active staff parish context before loading the request or parish Google integration.
- POST preserves explicit `primary_parish_id()` compatibility fallback only through the staff parish context helper when no active parish cookie exists.
- POST fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- POST checks the request's parishioner row and returns `Request not found` if the request does not belong to the selected/authorized parish.
- POST loads the Google Calendar integration by the selected/authorized parish id before any Google Calendar client, conflict check, or event patch is created.
- POST rejects linked requests whose stored `google_calendar_id` does not match the selected parish's configured calendar id.
- Existing Google conflict detection, event patching, request link update, and OAuth error marking remain unchanged after the scope checks pass.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.
- Requests linked to an older/different parish calendar id now need the event recreated for the selected parish instead of being patched across calendar boundaries.

Completed phase:

- Active parish context is wired into Google Calendar event updates.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, primary-fallback denial when a cookie exists, request parish ownership checks, selected-parish calendar id checks, and route source-order wiring.

### Completed: Google Calendar Delete Event API

Files:

- `app/api/google/calendar-event/delete/route.ts`
- `lib/parishGoogleCalendarServer.ts`

Current behavior:

- Google Calendar delete-event POST now requires staff authorization.
- POST reads the active parish cookie and resolves it through active staff parish context before loading the request or parish Google integration.
- POST preserves explicit `primary_parish_id()` compatibility fallback only through the staff parish context helper when no active parish cookie exists.
- POST fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- POST checks the request's parishioner row and returns `Request not found` if the request does not belong to the selected/authorized parish.
- POST loads the Google Calendar integration by the selected/authorized parish id before any Google Calendar client or event deletion is created.
- POST rejects linked requests whose stored `google_calendar_id` does not match the selected parish's configured calendar id.
- Existing Google not-found tolerance, request calendar-field cleanup, and OAuth error marking remain unchanged after the scope checks pass.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.
- Requests linked to an older/different parish calendar id now need the event recreated for the selected parish instead of being deleted across calendar boundaries.

Completed phase:

- Active parish context is wired into Google Calendar event deletion.
- Focused tests cover no-cookie fallback, exact active parish authorization, unauthorized-cookie denial, primary-fallback denial when a cookie exists, request parish ownership checks, selected-parish calendar id checks, Google not-found tolerance, and route source-order wiring.
- Manual QA checklist and source-level guard tests now cover the full create/update/delete active-parish behavior before any production or operational RLS work.

### Completed: Google Calendar OAuth Connection Routes

Files:

- `app/api/google/oauth/start/route.ts`
- `app/api/google/oauth/callback/route.ts`
- `app/api/parish/settings/route.ts`
- `lib/googleOAuthStateCookie.ts`

Current behavior:

- OAuth start now requires authorized staff access before beginning the Google Calendar connection flow.
- OAuth start reads the active parish cookie and resolves it through active staff parish context before creating the Google OAuth redirect.
- OAuth start preserves explicit `primary_parish_id()` compatibility fallback only through the active staff parish context helper when no active parish cookie exists.
- OAuth start fails closed when an active parish cookie is stale, unauthorized, or resolves through primary fallback instead of membership authorization.
- The signed Google OAuth state cookie now includes the selected/authorized parish id as server-signed metadata.
- OAuth callback verifies the signed state and revalidates the signed parish id through the authenticated staff membership context before exchanging the Google OAuth code.
- OAuth callback upserts `parish_google_integrations` for the signed and revalidated selected parish, not the oldest parish row.
- Parish settings already loads Google Calendar status for the selected/authorized parish through the active parish settings read context.

Risk:

- Operational RLS is still unchanged, so this remains an application authorization phase before the future database policy migration.
- Existing in-progress Google OAuth sessions that were started before this change may fail because their older state cookie has no signed parish metadata.
- Live OAuth reconnect was not run in this phase; it still requires safe non-production Google credentials.

Completed phase:

- Active parish context is wired into Google Calendar OAuth start/callback connection behavior.
- Focused tests cover signed parish metadata, legacy state verification compatibility, staff/active-parish OAuth start wiring, callback selected-parish upsert wiring, oldest-parish lookup removal, and selected-parish settings status wiring.
- Browser-QA evidence template is prepared for a future safe non-production reconnect run covering selected-parish settings status, create/update/delete lifecycle, cross-parish/stale selection denial, mismatched calendar safety, and cleanup.
- Secure browser-QA setup/check scripts are prepared for the selected-parish Google Calendar reconnect run when safe non-production variables are not visible to the active Codex session.

## Intentional Compatibility Helpers

Files:

- `lib/dashboardParishRequestScope.ts`
- `lib/server/staffParishContext.ts`
- `lib/server/staffWriteParishContext.ts`

Current behavior:

- These helpers intentionally preserve `primary_parish_id()` fallback paths.
- The fallback is required until production migration readiness is proven and rollback support remains available.

Inventory decision:

- Do not remove these fallback helpers yet.
- Do not count these helpers as operational surfaces by themselves.
- Continue requiring call sites to make fallback usage explicit.

## Recommended Next Safe Implementation Order

1. Keep production public intake runtime routing disabled unless the exact production approval phrase is recorded.
2. Run membership-aware operational RLS forward and rollback drafts in a disposable Supabase target only.
3. Capture disposable RLS evidence, manual staff workflow QA, public/family/document QA, and automated check outputs.
4. Promote operational RLS only after every gate in `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md` passes.

## Current No-Go Before Operational RLS Promotion

Do not promote the membership-aware operational RLS candidate until all are true:

- Disposable RLS forward validation passes.
- Disposable RLS rollback validation passes.
- Manual staff workflow QA passes for requests, people, households, sacramental records, Mass intentions, settings, reports, calendar, communications, intake, notifications, and global search.
- Public intake, family portal, documents, email, Google Calendar, and AI checks pass with safe test credentials.
- Production public intake runtime routing remains disabled unless separately approved through `docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md`.
- No cross-parish deny case fails.
- Rollback owner and product/technical/QA/security sign-off are recorded.
