# Google Calendar Provider Reliability - 2026-07-12

Status: `Implemented and verified` locally. Live provider retry recovery remains `Implemented but not rollout-verified`.

## Technical Approval Record

**Capability:** Bounded Google Calendar event operations and duplicate-safe event creation retries.

**Environment tested:** Local Windows release-candidate worktree; no Google Calendar request or production access.

**Repository state/commit:** `codex/release-candidate-20260711` at immutable implementation commit `74dc786b1489f37d83082d68aa12bfdf75fae37f`.

**Date:** 2026-07-12

**Acceptance criteria:**

- Every Calendar list, insert, recovery lookup, patch, and delete call has a server-owned provider deadline.
- Create uses one opaque deterministic Google-compatible event id per selected parish and request.
- A retry ignores only that deterministic event during conflict detection.
- Google `409 already exists` recovery verifies the event id, summary, start, and end before local linkage.
- Local request linkage occurs only after a confirmed insert or verified recovery.
- Authentication, active-parish membership, request ownership, selected-parish integration, staff conflict review, and audit ordering remain authoritative.

**Evidence collected:**

- Complete Google Calendar slice: `34 files / 128 tests passed`.
- Focused reliability and route slice: `7 files / 47 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- ESLint: `PASS`.
- Next.js `16.2.10` production build: `PASS`; `56` static pages generated.
- Repository secret scan: `2,122` files scanned; `0` findings; no secret values printed.
- Immutable source aggregate: `EEE8DAD194D70650341FD4643019DBF530AFA856E1DDA897D78DC69FD61124B3` across `1,457` release-source files.
- Complete `15`-check local release gate: `PASS` in `271.6` seconds.
- Complete Vitest regression: `822` files / `3,503` tests passed.
- Release security/evidence gates: zero dependency vulnerabilities and zero findings across RLS, monitoring, production gates, CSP, trust claims, release handoff, and completed evidence.
- Remote Vercel preview deployment `dpl_GbuTZdN1n5rrp8KJNzLDLxcS6pN3` failed closed before `READY` because Preview scope still lacks the required `SUPABASE_SERVICE_ROLE_KEY` name; the build log exposed no value.
- GitHub's connected app returned no open PR and no GitHub Actions workflow run for the evidence head at review time; PR-level check attribution remains unavailable.

**Security and tenancy result:** `PASS` for source/unit scope. Event identity is derived only after staff authentication, selected-parish resolution, and same-parish request ownership. The custom event id contains no raw parish or request id.

**Failure and rollback result:** Provider calls settle after `15` seconds. Create retry recovery fails closed with a generic conflict when the existing event does not match. Update and delete retain their existing repeat-safe behavior. Rollback is the code revert; there is no migration, feature flag, database policy, or data conversion.

**Known limitations:** No live Google timeout was induced, no real event was created, and no provider-side `409` recovery was exercised against an approved test calendar in this slice. The protected preview could not be smoke-tested because its build failed closed on the missing Preview service-role credential. Provider behavior therefore remains `Implemented but not rollout-verified`.

**Approval decision:** `Approved with constraints`.

**Approved scope:** Local/CI implementation and non-production provider smoke. This does not approve merge, production deployment, production Calendar use, production RLS, exports, public intake routing, AI rollout, monitoring, or public trust claims.

**Reasoning:** Deterministic identity closes the ambiguous-create duplicate risk, exact event verification prevents unsafe collision recovery, and bounded calls prevent provider stalls. Existing tenant and staff-review boundaries remain before provider work.

**Next required action:** Run the complete release gate, bind an immutable commit, obtain clean remote CI, then exercise one approved synthetic test-calendar create/retry/update/delete smoke without touching real parish calendars.

## OAuth Transport Deadline Addendum

Status: `Implemented and verified` locally at immutable implementation commit `21fb3d4a0d26b4881a9ab936793a032ca64633fa`.

The event API deadlines now extend through the OAuth transport boundary. Calendar clients receive a fresh 15-second transporter signal before refresh-token use, the OAuth callback applies the same boundary to authorization-code exchange, and the optional Google profile lookup receives its own 15-second abort signal. Staff authentication, signed state, active-parish membership, redirect URI, token requirements, selected-parish persistence, and safe callback failure behavior are unchanged.

- Complete Calendar/OAuth regression slice: `36 files / 139 tests passed`.
- Focused transport slice: `3 files / 15 tests passed`.
- Standard TypeScript check: `PASS`.
- Immutable release-source aggregate: `A8653C9DB5FCF3259B8F8A3E0031F59D41F8C2136D7BECAB13F547FBA0E65E5B` across `1,457` files.
- Complete `15`-check local release gate: `PASS` in `269.5` seconds.
- Complete Vitest regression: `822` files / `3,504` tests passed.
- Both TypeScript scopes, ESLint, every evidence gate, and the credential-free `56`-page build: `PASS`.
- Repository secret scan: `2,122` files / `0` findings; dependency audit: `0` vulnerabilities.
- GitHub Actions run `29196473916`: `SUCCESS` on exact evidence head `5c8eaf75c5f86140f8146cc80c1a95011722b7fe`.
- Vercel preview `dpl_DTgXTzk5BZQD8JTBo8wxDt4rsm77`: failed closed before `READY` because Preview still lacks required variable name `SUPABASE_SERVICE_ROLE_KEY`; no value was printed.
- Production accessed: `NO`.
- Google Calendar, OAuth, or profile endpoint called: `NO`.
- Token, integration, event, request, or parish record mutated: `NO`.
- Migration, operational RLS, scope, redirect, or production flag changed: `NO`.

Live token refresh, code exchange, and timeout recovery remain `Implemented but not rollout-verified`. Protected-preview health/staff smoke also remains blocked by the missing Preview credential, not by deployment protection.

## Plain-English Summary

If Google creates an event but Vinea loses the reply, Vinea can now recognize that exact event on retry instead of making a second copy. Google operations also stop waiting after a fixed deadline. Vinea still checks the staff member, selected parish, request, calendar connection, and scheduling conflicts first.

## Explicit Non-Actions

- Production accessed: `NO`.
- Google Calendar or OAuth called: `NO`.
- Event or request mutated during verification: `NO`.
- Migration or operational RLS changed: `NO`.
- Production-sensitive flag enabled: `NO`.
- Secret, raw identifier, OAuth token, calendar id, or event link recorded: `NO`.
- Public trust claim made: `NO`.
