import { formatRequestType } from '@/lib/formatRequestType'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { isRecordCreatableRequestType, requestTypeToRecordType } from './requestTypeToRecordType'
import type { RecordCreationSuggestion } from './types'

export function suggestRecordForRequest(input: {
  requestId: string
  status: unknown
  request_type: unknown
  requestIdsWithRecords: ReadonlySet<string>
}): RecordCreationSuggestion | null {
  const requestId = String(input.requestId).trim()
  if (!requestId) return null

  if (String(input.status ?? '').trim() !== 'complete') return null

  const requestType = requestTypeFromRow({ request_type: input.request_type })
  if (!isRecordCreatableRequestType(requestType)) return null

  if (input.requestIdsWithRecords.has(requestId)) return null

  const recordType = requestTypeToRecordType(requestType)
  if (!recordType) return null

  return {
    kind: 'record_creation',
    requestId,
    requestType,
    recordType,
    label: `${formatRequestType(requestType)} request — create register entry`,
  }
}
