import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_PRE_APPROVAL_DRY_RUN_EVIDENCE_20260629.md'
)

describe('membership-aware RLS production pre-approval dry-run evidence', () => {
  it('records a repository-only dry run and keeps production untouched', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Production pre-approval dry run executed against repository documents only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This evidence does not approve production work.',
      'It does not run SQL.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the correct non-approval outcome', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Dry-run outcome: `PACKAGE_READY_FOR_HUMAN_APPROVAL_REQUEST`',
      'Production RLS status: `NO_GO_PENDING_EXPLICIT_PRODUCT_OWNER_APPROVAL`',
      'It does not mean production RLS is approved, scheduled, migrated, or verified.',
      'Production RLS remains blocked until a future approval prompt explicitly includes:',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('passes all twenty dry-run checklist steps with source document references', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    const passRows = evidence.match(/\| \d+ \| `[^`]+` \| `PASS` \|/g) ?? []
    expect(passRows).toHaveLength(20)

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
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
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_PRE_APPROVAL_DRY_RUN_CHECKLIST_20260629.md',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('references only repository artifacts that exist', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const referencedPaths = [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_PRE_APPROVAL_DRY_RUN_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
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
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    ]

    for (const relativePath of referencedPaths) {
      expect(evidence).toContain(relativePath)
      expect(existsSync(join(process.cwd(), relativePath))).toBe(true)
    }
  })

  it('documents hard-stop clearance without bypassing future approval', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'No hard stop was hit during the repository-only dry run.',
      'No document was treated as production approval.',
      'No required evidence document was missing from the package.',
      'No owner/sign-off role category was absent from the package.',
      'No fixture label category was left unmapped to future evidence.',
      'Rollback, support, and monitoring documentation exist in the package.',
      'No production target secret or private value was recorded.',
      'No unrelated scope was added to the production RLS approval package.',
      'No production system, SQL command, runtime route, calendar account, or database record was used.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include real secrets, raw tokens, signed URLs, or known QA fixture ids', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

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
      expect(evidence).not.toContain(forbidden)
    }
  })
})
