import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260622142000_cleanup_legacy_permissive_policies.sql'
)

describe('Supabase security cleanup migration', () => {
  it('keeps the QA security cleanup migration in the repo', () => {
    const sql = readFileSync(migrationPath, 'utf8')

    expect(sql).toContain('DROP POLICY IF EXISTS "parishioners_insert_anon"')
    expect(sql).toContain('DROP POLICY IF EXISTS "requests_insert_anon"')
    expect(sql).toContain('DROP POLICY IF EXISTS "funeral_request_details_insert_anon"')
    expect(sql).toContain('REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE')
    expect(sql).toContain('FROM anon')
    expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.primary_parish_id() FROM PUBLIC')
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) FROM PUBLIC'
    )
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.primary_parish_id() TO authenticated')
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) TO authenticated'
    )
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.is_authorized_staff() TO authenticated')
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.workflow_templates_touch_updated_at() FROM PUBLIC'
    )
  })
})
