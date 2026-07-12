import { safeDashboardHref } from '@/lib/safeDashboardHref'
import type { GlobalSearchGroupedResults, GlobalSearchResultItem } from './types'

export type GlobalSearchResponse = {
  query: string
  results: GlobalSearchGroupedResults
  totalCount: number
  errorMessage: string
  warningMessage: string
}

const GROUP_KEYS = ['requests', 'people', 'households', 'records'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseResultItem(value: unknown): GlobalSearchResultItem | null {
  if (!isRecord(value)) return null
  const href = safeDashboardHref(typeof value.href === 'string' ? value.href : null)
  if (
    typeof value.title !== 'string' ||
    typeof value.typeLabel !== 'string' ||
    typeof value.context !== 'string' ||
    !href
  ) {
    return null
  }
  return {
    title: value.title,
    typeLabel: value.typeLabel,
    context: value.context,
    href,
  }
}

export function parseGlobalSearchResponse(value: unknown): GlobalSearchResponse | null {
  if (!isRecord(value) || !isRecord(value.results)) return null
  if (
    typeof value.query !== 'string' ||
    !Number.isInteger(value.totalCount) ||
    Number(value.totalCount) < 0 ||
    typeof value.errorMessage !== 'string' ||
    typeof value.warningMessage !== 'string'
  ) {
    return null
  }

  const results = {} as GlobalSearchGroupedResults
  for (const group of GROUP_KEYS) {
    const rawItems = value.results[group]
    if (!Array.isArray(rawItems) || rawItems.length > 100) return null
    const parsedItems: GlobalSearchResultItem[] = []
    for (const rawItem of rawItems) {
      const item = parseResultItem(rawItem)
      if (!item) return null
      parsedItems.push(item)
    }
    results[group] = parsedItems
  }

  return {
    query: value.query,
    results,
    totalCount: Number(value.totalCount),
    errorMessage: value.errorMessage,
    warningMessage: value.warningMessage,
  }
}
