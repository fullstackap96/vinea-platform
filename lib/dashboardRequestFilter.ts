import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import type { RequestWaitingOnValue } from '@/lib/requestWaitingOn'
import { REQUEST_WAITING_ON_VALUES } from '@/lib/requestWaitingOn'

export type DashboardWaitingOnFilter = 'all' | 'none' | RequestWaitingOnValue

export type DashboardRowFilters = {
  status: string
  requestType: string
  staffAssignee: string
  priestAssignee: string
  overdueOnly: boolean
  unassignedOnly: boolean
  waitingOn: DashboardWaitingOnFilter
  submittedFrom: string
  submittedTo: string
}

export const DASHBOARD_REQUEST_TYPE_VALUES = [
  'baptism',
  'funeral',
  'wedding',
  'ocia',
  'join_parish',
] as const

export function defaultDashboardRowFilters(): DashboardRowFilters {
  return {
    status: 'all',
    requestType: 'all',
    staffAssignee: '',
    priestAssignee: '',
    overdueOnly: false,
    unassignedOnly: false,
    waitingOn: 'all',
    submittedFrom: '',
    submittedTo: '',
  }
}

function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
}

/** Start of local calendar day for `YYYY-MM-DD` from a date input. */
export function parseSubmittedDateStart(isoDate: string): number | null {
  const s = String(isoDate ?? '').trim()
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

/** End of local calendar day for `YYYY-MM-DD` from a date input. */
export function parseSubmittedDateEnd(isoDate: string): number | null {
  const s = String(isoDate ?? '').trim()
  if (!s) return null
  const d = new Date(`${s}T23:59:59.999`)
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

export function requestMatchesDashboardRowFilters(
  request: Record<string, unknown>,
  filters: DashboardRowFilters,
  now: Date = new Date()
): boolean {
  const st = String(request.status ?? '').trim()
  if (filters.status !== 'all' && st !== filters.status) return false

  const rt = String(request.request_type ?? '')
    .trim()
    .toLowerCase()
  if (filters.requestType !== 'all' && rt !== filters.requestType.toLowerCase()) return false

  if (
    filters.overdueOnly &&
    !isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  ) {
    return false
  }

  if (filters.unassignedOnly) {
    const staff = String(request.assigned_staff_name ?? '').trim()
    const priest = String(request.assigned_priest_name ?? '').trim()
    const deacon = String(request.assigned_deacon_name ?? '').trim()
    if (staff || priest || deacon) return false
  }

  if (filters.staffAssignee) {
    if (norm(request.assigned_staff_name) !== norm(filters.staffAssignee)) return false
  }
  if (filters.priestAssignee) {
    if (norm(request.assigned_priest_name) !== norm(filters.priestAssignee)) return false
  }

  if (filters.waitingOn === 'none') {
    if (String(request.waiting_on ?? '').trim()) return false
  } else if (filters.waitingOn !== 'all') {
    if (String(request.waiting_on ?? '').trim() !== filters.waitingOn) return false
  }

  const created = request.created_at
  const ct =
    created == null || created === ''
      ? null
      : new Date(String(created)).getTime()
  const fromT = parseSubmittedDateStart(filters.submittedFrom)
  const toT = parseSubmittedDateEnd(filters.submittedTo)
  if (fromT !== null) {
    if (ct === null || Number.isNaN(ct) || ct < fromT) return false
  }
  if (toT !== null) {
    if (ct === null || Number.isNaN(ct) || ct > toT) return false
  }

  return true
}

export function countActiveDashboardFilters(f: DashboardRowFilters): number {
  let n = 0
  if (f.status !== 'all') n++
  if (f.requestType !== 'all') n++
  if (f.staffAssignee) n++
  if (f.priestAssignee) n++
  if (f.overdueOnly) n++
  if (f.unassignedOnly) n++
  if (f.waitingOn !== 'all') n++
  if (f.submittedFrom.trim()) n++
  if (f.submittedTo.trim()) n++
  return n
}

export function isDashboardWaitingOnFilter(
  value: string
): value is DashboardWaitingOnFilter {
  if (value === 'all' || value === 'none') return true
  return (REQUEST_WAITING_ON_VALUES as readonly string[]).includes(value)
}
