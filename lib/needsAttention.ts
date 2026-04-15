import {
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
} from '@/lib/nextFollowUpDate'

/** Minimal request shape for eligibility / priority (dashboard rows). */
export type NeedsAttentionRequestLike = {
  status?: unknown
  next_follow_up_date?: unknown
  assigned_staff_name?: unknown
  created_at?: unknown
}

/** Staff slot counts as unassigned when empty or explicitly marked "unassigned". */
export function isStaffUnassignedForAttention(assignedStaffName: unknown): boolean {
  const s = String(assignedStaffName ?? '').trim()
  if (!s) return true
  if (s.toLowerCase() === 'unassigned') return true
  return false
}

/**
 * Inclusion: not complete, and (follow-up overdue OR due today OR staff unassigned).
 */
export function needsAttentionEligible(request: NeedsAttentionRequestLike): boolean {
  if (String(request.status ?? '').trim() === 'complete') return false
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status)
  const dueToday = isNextFollowUpDueToday(request.next_follow_up_date, request.status)
  const unassigned = isStaffUnassignedForAttention(request.assigned_staff_name)
  return overdue || dueToday || unassigned
}

/**
 * Priority rank for sorting (lower = act first).
 * Order: overdue+unassigned → overdue → due today+unassigned → due today → unassigned only.
 */
export function needsAttentionPriorityRank(
  request: NeedsAttentionRequestLike,
  now: Date = new Date()
): number {
  const unassigned = isStaffUnassignedForAttention(request.assigned_staff_name)
  const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  const dueToday = isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)
  if (overdue && unassigned) return 0
  if (overdue) return 1
  if (dueToday && unassigned) return 2
  if (dueToday) return 3
  if (unassigned) return 4
  return 99
}

function createdAtTime(value: unknown): number {
  const t = new Date(String(value ?? '')).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Sort for Needs Attention: priority rank asc, then created_at desc. */
export function compareNeedsAttention(
  a: NeedsAttentionRequestLike,
  b: NeedsAttentionRequestLike,
  now?: Date
): number {
  const nowDate = now ?? new Date()
  const ra = needsAttentionPriorityRank(a, nowDate)
  const rb = needsAttentionPriorityRank(b, nowDate)
  if (ra !== rb) return ra - rb
  return createdAtTime(b.created_at) - createdAtTime(a.created_at)
}

export function sortNeedsAttentionRequests<T extends NeedsAttentionRequestLike>(
  list: T[],
  now?: Date
): T[] {
  const copy = [...list]
  copy.sort((a, b) => compareNeedsAttention(a, b, now))
  return copy
}
