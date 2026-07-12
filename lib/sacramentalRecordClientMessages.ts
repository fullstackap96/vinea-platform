export type SacramentalRecordClientAction =
  | 'loadPrefill'
  | 'createRecord'
  | 'updateRecord'
  | 'updatePersonLink'

const fallbackMessages: Record<SacramentalRecordClientAction, string> = {
  loadPrefill:
    'Could not safely prepare this request for record prefill. Open the request and try again.',
  createRecord: 'Could not create the sacramental record. Please review the form and try again.',
  updateRecord: 'Could not update the sacramental record. Please refresh and try again.',
  updatePersonLink:
    'The record was updated, but Vinea could not update the linked person. Please refresh before trying again.',
}

const sharedAllowedMessages = new Set([
  'Parish membership is required before writing parish data.',
  'Parish is not configured.',
  'You are not authorized to write to this parish.',
  'Could not resolve parish context for this write.',
])

const allowedMessages: Record<SacramentalRecordClientAction, ReadonlySet<string>> = {
  loadPrefill: new Set([
    'Request not found.',
    'A sacramental record already exists for this request.',
    'Could not load the request for prefill.',
    'Could not safely prepare this request for record prefill. Please open the request and try again.',
    'Could not verify whether a record already exists for this request. Please refresh before saving.',
  ]),
  createRecord: new Set([
    ...sharedAllowedMessages,
    'Person name is required.',
    'Please choose a record type.',
    'Request not found for the selected parish.',
    'A sacramental record already exists for this request.',
    'Person not found for the selected parish.',
    'Could not verify the linked request or person.',
    'Could not create record.',
  ]),
  updateRecord: new Set([
    ...sharedAllowedMessages,
    'Missing record id.',
    'Person name is required.',
    'Please choose a record type.',
    'Could not update record.',
    'Record not found for the selected parish.',
  ]),
  updatePersonLink: new Set([
    ...sharedAllowedMessages,
    'Missing record id.',
    'Could not verify selected person.',
    'Person not found for the selected parish.',
    'Could not update person link. Refresh and try again.',
    'Record not found for the selected parish.',
  ]),
}

function normalizeMessage(error: unknown): string {
  return typeof error === 'string' ? error.trim() : ''
}

export function sacramentalRecordClientErrorMessage(
  action: SacramentalRecordClientAction,
  error: unknown,
): string {
  const message = normalizeMessage(error)
  if (message === 'Unauthorized') {
    return 'Your staff session is no longer active. Sign in and try again.'
  }

  return allowedMessages[action].has(message) ? message : fallbackMessages[action]
}

export function sacramentalRecordClientFallbackMessage(
  action: SacramentalRecordClientAction,
): string {
  return fallbackMessages[action]
}
