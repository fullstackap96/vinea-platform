# Dashboard Shell Server Context And Exact-Parish Admin Boundary

Date: 2026-07-10

Status: Implemented and fully verified locally. Safe non-production multi-parish browser QA remains recommended.

## Purpose

Make the dashboard shell arrive complete without hydration-time identity and staff-roster requests, while ensuring admin privileges follow the selected parish instead of becoming account-wide.

## Implementation

- `lib/server/loadDashboardShellContext.ts` loads the authenticated staff email and selected-parish admin capability on the server.
- Parish-switcher and authenticated-user reads begin concurrently.
- `app/dashboard/layout.tsx` passes the finished identity and capability into the interactive shell.
- `app/dashboard/DashboardLayoutClient.tsx` no longer calls browser `getUser`, subscribes to browser auth changes, or fetches `/api/parish/staff-users` during hydration.
- Browser Supabase use remains only for the existing explicit logout action.
- The shell no longer downloads the Staff Access roster merely to decide whether to show Audit Log navigation.
- `lib/server/staffParishRole.ts` provides one server-only exact-parish active-admin check shared by Staff Access, the dashboard shell, and Audit Events.
- Full `GET /api/audit-events` reads and non-request `POST /api/audit-events` writes require an active admin row for the exact selected parish.
- Request-target audit access retains its existing authenticated active-parish and request-parish attribution behavior.

## Fail-Closed Behavior

- Missing staff email, unresolved parish context, or role lookup failure hides admin navigation.
- Role lookup failures return generic API errors and safe structured logs without staff email, database detail, credentials, or secrets.
- Admin status in Parish A does not grant full Audit Events access or parish-level Audit Events write authority while Parish B is selected.
- No browser-provided role or parish label is trusted.

## Preserved Boundaries

- Staff authentication, active-parish membership resolution, and route-level authorization remain required.
- Staff Access management behavior and its page payload contract remain unchanged.
- Logout behavior remains unchanged.
- No production access, migration, operational RLS change, external provider call, record mutation outside existing approved audit writes, production-sensitive flag, or public trust claim was introduced.

## Verification

- Focused shell, Staff Access, and Audit Events suite: 7 files / 41 tests passed.
- Expanded exact-parish authorization suite: 5 files / 25 tests passed.
- Full Vitest regression suite: 687 files / 2,711 tests passed.
- All-file TypeScript: passed.
- Quiet lint: passed.
- Next.js 16.2.10 production build: passed with 56 static pages generated.
- Repository secret scan after documentation: 1,872 text files scanned, 26 binaries skipped, 0 findings, and no secret values printed.
- Release handoff: 82 artifacts, 16 CI commands, 15 locked gates, and 0 findings.
- Completed local evidence: 510 required phrases and 0 findings.
- `git diff --check`: passed with existing line-ending warnings only.

## Safe Non-Production Browser QA

Use a synthetic or approved non-production account that is admin in Parish A and staff in Parish B:

1. Confirm `/api/health` returns `checks.schema: true`.
2. Confirm staff identity appears in the first rendered shell with no browser request to `/api/parish/staff-users`.
3. Select Parish A and confirm Audit Log navigation is visible and the full Audit Events view loads.
4. Switch to Parish B and confirm Audit Log navigation disappears.
5. Confirm direct full Audit Events access in Parish B returns a generic denial.
6. Confirm a safe synthetic parish-level audit write in Parish B is denied without creating an event.
7. Confirm request-target activity for an owned Parish B request retains its existing scoped behavior.
8. Switch back to Parish A and confirm exact-parish admin capability returns.
9. Confirm logout still clears the session and returns to login.

## Approval Boundary

This evidence does not approve production RLS, production monitoring, production exports, public intake production routing, production AI, runtime reminders, certificate issuance, public backup/restore claims, or public trust-center claims.
