# Request List Basic Export Non-Production QA Evidence - 2026-06-30

Status: Completed as non-production route-level QA for `request_list_basic`. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated beyond the approved future-safe audit metadata path, and no secrets were exposed.

## QA Environment

- QA type: `route-level non-production QA harness`
- Route under test: `app/api/exports/requests/basic/route.ts`
- Export preset: `request_list_basic`
- Runtime flag state for enabled cases:
  - `VINEA_EXPORT_RUNTIME=ENABLED`
  - `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
  - `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`
- Production boundary: production remains blocked by `lib/server/exportRuntimeGate.ts`.
- Runtime rollback method: disable or unset the export runtime flags.

## QA Results

| Gate | Expected result | Evidence | Result |
|---|---|---|---|
| Flag-off blocking | Route returns generic disabled response before staff auth, parish scope, audit, or query | `lib/server/requestListBasicExportRoute.test.ts` verifies HTTP `404` with `export_unavailable` and no staff/auth/db/audit calls | Passed |
| Same-parish success | Authenticated staff with selected active parish membership receives only the basic request-list CSV | `lib/server/requestListBasicExportRoute.test.ts` verifies HTTP `200`, CSV content type, approved CSV header, same-parish row, and no email/phone/notes strings | Passed |
| Cross-parish denial | Forged or unauthorized active parish cookie fails before audit or query | `lib/server/requestListBasicExportRoute.test.ts` verifies HTTP `403`, generic blocked reason, no service-role query client, and no audit write | Passed |
| Blocked-field denial | Token, internal note, or non-allowlisted field requests fail before audit or query | `lib/server/requestListBasicExportRoute.test.ts` verifies blocked `access_token` and `internal_notes` field attempts return HTTP `403` with no service-role query client and no audit write | Passed |
| Family portal denial | Non-staff/family-facing requests cannot access the staff export route | `lib/server/requestListBasicExportRoute.test.ts` verifies unauthenticated/family-style access returns HTTP `401` before parish scope, service-role query client, or audit write | Passed |
| Safe audit metadata before query/delivery | Approved audit metadata is written before any export query or CSV delivery | `lib/server/requestListBasicExportRoute.test.ts` records event order and verifies `audit` occurs before `query:parishioners`, `query:requests`, and `query:request_workflow_steps` | Passed |
| CSV field exclusions | Export excludes notes, communication history, parishioner contact details, documents, signed URLs, token material, Google payloads, AI payloads, audit-log details, and sacramental/canonical details | Route allowlist contains only request reference, type, status, workflow phase, assigned staff label, follow-up date, created/updated date, and incomplete workflow counts; tests verify forbidden strings are absent | Passed |
| Source-level route preflight | Route source keeps auth, gate, active parish, membership scope, DTO, blocked-field, family-portal, audit, generic-error, query, and delivery markers | `lib/server/requestListBasicExportRoute.test.ts` calls `validateFutureExportRouteRuntimeWiringSource` against the actual route source | Passed |
| Rollback | Disabling flags returns the route to generic unavailable behavior | Flag-off test verifies route is blocked before auth/db/audit when runtime flags are absent | Passed |

## Commands Run

```bash
npm.cmd test -- lib/server/requestListBasicExportRoute.test.ts lib/server/exportRouteBasicPilotProductOwnerApprovalPacket.test.ts lib/server/exportRouteBasicPilotImplementationPlan.test.ts lib/server/dataExportAccessControlPolicyProposal.test.ts lib/server/trustCenterReadinessPacket.test.ts lib/server/exportRuntimeGate.test.ts lib/server/exportRouteRuntimeWiringPreflight.test.ts lib/exportAccessControl.test.ts
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

## Forbidden Data Review

The route-level QA did not expose or log:

- Staff passwords.
- Supabase service role keys.
- Supabase anon keys.
- Google OAuth access or refresh tokens.
- OpenAI API keys.
- Family portal tokens or token hashes.
- Public intake token hashes.
- Signed URL material.
- Raw AI prompts, generated outputs, provider payloads, or token material.
- Internal notes or communication bodies.
- Document storage paths or document contents.
- Sacramental/canonical record details.

## Remaining Risks

- This was route-level non-production QA, not a production smoke test.
- No staff-facing export UI exists.
- The route is intentionally disabled by default and production-blocked.
- Broader export governance remains incomplete for sensitive exports, document exports, people/household exports, sacramental/canonical exports, audit exports, diocesan exports, and support break-glass exports.
- A future live non-production smoke can be run after product owner approves a safe app target and fixture records for direct HTTP/browser validation.

## Outcome

Current decision: `NON-PRODUCTION ROUTE-LEVEL QA PASSED, PRODUCTION EXPORTS REMAIN NO-GO`

Recommended next step: prepare a production-safe export rollout plan only after a separate approval covers staff-facing UI, live non-production smoke fixtures, monitoring, support readiness, field-level export permissions, and rollback ownership.

Completion marker: `REQUEST_LIST_BASIC_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630`
