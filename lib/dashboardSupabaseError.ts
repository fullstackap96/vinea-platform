import type { PostgrestError } from '@supabase/supabase-js'

function errorMessage(error: unknown): string {
  if (error == null) return ''
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message ?? '')
  }
  return String(error)
}

/** Postgres / PostgREST often reports missing columns this way. */
export function isLikelyMissingColumnError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    (m.includes('column') && m.includes('does not exist')) ||
    (m.includes('could not find') && m.includes('column'))
  )
}

export function logDashboardQueryError(context: string, error: unknown): void {
  const msg = errorMessage(error)
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PostgrestError).code != null
      ? (error as PostgrestError).code
      : undefined
  const details =
    typeof error === 'object' &&
    error !== null &&
    'details' in error &&
    (error as PostgrestError).details != null
      ? (error as PostgrestError).details
      : undefined
  const hint =
    typeof error === 'object' &&
    error !== null &&
    'hint' in error &&
    (error as PostgrestError).hint != null
      ? (error as PostgrestError).hint
      : undefined

  console.error(`[dashboard] ${context}`, { message: msg, code, details, hint })
}

export function userMessageForDashboardQueryError(
  context: string,
  error: unknown
): string {
  const msg = errorMessage(error)
  if (!msg) {
    return `Could not load ${context}. Please try again or contact support if this continues.`
  }
  if (isLikelyMissingColumnError(msg)) {
    return `Could not load ${context}: the database may be missing a column the app expects. Ask an administrator to run pending migrations or compare the live schema with the app. Technical detail: ${msg}`
  }
  return `Could not load ${context}: ${msg}`
}
