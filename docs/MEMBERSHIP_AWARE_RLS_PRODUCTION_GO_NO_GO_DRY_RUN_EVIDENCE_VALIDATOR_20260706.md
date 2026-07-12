# Membership-Aware RLS Production Go/No-Go Dry-Run Evidence Validator

Date: 2026-07-06

Status: Prepared as a repository-only validation helper. This does not access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, enable production flags, or make public trust claims.

## Purpose

Use `lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts` after the repository-only production approval dry run has passed and before requesting the final human production approval.

The validator checks a filled, sanitized go/no-go evidence record for:

- a passing repository-only dry-run summary;
- no recorded final approval phrase before the separate product-owner approval step;
- matching owner, fixture, and evidence counts;
- confirmed production NO-GO boundaries;
- non-empty final approval placeholders;
- no raw owner/fixture label bags;
- no database URLs, passwords, service-role or anon key material, bearer tokens, OpenAI-style API keys, token hashes, signed URL markers, email addresses, or raw UUIDs in evidence fields.

## Required Input Shape

The evidence record must include:

- `evidenceLabel`;
- `dryRunJson` from `runMembershipAwareRlsProductionApprovalDryRun`;
- `ownerStatusSummary`;
- `fixtureStatusSummary`;
- `evidenceStatusSummary`;
- `noGoBoundariesConfirmed`;
- `finalApprovalPlaceholders`.

The evidence record must not include raw source packet fields such as:

- `ownerLabels`;
- `fixtureLabels`;
- `productionTargetLabels`;
- `explicitProductionApprovalPhrase`;
- raw database URLs;
- raw tokens;
- signed URLs;
- private documents;
- raw production ids.

## Expected Passing Decision

A valid pre-approval evidence record returns:

- `decision: READY_TO_REQUEST_FINAL_APPROVAL`;
- `readyToRequestFinalApproval: true`;
- `readyForProductionRollout: false`.

Production rollout must remain blocked until the product owner separately provides the exact approval phrase in the final approval prompt.

See `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md` for a repository-only sanitized example built from the current filled label-only packet.

## Hold Conditions

The validator returns `decision: HOLD` when:

- the dry run is not `READY_TO_REQUEST_APPROVAL`;
- the dry run did not pass;
- the dry run says final approval is already recorded;
- any owner, fixture, or evidence count mismatches the dry run;
- any required owner, fixture, evidence, or no-go boundary is incomplete;
- final approval placeholders are blank;
- the approval phrase itself is pasted into the evidence template;
- raw labels, raw ids, secrets, tokens, database URLs, signed URL markers, or email addresses are present.

## Production Boundary

This validator is a pre-approval safety check only. It does not make production RLS approved, does not make rollout ready, and does not replace the final human approval, production-safe smoke data, rollout evidence template, or rollback plan.
