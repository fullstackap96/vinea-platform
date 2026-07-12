import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md'
)

describe('membership-aware RLS production smoke-test data checklist', () => {
  it('is explicitly a preparation checklist and does not touch production', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Checklist prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'Current outcome: `Checklist prepared; production-safe smoke-test data still pending`',
      'Current recommendation: `Do not apply production RLS`',
      'Production smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires exact safe staff, parish, request, workflow, document, and portal inputs', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Required Production-Safe Staff Account',
      'Staff account email',
      'Account can sign in before rollout',
      '## Required Active Parish',
      'Parish switcher or active parish selection path verified',
      '`vinea_active_parish_id` cookie can be present during smoke',
      '## Required Production-Safe Request',
      'Request can tolerate a temporary test document',
      '## Required Workflow Step',
      'Step can accept a temporary test upload',
      'vinea-production-rls-staff-smoke.txt',
      'vinea-production-rls-family-smoke.txt',
      '## Family Portal Token Plan',
      'Raw token is not pasted into repo docs or long-lived chat.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('forbids unsafe production data and unrelated rollout work', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Do not use real parishioner private documents.',
      'Do not use a request involving a sensitive pastoral, funeral, canonical, or private family situation.',
      'Do not create a family portal token for a real family unless the family has explicitly agreed to testing.',
      'Do not store passwords, service role keys, database URLs, or raw portal tokens in this checklist.',
      'Do not bundle runtime public intake routing or unrelated deployment work into this production RLS smoke.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires monitoring, cleanup, evidence, and final approval dependencies', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Monitoring owner',
      'Monitoring channel/tool',
      'Request/document `403` or `404` observation path',
      'Supabase RLS/policy error observation path',
      'Staff test document cleanup plan',
      'Family test document cleanup plan',
      'Portal token deactivation/expiration plan',
      'Active parish cookie present during request detail/document smoke.',
      'Direct storage access denied.',
      'Family portal page does not expose internal notes, AI notes, audit logs, token hashes, or private parish data.',
      'The production smoke fixture worksheet is completed.',
      'Product owner gives a separate explicit approval to apply production RLS.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })
})
