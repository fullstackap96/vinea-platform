# Weekly security audit — 2026-09-07

Baseline: `b6f0e028057760d8238240b1f77ca490c0699e53` (unchanged origin/main since last run).

## Confirmed findings and fixes

1. **Email wildcard authorization (high priority).** `authorizeStaffUser`, `staffIsAdminForParish`, and `loadAuthenticatedStaffRoleForParish` used an unescaped ILIKE email lookup as identity evidence. A signed-in email such as `a_min@example.com` could match an admin row for `admin@example.com`. The service-role lookups bypass database RLS, so the application must enforce exact identity itself. Existing tenant gates constrain impact but do not make an in-parish admin wildcard match safe. Queries now select the email and grant access only for an exact normalized match. Global role aggregation excludes other emails. Tests cover percent, underscore, asterisk, mixed case, exact literal wildcard addresses, and mixed staff/admin candidate results. Bounded candidate queries remain; ambiguous results can deny access rather than grant another user's role.

2. **Dependency advisories.** Updated locked `@humanfs/node` to 0.16.8, `browserslist` to 4.28.9, and `qs` to 6.16.0 with required transitive updates within existing ranges. The initial audit reported two moderate and one high affected packages; the resulting full and production audits report zero vulnerabilities. Direct package versions are unchanged.

## Other reviewed boundaries

- Reviewed migration authorization predicates, privileged function grants, parish membership checks, and public intake revocations. The prior `auth.role()` cleanup remains unmerged, but the current parishes policy still requires membership for authenticated users. Deprecation alone does not establish an access bypass; no duplicate cleanup branch was created.
- Checked staff and tenant operation-order guards, mutation origin checks, public intake rate limiting, Google OAuth staff/state/parish validation, safe login destinations, privileged server-only clients, environment exposure, safe errors, document access, portal tokens, and sensitive response cache headers. No additional confirmed defect was identified in the reviewed paths.
- Repository scan: 2,212 text files, zero secret findings. No live database credentials, deployed policies, or production data were inspected or modified. Repository assertions and mocked authorization tests do not certify deployed RLS behavior.

## Verification

- 87 tests passed across 12 focused security test files, including the changed authorization helpers and staff management caller.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed. Build used placeholder Supabase configuration and a synthetic application origin.
- `npm run check:repository-secrets` passed.
- Full npm audit and `npm audit --omit=dev`: zero vulnerabilities.
- Full repository test suite and live Supabase tests were not run.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase changelog](https://supabase.com/changelog). Installed Next.js 16.3 authentication and server/client guides were reviewed before implementation.
