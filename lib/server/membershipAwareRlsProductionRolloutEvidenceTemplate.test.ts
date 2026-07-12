import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md'
)

describe('membership-aware RLS production rollout evidence template', () => {
  it('is explicitly a non-executing evidence template', () => {
    const template = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Template prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Current outcome: `Evidence template prepared; production rollout not executed`',
      'Current recommendation: `Do not apply production RLS until the checklist, sign-offs, and rollout approval are complete`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the required production readiness inputs and migration references', () => {
    const template = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'Do not paste database passwords, service role keys, session cookies, family portal raw tokens, or signed document URLs',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures the actual rollout window evidence fields', () => {
    const template = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '## Rollout Identity',
      'Git commit or release tag',
      'Final approval readiness decision is `GO`',
      '## Completed Smoke-Test Data Checklist',
      'Staff account selected',
      'Family portal token plan prepared',
      '## Named Sign-Offs',
      '| Product owner | `PENDING` |',
      '| Security/data owner | `PENDING` |',
      '## Automated Checks',
      'npm.cmd test -- --reporter=dot',
      '## Pre-Apply Health',
      '## Forward Migration Output',
      '## Post-Apply Health',
      '## Policy Shape Verification',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires active-cookie, document, family portal, monitoring, cleanup, rollback, and final outcome evidence', () => {
    const template = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '## Active-Parish-Cookie Request And Document Smoke',
      '`vinea_active_parish_id` present during smoke',
      'Direct Supabase Storage access is denied',
      'No unrelated parish request or document appears',
      '## Family Portal Safety Smoke',
      'Token creation response does not expose `token_hash`',
      'Internal notes absent',
      'AI notes absent',
      'Audit logs absent',
      'Private parish data absent',
      '## Monitoring Observations',
      'No broad Supabase RLS/policy error spike',
      'Monitoring completed for at least 30 minutes',
      '## Cleanup And Deactivation',
      'Family portal token deactivated or expiration confirmed',
      '## Rollback Decision',
      'Rollback immediately if:',
      '## Final Outcome',
      'Production rollout completed and monitored',
      'Production rollout rolled back',
    ]) {
      expect(template).toContain(expected)
    }
  })
})
