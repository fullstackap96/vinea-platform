import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app',
    'family',
    'request',
    '[token]',
    'FamilyRequestDocumentsPortal.tsx',
  ),
  'utf8',
)
const messages = readFileSync(
  join(process.cwd(), 'lib', 'familyPortalDocumentClientMessages.ts'),
  'utf8',
)

function uploadHandler(): string {
  const start = source.indexOf('async function uploadDocument')
  const end = source.indexOf('\n\n  return (', start)
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('family portal document upload client recovery', () => {
  it('locks synchronously and bounds the browser request', () => {
    const upload = uploadHandler()
    const lockIndex = upload.indexOf('uploadInFlightRef.current = true')
    const fetchIndex = upload.indexOf('fetch(`/api/family/request-portal/${token}/documents`')

    expect(upload).toContain('if (uploadInFlightRef.current) return')
    expect(lockIndex).toBeGreaterThan(-1)
    expect(lockIndex).toBeLessThan(fetchIndex)
    expect(upload).toContain('signal: AbortSignal.timeout(FAMILY_PORTAL_UPLOAD_TIMEOUT_MS)')
    expect(upload).toContain('uploadInFlightRef.current = false')
  })

  it('rejects an oversized file before constructing or sending multipart data', () => {
    const upload = uploadHandler()
    const sizeIndex = upload.indexOf('file.size > REQUEST_DOCUMENT_MAX_FILE_BYTES')
    const formIndex = upload.indexOf('const formData = new FormData()')
    const fetchIndex = upload.indexOf('fetch(`/api/family/request-portal/${token}/documents`')

    expect(sizeIndex).toBeGreaterThan(-1)
    expect(sizeIndex).toBeLessThan(formIndex)
    expect(sizeIndex).toBeLessThan(fetchIndex)
    expect(upload).toContain("'Documents must be 10 MB or smaller.'")
  })

  it('freezes reviewed inputs and gives uncertain completion guidance', () => {
    const upload = uploadHandler()

    expect(source).toContain('aria-busy={uploading}')
    expect(source.match(/disabled=\{uploading\}/g)).toHaveLength(3)
    expect(upload).toContain('isFamilyPortalUploadTimeout(error)')
    expect(upload).toContain('familyPortalDocumentUploadUnconfirmedMessage')
    expect(messages).toContain('contact the parish office before trying again')
  })

  it('documents the exact boundary without claiming server idempotency', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'FAMILY_PORTAL_DOCUMENT_UPLOAD_CLIENT_RECOVERY_20260712.md'),
      'utf8',
    )

    for (const phrase of [
      'FAMILY_PORTAL_DOCUMENT_UPLOAD_CLIENT_RECOVERY_IMPLEMENTED_20260712',
      'synchronous single-flight',
      'contact the parish office before trying again',
      'not durable server idempotency',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
