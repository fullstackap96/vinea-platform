import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_PACKET.md'
)

describe('disposable base schema bootstrap execution packet', () => {
  it('keeps execution disposable-only and forbids production/shared QA changes', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Disposable execution packet only.',
      'Do not apply this packet to production',
      'Do not use production.',
      'Do not use the current shared QA database.',
      'Do not add `docs/sql/disposable_base_schema_bootstrap_candidate.sql` to `supabase/migrations`.',
      'Do not change runtime `/api/health`.',
      'Do not change runtime public intake routing.',
      'Do not change operational RLS.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines the exact bootstrap and migration execution order', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Apply `docs/sql/disposable_base_schema_bootstrap_candidate.sql`.',
      'Apply every file from `supabase/migrations` in sorted filename order.',
      'docs/sql/disposable_base_schema_bootstrap_candidate.sql',
      'supabase/migrations',
      'Sort-Object Name',
      'Every migration applies without manual edits.',
      'If any migration fails, stop and do not proceed to app checks.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires schema verification, health success, intake regression, and cleanup evidence', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Post-Migration Schema Verification',
      'primary_parish_id',
      'check_public_intake_rate_limit',
      'current_staff_parish_ids',
      'GET /api/health',
      '"schema": true',
      'Baptism public intake submits successfully.',
      'Wedding public intake submits successfully.',
      'Funeral public intake submits successfully.',
      'OCIA public intake submits successfully.',
      'Join Parish public intake submits successfully.',
      'Durable public intake 429 behavior works after the threshold.',
      'drop schema public cascade;',
      'No Vinea app tables remain.',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
