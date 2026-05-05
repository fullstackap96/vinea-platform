import { isOpenUpcomingScheduledRequest } from '@/lib/dashboardSummaryCounts'
import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { isStaffUnassignedForAttention, needsAttentionEligible } from '@/lib/needsAttention'

export const STAFF_WORKLOAD_UNASSIGNED_LABEL = 'Unassigned'

export type StaffWorkloadRow = {
  /** Display bucket (trimmed assignee name or {@link STAFF_WORKLOAD_UNASSIGNED_LABEL}). */
  staffDisplay: string
  openRequests: number
  overdueFollowUps: number
  actionRequired: number
  upcomingScheduled: number
}

type MutableCounts = {
  openRequests: number
  overdueFollowUps: number
  actionRequired: number
  upcomingScheduled: number
}

function emptyCounts(): MutableCounts {
  return {
    openRequests: 0,
    overdueFollowUps: 0,
    actionRequired: 0,
    upcomingScheduled: 0,
  }
}

function staffDisplayKey(assignedStaffName: unknown): string {
  if (isStaffUnassignedForAttention(assignedStaffName)) {
    return STAFF_WORKLOAD_UNASSIGNED_LABEL
  }
  return String(assignedStaffName ?? '').trim()
}

function sortWorkloadRows(rows: StaffWorkloadRow[]): StaffWorkloadRow[] {
  return [...rows].sort((a, b) => {
    if (a.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL) return 1
    if (b.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL) return -1
    return a.staffDisplay.localeCompare(b.staffDisplay, undefined, {
      sensitivity: 'base',
    })
  })
}

/**
 * Aggregates open requests by `assigned_staff_name` for dashboard workload.
 * Uses the same rules as the command summary (`needsAttention`, overdue follow-up, upcoming confirmed schedule).
 */
export function buildStaffWorkloadRows(
  requests: readonly unknown[],
  now: Date = new Date()
): StaffWorkloadRow[] {
  const map = new Map<string, MutableCounts>()

  for (const raw of requests) {
    const r = raw as {
      status?: unknown
      assigned_staff_name?: unknown
      next_follow_up_date?: unknown
      created_at?: unknown
    }
    if (String(r.status ?? '').trim() === 'complete') continue

    const key = staffDisplayKey(r.assigned_staff_name)
    let c = map.get(key)
    if (!c) {
      c = emptyCounts()
      map.set(key, c)
    }

    c.openRequests += 1
    if (
      isNextFollowUpOverdue(r.next_follow_up_date, r.status, now)
    ) {
      c.overdueFollowUps += 1
    }
    if (needsAttentionEligible(r, now)) {
      c.actionRequired += 1
    }
    if (isOpenUpcomingScheduledRequest(raw, now)) {
      c.upcomingScheduled += 1
    }
  }

  const rows: StaffWorkloadRow[] = []
  for (const [staffDisplay, c] of map) {
    rows.push({
      staffDisplay,
      openRequests: c.openRequests,
      overdueFollowUps: c.overdueFollowUps,
      actionRequired: c.actionRequired,
      upcomingScheduled: c.upcomingScheduled,
    })
  }
  return sortWorkloadRows(rows)
}
