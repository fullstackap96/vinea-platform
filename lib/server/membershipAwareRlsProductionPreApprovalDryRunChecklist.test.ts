import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_PRE_APPROVAL_DRY_RUN_CHECKLIST_20260629.md'
)

describe('membership-aware RLS production pre-approval dry-run checklist', () => {
  it('is explicitly a dry run and keeps production untouched', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Pre-approval dry-run checklist prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This checklist walks through `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md` step by step.',
      'Current decision: `PRE_APPROVAL_DRY_RUN_CHECKLIST_READY_PRODUCTION_NOT_APPROVED`',
      'Production RLS remains `NO-GO`',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('forbids production access, mutations, migrations, Google Calendar changes, and secrets', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Do not use this dry run to access production',
      'apply migrations',
      'change runtime behavior',
      'change operational RLS',
      'touch Google Calendar data',
      'mutate records',
      'expose secrets',
      'Do not open the production app.',
      'Do not open Supabase production.',
      'Do not run SQL.',
      'Do not create, edit, upload, approve, reject, delete, or deactivate any records.',
      'Do not submit Google Calendar OAuth, create events, update events, or delete events.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('walks through every required production evidence package document and SQL reference', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

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
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires dry-run statuses, outcomes, and approval phrase boundaries', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '`PASS`, `FAIL`, or `BLOCKED`',
      'PACKAGE_READY_FOR_HUMAN_APPROVAL_REQUEST',
      'NO_GO_MISSING_DOCUMENT',
      'NO_GO_MISSING_OWNER_OR_SIGNOFF',
      'NO_GO_MISSING_FIXTURE_MAPPING',
      'NO_GO_MISSING_ROLLBACK_OR_MONITORING',
      'NO_GO_SCOPE_DRIFT',
      'NO_GO_SECRET_OR_PRIVATE_DATA_PRESENT',
      'NO_GO_PRODUCTION_APPROVAL_ALREADY_ASSUMED',
      'Current dry-run outcome: `PENDING_NOT_RUN`',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
      'If yes, dry-run outcome may be `PACKAGE_READY_FOR_HUMAN_APPROVAL_REQUEST`; otherwise `NO_GO`',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('documents hard stops for missing evidence, scope drift, secrets, and assumed approval', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Any document says production RLS is already approved without the exact approval phrase.',
      'Any required evidence document is missing.',
      'Any owner/sign-off role is missing.',
      'Any fixture label cannot be mapped to evidence.',
      'Any rollback, support, or monitoring owner/channel is missing.',
      'Any production target includes a database URL, password, service-role key, session cookie, signed URL, raw token, or private parish data.',
      'The packet includes runtime public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, or unrelated data cleanup.',
      'The dry run requires opening production systems, applying migrations, changing runtime behavior, changing operational RLS, touching Google Calendar data, mutating records, or exposing secrets.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('does not include real secrets, raw tokens, signed URLs, or known QA fixture ids', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

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
      expect(checklist).not.toContain(forbidden)
    }
  })
})
