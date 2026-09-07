import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

type StaffRoleClient = Pick<SupabaseClient, 'from'>

export type StaffParishRole = 'admin' | 'staff'

function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

export async function staffIsAdminForParish(
  client: StaffRoleClient,
  input: { parishId: string; email: string }
): Promise<boolean> {
  const parishId = String(input.parishId ?? '').trim()
  const email = normalizeEmail(input.email)
  if (!parishId || !email) return false

  const { data, error } = await client
    .from('staff_users')
    .select('id, email')
    .eq('parish_id', parishId)
    .eq('role', 'admin')
    .eq('active', true)
    .ilike('email', email)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  // Never grant a role from an ILIKE wildcard match to a different email.
  return Boolean(data?.id) && normalizeEmail(data?.email) === email
}

export async function loadAuthenticatedStaffRoleForParish(
  client: StaffRoleClient,
  input: { parishId: string; email: string }
): Promise<StaffParishRole | null> {
  const parishId = String(input.parishId ?? '').trim()
  const email = normalizeEmail(input.email)
  if (!parishId || !email) return null

  const { data, error } = await client
    .from('parish_memberships')
    .select('role, email')
    .eq('parish_id', parishId)
    .eq('active', true)
    .ilike('email', email)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (normalizeEmail(data?.email) !== email) return null
  return data?.role === 'admin' || data?.role === 'staff' ? data.role : null
}

export const staffParishRoleTestInternals = {
  normalizeEmail,
}
