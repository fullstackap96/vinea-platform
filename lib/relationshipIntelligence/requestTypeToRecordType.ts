import type { SacramentalRecordType } from '@/lib/types/sacramentalRecords'

const MAPPABLE: Record<string, SacramentalRecordType> = {
  baptism: 'baptism',
  wedding: 'marriage',
  funeral: 'funeral',
  ocia: 'ocia',
}

export function requestTypeToRecordType(
  requestType: unknown
): SacramentalRecordType | null {
  const key = String(requestType ?? '')
    .trim()
    .toLowerCase()
  return MAPPABLE[key] ?? null
}

export function isRecordCreatableRequestType(requestType: unknown): boolean {
  return requestTypeToRecordType(requestType) != null
}
