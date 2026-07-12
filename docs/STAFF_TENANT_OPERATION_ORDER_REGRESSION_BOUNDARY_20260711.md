# Staff Tenant Operation-Order Regression Boundary - 2026-07-11

Decision: `STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified as a repository guard without production access or runtime behavior changes.

## Protected Cohort

The guard discovers and inventories all **13 non-request privileged staff mutation methods** that directly authenticate staff and construct the service-role client. It covers:

- generic non-request audit-event writes;
- request-bound staff email delivery;
- People and Household duplicate merges;
- committed data imports;
- Mass Intention intake triage;
- manual Daily Brief delivery;
- public-intake routing domain, token, verification, and settings changes;
- parish settings;
- Staff Access management; and
- workflow-template settings.

## Required Order

Each reviewed method must authenticate staff, resolve exact tenant scope, reject failed scope, and complete any required parish-admin authorization before the first provider or database side effect. The route inventory itself is tested, so a new directly authenticated privileged mutation cannot appear outside this review map unnoticed.

Staff Access and generic non-request audit writes retain their additional selected-parish admin checks. Request-bound email retains same-parish request ownership through the approved request access resolver. Imports retain separate read-only preview context and write context for committed imports.

## Coverage Limits

This guard **does not replace route-specific validation**, target ownership checks, bounded bodies, field allowlists, audit redaction, partial-success handling, storage cleanup, provider error handling, cron bearer authorization, public/token-scoped route protections, or operational RLS. Existing focused tests remain authoritative for those details.

## Verification Boundary

- No production access.
- No database write, provider call, communication send, import, merge, or settings change.
- No Google Calendar, AI, export, storage, signed URL, or certificate action.
- No migration or operational RLS change.
- No production-sensitive flag change.

Rollback is test/docs-only and does not require runtime or data rollback.
