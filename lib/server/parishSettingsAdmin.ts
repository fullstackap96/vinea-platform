import 'server-only'

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/** Comma-separated `PARISH_ADMIN_EMAILS`; server-only, never sent to the client. */
export function parishAdminEmailAllowlist(): Set<string> {
  const raw = String(process.env.PARISH_ADMIN_EMAILS ?? '')
  const set = new Set<string>()
  for (const part of raw.split(',')) {
    const email = normalizeEmail(part)
    if (email) set.add(email)
  }
  return set
}

export function isParishSettingsAdminEmail(userEmail: string | undefined | null): boolean {
  const normalized = normalizeEmail(String(userEmail ?? ''))
  if (!normalized) return false
  return parishAdminEmailAllowlist().has(normalized)
}
