import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const worksheetPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md'
)
const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md'
)
const readinessRecordPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md'
)

describe('membership-aware RLS production smoke fixture worksheet', () => {
  it('is explicitly non-executing and keeps production RLS blocked', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Status: Fixture worksheet prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'This worksheet does not approve production execution.',
      'Current decision: `FIXTURES_INCOMPLETE_DO_NOT_APPLY_PRODUCTION_RLS`',
      'Current recommendation: `Do not apply production RLS',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('links the related production readiness documents', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('captures all required fixture sections and safety approvals', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '## Fixture Approval Summary',
      '## Staff Account Fixture',
      '## Active Parish Fixture',
      '## Same-Parish Request Fixture',
      '## Cross-Parish Denied Request Fixture',
      '## Workflow Step Fixture',
      '## Test Document Content',
      '## Family Portal Token Plan',
      '## Cleanup Plan',
      '## Evidence Redaction Rules',
      'Worksheet owner',
      'Security/data owner approval of fixture safety',
      'QA owner approval of fixture usability',
      'Product owner approval',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('forbids sensitive data, secrets, and confusing production fixtures', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'A real funeral request.',
      'A sensitive pastoral situation.',
      'A canonical case.',
      'A private family situation.',
      'Real parishioner private documents.',
      'Passwords.',
      'Service role keys.',
      'Database URLs.',
      'Session cookies.',
      'Raw family portal tokens.',
      'Signed document URLs.',
      'Token hashes.',
      'Private document contents.',
      'Internal note bodies.',
      'AI notes.',
      'Audit payloads that reveal private data.',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('requires exact smoke fixture fields for staff, parish, request, denied request, and workflow step', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Staff account email or safe identifier',
      'Staff user belongs to active parish through membership',
      'Staff user has least privilege needed for smoke',
      'Staff user is not a shared password account',
      'Active parish name',
      'Parish membership confirmed for staff user',
      '`vinea_active_parish_id` cookie expected during smoke',
      'Request belongs to active parish',
      'Request does not involve funeral, pastoral, canonical, or private family details',
      'Denied request belongs to a different parish',
      'Smoke staff user must not be authorized for denied request parish',
      'Expected request detail result',
      'Expected document route result',
      'Object existence leak check planned',
      'Workflow step id or safe label',
      'Step owner type is family-facing or document-safe',
      'Step status restoration plan',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('defines synthetic document content, portal token handling, cleanup, and redaction requirements', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Vinea production RLS smoke test staff document.',
      'Vinea production RLS smoke test family upload.',
      'vinea-production-rls-staff-smoke.txt',
      'vinea-production-rls-family-smoke.txt',
      'Token generated only for production-safe same-parish request',
      'Raw token will not be stored in docs, chat, screenshots, or logs',
      'Token response checked for no `token_hash` exposure',
      'Family portal opened in clean session',
      'Token revocation or expiration plan',
      'Family portal token',
      'Revoke or confirm expiration',
      'Evidence screenshots/logs',
      'Redact before storage',
      'Family portal raw tokens.',
      'Signed URLs.',
      'Session cookies.',
      'Audit event names and timestamps without private payloads.',
      'Confirmation that direct storage access was denied.',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('is linked from the production smoke checklist and final readiness record', () => {
    const checklist = readFileSync(checklistPath, 'utf8')
    const readinessRecord = readFileSync(readinessRecordPath, 'utf8')

    for (const doc of [checklist, readinessRecord]) {
      expect(doc).toContain(
        'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md'
      )
    }

    expect(checklist).toContain('The production smoke fixture worksheet is completed.')
    expect(readinessRecord).toContain('Production-safe smoke fixture worksheet is completed.')
    expect(readinessRecord).toContain('Smoke fixture worksheet status is `COMPLETE`.')
  })
})
