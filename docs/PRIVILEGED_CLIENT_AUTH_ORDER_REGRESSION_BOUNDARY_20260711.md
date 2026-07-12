# Privileged Client Authentication-Order Regression Boundary - 2026-07-11

Decision: `PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented as a source-level production-readiness guard.

## Rule

An authenticated API Route Handler must not construct Vinea's Supabase service-role client before direct staff authentication succeeds. The repository guard currently verifies 52 directly authenticated handler methods that also construct the privileged client.

The guard also rejects:

- module-scope construction of the service-role client in Route Handlers;
- importing or constructing the privileged client from a Client Component; and
- removal of the service helper's explicit `server-only` boundary.

## Authorization Boundary

Construction ordering is only the first privileged-access gate. This guard does not replace active-parish membership, request/record ownership, admin-role, target-document, export-field, token, rate-limit, or route-specific authorization tests. Some loaders deliberately use the service-role client to find the target row needed for ownership resolution; those routes must keep focused tests proving no privileged query or mutation occurs before the applicable scope decision.

Public intake, token-scoped family access, verified notifications, scheduled delivery, and webhook-style transports are not reclassified as staff routes by this guard. They retain their own rate limits, signatures/tokens, bounded inputs, and target verification.

## Rollback

Rollback removes only the source-level test and evidence entry. It does not alter runtime behavior, credentials, schema, policies, or data.

## Verification Boundary

No production access, credential read, privileged query, provider call, database write, migration, operational RLS change, record mutation, or production-sensitive flag change occurred while implementing this guard.

### Automated Verification

- Focused privileged-client, mutation-origin, side-effecting-GET, release-index, and evidence suite: 5 files / 16 tests passed.
- Full Vitest regression suite: 710 files / 2,863 tests passed.
- Lint passed with zero errors and zero warnings.
- The latest runtime-changing Next.js `16.2.10` production build passed all 56 static pages; this guard adds test/docs only.
- Release handoff reconciled all 111 artifacts while all 15 production-sensitive gates remained locked.
- Repository secret scan checked 1,932 files with zero findings.
- `git diff --check` passed; existing line-ending notices remain informational only.
