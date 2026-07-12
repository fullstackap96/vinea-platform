# Production CSP Report-Only Evidence Package Consistency Checker

Current decision state: `CSP REPORT-ONLY EVIDENCE PACKAGE CHECKER PREPARED; RUNTIME CSP REMAINS NO-GO`

Date prepared: 2026-07-07

## Purpose

This repository-only checker verifies that the CSP report-only approval path stays complete and conservative before any future runtime implementation request.

It checks the CSP approval packet, production security headers baseline, source preflight, and supporting tests for:

- report-only-only scope
- disabled-by-default and non-production boundaries
- owner approval requirements
- provider allowlist review
- forbidden payload redaction
- non-production smoke expectations
- required smoke evidence labels for health, staff sign-in, selected-parish switching, public intake, family portal, Google OAuth callback, document UI, and certificate view coverage
- rollback/no-op behavior
- explicit enforcing CSP `NO-GO`
- explicit public trust-claim `NO-GO`

## Source Helper

- `lib/server/productionCspReportOnlyEvidencePackageConsistency.ts`
- `lib/server/productionCspReportOnlyEvidencePackageConsistency.test.ts`

The helper returns `READY_FOR_RUNTIME_APPROVAL_REVIEW` only when required CSP artifacts exist, required boundary text remains present, and no secret-like values appear in the package.

The source preflight portion must require these future smoke evidence labels before any report-only collection:

- `healthSchemaTrue`
- `staffSignInVerified`
- `selectedParishSwitchingVerified`
- `publicIntakeSmokeVerified`
- `familyPortalSmokeVerified`
- `googleOauthCallbackSmokeVerified`
- `documentUiSmokeVerified`
- `certificateViewSmokeVerified`

The helper always keeps:

- `reportOnlyRuntimeApproved: false`
- `productionCspApproved: false`
- `enforcingCspApproved: false`
- `publicTrustClaimsApproved: false`

## Checked Artifacts

- `docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md`
- `docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md`
- `lib/server/productionCspReportOnlyRuntimePreflight.ts`
- `lib/server/productionCspReportOnlyRuntimePreflight.test.ts`
- `lib/server/productionCspReportOnlyApprovalPacket.test.ts`
- `lib/server/nextSecurityHeadersConfig.test.ts`
- `lib/server/productionCspReportOnlyEvidencePackageConsistency.ts`

## Production Boundary

This checker does not enable CSP, does not implement report collection, does not add production flags, does not access production, does not apply migrations, does not change operational RLS, does not mutate records, does not touch Google Calendar data, does not run exports, does not call AI, does not access storage, does not create signed URLs, does not send communications, does not generate certificates, and does not make public trust-center claims.

Passing this checker does not approve:

- report-only CSP runtime
- production CSP
- enforcing CSP
- public trust-center publication
- production monitoring
- production exports
- production RLS rollout
- public intake production routing
- AI production rollout

## Next Safe Action

Use this checker as repository evidence before asking for the separate product-owner approval to implement non-production report-only CSP runtime scaffolding.
