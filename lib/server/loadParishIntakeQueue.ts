import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import {
  buildParishIntakeQueue,
  type ParishIntakeQueueItem,
  type ParishIntakeQueueMassIntention,
  type ParishIntakeQueueRequest,
} from '@/lib/parishIntakeQueue'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const PARISH_INTAKE_QUEUE_INTENTION_SELECT =
  'id, requester_name, assigned_mass_date, assigned_priest_name, stipend_received, is_fulfilled, created_at' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function parseIntakeMassIntention(
  raw: Record<string, unknown>
): ParishIntakeQueueMassIntention {
  return {
    id: String(raw.id ?? ''),
    requester_name: String(raw.requester_name ?? '').trim(),
    assigned_mass_date:
      raw.assigned_mass_date != null ? String(raw.assigned_mass_date).slice(0, 10) : null,
    assigned_priest_name: nullableString(raw.assigned_priest_name),
    stipend_received: Boolean(raw.stipend_received),
    is_fulfilled: Boolean(raw.is_fulfilled),
    created_at: String(raw.created_at ?? ''),
  }
}

export type LoadParishIntakeQueueResult = {
  items: ParishIntakeQueueItem[]
  errorMessage: string
  softWarnings: string[]
}

export async function loadParishIntakeQueue(): Promise<LoadParishIntakeQueueResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { items: [], errorMessage: 'Unauthorized', softWarnings: [] }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })

  if (!parishContext.ok) {
    return {
      items: [],
      errorMessage: parishContext.error,
      softWarnings: [],
    }
  }

  const requestResult = await loadDashboardRequests(supabase, {
    activeParishId: parishContext.activeParishId,
  })
  if (!requestResult.ok) {
    return {
      items: [],
      errorMessage: requestResult.userMessage,
      softWarnings: [],
    }
  }

  let intentions: ParishIntakeQueueMassIntention[] = []
  let softWarnings = [...requestResult.softWarnings]
  const parishId = parishContext.activeParishId

  let intentionsQuery = supabase
    .from('mass_intentions')
    .select(PARISH_INTAKE_QUEUE_INTENTION_SELECT)
    .eq('is_fulfilled', false)
    .order('created_at', { ascending: false })

  if (parishId) {
    intentionsQuery = intentionsQuery.eq('parish_id', parishId)
  }

  const { data, error } = await intentionsQuery
  if (error) {
    softWarnings = [
      ...softWarnings,
      userMessageForDashboardQueryError('mass intentions', error),
    ]
  } else {
    intentions = (data ?? []).map((row) =>
      parseIntakeMassIntention(row as Record<string, unknown>)
    )
  }

  return {
    items: buildParishIntakeQueue({
      requests: requestResult.requests as ParishIntakeQueueRequest[],
      intentions,
    }),
    errorMessage: '',
    softWarnings,
  }
}
