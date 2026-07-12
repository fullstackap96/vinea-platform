import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md'
)

describe('membership-aware RLS production smoke fixture verification checklist', () => {
  it('is explicitly planning-only and keeps production untouched', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Fixture verification checklist prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This checklist does not approve production work.',
      'Current decision: `CHECKLIST_READY_FOR_FUTURE_APPROVED_ROLLOUT`',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('links the filled intake, validation, approval, smoke, and evidence docs', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('maps every safe fixture label from the filled intake checklist to required evidence', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '`Production RLS Smoke Staff Account - no password recorded`',
      'Staff sign-in result, dashboard load result, membership in active parish confirmed by safe label',
      '`Production RLS Smoke Parish A`',
      'Active parish selector or active parish context evidence',
      '`REDACTED` active parish id',
      '`Production RLS Denial Parish B`',
      'Cross-parish denial setup note and expected denied parish label',
      '`Production RLS Smoke Request A - non-sensitive`',
      'Request detail HTTP result, request list visibility result',
      '`Production RLS Denied Request B - generic denial expected`',
      'Request detail denial result, document route denial result, search/report absence result',
      '`Production RLS Smoke Workflow Step - document safe`',
      'Workflow step appears on same-parish request',
      '`Vinea production RLS smoke test staff document - synthetic file only`',
      'Staff upload result, document list result, signed URL route result',
      '`Vinea production RLS smoke test family document - synthetic file only`',
      'Family upload result, staff document visibility result',
      '`Create during smoke window; do not record raw token; deactivate immediately after smoke`',
      'Portal token creation result, no `token_hash` exposure result',
      '`Delete synthetic docs, deactivate token, restore request status if changed`',
      'Cleanup checklist completion note, cleanup owner, timestamp',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires route, storage, family portal, audit, and monitoring evidence', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '| `/api/health` before apply |',
      '| `/api/health` after apply |',
      '| Request detail |',
      '| Request documents |',
      '| Direct storage privacy |',
      '| Family portal |',
      '| Family portal exclusions |',
      '| Search/report visibility |',
      '| Audit evidence |',
      '| Monitoring |',
      'HTTP `200`, `ok: true`, `checks.schema: true`, `checks.supabase: true`',
      'Same-parish loads; cross-parish is generic denied/not-found',
      'Direct storage access is denied',
      'All absent',
      'No unexplained spike or privacy/access issue',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('defines cleanup, completion, redaction, and hard-stop requirements', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Redaction Rules For Evidence',
      'Raw production ids unless the security/data owner explicitly approves safe recording.',
      'Family portal raw tokens.',
      'Token hashes.',
      'Signed URLs.',
      'Session cookies.',
      'Database URLs.',
      'Service-role keys.',
      'Private document contents.',
      'Internal notes.',
      'AI notes or raw AI outputs.',
      'Google Calendar ids or event ids.',
      '## Completion Table For Future Rollout',
      'Staff account fixture verified',
      'Family portal token lifecycle verified',
      'Cleanup and redaction verified',
      '## Hard Stops',
      'The staff account cannot sign in.',
      'Family portal exposes internal notes, staff-only notes, AI notes, audit logs, token hashes, signed URLs, or private parish data.',
      'Cleanup cannot be completed or intentionally deferred with named owner approval.',
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
