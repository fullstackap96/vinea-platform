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

async function hasAnyParish(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.id)
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

  const { data, error } = await admin
    .from('staff_users')
    .select('id, role, parish_id, email')
    .eq('active', true)
    .ilike('email', email)
    .limit(50)

  if (error) {
    if (staffAccessNotConfiguredAllowsDev() && isMissingStaffUsersTable(error)) {
      return { ok: true, email, role: 'admin', source: 'development' }
    }
    return { ok: false, error: 'Could not verify staff access.' }
  }
  // ILIKE is only a candidate lookup: email characters can be SQL/PostgREST wildcards.
  const matchingStaff = (data ?? []).filter((row) => normalizeStaffEmail(row.email) === email)
  if (matchingStaff.length) {
    const role = matchingStaff.some((row) => row.role === 'admin') ? 'admin' : 'staff'
    return { ok: true, email, role, source: 'database' }
  }

  try {
    const parishExists = await hasAnyParish(admin)
    if (!parishExists) {
      return { ok: false, error: 'Parish is not configured.' }
    }
  } catch {
    return { ok: false, error: 'Could not verify parish access.' }
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
