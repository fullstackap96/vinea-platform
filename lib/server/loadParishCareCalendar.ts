import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import {
  buildParishCareCalendarItems,
  type ParishCareCalendarRequest,
  type ParishCareCalendarItem,
  type ParishCareCalendarMassIntention,
} from '@/lib/parishCareCalendar'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const PARISH_CARE_CALENDAR_INTENTION_SELECT =
  'id, requester_name, intention_text, requested_date, assigned_mass_date, assigned_priest_name, is_fulfilled' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function dateOnly(value: unknown): string | null {
  return value != null ? String(value).slice(0, 10) : null
}

function parseCalendarMassIntention(
  raw: Record<string, unknown>
): ParishCareCalendarMassIntention {
  return {
    id: String(raw.id ?? ''),
    requester_name: String(raw.requester_name ?? '').trim(),
    intention_text: String(raw.intention_text ?? '').trim(),
    requested_date: dateOnly(raw.requested_date),
    assigned_mass_date: dateOnly(raw.assigned_mass_date),
    assigned_priest_name: nullableString(raw.assigned_priest_name),
    is_fulfilled: Boolean(raw.is_fulfilled),
  }
}

export type LoadParishCareCalendarResult = {
  items: ParishCareCalendarItem[]
  errorMessage: string
  softWarnings: string[]
  activeParishName: string | null
}

export async function loadParishCareCalendar(): Promise<LoadParishCareCalendarResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { items: [], errorMessage: 'Unauthorized', softWarnings: [], activeParishName: null }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })

  if (!parishContext.ok) {
    return {
      items: [],
      errorMessage: parishContext.error,
      softWarnings: [],
      activeParishName: null,
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
      activeParishName: parishContext.activeParish?.name ?? null,
    }
  }

  const parishId = parishContext.activeParishId

  let intentions: ParishCareCalendarMassIntention[] = []
  let softWarnings = [...requestResult.softWarnings]

  let intentionsQuery = supabase
    .from('mass_intentions')
    .select(PARISH_CARE_CALENDAR_INTENTION_SELECT)
    .order('assigned_mass_date', { ascending: true, nullsFirst: false })
    .order('requested_date', { ascending: true, nullsFirst: false })

  if (parishId) {
    intentionsQuery = intentionsQuery.eq('parish_id', parishId)
  }

  const { data: intentionsData, error: intentionsError } = await intentionsQuery
  if (intentionsError) {
    softWarnings = [
      ...softWarnings,
      userMessageForDashboardQueryError('mass intentions', intentionsError),
    ]
  } else {
    intentions = (intentionsData ?? []).map((row) =>
      parseCalendarMassIntention(row as Record<string, unknown>)
    )
  }

  return {
    items: buildParishCareCalendarItems({
      requests: requestResult.requests as ParishCareCalendarRequest[],
      intentions,
    }),
    errorMessage: '',
    softWarnings,
    activeParishName: parishContext.activeParish?.name ?? null,
  }
}
