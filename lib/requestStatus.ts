export const REQUEST_STATUS_VALUES = [
  'new',
  'in_progress',
  'waiting_on_family',
  'complete',
] as const

export type RequestStatus = (typeof REQUEST_STATUS_VALUES)[number]

/** Human-readable labels for stored `requests.status` values (DB values unchanged). */
export const REQUEST_STATUS_LABELS: Readonly<Record<RequestStatus, string>> = {
  new: 'New Request',
  in_progress: 'In Progress',
  waiting_on_family: 'Waiting on Family',
  complete: 'Completed',
} as const

/** Short explanations for status tooltips (paired with {@link REQUEST_STATUS_LABELS}). */
export const REQUEST_STATUS_DESCRIPTIONS: Readonly<Record<RequestStatus, string>> = {
  new: 'This request has been submitted and needs to be reviewed.',
  in_progress: 'This request is currently being handled by staff.',
  waiting_on_family:
    'Waiting for the family to provide information or respond.',
  complete: 'This request has been fully handled and is complete.',
} as const

export function isRequestStatus(value: unknown): value is RequestStatus {
  return (REQUEST_STATUS_VALUES as readonly string[]).includes(String(value))
}

/** Display label for a request status (raw DB string in, friendly label out). */
export function getStatusLabel(status: unknown): string {
  const s = String(status ?? '').trim()
  if (isRequestStatus(s)) return REQUEST_STATUS_LABELS[s]
  return s.length > 0 ? s : 'Unknown'
}

/** Tooltip / helper copy for a known request status; `null` when unknown. */
export function getStatusDescription(status: unknown): string | null {
  const s = String(status ?? '').trim()
  if (isRequestStatus(s)) return REQUEST_STATUS_DESCRIPTIONS[s]
  return null
}

/** Same as {@link getStatusLabel}; kept for existing call sites. */
export function formatRequestStatus(status: unknown): string {
  return getStatusLabel(status)
}

/**
 * Layout shared by all request status badges (rounded pill, consistent size).
 * Distinct from `chipBase` used for type chips and queue tags.
 */
export const REQUEST_STATUS_BADGE_BASE =
  'inline-flex max-w-full items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold leading-tight tracking-tight'

/** Softer fills + strong text for contrast; border tint stays low-chroma. */
export function getRequestStatusClasses(status: unknown): string {
  const s = String(status ?? '').trim()
  switch (s) {
    case 'new':
      return 'border-sky-200/70 bg-sky-100/70 text-sky-950'
    case 'in_progress':
      return 'border-amber-200/70 bg-amber-100/65 text-amber-950'
    case 'waiting_on_family':
      return 'border-violet-200/65 bg-violet-100/60 text-violet-950'
    case 'complete':
      return 'border-emerald-200/70 bg-emerald-100/65 text-emerald-950'
    default:
      return 'border-gray-200/90 bg-gray-100 text-gray-900'
  }
}

export function requestStatusBadgeClasses(status: unknown): string {
  return `${REQUEST_STATUS_BADGE_BASE} ${getRequestStatusClasses(status)}`
}

/** Sort order when ordering dashboard rows by status (lower = earlier). */
export function requestStatusRankForSort(status: unknown): number {
  switch (String(status ?? '').trim()) {
    case 'new':
      return 0
    case 'in_progress':
      return 1
    case 'waiting_on_family':
      return 2
    case 'complete':
      return 3
    default:
      return 99
  }
}

/** Values and human labels for status picker controls (labels match {@link getStatusLabel}). */
export const REQUEST_STATUS_SEGMENTS: ReadonlyArray<{
  value: RequestStatus
  label: string
}> = REQUEST_STATUS_VALUES.map((value) => ({
  value,
  label: getStatusLabel(value),
}))
