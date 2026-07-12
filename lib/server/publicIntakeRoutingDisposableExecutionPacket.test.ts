import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md'
)

describe('public intake routing disposable Supabase execution packet', () => {
  it('keeps execution limited to disposable targets and out of runtime migrations', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Disposable execution packet only.',
      'Use only a disposable Supabase target.',
      'Do not use production.',
      'Do not add the migration candidate to `supabase/migrations`.',
      'Do not wire `resolvePublicIntakeParishScope` into `/api/intake`.',
      'Do not change runtime `/api/health`.',
      'Do not change operational RLS.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact forward, verification, rollback, health, and evidence steps', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '## Exact Execution Order',
      'Apply the forward candidate from `docs/sql/public_intake_parish_routing_migration_candidate.sql`.',
      'Run forward schema verification queries.',
      'Run forward policy verification queries.',
      'Capture post-forward `/api/health` observation.',
      'Apply the rollback draft from `docs/sql/public_intake_parish_routing_rollback_draft.sql`.',
      'Run rollback verification queries.',
      'Capture post-rollback `/api/health` observation.',
      '## Step 16: Evidence Capture Checklist',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('includes the required schema, policy, resolver, regression, and stop-condition checks', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'public_slug',
      'public_display_name',
      'public_intake_enabled',
      'parish_public_intake_domains',
      'parish_public_intake_tokens',
      'rowsecurity',
      'No policy grants anonymous direct-write management access.',
      'npm.cmd test -- lib/server/publicIntakeParishScope.test.ts',
      'Baptism public intake.',
      'Durable public intake 429 behavior after threshold.',
      'Operational RLS is changed.',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
