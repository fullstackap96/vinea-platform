import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260622170000_parish_memberships_foundation.sql'
)

describe('parish memberships foundation migration', () => {
  it('adds the tenant membership primitives without replacing V1 RLS yet', () => {
    const sql = readFileSync(migrationPath, 'utf8')

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.parish_memberships')
    expect(sql).toContain('CONSTRAINT parish_memberships_email_lowercase')
    expect(sql).toContain('FROM public.staff_users su')
    expect(sql).toContain('ON CONFLICT (parish_id, email) DO UPDATE')
    expect(sql).toContain('ALTER TABLE public.parish_memberships ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "parish_memberships_select_self"')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.current_staff_parish_ids()')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.current_staff_primary_parish_id()')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.is_authorized_for_parish(p_parish_id uuid)')
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.current_staff_parish_ids() TO authenticated')
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) TO authenticated'
    )
  })
})
