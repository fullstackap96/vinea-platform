import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { parseMassIntentionRow } from '@/lib/massIntentions'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

export type MassIntentionDetailResult = {
  intention: MassIntentionRow | null
  errorMessage: string
  activeParishName: string | null
}

export const MASS_INTENTION_DETAIL_SELECT =
  'id, parish_id, requester_name, intention_text, requested_date, assigned_mass_date, assigned_priest_name, stipend_received, is_fulfilled, notes, created_at, updated_at' as const

function normalizeId(value: unknown): string {
  return String(value ?? '').trim()
}

export async function loadMassIntentionDetail(
  intentionId: unknown
): Promise<MassIntentionDetailResult> {
  const id = normalizeId(intentionId)
  if (!id) {
    return {
      intention: null,
      errorMessage: 'Intention not found.',
      activeParishName: null,
    }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { intention: null, errorMessage: 'Unauthorized', activeParishName: null }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })

  if (!parishContext.ok) {
    return {
      intention: null,
      errorMessage: parishContext.error,
      activeParishName: null,
    }
  }

  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  const { data, error } = await supabase
    .from('mass_intentions')
    .select(MASS_INTENTION_DETAIL_SELECT)
    .eq('id', id)
    .eq('parish_id', parishContext.activeParishId)
    .maybeSingle()

  if (error) {
    return {
      intention: null,
      errorMessage: userMessageForDashboardQueryError('mass intention', error),
      activeParishName,
    }
  }

  if (!data) {
    return {
      intention: null,
      errorMessage: 'Intention not found.',
      activeParishName,
    }
  }

  return {
    intention: parseMassIntentionRow(data as Record<string, unknown>),
    errorMessage: '',
    activeParishName,
  }
}
