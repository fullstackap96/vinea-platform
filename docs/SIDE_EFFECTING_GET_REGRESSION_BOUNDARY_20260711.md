# Side-Effecting GET Regression Boundary - 2026-07-11

Decision: `SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented as a source-level production-readiness guard.

## Rule

An ordinary browser GET must not create, update, delete, send, issue, or otherwise mutate Vinea or provider state. CI now discovers GET Route Handlers with recognized database/provider side effects and permits only two reviewed protocol transports.

## Approved Exceptions

### Google OAuth callback

`app/api/google/oauth/callback/route.ts` remains GET because Google redirects the browser to the registered callback URI. Before token exchange or integration upsert, the route must preserve:

1. authenticated staff;
2. a signed HttpOnly OAuth state cookie;
3. timing-safe state comparison;
4. signed parish identity;
5. exact active-parish membership authorization; and
6. provider token exchange before the scoped integration upsert.

Cross-origin rejection is intentionally not used on this provider redirect.

### Parish Daily Brief cron

`app/api/parish/daily-brief/route.ts` remains GET for scheduled delivery compatibility. The bearer-authorized Daily Brief cron branch must reject an invalid authorization header before constructing a service-role client, loading parish data, calling the email provider, or updating delivery status.

It remains separate from the same-origin authenticated staff POST used for manual delivery.

## Regression And Rollback

A newly discovered side-effecting GET fails CI until the behavior is moved to an explicit mutation method or receives a separately reviewed protocol exception with focused ordering tests. Rollback removes only this source guard; it does not alter runtime behavior or data.

## Verification Boundary

No production access, provider call, OAuth exchange, email send, database write, migration, operational RLS change, record mutation, secret access, or production-sensitive flag change occurred while implementing this guard.

### Automated Verification

- Focused side-effect scan, OAuth, Daily Brief, release-index, and evidence coverage passed.
- Full Vitest regression suite: 709 files / 2,859 tests passed.
- Lint passed with zero errors and zero warnings.
- The immediately preceding Next.js `16.2.10` production build passed all 56 static pages; this guard adds test/docs only.
- Release handoff reconciled all 110 artifacts while all 15 production-sensitive gates remained locked.
- Repository secret scan checked 1,930 files with zero findings.
- `git diff --check` passed; existing line-ending notices remain informational only.
