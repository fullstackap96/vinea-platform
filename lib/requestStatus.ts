import { chipBase } from '@/lib/chipStyles'

export const REQUEST_STATUS_VALUES = [
  'new',
  'in_progress',
  'waiting_on_family',
  'complete',
] as const

export type RequestStatus = (typeof REQUEST_STATUS_VALUES)[number]

export function isRequestStatus(value: unknown): value is RequestStatus {
  return (REQUEST_STATUS_VALUES as readonly string[]).includes(String(value))
}

export function formatRequestStatus(status: unknown): string {
  const s = String(status ?? '').trim()
  switch (s) {
    case 'new':
      return 'New'
    case 'in_progress':
      return 'In Progress'
    case 'waiting_on_family':
      return 'Waiting on Family'
    case 'complete':
      return 'Complete'
    default:
      return s.length > 0 ? s : 'Unknown'
  }
}

/** Background, text, and border for a small status badge (pair with `chipBase`). */
export function getRequestStatusClasses(status: unknown): string {
  const s = String(status ?? '').trim()
  switch (s) {
    case 'new':
      return 'bg-blue-50 text-blue-900 border border-blue-200'
    case 'in_progress':
      return 'bg-amber-50 text-amber-900 border border-amber-200'
    case 'waiting_on_family':
      return 'bg-violet-50 text-violet-900 border border-violet-200'
    case 'complete':
      return 'bg-green-50 text-green-900 border border-green-200'
    default:
      return 'bg-gray-50 text-gray-800 border border-gray-200'
  }
}

export function requestStatusBadgeClasses(status: unknown): string {
  return `${chipBase} ${getRequestStatusClasses(status)}`
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

/** Values and human labels for status picker controls (labels match `formatRequestStatus`). */
export const REQUEST_STATUS_SEGMENTS: ReadonlyArray<{
  value: RequestStatus
  label: string
}> = REQUEST_STATUS_VALUES.map((value) => ({
  value,
  label: formatRequestStatus(value),
}))
