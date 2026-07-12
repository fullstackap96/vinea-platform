import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'

export const PEOPLE_LIST_FALLBACK_HREF = '/dashboard/people'
export const HOUSEHOLDS_LIST_FALLBACK_HREF = '/dashboard/households'
export const RECORDS_LIST_FALLBACK_HREF = '/dashboard/records'
export const INTENTIONS_LIST_FALLBACK_HREF = '/dashboard/intentions'

function normalizedId(value: unknown): string {
  return String(value ?? '').trim()
}

export function personDetailHref(personId: unknown): string {
  const id = normalizedId(personId)
  if (!id) return PEOPLE_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/people/${encodeURIComponent(id)}`,
    PEOPLE_LIST_FALLBACK_HREF
  )
}

export function personEditHref(personId: unknown): string {
  const id = normalizedId(personId)
  if (!id) return PEOPLE_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/people/${encodeURIComponent(id)}/edit`,
    PEOPLE_LIST_FALLBACK_HREF
  )
}

export function householdDetailHref(householdId: unknown): string {
  const id = normalizedId(householdId)
  if (!id) return HOUSEHOLDS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/households/${encodeURIComponent(id)}`,
    HOUSEHOLDS_LIST_FALLBACK_HREF
  )
}

export function householdEditHref(householdId: unknown): string {
  const id = normalizedId(householdId)
  if (!id) return HOUSEHOLDS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/households/${encodeURIComponent(id)}/edit`,
    HOUSEHOLDS_LIST_FALLBACK_HREF
  )
}

export function recordDetailHref(recordId: unknown): string {
  const id = normalizedId(recordId)
  if (!id) return RECORDS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/records/${encodeURIComponent(id)}`,
    RECORDS_LIST_FALLBACK_HREF
  )
}

export function recordEditHref(recordId: unknown): string {
  const id = normalizedId(recordId)
  if (!id) return RECORDS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/records/${encodeURIComponent(id)}/edit`,
    RECORDS_LIST_FALLBACK_HREF
  )
}

export function massIntentionDetailHref(intentionId: unknown): string {
  const id = normalizedId(intentionId)
  if (!id) return INTENTIONS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/intentions/${encodeURIComponent(id)}`,
    INTENTIONS_LIST_FALLBACK_HREF
  )
}

export function massIntentionEditHref(intentionId: unknown): string {
  const id = normalizedId(intentionId)
  if (!id) return INTENTIONS_LIST_FALLBACK_HREF
  return safeDashboardHrefOrFallback(
    `/dashboard/intentions/${encodeURIComponent(id)}/edit`,
    INTENTIONS_LIST_FALLBACK_HREF
  )
}
