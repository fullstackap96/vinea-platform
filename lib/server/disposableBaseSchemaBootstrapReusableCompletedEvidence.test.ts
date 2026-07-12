import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('disposable base schema bootstrap reusable completed evidence', () => {
  it('records a completed replay against only the approved reusable disposable project', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Status: Completed against the approved reusable disposable project.',
      'Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`',
      'Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`',
      '`VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM=DISPOSABLE_BASE_SCHEMA_BOOTSTRAP` was set.',
      '`VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.',
      'Shared QA project `gnfomgsuottcuueasfvi` remained hard-blocked by the runner.',
      'The runner classified the target as `supabase_disposable`.',
      'Script status: `completed`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures bootstrap, migration, and verification success', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Baseline relevant tables before bootstrap: `0`',
      'Base schema bootstrap applied: `docs/sql/disposable_base_schema_bootstrap_candidate.sql`',
      'Repo migrations applied: `36`',
      'Missing required tables after migration replay: `0`',
      'Missing required functions after migration replay: `0`',
      '`checklist_items`',
      '`parishioners`',
      '`request_communications`',
      '`requests`',
      '`staff_users`',
      '`workflow_templates`',
      '`check_public_intake_rate_limit`',
      '`current_staff_parish_ids`',
      'Missing required tables: none.',
      'Missing required functions: none.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents boundaries and does not store database secrets', () => {
    const evidence = readEvidence()

    for (const expected of [
      'No database password or full connection string is recorded in this evidence file.',
      'Production',
      'Shared QA project `gnfomgsuottcuueasfvi`',
      'Runtime public intake wiring',
      'Runtime `/api/health`',
      'Files under `supabase/migrations`',
      'Operational RLS in repo code',
      'touched only the approved reusable disposable project `kikqtorplsswepqitjys`',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(evidence).not.toContain('postgresql://postgres:')
    expect(evidence).not.toContain('DISPOSABLE_SUPABASE_DB_URL=')
  })
})
