export function normalizeStaffEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

export function staffAllowlistEmailsFromEnv(): string[] {
  return String(process.env.STAFF_ALLOWLIST_EMAILS ?? '')
    .split(',')
    .map(normalizeStaffEmail)
    .filter(Boolean)
}

export function isStaffEmailAllowlisted(email: unknown): boolean {
  const normalized = normalizeStaffEmail(email)
  if (!normalized) return false
  return staffAllowlistEmailsFromEnv().includes(normalized)
}

export function staffAccessNotConfiguredAllowsDev(): boolean {
  return process.env.NODE_ENV !== 'production' && staffAllowlistEmailsFromEnv().length === 0
}
