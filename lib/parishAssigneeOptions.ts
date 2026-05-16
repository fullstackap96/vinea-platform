import { directoryFromJsonColumn } from '@/lib/parishDirectory'

/**
 * Dropdown options for assignee fields: parish directory names plus any current
 * values that should remain selectable even if removed from settings.
 */
export function mergeAssigneeDirectoryOptions(
  directoryNames: unknown,
  ...preserveValues: unknown[]
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const add = (raw: unknown) => {
    const s = String(raw ?? '').trim()
    if (!s) return
    const key = s.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(s)
  }

  for (const name of directoryFromJsonColumn(directoryNames)) {
    add(name)
  }
  for (const value of preserveValues) {
    add(value)
  }

  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}
