/** Human-readable label for optional assignee fields (DB null/blank → Unassigned). */
export function assignmentDisplayLabel(value: unknown): string {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : 'Unassigned'
}
