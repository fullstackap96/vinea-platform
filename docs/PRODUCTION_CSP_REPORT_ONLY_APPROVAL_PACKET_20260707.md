# Production CSP Report-Only Approval Packet

Current decision state: `CSP REPORT-ONLY DESIGN READY FOR REVIEW; RUNTIME CSP NOT IMPLEMENTED`

Date prepared: 2026-07-07

## Purpose

This packet defines the approval gate for adding a Content Security Policy in report-only mode before any enforcing CSP is considered.

The existing production security headers baseline is live in code through `next.config.ts`, but CSP is intentionally excluded until a separate browser QA pass proves it does not break staff sign-in, public intake, family portal access, Google OAuth/Calendar callbacks, document flows, or dashboard interaction.

This packet does not enable CSP, add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust-center claims.

## Required Approvals

| Role | Required Approval |
|---|---|
| Product owner | Confirms report-only CSP is safe to test in non-production and does not create public trust-center claims. |
| Security/data owner | Reviews provider allowlists, report payload redaction expectations, and forbidden data boundaries. |
| Engineering owner | Confirms the implementation plan follows the current Next.js 16 header/proxy conventions and can be rolled back by removing the report-only header. |
| QA owner | Confirms browser smoke coverage across staff, public, family portal, and provider callback flows. |
| Support owner | Confirms no customer-facing communication is sent unless a future production rollout is approved. |

## Proposed Report-Only Scope

The first runtime implementation should be non-production only and report-only only.

Candidate header:

```text
Content-Security-Policy-Report-Only
```

The first candidate policy should be intentionally conservative and evidence-driven. It should start from observed app needs rather than guessing a final policy. Provider allowlists must be verified before any enforcing CSP is proposed.

Known integration areas that must be reviewed:

- Next.js app shell and static asset loading
- Supabase auth and REST calls
- Google OAuth callback and Calendar reconnect flows
- Resend or staff email API paths
- public intake forms
- family portal routes
- document upload/download UI paths without exposing storage paths or signed URLs
- certificate preview/view routes
- dashboard charts, tables, forms, and selected-parish switching

## Required Non-Production Smoke Gates

Run the following against an explicitly approved non-production target only:

1. `/api/health` returns `checks.schema: true`.
2. Staff sign-in succeeds.
3. Dashboard loads and selected-parish switching works.
4. Requests, People, Households, Records, Settings, Audit Log, and Daily Work Hub load without console-blocked resources.
5. Public intake forms render and submit only in approved non-production fixtures.
6. Family portal safe fixture loads without leaking token material.
7. Google OAuth reconnect callback can complete in the safe non-production client.
8. Document UI paths render without storage path, original filename, signed URL value, or private content exposure.
9. Certificate view path renders without automatic generation or canonical/sacramental decisioning.
10. Browser console and report-only collector show no blocking failures that would break core staff or public workflows if enforced.

## Forbidden Payloads

CSP violation reports, logs, and QA evidence must not include:

- secrets or API keys
- auth tokens, family portal tokens, or signed URL values
- raw storage paths
- private document contents
- raw export data or raw export metadata
- full request bodies
- raw prompts, AI outputs, or model payloads
- sacramental/canonical private notes
- production parishioner data

## Source-Level Preflight

Future report-only CSP runtime code must satisfy the source-level preflight before merge:

- `lib/server/productionCspReportOnlyRuntimePreflight.ts`
- `lib/server/productionCspReportOnlyRuntimePreflight.test.ts`
- `lib/server/productionCspReportOnlyEvidencePackageConsistency.ts`
- `docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md`

The source preflight is not runtime enforcement. It is a merge-time guard that requires disabled-by-default gates, non-production scope checks, report-only header usage, approved provider allowlists, forbidden payload redaction, smoke evidence labels, rollback/no-op behavior, and customer/public-trust boundaries before any CSP report-only send or collection.

The smoke evidence labels must cover the same major workflows listed in this packet before any report-only send or collection:

- `healthSchemaTrue`
- `staffSignInVerified`
- `selectedParishSwitchingVerified`
- `publicIntakeSmokeVerified`
- `familyPortalSmokeVerified`
- `googleOauthCallbackSmokeVerified`
- `documentUiSmokeVerified`
- `certificateViewSmokeVerified`

The evidence package consistency checker is also repository-only. It verifies that this approval packet, the security headers baseline, the source preflight, and supporting tests still preserve report-only scope, owner approval requirements, smoke gates, rollback behavior, forbidden-payload boundaries, enforcing CSP `NO-GO`, and public trust-claim `NO-GO` before any runtime implementation approval request.

The preflight must reject future source that adds an enforcing `Content-Security-Policy` header, stores or sends secrets, token material, signed URL values, storage paths, private document contents, raw exports, raw metadata, AI prompts/outputs, full request bodies, customer communication, or public trust claims.

## Rollback Plan

Report-only CSP rollback must be a no-op style change:

- remove the `Content-Security-Policy-Report-Only` header from the runtime implementation
- redeploy the non-production target
- verify `/api/health` and staff sign-in
- confirm no CSP report traffic continues from the rollback target

No database rollback, migration rollback, storage cleanup, export cleanup, AI cleanup, Google Calendar cleanup, or record mutation is allowed for this CSP slice.

## Enforcing CSP Boundary

An enforcing `Content-Security-Policy` header remains `NO-GO` until:

- report-only evidence is reviewed
- false positives are resolved
- provider allowlists are approved
- manual browser QA passes for staff, public, family, and provider callback paths
- rollback evidence exists
- product, security/data, engineering, QA, and support owners sign off

## Exact Future Approval Language

Use this exact language before implementing report-only CSP runtime code:

```text
Approve non-production CSP report-only runtime implementation for Vinea. Implement only Content-Security-Policy-Report-Only behind a non-production-only approval boundary, using the approved provider allowlist and redaction rules from docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md. Do not add an enforcing Content-Security-Policy header, enable production CSP, access production, apply migrations, change operational RLS, mutate records, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims. Run the documented non-production smoke gates, capture evidence, and keep enforcing CSP NO-GO.
```

## Production Boundary

This packet does not grant approval for:

- production CSP
- enforcing CSP
- production monitoring
- production exports
- production RLS rollout
- public intake production routing
- AI production rollout
- backup/restore public claims
- public trust-center publication
