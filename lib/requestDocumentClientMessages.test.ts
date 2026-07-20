import { describe, expect, it } from 'vitest'
import {
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
  REQUEST_DOCUMENT_UPLOAD_TYPE_MESSAGE,
} from './requestDocuments'
import {
  requestDocumentClientFailureMessage,
  requestDocumentClientFailureMessages,
  type RequestDocumentClientAction,
} from './requestDocumentClientMessages'

const actions: RequestDocumentClientAction[] = [
  'loadDocuments',
  'uploadDocument',
  'uploadDocumentUnconfirmed',
  'reviewDocument',
  'reviewDocumentUnconfirmed',
  'openDocument',
  'openDocumentPopupBlocked',
  'createFamilyUploadLink',
  'createFamilyUploadLinkUnconfirmed',
]

describe('request document client messages', () => {
  it('returns action-specific safe fallback messages for unsafe errors', () => {
    for (const action of actions) {
      const message = requestDocumentClientFailureMessage(
        action,
        new Error('postgres://secret@db.example.supabase.co signed-url storage/object.pdf')
      )

      expect(message).toBe(requestDocumentClientFailureMessages[action])
      expect(message).toMatch(/\.$/)
      expect(message).not.toContain('postgres://')
      expect(message).not.toContain('signed-url')
      expect(message).not.toContain('storage/object.pdf')
    }
  })

  it('preserves approved setup guidance returned by the API', () => {
    expect(
      requestDocumentClientFailureMessage('uploadDocument', REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE)
    ).toBe(REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE)

    expect(
      requestDocumentClientFailureMessage(
        'createFamilyUploadLink',
        'Family document portal links are not configured yet. Apply the family portal token migration before creating upload links.'
      )
    ).toBe(
      'Family document portal links are not configured yet. Apply the family portal token migration before creating upload links.'
    )

    expect(
      requestDocumentClientFailureMessage('uploadDocument', REQUEST_DOCUMENT_UPLOAD_TYPE_MESSAGE),
    ).toBe(REQUEST_DOCUMENT_UPLOAD_TYPE_MESSAGE)
  })

  it('provides specific safe guidance when the browser blocks the document window', () => {
    expect(requestDocumentClientFailureMessage('openDocumentPopupBlocked')).toBe(
      'Your browser blocked the document window. Allow popups for Vinea and try again.'
    )
  })

  it('gives uncertain-write recovery guidance without private or technical detail', () => {
    expect(requestDocumentClientFailureMessage('uploadDocumentUnconfirmed')).toContain(
      'Refresh the document list before trying again'
    )
    expect(requestDocumentClientFailureMessage('reviewDocumentUnconfirmed')).toContain(
      'Refresh the document list before saving it again'
    )
    expect(requestDocumentClientFailureMessage('createFamilyUploadLinkUnconfirmed')).toContain(
      'Check the Audit Log before creating another link'
    )
  })
})
