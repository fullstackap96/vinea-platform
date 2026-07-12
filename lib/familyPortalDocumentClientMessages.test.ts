import { describe, expect, it } from 'vitest'
import { REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE } from './requestDocuments'
import {
  familyPortalDocumentUploadGenericMessage,
  safeFamilyPortalDocumentUploadMessage,
} from './familyPortalDocumentClientMessages'

describe('safeFamilyPortalDocumentUploadMessage', () => {
  it('preserves known safe family-facing validation messages', () => {
    for (const message of [
      'This upload link is invalid or expired.',
      'Choose a document request from the list.',
      'Choose a document to upload.',
      'Documents must be 10 MB or smaller.',
      'Could not upload document.',
      REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
    ]) {
      expect(safeFamilyPortalDocumentUploadMessage(message)).toBe(message)
    }
  })

  it('replaces unknown browser or provider details with generic family guidance', () => {
    const message = safeFamilyPortalDocumentUploadMessage(
      new Error(
        'storage failed for family@example.com with Bearer token_123 at postgresql://postgres:pw@db.example.supabase.co/postgres',
      ),
    )

    expect(message).toBe(familyPortalDocumentUploadGenericMessage)
    expect(message).not.toContain('family@example.com')
    expect(message).not.toContain('token_123')
    expect(message).not.toContain('postgresql://')
  })
})
