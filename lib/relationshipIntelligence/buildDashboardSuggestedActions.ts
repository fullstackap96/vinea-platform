import { formatRequestType } from '@/lib/formatRequestType'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { confidenceRank } from './confidenceLabels'
import { matchPeopleForRequest } from './matchPeopleForRequest'
import { suggestCertificateForRecord } from './suggestCertificateForRecord'
import { suggestRecordForRequest } from './suggestRecordForRequest'
import type {
  DashboardSuggestedAction,
  ParishionerContact,
  PersonCandidate,
  PersonMatchSuggestion,
} from './types'
import { DASHBOARD_SUGGESTED_ACTIONS_CAP } from './types'

export function buildDashboardSuggestedActions(input: {
  requests: readonly unknown[]
  parishionersById: ReadonlyMap<string, ParishionerContact>
  people: readonly PersonCandidate[]
  householdNamesByPersonId: ReadonlyMap<string, string[]>
  requestIdsWithRecords: ReadonlySet<string>
  records: readonly {
    id: string
    record_type: unknown
    person_name: unknown
  }[]
  recordIdsWithCertificate: ReadonlySet<string>
}): DashboardSuggestedAction[] {
  const recordSuggestions: DashboardSuggestedAction[] = []
  const certificateSuggestions: DashboardSuggestedAction[] = []
  const personSuggestions: PersonMatchSuggestion[] = []

  for (const raw of input.requests) {
    const r = raw as {
      id?: unknown
      status?: unknown
      request_type?: unknown
      person_id?: unknown
      parishioner_id?: unknown
    }
    const requestId = String(r.id ?? '').trim()
    if (!requestId) continue

    const recordSuggestion = suggestRecordForRequest({
      requestId,
      status: r.status,
      request_type: r.request_type,
      requestIdsWithRecords: input.requestIdsWithRecords,
    })
    if (recordSuggestion) {
      recordSuggestions.push(recordSuggestion)
    }

    const parishionerId =
      r.parishioner_id != null ? String(r.parishioner_id).trim() : ''
    const parishioner = parishionerId
      ? input.parishionersById.get(parishionerId) ?? null
      : null

    const personId = r.person_id != null ? String(r.person_id).trim() : null

    const matches = matchPeopleForRequest({
      requestId,
      requestPersonId: personId,
      parishioner,
      people: input.people,
      householdNamesByPersonId: input.householdNamesByPersonId,
    })

    for (const match of matches) {
      if (match.confidence === 'certain' || match.confidence === 'high') {
        const requestTypeLabel = formatRequestType(requestTypeFromRow(r))
        personSuggestions.push({
          ...match,
          reason: `${requestTypeLabel} request — ${match.reason.toLowerCase()}`,
        })
      }
    }
  }

  for (const record of input.records) {
    const cert = suggestCertificateForRecord({
      recordId: record.id,
      record_type: record.record_type,
      person_name: record.person_name,
      hasCertificateEvent: input.recordIdsWithCertificate.has(record.id),
    })
    if (cert) certificateSuggestions.push(cert)
  }

  personSuggestions.sort(
    (a, b) =>
      confidenceRank(a.confidence) - confidenceRank(b.confidence) ||
      a.personDisplayName.localeCompare(b.personDisplayName)
  )

  const merged: DashboardSuggestedAction[] = [
    ...recordSuggestions,
    ...certificateSuggestions,
    ...personSuggestions,
  ]

  return merged.slice(0, DASHBOARD_SUGGESTED_ACTIONS_CAP)
}
