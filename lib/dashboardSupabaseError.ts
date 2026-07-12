import type { PostgrestError } from '@supabase/supabase-js'

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const REDACTION_PATTERNS: readonly { readonly pattern: RegExp; readonly replacement: string }[] =
  [
    {
      pattern: /postgres(?:ql)?:\/\/[^\s"'<>]+/gi,
      replacement: '[redacted database url]',
    },
    {
      pattern: /https?:\/\/[^\s"'<>]+/gi,
      replacement: '[redacted url]',
    },
    {
      pattern:
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      replacement: '[redacted id]',
    },
    {
      pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      replacement: '[redacted jwt]',
    },
    {
      pattern: /\b(?:sk|rk|pk|sess|sbp)[_-][A-Za-z0-9_-]{12,}\b/g,
      replacement: '[redacted token]',
    },
    {
      pattern: /\b(?:sk|rk|pk|sess)-[A-Za-z0-9_-]{12,}\b/g,
      replacement: '[redacted token]',
    },
    {
      pattern: /\bBearer\s+[A-Za-z0-9._-]+\b/gi,
      replacement: 'Bearer [redacted token]',
    },
    {
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      replacement: '[redacted email]',
    },
  ]

function redactDashboardErrorText(value: unknown): string {
  let text = String(value ?? '')
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    text = text.replace(pattern, replacement)
  }
  return text
}

function rawErrorMessage(error: unknown): string {
  if (error == null) return ''
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message ?? '')
  }
  return String(error)
}

function errorMessage(error: unknown): string {
  return redactDashboardErrorText(rawErrorMessage(error))
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

  const msg = rawErrorMessage(error).toLowerCase()
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
      ? redactDashboardErrorText((error as PostgrestError).details)
      : undefined
  const hint =
    typeof error === 'object' &&
    error !== null &&
    'hint' in error &&
    (error as PostgrestError).hint != null
      ? redactDashboardErrorText((error as PostgrestError).hint)
      : undefined
  const lines = [
    msg && `message: ${msg}`,
    code && `code: ${code}`,
    details && `details: ${details}`,
    hint && `hint: ${hint}`,
  ].filter(Boolean) as string[]
  return lines.length > 0 ? lines.join('\n') : redactDashboardErrorText(error)
}

function safeDashboardLogValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: redactDashboardErrorText(value.name || 'Error'),
      message: redactDashboardErrorText(value.message || 'Unexpected error'),
    }
  }

  if (typeof value === 'string') {
    return redactDashboardErrorText(value)
  }

  if (typeof value === 'object' && value !== null) {
    return {
      message: 'message' in value ? errorMessage(value) : undefined,
      code: postgrestCode(value),
      details:
        'details' in value && (value as PostgrestError).details != null
          ? redactDashboardErrorText((value as PostgrestError).details)
          : undefined,
      hint:
        'hint' in value && (value as PostgrestError).hint != null
          ? redactDashboardErrorText((value as PostgrestError).hint)
          : undefined,
    }
  }

  return value
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
      ? redactDashboardErrorText((error as PostgrestError).details)
      : undefined
  const hint =
    typeof error === 'object' &&
    error !== null &&
    'hint' in error &&
    (error as PostgrestError).hint != null
      ? redactDashboardErrorText((error as PostgrestError).hint)
      : undefined

  console.error(`[dashboard] ${context}`, {
    message: msg,
    code,
    details,
    hint,
  })
}

/** Ad-hoc dashboard / request-detail errors; development console only. */
export function devDashboardConsoleError(...args: unknown[]): void {
  if (!isDev) return
  console.error('[dashboard]', ...args.map(safeDashboardLogValue))
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
    const base = `Could not load ${context}: the database may be missing a column the app expects. Ask an administrator to run pending Supabase migrations (or align the live schema with the app).`
    return isDev ? `${base} Technical detail: ${msg}` : base
  }
  return isDev
    ? `Could not load ${context}: ${msg}`
    : `Could not load ${context}. Please try again or contact support if this continues.`
}
