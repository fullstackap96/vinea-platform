# Production Release Readiness Local Evidence Template

Current decision state: `LOCAL RELEASE READINESS EVIDENCE TEMPLATE PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date prepared: 2026-07-06

Related checklist: `docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md`

Related validator: `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md`

## Purpose

Use this template to capture a non-secret record of the local release-readiness checklist before requesting review for production-sensitive work.

This template is evidence hygiene only. It is not a release approval, deployment record, production smoke record, production RLS approval, production export approval, production monitoring approval, public trust-center approval, or customer-facing claim.

After filling this template, validate the filled label-only record with `validateReleaseReadinessLocalEvidence(...)` from `lib/releaseReadinessLocalEvidence.ts`. The validator must return `READY_FOR_HUMAN_RELEASE_REVIEW` while `productionApprovalGranted` remains `false` before the evidence is used in a release-readiness handoff.

## Evidence Header

- Evidence file name:
- Evidence captured by:
- Evidence captured at:
- Repository branch label:
- Commit label or short SHA:
- Worktree status label:
- Review purpose:
- Related approval packet, if any:
- Production-sensitive feature under review, if any:

## Environment Identity

- Environment type: `LOCAL_REPOSITORY_ONLY`
- Production access used: `NO`
- Production flags enabled: `NO`
- Migrations applied: `NO`
- Operational RLS changed: `NO`
- Records mutated: `NO`
- External services called: `NO`
- Browser/manual QA included in this evidence: `NO`

## Command Results

Record pass/fail only. Do not paste secrets, raw environment values, database URLs, service-role keys, anon keys, tokens, signed URLs, storage paths, original filenames, private document contents, raw export contents, raw audit metadata, raw IDs, or raw provider payloads.

| Order | Command | Status | Sanitized notes |
|---:|---|---|---|
| 1 | `npm run check:release-env` |  |  |
| 2 | `npm run check:rls-production-evidence` |  |  |
| 3 | `npm run check:production-monitoring-evidence` |  |  |
| 4 | `npm run check:production-gates` |  |  |
| 5 | `npm run check:csp-report-only` |  |  |
| 6 | `npm run check:trust-center-claims` |  |  |
| 7 | `npm run check:release-handoff` |  |  |
| 8 | `npm run typecheck` |  |  |
| 9 | `npm run typecheck:all` |  |  |
| 10 | `npm run lint -- --quiet` |  |  |
| 11 | `npm test` |  |  |
| 12 | `npm run build` |  |  |

## Required Sanitized Outputs

### Release Environment Guard

- Decision label:
- Production-sensitive runtime flags enabled: `NO`
- QA/prototype ACK or ENV residue configured: `NO`
- If refused, variable names only:
- Raw values captured: `NO`

Expected accepted shape:

```json
{
  "schemaVersion": 1,
  "decision": "RELEASE_READINESS_ENVIRONMENT_ACCEPTED",
  "productionSensitiveRuntimeFlagsEnabled": false,
  "qaPrototypeRuntimeResidueConfigured": false,
  "rawValuesCaptured": false
}
```

### Optional Release Environment Cleanup Guide Evidence

Use this section only when `npm run check:release-env-cleanup-guide` was run before the accepted release environment guard. Record variable names and safe labels only. Do not paste environment values, approval values, tokens, keys, URLs, or command output.

- Cleanup guide decision label: `NOT_RUN` / `RELEASE_ENV_ALREADY_CLEAN` / `RELEASE_ENV_CLEANUP_GUIDE_READY`
- Cleanup scope performed: `none` / `process_scope` / `user_scope` / `process_and_user_scope`
- Cleanup guide mutated environment by itself: `NO`
- Secret values printed: `NO`
- Variables reported by name only: `YES`
- Raw values captured: `NO`

Expected safe shape:

```json
{
  "decision": "NOT_RUN",
  "mutatesEnvironment": false,
  "secretValuesPrinted": false,
  "variablesReportedByNameOnly": true,
  "rawValuesCaptured": false,
  "cleanupPerformed": "none"
}
```

### RLS Production Evidence Check

- Decision label:
- Ready for production rollout: `NO`
- Production RLS approved: `NO`
- Migrations applied: `NO`
- Operational RLS changed: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW",
  "readyForProductionRollout": false,
  "productionRlsApproved": false,
  "appliesMigrations": false,
  "changesOperationalRls": false
}
```

### Production Monitoring Evidence Check

- Decision label:
- Production monitoring enabled: `NO`
- Production smoke approved: `NO`
- Public trust claims approved: `NO`
- External monitoring send enabled: `NO`
- Runtime monitoring implemented: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW",
  "productionMonitoringEnabled": false,
  "productionSmokeApproved": false,
  "publicTrustClaimsApproved": false,
  "externalMonitoringSendEnabled": false,
  "runtimeMonitoringImplemented": false
}
```

### Production Gate Boundary Check

- Decision label:
- Artifact count: `14`
- Linked artifact count: `14`
- Existing artifact count: `14`
- Production-sensitive features approved: `NO`
- Public trust claims approved: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "BOUNDARIES_READY_FOR_REVIEW",
  "artifactCount": 14,
  "linkedArtifactCount": 14,
  "existingArtifactCount": 14,
  "productionSensitiveFeaturesApproved": false,
  "publicTrustClaimsApproved": false
}
```

### CSP Report-Only Evidence Check

- Decision label:
- Report-only runtime approved: `NO`
- Production CSP approved: `NO`
- Enforcing CSP approved: `NO`
- Public trust claims approved: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW",
  "reportOnlyRuntimeApproved": false,
  "productionCspApproved": false,
  "enforcingCspApproved": false,
  "publicTrustClaimsApproved": false
}
```

### Trust Center Public Claims Boundary Check

- Decision label:
- Public trust-center publishing approved: `NO`
- Public claims approved: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW",
  "publicTrustCenterPublishingApproved": false,
  "publicClaimsApproved": false
}
```

### Release Handoff Consistency Check

- Decision label:
- Artifact count: `25`
- Locked gate count: `14`
- Human review boundary count: `17`
- Production-sensitive features approved: `NO`
- Public trust claims approved: `NO`
- Findings count:
- Raw labels or secrets captured: `NO`

Expected safe state:

```json
{
  "schemaVersion": 1,
  "decision": "RELEASE_HANDOFF_READY_FOR_REVIEW",
  "artifactCount": 25,
  "lockedGateCount": 14,
  "humanReviewBoundaryCount": 17,
  "productionSensitiveFeaturesApproved": false,
  "publicTrustClaimsApproved": false
}
```

## Forbidden Evidence Content

The completed evidence must not include:

- database URLs
- service-role keys
- anon keys
- API keys
- bearer tokens
- JWTs
- OAuth tokens or refresh tokens
- plaintext family portal tokens
- signed URL values
- storage paths
- original filenames
- private document contents
- raw export contents
- raw audit metadata
- raw provider payloads
- raw production record IDs
- staff passwords
- parishioner private contact details

## Safety Boundary Confirmation

Confirm each item before using this evidence in a release-readiness handoff:

- This evidence did not deploy code.
- This evidence did not enable production flags.
- This evidence did not add production flags.
- This evidence did not access production.
- This evidence did not apply migrations.
- This evidence did not change operational RLS.
- This evidence did not mutate records.
- This evidence did not touch Google Calendar data.
- This evidence did not run exports.
- This evidence did not call AI.
- This evidence did not access storage.
- This evidence did not create signed URLs.
- This evidence did not send communications.
- This evidence did not generate certificates.
- This evidence did not make public trust-center claims.

## Manual Follow-Up Still Required

Passing the local checklist does not replace:

- product-owner approval
- security/data owner approval
- production-safe smoke fixtures
- production rollout window approval
- rollback owner assignment
- monitoring owner assignment
- support owner assignment
- production-specific smoke evidence
- customer communication review
- public trust-center approval

## Final Local Evidence Decision

- Local checklist result: `PASS` / `FAIL`
- Ready to request human review: `YES` / `NO`
- Production approval granted by this evidence: `NO`
- Local evidence validator decision:
- Local evidence validator findings count:
- Remaining blockers:
- Next safe action:
