import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchDashboardRequestParishionerScope } from '@/lib/dashboardParishRequestScope'
import {
  formatDashboardTechnicalError,
  logDashboardQueryError,
  userMessageForDashboardQueryError,
} from '@/lib/dashboardSupabaseError'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type LoadDashboardRequestsResult =
  | {
      ok: true
      requests: unknown[]
      softWarnings: string[]
    }
  | {
      ok: false
      fetchFailed: boolean
      userMessage: string
      technicalDetail: string | null
    }

/**
 * Loads parish-scoped requests with parishioner, checklist, and type detail joins.
 */
export async function loadDashboardRequests(
  supabase: SupabaseClient
): Promise<LoadDashboardRequestsResult> {
  const softWarnings: string[] = []

  try {
    const parishScope = await fetchDashboardRequestParishionerScope(supabase)
    if (!parishScope.ok) {
      return {
        ok: false,
        fetchFailed: false,
        userMessage: parishScope.userMessage,
        technicalDetail: parishScope.technicalDetail,
      }
    }

    const { data: requestsData, error: requestsError } = await supabase
      .from('requests')
      .select(`
        id,
        request_type,
        status,
        child_name,
        preferred_dates,
        notes,
        reply_draft,
        created_at,
        parishioner_id,
        person_id,
        confirmed_baptism_date,
        last_contacted_at,
        assigned_staff_name,
        assigned_priest_name,
        assigned_deacon_name,
        next_follow_up_date,
        waiting_on
      `)
      .in('parishioner_id', parishScope.parishionerIds)
      .order('created_at', { ascending: false })

    if (requestsError) {
      logDashboardQueryError('requests (dashboard list)', requestsError)
      return {
        ok: false,
        fetchFailed: true,
        userMessage: 'Requests could not be loaded.',
        technicalDetail: formatDashboardTechnicalError(requestsError),
      }
    }

    if (!requestsData) {
      const synthetic = new Error('Supabase returned no data and no error')
      logDashboardQueryError('requests (dashboard list)', synthetic)
      return {
        ok: false,
        fetchFailed: true,
        userMessage: 'Requests could not be loaded.',
        technicalDetail: formatDashboardTechnicalError(synthetic),
      }
    }

    const requestRows = requestsData.map((r) => ({
      ...r,
      request_type: requestTypeFromRow(r as { request_type?: unknown }),
    }))

    const parishionerIds = requestRows.map((request) => request.parishioner_id).filter(Boolean)

    let parishionersData:
      | {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          parish_id: string | null
        }[]
      | null = []
    let parishionersError: { message: string } | null = null

    if (parishionerIds.length > 0) {
      const pRes = await supabase
        .from('parishioners')
        .select('id, full_name, email, phone, parish_id')
        .in('id', parishionerIds)
      parishionersData = pRes.data as typeof parishionersData
      parishionersError = pRes.error
    }

    if (parishionersError) {
      logDashboardQueryError('parishioners (for dashboard merge)', parishionersError)
      return {
        ok: false,
        fetchFailed: true,
        userMessage: 'Requests could not be loaded.',
        technicalDetail: formatDashboardTechnicalError(parishionersError),
      }
    }

    const requestIds = requestRows.map((r) => r.id).filter(Boolean)
    const checklistIncompleteCountByRequestId = new Map<string, number>()

    if (requestIds.length > 0) {
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklist_items')
        .select('request_id, is_complete')
        .in('request_id', requestIds)

      if (checklistError) {
        logDashboardQueryError('checklist_items (for dashboard)', checklistError)
        softWarnings.push(userMessageForDashboardQueryError('checklist summary', checklistError))
      } else {
        for (const item of checklistData || []) {
          const reqId = String(item.request_id)
          if (item.is_complete === false) {
            checklistIncompleteCountByRequestId.set(
              reqId,
              (checklistIncompleteCountByRequestId.get(reqId) ?? 0) + 1
            )
          }
        }
      }
    }

    const mergedRequests = requestRows.map((request) => {
      const matchingParishioner = parishionersData?.find((p) => p.id === request.parishioner_id)
      const checklistIncompleteCount =
        checklistIncompleteCountByRequestId.get(String(request.id)) ?? 0

      return {
        ...request,
        parishioner: matchingParishioner || null,
        checklist_incomplete: checklistIncompleteCount > 0,
        checklist_incomplete_count: checklistIncompleteCount,
      }
    })

    let withDetails = mergedRequests as (typeof mergedRequests[number] & {
      funeral_detail?: unknown
      wedding_detail?: unknown
      ocia_detail?: unknown
    })[]

    for (const [type, table] of [
      ['funeral', 'funeral_request_details'],
      ['wedding', 'wedding_request_details'],
      ['ocia', 'ocia_request_details'],
    ] as const) {
      const ids = withDetails.filter((r) => r.request_type === type).map((r) => String(r.id))
      const byId = new Map<string, Record<string, unknown>>()
      if (ids.length > 0) {
        const { data, error } = await supabase.from(table).select('*').in('request_id', ids)
        if (error) {
          logDashboardQueryError(`${table} (for dashboard)`, error)
          softWarnings.push(userMessageForDashboardQueryError(`${type} request details`, error))
        }
        for (const row of data || []) {
          byId.set(String(row.request_id), row as Record<string, unknown>)
        }
      }
      withDetails = withDetails.map((r) => {
        const detailKey =
          type === 'funeral'
            ? 'funeral_detail'
            : type === 'wedding'
              ? 'wedding_detail'
              : 'ocia_detail'
        return {
          ...r,
          [detailKey]: r.request_type === type ? byId.get(String(r.id)) ?? null : r[detailKey as keyof typeof r],
        }
      })
    }

    return { ok: true, requests: withDetails, softWarnings }
  } catch (unexpected) {
    logDashboardQueryError('dashboard load (unexpected)', unexpected)
    return {
      ok: false,
      fetchFailed: true,
      userMessage: 'Requests could not be loaded.',
      technicalDetail: formatDashboardTechnicalError(unexpected),
    }
  }
}
