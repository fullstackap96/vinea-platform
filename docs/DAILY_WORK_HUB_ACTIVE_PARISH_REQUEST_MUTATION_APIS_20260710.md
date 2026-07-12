# Daily Work Hub Active-Parish Request Mutation APIs - 2026-07-10

Decision: `DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_IMPLEMENTED_20260710`

Status: Implemented in repository code and verified without accessing production or sending communications.

## Scope

The Daily Work Hub no longer writes mark-as-contacted or family care touchpoint changes directly from the browser. The two staff-reviewed actions now use:

- `POST /api/requests/[id]/mark-contacted`
- `POST /api/requests/[id]/care-touchpoint`

The routes own the corresponding `request_communications`, `requests`, and funeral follow-up date writes. `app/dashboard/DashboardPageCore.tsx` calls the routes with same-origin credentials and contains no direct Supabase mutations for either action.

## Authorization Boundary

Both routes:

1. Require an authenticated authorized staff session.
2. Read the selected active parish cookie.
3. Require exact active-parish membership when that cookie is present.
4. Use the already server-resolved active parish hint only when no active parish cookie exists, then validate that exact parish through membership.
5. Confirm the target request belongs to the authorized parish through the request's parishioner relationship.
6. Return the generic `Request not found.` response for forged, cross-parish, or wrong-type targets before any write.

These routes do not enable the legacy oldest-parish fallback. The cookie takes precedence; a request-supplied parish hint cannot override it, and either value must pass exact membership validation.

The care-touchpoint route additionally confirms the owned request is a funeral request before accepting the current bereavement-care action.

## Validation And Write Order

Mark as contacted uses server-owned contact time, method, and history text. After authorization it:

1. Inserts the communication-history row.
2. Updates the request communication summary.
3. Writes safe `request.communication.logged` audit metadata.

Care touchpoint authenticates before bounded JSON parsing, accepts only the existing communication methods, limits the request body to `64 KiB`, limits the staff-reviewed communication note, validates the follow-up calendar date, and requires an explicit care-cycle completion boolean. After authorization it:

1. Loads the minimal request type.
2. Inserts the communication-history row.
3. Updates the funeral follow-up date.
4. Updates the request communication/follow-up summary and optionally marks the staff-reviewed care cycle complete.
5. Writes safe `request.communication.logged` audit metadata.

The server allowlist preserves every staff-reviewed control currently exposed by the care card, including **Sent card**. The active parish cookie remains authoritative when present; a forged request header cannot override it.

Audit metadata records the active parish, staff identity, request target, route source, result stage, method, completion choice, follow-up date, and completed write stages. It excludes the pastoral communication note body.

## Partial Success And No-Op Behavior

All authentication, membership, request ownership, request-type, body-size, and validation failures are no-op responses: no communication, request, funeral detail, or audit row is written.

The underlying REST writes are sequential and no migration or database RPC was added. If communication history succeeds but a later summary write fails, the API returns a structured partial-success result. The dashboard then refreshes the request and gives staff the existing plain-English review guidance instead of retrying blindly or claiming the entire action failed.

Each later `UPDATE` also selects the minimal updated-row identifier. A successful Supabase response with zero matched rows is treated as a partial save, not a completed action. This covers the narrow race where an authorized request or its funeral detail disappears after the ownership check but before the sequential update.

Rollback is code-only: restore the prior dashboard caller and remove the two routes. No feature flag, migration, schema change, or operational RLS change is required. Existing database rows created by a completed staff action are not automatically reversed.

## Focused Verification

`lib/server/dashboardWorkHubRequestMutationRoutes.test.ts` proves:

- same-parish success for both actions;
- unauthorized, forged, cross-parish, and non-funeral denial before writes;
- unauthenticated care-touchpoint denial before service-client creation;
- active-parish cookie precedence over a conflicting header;
- active-parish cookie scope and explicit no-cookie fallback configuration;
- scheduled follow-up and staff-reviewed care-cycle completion behavior;
- the existing staff-reviewed **Sent card** touchpoint option;
- ordered communication, funeral-detail, and request writes;
- structured partial results for both later-stage failures;
- zero-row request and funeral-detail updates producing the same honest partial result;
- safe audit metadata without pastoral note text;
- authentication and request ownership before writes;
- bounded body parsing without `request.json()`; and
- absence of the corresponding direct browser Supabase mutations.

Current local verification completed on 2026-07-10:

- focused mutation-route, same-origin, and browser-access suite: 3 files / 42 tests passed;
- full Vitest regression suite: 729 files / 2,972 tests passed;
- all-file TypeScript check passed through the production build;
- lint passed with zero errors and zero warnings;
- Next.js 16.2.10 production build passed with 56 static pages generated.
- release handoff reconciled all 133 artifacts and all 15 production-sensitive gates remain locked;
- repository secret scan passed across 1,973 files with zero findings and printed no secret values; and
- `git diff --check` passed.

## Manual QA Still Recommended

Use synthetic non-production requests only:

1. Select an authorized parish and mark one same-parish follow-up contacted.
2. Confirm history, request summary, and one safe audit event agree.
3. Save one funeral care touchpoint with a next date, then complete the care cycle after staff review.
4. Switch to another authorized parish and confirm a stale/cross-parish request id receives generic not-found guidance with no write.
5. Confirm batch mark-as-contacted keeps failed rows selected and reports counts only.
6. Confirm no email, text message, Google Calendar call, AI call, export, storage request, certificate generation, or other outbound action occurs.

## Preserved Boundaries

- No production access.
- No communication was sent during verification.
- No Google Calendar call.
- No migration or operational RLS change.
- No production-sensitive flag enabled.
- Staff review remains required.
- Existing provider behavior is unchanged.
- Production-sensitive features remain `NO-GO` unless their separate approval evidence is complete.
