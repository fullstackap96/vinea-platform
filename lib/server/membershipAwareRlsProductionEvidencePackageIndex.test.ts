import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const indexPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md'
)

describe('membership-aware RLS production evidence package index', () => {
  it('is explicitly an index only and keeps production untouched', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const expected of [
      'Status: Evidence package index prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This index does not approve production work.',
      'Current decision: `EVIDENCE_PACKAGE_INDEX_READY_PRODUCTION_NOT_APPROVED`',
      'Production RLS remains `NO-GO`',
    ]) {
      expect(index).toContain(expected)
    }
  })

  it('links all required approval, readiness, fixture, smoke, rollout, rollback, support, and sign-off docs', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_GUIDED_WORKSHEET_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
      'lib/membershipAwareRlsProductionApprovalInput.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
      'lib/membershipAwareRlsProductionApprovalDryRun.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
      'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
      'lib/membershipAwareRlsProductionApprovalReadiness.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
      'lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
    ]) {
      expect(index).toContain(expected)
    }
  })

  it('links forward, rollback, and historical SQL references with safe production-use status', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const expected of [
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
      'docs/sql/membership_aware_operational_rls_draft.sql',
      'Do not run until explicitly approved',
      'Do not run unless approved rollout requires rollback',
      'Reference only',
    ]) {
      expect(index).toContain(expected)
    }
  })

  it('requires the review order and production approval gates', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const expected of [
      'Read the readiness and blocker records.',
      'Confirm human owners and safe fixture labels are complete.',
      'Confirm the smoke fixture verification checklist and rollout evidence crosswalk are ready.',
      'Confirm rollback, support, and monitoring instructions are ready.',
      'Confirm named sign-offs are complete.',
      'Confirm the final go/no-go checklist is `GO`.',
      'Build the source-level production approval readiness input from label-only current evidence.',
      'Run the repository-only source-level approval dry run and confirm it returns sanitized pass/fail JSON with `READY_TO_REQUEST_APPROVAL`.',
      'Fill the go/no-go dry-run evidence template with the sanitized dry-run summary and human approval placeholders.',
      'Run the go/no-go dry-run evidence validator and confirm it returns `READY_TO_REQUEST_FINAL_APPROVAL`.',
      'Run the evidence package consistency checker and confirm it returns `READY_FOR_FINAL_HUMAN_REVIEW`.',
      'Prepare the final approval prompt.',
      'Only after separate explicit approval, use the rollout evidence template during the approved rollout window.',
      'Production target labels are safe',
      'Human intake is complete',
      'Fixture evidence map is complete',
      'Rollout evidence crosswalk is complete',
      'Smoke-test data is production-safe',
      'Named sign-offs are complete',
      'Rollback is rehearsable',
      'Monitoring is ready',
      'Support posture is ready',
      'Source readiness input builder passes',
      'buildMembershipAwareRlsProductionApprovalInput(...)',
      'Repository dry run passes',
      'runMembershipAwareRlsProductionApprovalDryRun(...)',
      'READY_TO_REQUEST_APPROVAL',
      'Go/no-go dry-run evidence template is filled',
      'Sanitized dry-run summary, owner/fixture/evidence status, NO-GO boundaries, approval phrase boundary, and human approval placeholders are recorded without secrets',
      'Go/no-go dry-run evidence validator passes',
      'validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(...)',
      'READY_TO_REQUEST_FINAL_APPROVAL',
      'Source readiness gate passes',
      'buildMembershipAwareRlsProductionApprovalReadiness(...)',
      'Evidence package consistency checker passes',
      'checkMembershipAwareRlsProductionEvidencePackageConsistency(...)',
      'READY_FOR_FINAL_HUMAN_REVIEW',
      'Explicit approval phrase is present',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    ]) {
      expect(index).toContain(expected)
    }
  })

  it('documents excluded scopes, monitoring requirements, and hard stops', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const expected of [
      'Runtime public intake routing enablement.',
      'Public intake production runtime flags.',
      'AI production flag enablement.',
      'Google Calendar data mutation.',
      'Staff membership cleanup.',
      'Operational table schema redesign.',
      'Production data cleanup.',
      'Any unrelated deployment or feature rollout.',
      'Pre-apply `/api/health`.',
      'Forward migration sanitized output.',
      'Post-apply `/api/health`.',
      'Policy-shape verification.',
      'Active-parish-cookie request detail smoke.',
      'Request document route smoke.',
      'Direct storage privacy denial.',
      'Family portal safety smoke.',
      '30-minute monitoring observations.',
      'Rollback decision.',
      'The final go/no-go checklist is not `GO`.',
      'Any required owner or sign-off is missing.',
      'Rollback owner, rollback deadline, rollback SQL, or post-rollback checks are missing.',
    ]) {
      expect(index).toContain(expected)
    }
  })

  it('does not include real secrets, raw tokens, signed URLs, or known QA fixture ids', () => {
    const index = readFileSync(indexPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'X-Amz-Signature',
      'token=',
      'token_hash:',
      'signedUrl',
      'calendarId=',
      'eventId=',
      'service_role:',
      'Bearer ',
      'sk-',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(index).not.toContain(forbidden)
    }
  })
})
