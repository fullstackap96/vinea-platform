export const FRIENDLY_DATE_PASSED = 'Please choose a future date. This date has already passed.'
export const FRIENDLY_DATETIME_PASSED =
  'Please choose a future date and time before saving.'
export const FRIENDLY_SUGGESTED_DATE_ONLY =
  'Suggested dates must be today or later.'

function safeParseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function toDatetimeLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Convenience: `datetime-local` min for "today or later" (00:00 local). */
export function minTodayDatetimeLocal(): string {
  return toDatetimeLocalInputValue(startOfLocalDay(new Date()))
}

/** Convenience: `datetime-local` min for "now or later" (local time, minutes precision). */
export function minNowDatetimeLocal(): string {
  return toDatetimeLocalInputValue(new Date())
}

export function isPastSuggestedDate(value: string): boolean {
  if (!value) return false
  const d = safeParseDate(value)
  if (!d) return false
  return startOfLocalDay(d).getTime() < startOfLocalDay(new Date()).getTime()
}

export function isPastConfirmedIso(confirmedIso: string | null | undefined): boolean {
  if (!confirmedIso) return false
  const d = safeParseDate(String(confirmedIso))
  if (!d) return false
  return d.getTime() < Date.now()
}

/**
 * For "date-only" validation: treat the input's local calendar day as the date.
 * Rule: must be today or later (today allowed).
 *
 * Note: UI currently uses `datetime-local`, so we validate by local date only.
 */
export function validateSuggestedDateNotPast(value: string): string | null {
  if (!value) return null
  const d = safeParseDate(value)
  if (!d) return FRIENDLY_SUGGESTED_DATE_ONLY

  const inputDay = startOfLocalDay(d).getTime()
  const todayDay = startOfLocalDay(new Date()).getTime()
  if (inputDay < todayDay) return FRIENDLY_SUGGESTED_DATE_ONLY
  return null
}

/**
 * For confirmed date/time fields:
 * Rule: must be now or later (present allowed).
 */
export function validateConfirmedDateTimeNotPast(value: string): string | null {
  if (!value) return null
  const d = safeParseDate(value)
  if (!d) return FRIENDLY_DATETIME_PASSED

  if (d.getTime() < Date.now()) return FRIENDLY_DATETIME_PASSED
  return null
}

