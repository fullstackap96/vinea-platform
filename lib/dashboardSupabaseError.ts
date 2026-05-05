import type { PostgrestError } from '@supabase/supabase-js'

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

function errorMessage(error: unknown): string {
  if (error == null) return ''
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message ?? '')
  }
  return String(error)
}

function postgrestCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined
  const c = (error as PostgrestError).code
  return c != null ? String(c) : undefined
}

/**
 * Missing or unknown-to-PostgREST columns: Postgres messages, schema-cache text,
 * or PostgREST `PGRST204` / Postgres `42703`.
 */
export function isLikelyMissingColumnError(error: unknown): boolean {
  const code = postgrestCode(error)
  if (code === 'PGRST204' || code === '42703') return true

  const msg = errorMessage(error).toLowerCase()
  if (!msg) return false
  return (
    (msg.includes('column') && msg.includes('does not exist')) ||
    (msg.includes('could not find') && msg.includes('column')) ||
    msg.includes('schema cache')
  )
}

/** Multi-line detail for developer-only UI when a dashboard load fails. */
export function formatDashboardTechnicalError(error: unknown): string {
  const msg = errorMessage(error)
  const code = postgrestCode(error)
  const details =
    typeof error === 'object' &&
    error !== null &&
    'details' in error &&
    (error as PostgrestError).details != null
      ? String((error as PostgrestError).details)
      : undefined
  const hint =
    typeof error === 'object' &&
    error !== null &&
    'hint' in error &&
    (error as PostgrestError).hint != null
      ? String((error as PostgrestError).hint)
      : undefined
  const lines = [
    msg && `message: ${msg}`,
    code && `code: ${code}`,
    details && `details: ${details}`,
    hint && `hint: ${hint}`,
  ].filter(Boolean) as string[]
  return lines.length > 0 ? lines.join('\n') : String(error)
}

/**
 * Structured Supabase / load errors for the staff dashboard (client only).
 * Emits to the console in development only; production relies on in-app error UI.
 */
export function logDashboardQueryError(context: string, error: unknown): void {
  if (!isDev) return
  const msg = errorMessage(error)
  const code = postgrestCode(error)
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

  console.error(`[dashboard] ${context}`, {
    message: msg,
    code,
    details,
    hint,
    error,
  })
}

/** Ad-hoc dashboard / request-detail errors; development console only. */
export function devDashboardConsoleError(...args: unknown[]): void {
  if (!isDev) return
  console.error('[dashboard]', ...args)
}

export function userMessageForDashboardQueryError(
  context: string,
  error: unknown
): string {
  const msg = errorMessage(error)
  if (!msg) {
    return `Could not load ${context}. Please try again or contact support if this continues.`
  }
  if (isLikelyMissingColumnError(error)) {
    return `Could not load ${context}: the database may be missing a column the app expects. Ask an administrator to run pending Supabase migrations (or align the live schema with the app). Technical detail: ${msg}`
  }
  return `Could not load ${context}: ${msg}`
}
