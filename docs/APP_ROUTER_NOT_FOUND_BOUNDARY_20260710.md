# App Router Not-Found Boundary

Decision: `APP_ROUTER_NOT_FOUND_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - SAFE FIXED NAVIGATION`

Date: 2026-07-10

## Scope

Vinea now provides a root `app/not-found.tsx` Server Component for stale, mistyped, unmatched, or explicitly missing routes.

- The page uses the stable Next.js 16 `not-found.tsx` convention.
- It offers fixed links to the Vinea home page and staff sign-in.
- It does not inspect, render, log, or forward the requested path, query string, cookies, headers, route parameters, exception details, identifiers, private contacts, or credential material.
- It does not enable the experimental `globalNotFound` flag.

## Preserved Behavior

- Existing routes, redirects, authentication, active-parish scope, membership checks, and production gates are unchanged.
- No database, external provider, monitoring service, or storage system is called.
- No production environment is accessed.
- No migration, operational RLS change, production flag, record mutation, communication send, AI call, export, signed URL, Calendar mutation, certificate generation, or public trust claim is made.

## Verification Boundary

- Focused source/docs tests verify the Server Component boundary, fixed internal links, accessible heading, absence of request inspection, and production-safety statements.
- TypeScript, lint, full regression, release-evidence checks, secret scanning, and production build remain required before this slice is recorded as release evidence.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.

## Verification Results

- Focused App Router resilience and release-evidence suite: `7 test files / 21 tests passed`.
- Full Vitest regression suite: `671 test files / 2,642 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Repository secret scan: `1,833 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff validation: `72 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence validation: `454 required phrases / 0 findings`.
- Next.js production build: `PASS` with Next.js `16.2.10` and all `53` static pages generated.
