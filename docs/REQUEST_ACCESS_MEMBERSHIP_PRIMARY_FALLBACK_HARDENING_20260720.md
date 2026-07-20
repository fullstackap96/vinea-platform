# Request Access Membership-Primary Fallback Hardening

Status: Implemented and locally verified on 2026-07-20.

Implementation commit: `ae00ccec89b24a30862dbb84c5b41c1fd6a4da8d`.

## Purpose

Prevent cookie-free staff request and document access from selecting the globally oldest parish when an authenticated staff membership context is already available.

## Behavior

- An authorized active-parish cookie still requires an exact membership match.
- When no active-parish cookie exists and compatibility fallback is explicitly allowed, request and document access now resolve the authenticated staff membership context first.
- A successful membership result selects that staff member's authorized primary parish.
- A membership-resolution error fails closed instead of silently expanding access through the global oldest-parish lookup.
- The direct oldest-parish compatibility lookup remains available only when the caller explicitly allows fallback and has no staff Supabase client. This preserves legacy/single-parish compatibility without overriding available membership evidence.
- Request ownership is still confirmed through the request's parishioner parish before access is returned.

## Verification

- Focused request/detail/document access coverage passed 4 files / 22 tests before the source/documentation guard was added.
- Added unit coverage proves membership-primary selection, no global-parish query when membership is available, and fail-closed behavior on membership-resolution errors for both request detail and request documents.
- Added source-level assertions keep the legacy lookup behind the explicit compatibility option and membership-first branch.
- The completed focused slice passed 5 files / 25 tests, and `npm.cmd run typecheck:all` plus lint passed.
- The complete 15-check local release contract passed in 329.1 seconds: 0 secret findings across 2,842 text files, 0 dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, 836 test files / 3,566 tests, and the credential-free Next.js 16 56-page build.

## Safety

No migration or RLS change was made. No production, shared QA, database, storage, signed URL, provider, communication, export, AI, Google Calendar, or record mutation occurred. Existing active-parish authorization, request ownership checks, generic denial behavior, and legacy no-client compatibility remain intact.
