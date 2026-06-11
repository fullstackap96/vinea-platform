export function normalizeEmail(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function normalizePhone(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function normalizeFullName(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}
