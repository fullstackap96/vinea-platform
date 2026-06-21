import { describe, expect, it } from 'vitest'
import { redactFamilyPortalDocuments } from './familyPortalSafety'
import type { RequestDocument } from './requestDocuments'

const baseDocument: RequestDocument = {
  id: 'doc-1',
  request_id: 'req-1',
  workflow_step_id: 'step-family',
  document_type: 'Birth certificate',
  original_filename: 'birth.pdf',
  content_type: 'application/pdf',
  file_size_bytes: 1024,
  status: 'pending_review',
  uploaded_by_email: 'secretary@example.test',
  reviewed_by_email: 'pastor@example.test',
  reviewed_at: null,
  review_note: 'Internal review note',
  created_at: '2026-06-21T12:00:00Z',
}

describe('familyPortalSafety', () => {
  it('only returns documents tied to family-facing steps and redacts staff fields', () => {
    const result = redactFamilyPortalDocuments(
      [
        baseDocument,
        { ...baseDocument, id: 'doc-2', workflow_step_id: 'staff-step' },
        { ...baseDocument, id: 'doc-3', workflow_step_id: null },
      ],
      ['step-family']
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'doc-1',
      workflow_step_id: 'step-family',
      uploaded_by_email: null,
      reviewed_by_email: null,
      review_note: null,
    })
  })
})
