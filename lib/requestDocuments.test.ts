import { describe, expect, it } from 'vitest'
import {
  formatRequestDocumentFileSize,
  isRequestDocumentsTableMissing,
  normalizeRequestDocumentRow,
  normalizeRequestDocumentStatus,
  REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE,
  REQUEST_DOCUMENT_UPLOAD_TYPE_MESSAGE,
  requestDocumentStatusLabel,
  safeRequestDocumentFilename,
  validateRequestDocumentUpload,
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

  it('detects missing request document storage migrations', () => {
    expect(
      isRequestDocumentsTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.request_documents' in the schema cache",
      })
    ).toBe(true)

    expect(
      isRequestDocumentsTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.people' in the schema cache",
      })
    ).toBe(false)
  })

  it.each([
    {
      filename: 'certificate.pdf',
      declaredContentType: 'application/pdf',
      bytes: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31],
      contentType: 'application/pdf',
    },
    {
      filename: 'photo.jpg',
      declaredContentType: 'image/jpeg',
      bytes: [0xff, 0xd8, 0xff, 0xe0],
      contentType: 'image/jpeg',
    },
    {
      filename: 'scan.png',
      declaredContentType: 'application/octet-stream',
      bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      contentType: 'image/png',
    },
  ])('accepts a signature-matched $contentType document', (fixture) => {
    expect(
      validateRequestDocumentUpload({
        ...fixture,
        bytes: Uint8Array.from(fixture.bytes),
      }),
    ).toEqual({ ok: true, contentType: fixture.contentType })
  })

  it('validates the original extension even when the stored filename will be shortened', () => {
    expect(
      validateRequestDocumentUpload({
        filename: `${'long-name-'.repeat(20)}certificate.pdf`,
        declaredContentType: 'application/pdf',
        bytes: Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]),
      }),
    ).toEqual({ ok: true, contentType: 'application/pdf' })
  })

  it.each([
    ['script.html', 'text/html', [0x3c, 0x68, 0x74, 0x6d, 0x6c]],
    ['document.pdf', 'application/pdf', [0x3c, 0x68, 0x74, 0x6d, 0x6c]],
    ['document.pdf', 'image/png', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['document.png', 'image/png', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['document', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d]],
  ])('rejects unsupported or mismatched upload %#', (filename, declaredContentType, bytes) => {
    expect(
      validateRequestDocumentUpload({
        filename,
        declaredContentType,
        bytes: Uint8Array.from(bytes as number[]),
      }),
    ).toEqual({ ok: false, error: REQUEST_DOCUMENT_UPLOAD_TYPE_MESSAGE })
  })

  it('keeps the browser file picker aligned with the server allowlist', () => {
    expect(REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE).toBe(
      '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png',
    )
  })
})
