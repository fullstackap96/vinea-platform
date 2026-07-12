# Production Release Readiness Local Evidence Validator

Date: 2026-07-06

Status: Prepared as a repository-only validation helper. This does not deploy, enable production flags, add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust-center claims.

For avoidance of doubt: this validator does not access production, does not apply migrations, and does not make public trust-center claims.

## Purpose

Use `lib/releaseReadinessLocalEvidence.ts` after the local release-readiness checklist has passed and after `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md` or a copy of it has been filled with label-only evidence.

For a sanitized passing shape reference, use `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md`. The example is not real evidence, not production approval, and not a public trust-center artifact.

The validator checks a filled local release evidence record for:

- all twelve local release-readiness commands in the documented order;
- command statuses recorded as `PASS`;
- accepted sanitized output decisions for `check:release-env`, `check:rls-production-evidence`, `check:production-monitoring-evidence`, `check:production-gates`, `check:csp-report-only`, `check:trust-center-claims`, and `check:release-handoff`;
- current production gate and release handoff counts, including production-gates artifact count `14`, linked artifact count `14`, existing artifact count `14`, release-handoff artifact count `28`, locked gate count `14`, and human review boundary count `17`;
- explicit confirmation that QA/prototype `_ACK` and `_ENV` residue was not configured for the accepted release environment guard;
- no production-sensitive feature approval or public trust claim approval;
- local-repository-only environment identity;
- safety-boundary confirmations for no deployment, no production flag enablement, no added production flags, no production access, no migrations, no operational RLS change, no record mutation, no Google Calendar data touch, no exports, no AI calls, no storage access, no signed URLs, no communications, no certificate generation, and no public trust-center claims;
- manual follow-up still marked required for product-owner approval, security/data owner approval, production-safe smoke fixtures, rollback owner, monitoring owner, and public trust-center approval;
- no raw command output containers;
- no database URLs, passwords, service-role or anon key material, bearer tokens, JWTs, OpenAI-style API keys, token material, signed URL markers, raw UUIDs, raw export contents, raw audit metadata, raw provider payloads, staff passwords, or private document contents.

## Required Input Shape

The evidence record must include:

- `evidenceLabel`;
- `capturedByLabel`;
- `capturedAtLabel`;
- `repositoryBranchLabel`;
- `commitLabel`;
- `worktreeStatusLabel`;
- `reviewPurposeLabel`;
- `relatedApprovalPacketLabel`;
- `productionSensitiveFeatureUnderReviewLabel`;
- `environmentIdentity`;
- `commandResults`;
- `sanitizedOutputs`;
- `safetyBoundaryConfirmation`;
- `manualFollowUpConfirmed`;
- `finalLocalEvidenceDecision`.

The evidence record must not include raw source fields such as:

- `rawOutput`;
- `rawCommandOutput`;
- `stdout`;
- `stderr`;
- `databaseUrl`;
- `dbUrl`;
- `password`;
- `serviceRoleKey`;
- `anonKey`;
- `apiKey`;
- `bearerToken`;
- `jwt`;
- `oauthToken`;
- `refreshToken`;
- `familyPortalToken`;
- `signedUrl`;
- `storagePath`;
- `originalFilename`;
- `privateDocumentContents`;
- `rawExportContents`;
- `rawAuditMetadata`;
- `rawProviderPayload`;
- `rawProductionRecordId`;
- `staffPassword`.

## Expected Passing Decision

A valid local release-readiness evidence record returns:

- `decision: READY_FOR_HUMAN_RELEASE_REVIEW`;
- `readyForHumanReleaseReview: true`;
- `productionApprovalGranted: false`.

The sanitized output block must also keep the trust-center public claims check at:

- `releaseEnvironmentGuard.decision: RELEASE_READINESS_ENVIRONMENT_ACCEPTED`;
- `releaseEnvironmentGuard.productionSensitiveRuntimeFlagsEnabled: false`;
- `releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured: false`;
- optional `releaseEnvCleanupGuide.decision: NOT_RUN`, `RELEASE_ENV_ALREADY_CLEAN`, or `RELEASE_ENV_CLEANUP_GUIDE_READY`;
- optional `releaseEnvCleanupGuide.mutatesEnvironment: false`;
- optional `releaseEnvCleanupGuide.secretValuesPrinted: false`;
- optional `releaseEnvCleanupGuide.variablesReportedByNameOnly: true`;
- optional `releaseEnvCleanupGuide.rawValuesCaptured: false`;
- optional `releaseEnvCleanupGuide.cleanupPerformed: none`, `process_scope`, `user_scope`, or `process_and_user_scope`;
- `rlsProductionEvidenceCheck.decision: RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW`;
- `rlsProductionEvidenceCheck.readyForProductionRollout: false`;
- `rlsProductionEvidenceCheck.productionRlsApproved: false`;
- `rlsProductionEvidenceCheck.appliesMigrations: false`;
- `rlsProductionEvidenceCheck.changesOperationalRls: false`;
- `productionMonitoringEvidenceCheck.decision: PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW`;
- `productionMonitoringEvidenceCheck.productionMonitoringEnabled: false`;
- `productionMonitoringEvidenceCheck.productionSmokeApproved: false`;
- `productionMonitoringEvidenceCheck.publicTrustClaimsApproved: false`;
- `productionMonitoringEvidenceCheck.externalMonitoringSendEnabled: false`;
- `productionMonitoringEvidenceCheck.runtimeMonitoringImplemented: false`;
- `productionGateBoundaryCheck.decision: BOUNDARIES_READY_FOR_REVIEW`;
- `productionGateBoundaryCheck.artifactCount: 14`;
- `productionGateBoundaryCheck.linkedArtifactCount: 14`;
- `productionGateBoundaryCheck.existingArtifactCount: 14`;
- `productionGateBoundaryCheck.productionSensitiveFeaturesApproved: false`;
- `productionGateBoundaryCheck.publicTrustClaimsApproved: false`;
- `cspReportOnlyEvidenceCheck.decision: CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW`;
- `cspReportOnlyEvidenceCheck.reportOnlyRuntimeApproved: false`;
- `cspReportOnlyEvidenceCheck.productionCspApproved: false`;
- `cspReportOnlyEvidenceCheck.enforcingCspApproved: false`;
- `cspReportOnlyEvidenceCheck.publicTrustClaimsApproved: false`;

- `trustCenterPublicClaimsCheck.decision: PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW`;
- `trustCenterPublicClaimsCheck.publicTrustCenterPublishingApproved: false`;
- `trustCenterPublicClaimsCheck.publicClaimsApproved: false`;
- `releaseHandoffConsistencyCheck.decision: RELEASE_HANDOFF_READY_FOR_REVIEW`;
- `releaseHandoffConsistencyCheck.artifactCount: 28`;
- `releaseHandoffConsistencyCheck.lockedGateCount: 14`;
- `releaseHandoffConsistencyCheck.humanReviewBoundaryCount: 17`;
- `releaseHandoffConsistencyCheck.productionSensitiveFeaturesApproved: false`;
- `releaseHandoffConsistencyCheck.publicTrustClaimsApproved: false`.

Production-sensitive actions must remain blocked until their separate approval packets, smoke evidence, rollback plans, monitoring/support owners where relevant, and exact product-owner approval language are complete.

## Hold Conditions

The validator returns `decision: HOLD` when:

- any required command is missing, out of order, failed, or not run;
- a sanitized guard decision is missing or not accepted;
- QA/prototype `_ACK` or `_ENV` residue is configured in the release environment guard evidence;
- optional release environment cleanup guide evidence claims mutation, prints secrets, captures raw values, reports values instead of variable names, or uses an unsupported cleanup decision/scope;
- production-sensitive features or public trust claims appear approved;
- raw values or raw command output were captured;
- the evidence claims production approval;
- local-repository-only safety boundaries are not confirmed;
- manual follow-up approvals are not still marked required;
- raw output, raw IDs, secrets, tokens, database URLs, signed URL markers, or private evidence content are present.

## Production Boundary

This validator is an engineering evidence-quality check only. It does not make Vinea production-ready, does not deploy code, does not grant production approval, and does not replace manual QA, named owner sign-off, production-safe smoke fixtures, rollback plans, monitoring plans, or product-owner approval.
