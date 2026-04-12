/** Parse DB `date` (or ISO prefix) to `YYYY-MM-DD` calendar string, or null. */
export function parseFollowUpCalendarDate(value: unknown): string | null {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null
  const d = s.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== day
  ) {
    return null
  }
  return d
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Local calendar today as `YYYY-MM-DD` (for comparisons with `date` column semantics). */
export function todayCalendarDateString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
}

export function isNextFollowUpOverdue(
  nextFollowUpDate: unknown,
  status: unknown,
  now: Date = new Date()
): boolean {
  if (String(status ?? '').trim() === 'complete') return false
  const d = parseFollowUpCalendarDate(nextFollowUpDate)
  if (!d) return false
  return d < todayCalendarDateString(now)
}

export function isNextFollowUpDueToday(
  nextFollowUpDate: unknown,
  status: unknown,
  now: Date = new Date()
): boolean {
  if (String(status ?? '').trim() === 'complete') return false
  const d = parseFollowUpCalendarDate(nextFollowUpDate)
  if (!d) return false
  return d === todayCalendarDateString(now)
}

/** Longer label for request detail view. */
export function formatNextFollowUpDateDisplay(value: unknown): string {
  const d = parseFollowUpCalendarDate(value)
  if (!d) return ''
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Shorter label for dashboard cards. */
export function formatNextFollowUpDateCompact(value: unknown): string {
  const d = parseFollowUpCalendarDate(value)
  if (!d) return ''
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Lower = sort earlier (higher attention). Used only for default created-date sorts on the dashboard.
 */
export function followUpSortPriority(
  nextFollowUpDate: unknown,
  status: unknown,
  now: Date = new Date()
): number {
  if (isNextFollowUpOverdue(nextFollowUpDate, status, now)) return 0
  if (isNextFollowUpDueToday(nextFollowUpDate, status, now)) return 1
  if (parseFollowUpCalendarDate(nextFollowUpDate)) return 2
  return 3
}
