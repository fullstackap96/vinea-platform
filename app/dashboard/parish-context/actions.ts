'use server'

import { cookies } from 'next/headers'

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import {
  activeParishCookieOptions,
  normalizeRequestedParishId,
} from '@/lib/server/activeParishSelection'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type ActiveParishSelectionResult =
  | { ok: true; activeParishId: string | null; cleared?: boolean }
  | { ok: false; error: string; activeParishId: string | null; cleared?: boolean }

async function clearActiveParishCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_STAFF_PARISH_COOKIE, '', {
    ...activeParishCookieOptions(),
    maxAge: 0,
  })
}

export async function setActiveStaffParish(
  parishId: unknown
): Promise<ActiveParishSelectionResult> {
  const requestedParishId = normalizeRequestedParishId(parishId)

  if (!requestedParishId) {
    await clearActiveParishCookie()
    return { ok: true, activeParishId: null, cleared: true }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    await clearActiveParishCookie()
    return { ok: false, error: 'Unauthorized', activeParishId: null, cleared: true }
  }

  const parishContext = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!parishContext.ok) {
    await clearActiveParishCookie()
    return {
      ok: false,
      error: parishContext.error,
      activeParishId: null,
      cleared: true,
    }
  }

  if (parishContext.activeParishId !== requestedParishId) {
    await clearActiveParishCookie()
    return {
      ok: false,
      error:
        parishContext.ignoredRequestedParishReason ??
        'Requested parish is not authorized for this staff session.',
      activeParishId: parishContext.activeParishId,
      cleared: true,
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(
    ACTIVE_STAFF_PARISH_COOKIE,
    parishContext.activeParishId,
    activeParishCookieOptions()
  )

  return { ok: true, activeParishId: parishContext.activeParishId }
}
