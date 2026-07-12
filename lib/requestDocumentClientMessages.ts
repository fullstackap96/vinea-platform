import { REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE } from './requestDocuments'

export type RequestDocumentClientAction =
  | 'loadDocuments'
  | 'uploadDocument'
  | 'reviewDocument'
  | 'openDocument'
  | 'openDocumentPopupBlocked'
  | 'createFamilyUploadLink'

export const requestDocumentClientFailureMessages: Record<RequestDocumentClientAction, string> = {
  loadDocuments: 'Could not load request documents. Please refresh the page and try again.',
  uploadDocument: 'Could not upload the document. Please try again.',
  reviewDocument: 'Could not save the document review. Please try again.',
  openDocument: 'Could not open the document securely. Please try again.',
  openDocumentPopupBlocked:
    'Your browser blocked the document window. Allow popups for Vinea and try again.',
  createFamilyUploadLink:
    'Could not create the family upload link. Please try again before sharing a link.',
}

const REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE =
  'Family document portal links are not configured yet. Apply the family portal token migration before creating upload links.'

const safeRequestDocumentClientMessages = new Set([
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
  REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE,
])

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error.trim()
  if (error instanceof Error) return error.message.trim()
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '').trim()
  }
  return ''
}

export function requestDocumentClientFailureMessage(
  action: RequestDocumentClientAction,
  error?: unknown
): string {
  const message = extractErrorMessage(error)
  if (safeRequestDocumentClientMessages.has(message)) return message
  return requestDocumentClientFailureMessages[action]
}
