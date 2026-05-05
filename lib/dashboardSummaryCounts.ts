import { needsAttentionEligible } from '@/lib/needsAttention'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { hasConfirmedSchedule } from '@/lib/requestConfirmedSchedule'

export type DashboardScheduleRow = {
  request_type?: string | null
  confirmed_baptism_date?: unknown
  funeral_detail?: { confirmed_service_at?: unknown } | null
  wedding_detail?: { confirmed_ceremony_at?: unknown } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
}

/** Instant for the request-type-specific confirmed date/time, or null. */
export function getConfirmedScheduleInstantMs(
  request: DashboardScheduleRow
): number | null {
  const t = requestTypeFromRow(request)
  let raw: unknown
  if (t === 'funeral') raw = request.funeral_detail?.confirmed_service_at
  else if (t === 'wedding') raw = request.wedding_detail?.confirmed_ceremony_at
  else if (t === 'ocia') raw = request.ocia_detail?.confirmed_session_at
  else raw = request.confirmed_baptism_date
  if (raw == null || String(raw).trim() === '') return null
  const ms = new Date(String(raw)).getTime()
  return Number.isNaN(ms) ? null : ms
}

/** Non-complete request with a confirmed time on or after local start of `now`. */
export function isOpenUpcomingScheduledRequest(
  request: unknown,
  now: Date = new Date()
): boolean {
  const row = request as { status?: unknown }
  if (String(row.status ?? '').trim() === 'complete') return false
  if (!hasConfirmedSchedule(row as Parameters<typeof hasConfirmedSchedule>[0])) return false
  const ms = getConfirmedScheduleInstantMs(row as DashboardScheduleRow)
  if (ms === null) return false
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return ms >= startOfToday
}

/** Open requests with a confirmed date/time on or after local calendar start of `now`. */
export function countUpcomingScheduledEvents(
  requests: readonly unknown[],
  now: Date = new Date()
): number {
  let n = 0
  for (const r of requests) {
    if (isOpenUpcomingScheduledRequest(r, now)) n++
  }
  return n
}

export type DashboardCommandSummaryCounts = {
  newRequests: number
  actionRequired: number
  overdueFollowUps: number
  upcomingScheduled: number
}

export function getDashboardCommandSummaryCounts(
  requests: readonly unknown[],
  now: Date = new Date()
): DashboardCommandSummaryCounts {
  return {
    newRequests: requests.filter((r) => (r as { status?: unknown }).status === 'new').length,
    actionRequired: requests.filter((r) =>
      needsAttentionEligible(r as Parameters<typeof needsAttentionEligible>[0], now)
    ).length,
    overdueFollowUps: requests.filter((r) =>
      isNextFollowUpOverdue(
        (r as { next_follow_up_date?: unknown }).next_follow_up_date,
        (r as { status?: unknown }).status,
        now
      )
    ).length,
    upcomingScheduled: countUpcomingScheduledEvents(requests, now),
  }
}
