import React from 'react'

/** Empty / unknown values that should read as “needs attention”. */
const PLACEHOLDER_TEXT = new Set([
  'Unassigned',
  'Not set',
  '—',
  '(No event link saved.)',
  'No Calendar Event Created',
  'No email on file',
  'No draft saved yet',
])

export function isMissingPlaceholderText(value: string): boolean {
  const t = value.trim()
  if (PLACEHOLDER_TEXT.has(t)) return true
  if (t.toLowerCase() === 'no calendar event') return true
  return false
}

export const missingValueClassName =
  'inline-flex items-center gap-1.5 align-middle text-sm font-medium text-amber-600'

export function MissingValue({ children }: { children: React.ReactNode }) {
  return (
    <span className={missingValueClassName}>
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
        aria-hidden
      />
      <span>{children}</span>
    </span>
  )
}

export function maybeMissingValue(text: string): React.ReactNode {
  return isMissingPlaceholderText(text) ? <MissingValue>{text}</MissingValue> : text
}

/** ISO datetime or null → formatted string or amber “Not set”. */
export function FormattedDateTimeOrMissing({ value }: { value: unknown }) {
  if (value == null || value === '') {
    return <MissingValue>Not set</MissingValue>
  }
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) {
    return <MissingValue>Not set</MissingValue>
  }
  return <span>{d.toLocaleString()}</span>
}
