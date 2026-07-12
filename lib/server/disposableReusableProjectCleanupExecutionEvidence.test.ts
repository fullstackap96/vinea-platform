import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_REUSABLE_PROJECT_CLEANUP_EXECUTION_EVIDENCE_20260625.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('disposable reusable project cleanup execution evidence', () => {
  it('records an executed cleanup against only the approved reusable disposable project', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Status: Completed against the approved reusable disposable project.',
      'Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`',
      'Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`',
      '`VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA` was set.',
      '`VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.',
      '`VINEA_DISPOSABLE_RESET_EXECUTE=EXECUTE_RESET` was set.',
      'The script reported `executeReset: true`.',
      'The script reported `status: "completed"`.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures execution counts and zero remaining approved objects', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Approved statements executed: `44`',
      'Approved table drop statements included: `27`',
      'Approved function drop statements included: `16`',
      'Approved type drop statements included: `1`',
      'Remaining approved tables: `0`',
      'Remaining approved functions: `0`',
      'Remaining approved types: `0`',
      'ready for a clean disposable base schema bootstrap replay',
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
