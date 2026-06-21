import { describe, expect, it } from 'vitest'
import {
  formatRequestDocumentFileSize,
  normalizeRequestDocumentRow,
  normalizeRequestDocumentStatus,
  requestDocumentStatusLabel,
  safeRequestDocumentFilename,
} from './requestDocuments'

describe('requestDocuments', () => {
  it('sanitizes storage filenames defensively', () => {
    expect(safeRequestDocumentFilename('C:\\uploads\\Birth Certificate (copy).pdf')).toBe(
      'Birth-Certificate-copy-.pdf'
    )
    expect(safeRequestDocumentFilename('../../')).toBe('document')
  })

  it('normalizes statuses and labels', () => {
    expect(normalizeRequestDocumentStatus('approved')).toBe('approved')
    expect(normalizeRequestDocumentStatus('unknown')).toBe('pending_review')
    expect(requestDocumentStatusLabel('rejected')).toBe('Rejected')
  })

  it('normalizes rows and formats file sizes', () => {
    expect(
      normalizeRequestDocumentRow({
        id: 'doc-1',
        request_id: 'req-1',
        workflow_step_id: '',
        original_filename: 'form.pdf',
        status: 'approved',
        file_size_bytes: '1536',
        created_at: '2026-06-21T12:00:00Z',
      })
    ).toMatchObject({
      id: 'doc-1',
      request_id: 'req-1',
      workflow_step_id: null,
      status: 'approved',
      file_size_bytes: 1536,
    })
    expect(formatRequestDocumentFileSize(1536)).toBe('1.5 KB')
    expect(formatRequestDocumentFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
