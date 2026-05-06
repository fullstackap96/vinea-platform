import { formatRequestType } from '@/lib/formatRequestType'
import { isStaffUnassignedForAttention } from '@/lib/needsAttention'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type ParishInsights = {
  totalOpenRequests: number
  /** All requests (any status) with `created_at` in the current calendar week (Monday start, local). */
  submittedThisWeek: number
  /** Mean age in whole days for open requests with a valid `created_at`; null if none. */
  averageOpenAgeDays: number | null
  /** Display label for the most frequent `request_type` among open requests; null if none. */
  mostCommonRequestTypeLabel: string | null
  overdueFollowUps: number
  /** Open requests with no staff assignee (empty or “unassigned”), same rule as needs-attention. */
  unassignedOpenRequests: number
}

/** Start of the calendar week containing `now`, Monday 00:00:00 local. */
export function startOfCalendarWeekMondayLocal(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dow = d.getDay()
  const offsetToMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + offsetToMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

function createdAtMs(value: unknown): number | null {
  if (value == null) return null
  const t = new Date(String(value)).getTime()
  return Number.isNaN(t) ? null : t
}

function isOpenRequest(row: { status?: unknown }): boolean {
  return String(row.status ?? '').trim() !== 'complete'
}

/**
 * Parish-level stats from the loaded request list (no extra queries).
 */
export function buildParishInsights(
  requests: readonly unknown[],
  now: Date = new Date()
): ParishInsights {
  const weekStart = startOfCalendarWeekMondayLocal(now).getTime()
  const nowMs = now.getTime()

  let totalOpenRequests = 0
  let submittedThisWeek = 0
  let overdueFollowUps = 0
  let unassignedOpenRequests = 0
  let ageSumDays = 0
  let ageCount = 0
  const typeCounts = new Map<string, number>()

  for (const raw of requests) {
    const r = raw as {
      status?: unknown
      created_at?: unknown
      request_type?: unknown
      next_follow_up_date?: unknown
      assigned_staff_name?: unknown
    }

    const createdMs = createdAtMs(r.created_at)
    if (createdMs !== null && createdMs >= weekStart && createdMs <= nowMs) {
      submittedThisWeek += 1
    }

    if (!isOpenRequest(r)) continue

    totalOpenRequests += 1

    if (isNextFollowUpOverdue(r.next_follow_up_date, r.status, now)) {
      overdueFollowUps += 1
    }

    if (isStaffUnassignedForAttention(r.assigned_staff_name)) {
      unassignedOpenRequests += 1
    }

    if (createdMs !== null) {
      const ageDays = (nowMs - createdMs) / (24 * 60 * 60 * 1000)
      if (ageDays >= 0) {
        ageSumDays += ageDays
        ageCount += 1
      }
    }

    const typeKey = requestTypeFromRow(r)
    typeCounts.set(typeKey, (typeCounts.get(typeKey) ?? 0) + 1)
  }

  let mostCommonRequestTypeLabel: string | null = null
  let maxTypeCount = 0
  for (const c of typeCounts.values()) {
    maxTypeCount = Math.max(maxTypeCount, c)
  }
  if (maxTypeCount > 0) {
    const tiedKeys = [...typeCounts.entries()]
      .filter(([, c]) => c === maxTypeCount)
      .map(([k]) => k)
    tiedKeys.sort((a, b) =>
      formatRequestType(a).localeCompare(formatRequestType(b), undefined, {
        sensitivity: 'base',
      })
    )
    mostCommonRequestTypeLabel = formatRequestType(tiedKeys[0]) || null
  }

  const averageOpenAgeDays =
    ageCount > 0 ? Math.round((ageSumDays / ageCount) * 10) / 10 : null

  return {
    totalOpenRequests,
    submittedThisWeek,
    averageOpenAgeDays,
    mostCommonRequestTypeLabel,
    overdueFollowUps,
    unassignedOpenRequests,
  }
}
