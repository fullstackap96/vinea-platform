import { needsAttentionEligible } from '@/lib/needsAttention'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { hasConfirmedSchedule } from '@/lib/requestConfirmedSchedule'

function scheduleTimeMs(request: {
  request_type?: string | null
  confirmed_baptism_date?: unknown
  funeral_detail?: { confirmed_service_at?: unknown } | null
  wedding_detail?: { confirmed_ceremony_at?: unknown } | null
  ocia_detail?: { confirmed_session_at?: unknown } | null
}): number | null {
  const t = String(request.request_type || 'baptism').toLowerCase()
  let raw: unknown
  if (t === 'funeral') raw = request.funeral_detail?.confirmed_service_at
  else if (t === 'wedding') raw = request.wedding_detail?.confirmed_ceremony_at
  else if (t === 'ocia') raw = request.ocia_detail?.confirmed_session_at
  else raw = request.confirmed_baptism_date
  if (raw == null || String(raw).trim() === '') return null
  const ms = new Date(String(raw)).getTime()
  return Number.isNaN(ms) ? null : ms
}

/** Open requests with a confirmed date/time on or after local calendar start of `now`. */
export function countUpcomingScheduledEvents(
  requests: readonly unknown[],
  now: Date = new Date()
): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  let n = 0
  for (const r of requests) {
    const row = r as { status?: unknown }
    if (String(row.status ?? '').trim() === 'complete') continue
    if (!hasConfirmedSchedule(row as Parameters<typeof hasConfirmedSchedule>[0])) continue
    const ms = scheduleTimeMs(row as Parameters<typeof scheduleTimeMs>[0])
    if (ms === null) continue
    if (ms >= startOfToday) n++
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
    actionRequired: requests.filter((r) => needsAttentionEligible(r as Parameters<typeof needsAttentionEligible>[0])).length,
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
