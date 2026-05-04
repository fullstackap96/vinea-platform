/** Max names stored per directory (staff or priests). */
export const PARISH_DIRECTORY_MAX_NAMES = 80

/** Max characters per name line. */
export const PARISH_DIRECTORY_MAX_NAME_LEN = 120

/**
 * Normalizes a JSON column from Postgres into a clean list of display names.
 */
export function directoryFromJsonColumn(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const s = item.trim().slice(0, PARISH_DIRECTORY_MAX_NAME_LEN)
    if (!s) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= PARISH_DIRECTORY_MAX_NAMES) break
  }
  return out
}

/**
 * Converts a textarea (one name per line) into a list suitable for JSON storage.
 */
export function directoryFromMultilineText(text: string): string[] {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim().slice(0, PARISH_DIRECTORY_MAX_NAME_LEN))
    .filter(Boolean)
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const key = line.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(line)
    if (out.length >= PARISH_DIRECTORY_MAX_NAMES) break
  }
  return out
}

export function directoryToMultilineText(names: string[]): string {
  return directoryFromJsonColumn(names).join('\n')
}
