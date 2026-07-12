import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260630170000_enable_parishes_rls.sql',
)

function readMigration() {
  return readFileSync(migrationPath, 'utf8')
}

describe('parishes RLS migration', () => {
  it('enables RLS on public.parishes to resolve rls_disabled_in_public', () => {
    const migration = readMigration()

    expect(migration).toContain('rls_disabled_in_public')
    expect(migration).toContain('ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;')
  })

  it('adds only a membership-scoped authenticated staff read policy', () => {
    const migration = readMigration()

    for (const expected of [
      'DROP POLICY IF EXISTS "parishes_select_authorized_staff" ON public.parishes;',
      'CREATE POLICY "parishes_select_authorized_staff"',
      'ON public.parishes',
      'FOR SELECT',
      'TO authenticated, service_role',
      "auth.role() = 'service_role'",
      'OR public.is_authorized_for_parish(id)',
    ]) {
      expect(migration).toContain(expected)
    }
  })

  it('does not grant anonymous or broad write access to parishes', () => {
    const migration = readMigration().toLowerCase()

    for (const forbidden of [
      'to anon',
      'to public',
      'for all',
      'for insert',
      'for update',
      'for delete',
      'using (true)',
      'with check (true)',
      'disable row level security',
    ]) {
      expect(migration).not.toContain(forbidden)
    }
  })
})
