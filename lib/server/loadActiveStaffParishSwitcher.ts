import 'server-only'

import { cookies } from 'next/headers'

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type ActiveStaffParishSwitcherParish = {
  id: string
  name: string | null
}

export type ActiveStaffParishSwitcherContext =
  | {
      ok: true
      activeParishId: string
      parishes: ActiveStaffParishSwitcherParish[]
      warning: string | null
    }
  | {
      ok: false
      activeParishId: null
      parishes: []
      error: string
      technicalDetail: string | null
    }

export function labelActiveStaffParishSwitcherParishes(
  parishes: ActiveStaffParishSwitcherParish[]
): ActiveStaffParishSwitcherParish[] {
  const unnamedCount = parishes.filter((parish) => !parish.name?.trim()).length
  let unnamedIndex = 0

  return parishes.map((parish) => {
    const name = parish.name?.trim()

    if (name) {
      return { ...parish, name }
    }

    unnamedIndex += 1

    return {
      ...parish,
      name: unnamedCount > 1 ? `Unnamed parish ${unnamedIndex}` : 'Unnamed parish',
    }
  })
}

export async function loadActiveStaffParishSwitcherContext(): Promise<ActiveStaffParishSwitcherContext> {
  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const supabase = await createSupabaseServerClient()
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })

  if (!parishContext.ok) {
    return {
      ok: false,
      activeParishId: null,
      parishes: [],
      error: parishContext.error,
      technicalDetail: parishContext.technicalDetail,
    }
  }

  return {
    ok: true,
    activeParishId: parishContext.activeParishId,
    parishes: labelActiveStaffParishSwitcherParishes(parishContext.parishes),
    warning: parishContext.ignoredRequestedParishReason ?? null,
  }
}
