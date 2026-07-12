export type RecordPrefillClientAction =
  | 'loadSourceRequest'
  | 'loadSupportingDetails'
  | 'checkExistingRecord'

const recordPrefillClientFailureMessages: Record<RecordPrefillClientAction, string> = {
  loadSourceRequest: 'Could not load the request for prefill.',
  loadSupportingDetails:
    'Could not safely prepare this request for record prefill. Please open the request and try again.',
  checkExistingRecord:
    'Could not verify whether a record already exists for this request. Please refresh before saving.',
}

export function recordPrefillClientFailureMessage(action: RecordPrefillClientAction): string {
  return recordPrefillClientFailureMessages[action]
}
