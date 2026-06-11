import type { CertificateSuggestion } from './types'

export function suggestCertificateForRecord(input: {
  recordId: string
  record_type: unknown
  person_name: unknown
  hasCertificateEvent: boolean
}): CertificateSuggestion | null {
  const recordId = String(input.recordId).trim()
  if (!recordId) return null

  if (String(input.record_type ?? '').trim().toLowerCase() !== 'baptism') return null
  if (input.hasCertificateEvent) return null

  const personName = String(input.person_name ?? '').trim() || 'Baptism record'

  return {
    kind: 'certificate',
    recordId,
    personName,
    label: `Generate baptism certificate for ${personName}`,
  }
}

export function recordIdsWithCertificateEvent(
  events: readonly { sacramental_record_id: string; action: string }[]
): Set<string> {
  const ids = new Set<string>()
  for (const event of events) {
    if (String(event.action ?? '').trim().toLowerCase() !== 'certificate_generated') {
      continue
    }
    const recordId = String(event.sacramental_record_id ?? '').trim()
    if (recordId) ids.add(recordId)
  }
  return ids
}
