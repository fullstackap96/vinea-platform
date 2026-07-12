import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'
import type { DashboardSuggestedAction } from '@/lib/relationshipIntelligence/types'
import {
  loadDailyOperatingSystemSignals,
} from '@/lib/server/loadDailyOperatingSystemSignals'
import type { DailyOperatingSystemSignals } from '@/lib/dailyOperatingSystemSignals'
import { logServerError } from '@/lib/server/safeErrorLogging'
import type { DashboardWorkHubRequest } from '@/lib/dashboardWorkHubDtos'

type ReadOnlySupabaseClient = Pick<SupabaseClient, 'from' | 'rpc'>

export type DashboardWorkHubLoadResult =
  | {
      ok: true
      requests: DashboardWorkHubRequest[]
      suggestedActions: DashboardSuggestedAction[]
      signals: DailyOperatingSystemSignals
      warnings: string[]
    }
  | {
      ok: false
      fetchFailed: boolean
      error: string
    }

export async function loadDashboardWorkHub(
  supabase: ReadOnlySupabaseClient,
  activeParishId: string,
): Promise<DashboardWorkHubLoadResult> {
  const parishId = activeParishId.trim()
  if (!parishId) {
    return {
      ok: false,
      fetchFailed: false,
      error: 'The Daily Work Hub is unavailable for this parish.',
    }
  }

  const [requestResult, signalResult] = await Promise.all([
    loadDashboardRequests(supabase as SupabaseClient, {
      activeParishId: parishId,
    }),
    loadDailyOperatingSystemSignals(supabase, parishId),
  ])
  if (!requestResult.ok) {
    return {
      ok: false,
      fetchFailed: requestResult.fetchFailed,
      error: requestResult.userMessage,
    }
  }

  const warnings = [...requestResult.softWarnings, ...signalResult.warnings]
  let suggestedActions: DashboardSuggestedAction[] = []

  try {
    suggestedActions = await loadDashboardSuggestedActions(
      supabase as SupabaseClient,
      requestResult.requests,
      parishId,
    )
  } catch (error: unknown) {
    logServerError('[dashboard-work-hub] suggested actions load failed', error, {
      route: '/api/dashboard/work-hub',
    })
    warnings.push('Relationship suggestions are temporarily unavailable.')
  }

  return {
    ok: true,
    requests: requestResult.requests,
    suggestedActions,
    signals: signalResult.signals,
    warnings: [...new Set(warnings)],
  }
}
