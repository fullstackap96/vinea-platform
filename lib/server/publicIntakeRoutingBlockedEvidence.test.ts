import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_BLOCKED.md'
)

describe('public intake routing blocked disposable QA evidence', () => {
  it('records that no disposable Supabase execution occurred', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before SQL execution.',
      'No migrations were applied',
      'Disposable environment only: `No`',
      'Forward candidate was not added to `supabase/migrations`: `Yes`',
      'Runtime public intake was not wired to the resolver during this evidence run: `Yes`',
      'Runtime `/api/health` was not changed during this evidence run: `Yes`',
      'Operational RLS was not changed during this evidence run: `Yes`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('identifies the safety blocker and keeps promotion blocked', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'no safe disposable database target was available',
      'gnfomgsuottcuueasfvi',
      'shared QA project',
      'Forward candidate applied from `docs/sql/public_intake_parish_routing_migration_candidate.sql`: `Not run`',
      'Rollback draft applied from `docs/sql/public_intake_parish_routing_rollback_draft.sql`: `Not run`',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
