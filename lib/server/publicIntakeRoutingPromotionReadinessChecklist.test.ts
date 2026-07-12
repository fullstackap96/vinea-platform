import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md'
)
const evidenceSummaryPath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_PROMOTION_EVIDENCE_SUMMARY_20260625.md'
)

describe('public intake routing promotion readiness checklist', () => {
  it('records schema-only promotion with disposable evidence and rollback evidence', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Schema-only promotion approved.',
      'Do not promote unless disposable QA evidence has been completed from a clean disposable Supabase environment.',
      'Do not promote unless rollback has been applied and verified after the forward candidate in that same disposable environment.',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md',
      'docs/PUBLIC_INTAKE_ROUTING_PROMOTION_EVIDENCE_SUMMARY_20260625.md',
      'Confirmation that `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md` was followed.',
      'docs/DISPOSABLE_REUSABLE_PROJECT_CLEANUP_EXECUTION_EVIDENCE_20260625.md',
      'docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md',
      'docs/sql/public_intake_parish_routing_migration_candidate.sql',
      'docs/sql/public_intake_parish_routing_rollback_draft.sql',
      'supabase/migrations/20260625193000_public_intake_parish_routing.sql',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires health-check criteria, manual public intake QA, rollback owner, and sign-off', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Gate 4: Future `/api/health` Update Criteria',
      'public intake parish routing columns',
      'public intake domain routing table',
      'public intake token routing table',
      '## Gate 5: Manual Public Intake QA',
      'Baptism public intake submits successfully.',
      'Wedding public intake submits successfully.',
      'Funeral public intake submits successfully.',
      'OCIA public intake submits successfully.',
      'Join Parish public intake submits successfully.',
      'Durable public intake 429 behavior works after the threshold.',
      'Rollback owner is named',
      '## Gate 7: Approval Sign-Off',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('forbids bundled runtime intake wiring and operational RLS changes', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Do not bundle runtime public intake routing, route wiring, or operational RLS changes into the schema-promotion commit.',
      'Runtime forms still use legacy behavior until a future route-wiring phase is explicitly approved.',
      'Staff active parish cookies do not affect public intake routing tests.',
      'Runtime route wiring is being bundled into the migration-promotion step.',
      'Operational RLS is being changed as part of this promotion.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('records completed disposable evidence while keeping runtime routing blocked', () => {
    const checklist = readFileSync(checklistPath, 'utf8')
    const evidenceSummary = readFileSync(evidenceSummaryPath, 'utf8')

    for (const expected of [
      'Current evidence status:',
      'Disposable cleanup evidence is complete',
      'Base schema bootstrap replay evidence is complete',
      'Disposable app public intake QA evidence is complete',
      'Schema-only promotion has product-owner approval.',
      'Runtime public intake routing remains blocked until a separate route-wiring phase is explicitly approved.',
    ]) {
      expect(checklist).toContain(expected)
    }

    for (const expected of [
      'Status: Promotion approved for schema-only migration. Runtime intake routing remains unwired.',
      'Decision: `Promote Schema Only`',
      '`/api/health` reported `checks.schema: true`.',
      'Public intake submission regression passed for Baptism, Wedding, Funeral, OCIA, and Join Parish.',
      'Durable public intake `429` behavior triggered after the threshold and included a `Retry-After` header.',
      'Promoted migration: `supabase/migrations/20260625193000_public_intake_parish_routing.sql`',
      'Do not bundle runtime public intake routing, route wiring, or operational RLS changes into the schema-promotion commit.',
    ]) {
      expect(evidenceSummary).toContain(expected)
    }

    for (const forbidden of [
      'SUPABASE_SERVICE_ROLE_KEY=',
      'SUPABASE_ANON_KEY=',
      'postgresql://postgres:',
      'actual database password',
    ]) {
      expect(evidenceSummary).not.toContain(forbidden)
    }
  })
})
