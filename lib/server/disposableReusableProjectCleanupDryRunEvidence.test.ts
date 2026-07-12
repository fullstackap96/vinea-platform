import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_REUSABLE_PROJECT_CLEANUP_DRY_RUN_EVIDENCE_20260625.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('disposable reusable project cleanup dry-run evidence', () => {
  it('records a dry-run against only the approved reusable disposable project', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Status: Dry-run completed. Cleanup was not executed.',
      'Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`',
      'Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`',
      '`VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA` was set.',
      '`VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.',
      '`VINEA_DISPOSABLE_RESET_EXECUTE` was not set.',
      'The script reported `executeReset: false`.',
      'Script status: `dry_run`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the planned cleanup scope and keeps the decision gate closed', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Approved table drops planned: `27`',
      'Approved function drops planned: `16`',
      'Approved type drops planned: `1`',
      'Total planned statements: `44`',
      'Cleanup result object: empty, because execute mode was not enabled.',
      'Verification result object: empty, because execute mode was not enabled.',
      'Do not execute cleanup until this dry-run evidence has been reviewed.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents non-goals and does not store database secrets', () => {
    const evidence = readEvidence()

    for (const expected of [
      'No database password or full connection string is recorded in this evidence file.',
      '`DROP SCHEMA public`',
      'Supabase `auth` schema changes',
      'Supabase `storage` schema changes',
      'Production changes',
      'Shared QA changes',
      'Runtime public intake changes',
      'Runtime `/api/health` changes',
      'Files under `supabase/migrations`',
      'Operational RLS changes',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(evidence).not.toContain('postgresql://postgres:')
    expect(evidence).not.toContain('DISPOSABLE_SUPABASE_DB_URL=')
  })
})
