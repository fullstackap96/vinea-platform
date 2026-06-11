import type { SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export const SACRAMENTAL_RECORD_TYPES: readonly SacramentalRecordType[] = [
  'baptism',
  'marriage',
  'funeral',
  'confirmation',
  'first_communion',
  'ocia',
  'rcic',
] as const

export function isSacramentalRecordType(value: unknown): value is SacramentalRecordType {
  const s = String(value ?? '').trim().toLowerCase()
  return (SACRAMENTAL_RECORD_TYPES as readonly string[]).includes(s)
}
