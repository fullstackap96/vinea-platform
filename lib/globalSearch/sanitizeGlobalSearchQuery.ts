import { GLOBAL_SEARCH_MIN_LENGTH } from './constants'

/** Strip ilike wildcards and require at least 2 characters. */
export function sanitizeGlobalSearchQuery(query: string): string | null {
  const sanitized = query.trim().replace(/[%_]/g, '')
  if (sanitized.length < GLOBAL_SEARCH_MIN_LENGTH) return null
  return sanitized
}

export function toIlikePattern(sanitized: string): string {
  return `%${sanitized}%`
}
