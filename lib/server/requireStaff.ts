import 'server-only'

import type { User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import {
  isStaffEmailAllowlisted,
  normalizeStaffEmail,
  staffAccessNotConfiguredAllowsDev,
} from '@/lib/staffAuthorization'

export type StaffAuthorizationResult =
  | { ok: true; email: string; role: 'admin' | 'staff'; source: 'env' | 'database' | 'development' }
  | { ok: false; error: string }

async function loadPrimaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.id ? String(data.id) : null
}

function isMissingStaffUsersTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  return (
    error.code === 'PGRST205' &&
    String(error.message ?? '').includes("public.staff_users")
  )
}

export async function authorizeStaffUser(user: User | null | undefined): Promise<StaffAuthorizationResult> {
  const email = normalizeStaffEmail(user?.email)
  if (!user || !email) return { ok: false, error: 'Unauthorized' }

  if (isStaffEmailAllowlisted(email)) {
    return { ok: true, email, role: 'admin', source: 'env' }
  }

  const admin = createSupabaseServiceRoleClient()
  let parishId: string | null = null
  try {
    parishId = await loadPrimaryParishId(admin)
  } catch {
    return { ok: false, error: 'Could not verify parish access.' }
  }
  if (!parishId) {
    return { ok: false, error: 'Parish is not configured.' }
  }

  const { data, error } = await admin
    .from('staff_users')
    .select('id, role')
    .eq('parish_id', parishId)
    .eq('active', true)
    .ilike('email', email)
    .limit(1)
    .maybeSingle()

  if (error) {
    if (staffAccessNotConfiguredAllowsDev() && isMissingStaffUsersTable(error)) {
      return { ok: true, email, role: 'admin', source: 'development' }
    }
    return { ok: false, error: 'Could not verify staff access.' }
  }
  if (data?.id) {
    const role = data.role === 'admin' ? 'admin' : 'staff'
    return { ok: true, email, role, source: 'database' }
  }
  if (staffAccessNotConfiguredAllowsDev()) {
    return { ok: true, email, role: 'admin', source: 'development' }
  }

  return { ok: false, error: 'This login is not authorized for parish staff access.' }
}

export function staffUnauthorizedJson(error = 'Unauthorized', status = 403) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function requireStaffFromRequest(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false as const, response: staffUnauthorizedJson('Unauthorized', 401) }
  }

  const staff = await authorizeStaffUser(user)
  if (!staff.ok) {
    return { ok: false as const, response: staffUnauthorizedJson(staff.error, 403) }
  }

  return { ok: true as const, supabase, user, staff }
}
