import { isSacramentalRecordType } from '@/lib/sacramentalRecordConstants'

export function formatSacramentalRecordType(recordType: unknown): string {
  const t = String(recordType ?? '').trim().toLowerCase()

  if (t === 'baptism') return 'Baptism'
  if (t === 'marriage') return 'Marriage'
  if (t === 'funeral') return 'Funeral'
  if (t === 'confirmation') return 'Confirmation'
  if (t === 'first_communion') return 'First Communion'
  if (t === 'ocia') return 'OCIA'
  if (t === 'rcic') return 'RCIC'

  if (!t) return ''
  const withSpaces = t.replace(/_/g, ' ')
  return withSpaces.slice(0, 1).toUpperCase() + withSpaces.slice(1)
}

export function normalizeSacramentalRecordType(
  value: unknown,
  fallback: 'baptism' = 'baptism'
): string {
  const s = String(value ?? '').trim().toLowerCase()
  return isSacramentalRecordType(s) ? s : fallback
}
