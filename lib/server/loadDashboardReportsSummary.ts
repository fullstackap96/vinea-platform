import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  buildRequestAnalytics,
  type RequestAnalytics,
} from '@/lib/dashboard/buildRequestAnalytics'
import {
  fetchDashboardRequestParishionerScope,
} from '@/lib/dashboardParishRequestScope'
import {
  buildParishInsights,
  type ParishInsights,
} from '@/lib/dashboardParishInsights'
import {
  buildStaffWorkloadRows,
  type StaffWorkloadRow,
} from '@/lib/dashboardStaffWorkload'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { logServerError } from '@/lib/server/safeErrorLogging'

type ReadOnlySupabaseClient = Pick<SupabaseClient, 'from' | 'rpc'>

export type DashboardReportsSummary = {
  requestAnalytics: RequestAnalytics
  parishInsights: ParishInsights
  staffWorkloadRows: StaffWorkloadRow[]
}

export type LoadDashboardReportsSummaryResult =
  | { ok: true; summary: DashboardReportsSummary; warnings: string[] }
  | { ok: false; fetchFailed: boolean; error: string }

const REPORT_REQUEST_FIELDS =
  'id, request_type, status, created_at, assigned_staff_name, next_follow_up_date, last_contacted_at, waiting_on, confirmed_baptism_date'

function logReportLoadError(source: string, error: unknown) {
  logServerError(`[dashboard-reports] ${source} load failed`, error, {
    route: '/api/dashboard/reports-summary',
  })
}

async function loadScheduleDetails(
  supabase: ReadOnlySupabaseClient,
  table: 'funeral_request_details' | 'wedding_request_details' | 'ocia_request_details',
  field: 'confirmed_service_at' | 'confirmed_ceremony_at' | 'confirmed_session_at',
  requestIds: string[],
): Promise<{
  rows: Record<string, unknown>[]
  warning: string | null
}> {
  if (requestIds.length === 0) return { rows: [], warning: null }

  const { data, error } = await supabase
    .from(table)
    .select(`request_id, ${field}`)
    .in('request_id', requestIds)

  if (error) {
    logReportLoadError(table, error)
    return {
      rows: [],
      warning: 'Some confirmed schedule totals are temporarily unavailable.',
    }
  }

  return { rows: (data ?? []) as Record<string, unknown>[], warning: null }
}

export async function loadDashboardReportsSummary(
  supabase: ReadOnlySupabaseClient,
  activeParishId: string,
  now: Date = new Date(),
): Promise<LoadDashboardReportsSummaryResult> {
  const parishId = activeParishId.trim()
  if (!parishId) {
    return {
      ok: false,
      fetchFailed: false,
      error: 'Selected parish context is unavailable.',
    }
  }

  const parishScope = await fetchDashboardRequestParishionerScope(supabase as SupabaseClient, {
    activeParishId: parishId,
  })
  if (!parishScope.ok) {
    return {
      ok: false,
      fetchFailed: Boolean(parishScope.technicalDetail),
      error: parishScope.userMessage,
    }
  }

  const { data, error } = await supabase
    .from('requests')
    .select(REPORT_REQUEST_FIELDS)
    .in('parishioner_id', parishScope.parishionerIds)
    .order('created_at', { ascending: false })

  if (error || !data) {
    logReportLoadError('requests', error ?? new Error('Request rows were unavailable.'))
    return { ok: false, fetchFailed: true, error: 'Reports could not be loaded.' }
  }

  const requests = data.map((row) => ({
    ...row,
    request_type: requestTypeFromRow(row as { request_type?: unknown }),
  }))
  const idsByType = {
    funeral: requests
      .filter((request) => request.request_type === 'funeral')
      .map((request) => String(request.id)),
    wedding: requests
      .filter((request) => request.request_type === 'wedding')
      .map((request) => String(request.id)),
    ocia: requests
      .filter((request) => request.request_type === 'ocia')
      .map((request) => String(request.id)),
  }

  const [funeralResult, weddingResult, ociaResult] = await Promise.all([
    loadScheduleDetails(
      supabase,
      'funeral_request_details',
      'confirmed_service_at',
      idsByType.funeral,
    ),
    loadScheduleDetails(
      supabase,
      'wedding_request_details',
      'confirmed_ceremony_at',
      idsByType.wedding,
    ),
    loadScheduleDetails(
      supabase,
      'ocia_request_details',
      'confirmed_session_at',
      idsByType.ocia,
    ),
  ])

  const warnings = [funeralResult.warning, weddingResult.warning, ociaResult.warning].filter(
    (warning): warning is string => Boolean(warning),
  )
  const uniqueWarnings = [...new Set(warnings)]

  const scheduleMaps = {
    funeral: new Map(
      funeralResult.rows.map((row) => [String(row.request_id), row] as const),
    ),
    wedding: new Map(
      weddingResult.rows.map((row) => [String(row.request_id), row] as const),
    ),
    ocia: new Map(ociaResult.rows.map((row) => [String(row.request_id), row] as const)),
  }

  const requestsWithSchedule = requests.map((request) => ({
    ...request,
    funeral_detail:
      request.request_type === 'funeral'
        ? scheduleMaps.funeral.get(String(request.id)) ?? null
        : null,
    wedding_detail:
      request.request_type === 'wedding'
        ? scheduleMaps.wedding.get(String(request.id)) ?? null
        : null,
    ocia_detail:
      request.request_type === 'ocia'
        ? scheduleMaps.ocia.get(String(request.id)) ?? null
        : null,
  }))

  return {
    ok: true,
    summary: {
      requestAnalytics: buildRequestAnalytics(requestsWithSchedule),
      parishInsights: buildParishInsights(requestsWithSchedule, now),
      staffWorkloadRows: buildStaffWorkloadRows(requestsWithSchedule, now),
    },
    warnings: uniqueWarnings,
  }
}

export const dashboardReportsSummaryLoaderTestInternals = {
  REPORT_REQUEST_FIELDS,
}
