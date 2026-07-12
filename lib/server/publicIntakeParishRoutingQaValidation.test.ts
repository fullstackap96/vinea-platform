import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const qaPath = join(process.cwd(), 'docs', 'PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md')
const forwardPath = join(process.cwd(), 'docs', 'sql', 'public_intake_parish_routing_migration_candidate.sql')
const rollbackPath = join(process.cwd(), 'docs', 'sql', 'public_intake_parish_routing_rollback_draft.sql')

describe('public intake parish routing disposable QA validation', () => {
  it('keeps QA execution limited to disposable environments', () => {
    const qa = readFileSync(qaPath, 'utf8')

    for (const expected of [
      'Status: Disposable QA plan only.',
      'Do not apply this plan to the current QA or production database',
      'Use a disposable Supabase branch or temporary Supabase project.',
      'Record results in `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`',
      'use `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md` for the exact SQL order',
      'promotion into `supabase/migrations` must still follow `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`',
      'Do not run the forward candidate against production.',
      'Do not run the forward candidate against the shared QA project',
      'This plan does not change runtime public intake behavior.',
    ]) {
      expect(qa).toContain(expected)
    }
  })

  it('documents preflight, forward, rollback, and approval gates', () => {
    const qa = readFileSync(qaPath, 'utf8')

    for (const expected of [
      '## Preflight Checklist',
      '## Forward Candidate Validation',
      '## Data Validation Cases',
      '## Resolver Test Matrix',
      '## Public Intake Regression Checklist',
      '## Future Health-Check Readiness',
      '## Rollback Validation',
      '## Approval Gates',
      'Forward migration applies cleanly.',
      'Rollback applies cleanly.',
      'Security review confirms no anonymous direct-write RLS was introduced.',
      'Health-check readiness criteria are reviewed and approved.',
    ]) {
      expect(qa).toContain(expected)
    }
  })

  it('covers resolver routing precedence and fail-closed cases', () => {
    const qa = readFileSync(qaPath, 'utf8')

    for (const expected of [
      'resolvePublicIntakeParishScope',
      'must continue passing before runtime public intake routing is enabled',
      'Valid active token for active parish',
      'Verified active hostname',
      'Valid enabled slug',
      'Legacy `/baptism-request` without route signal',
      'New `/intake/{slug}/{type}` without valid slug',
      'Forged staff active parish cookie',
      'Has no effect',
    ]) {
      expect(qa).toContain(expected)
    }
  })

  it('defines a rollback draft that reverses the forward candidate objects', () => {
    const forward = readFileSync(forwardPath, 'utf8')
    const rollback = readFileSync(rollbackPath, 'utf8')

    expect(rollback).toContain('NON-APPLIED ROLLBACK DRAFT ONLY')
    expect(rollback).toContain('Do not apply to the current QA or production database')

    for (const objectName of [
      'parish_public_intake_tokens',
      'parish_public_intake_domains',
      'parishes_public_slug_lower_unique',
      'parishes_public_slug_format_check',
      'public_intake_enabled',
      'public_display_name',
      'public_slug',
    ]) {
      expect(forward).toContain(objectName)
      expect(rollback).toContain(objectName)
    }
  })

  it('keeps anonymous direct-write policies out of forward and rollback drafts', () => {
    const forward = readFileSync(forwardPath, 'utf8')
    const rollback = readFileSync(rollbackPath, 'utf8')

    expect(forward).not.toContain('TO anon')
    expect(rollback).not.toContain('TO anon')
    expect(forward).toContain('Intentionally no anon policies')
  })
})
