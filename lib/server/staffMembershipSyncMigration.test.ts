import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260622173000_staff_users_memberships_sync.sql'
)

describe('staff users to parish memberships sync migration', () => {
  it('keeps staff management writes mirrored into parish memberships', () => {
    const sql = readFileSync(migrationPath, 'utf8')

    expect(sql).toContain(
      'CREATE OR REPLACE FUNCTION public.sync_parish_membership_from_staff_user()'
    )
    expect(sql).toContain("IF TG_OP = 'DELETE' THEN")
    expect(sql).toContain("IF TG_OP = 'UPDATE' AND lower(NEW.email) <> lower(OLD.email) THEN")
    expect(sql).toContain('INSERT INTO public.parish_memberships')
    expect(sql).toContain('lower(NEW.email)')
    expect(sql).toContain('ON CONFLICT (parish_id, email) DO UPDATE')
    expect(sql).toContain('DROP TRIGGER IF EXISTS staff_users_sync_parish_membership_trg')
    expect(sql).toContain('AFTER INSERT OR UPDATE OR DELETE ON public.staff_users')
    expect(sql).toContain('EXECUTE FUNCTION public.sync_parish_membership_from_staff_user()')
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.sync_parish_membership_from_staff_user() FROM PUBLIC'
    )
  })
})
