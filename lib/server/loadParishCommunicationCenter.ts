import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import {
  buildParishCommunicationCenter,
  type ParishCommunicationEvent,
  type ParishCommunicationItem,
  type ParishCommunicationRequest,
} from '@/lib/parishCommunicationCenter'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type LoadParishCommunicationCenterResult = {
  items: ParishCommunicationItem[]
  errorMessage: string
  softWarnings: string[]
  activeParishName: string | null
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export async function loadParishCommunicationCenter(): Promise<LoadParishCommunicationCenterResult> {
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

  const requests = requestResult.requests as ParishCommunicationRequest[]
  const requestIds = requests.map((request) => text(request.id)).filter(Boolean)
  let communications: ParishCommunicationEvent[] = []
  let softWarnings = [...requestResult.softWarnings]

  if (requestIds.length > 0) {
    const { data, error } = await supabase
      .from('request_communications')
      .select('id, request_id, contacted_at, method, notes, created_at')
      .in('request_id', requestIds)
      .order('contacted_at', { ascending: false })

    if (error) {
      softWarnings = [
        ...softWarnings,
        userMessageForDashboardQueryError('communication history', error),
      ]
    } else {
      communications = (data ?? []) as ParishCommunicationEvent[]
    }
  }

  return {
    items: buildParishCommunicationCenter({ requests, communications }),
    errorMessage: '',
    softWarnings,
    activeParishName: parishContext.activeParish?.name ?? null,
  }
}
