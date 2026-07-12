import { REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE } from './requestDocuments'

export const familyPortalDocumentUploadGenericMessage =
  'Could not upload document. Please try again, or contact the parish office if this keeps happening.'

const safeFamilyPortalDocumentMessages = new Set([
  'This upload link is invalid or expired.',
  'Choose a document request from the list.',
  'Choose a document to upload.',
  'Documents must be 10 MB or smaller.',
  'Could not upload document.',
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
])

export function safeFamilyPortalDocumentUploadMessage(error: unknown): string {
  const message =
    typeof error === 'string'
      ? error.trim()
      : error instanceof Error
        ? error.message.trim()
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? '').trim()
          : ''

  if (safeFamilyPortalDocumentMessages.has(message)) {
    return message
  }

  return familyPortalDocumentUploadGenericMessage
}
