import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('request document content safety boundary', () => {
  it('keeps both upload routes on the shared pre-storage validator', () => {
    for (const path of [
      'app/api/requests/[id]/documents/route.ts',
      'app/api/family/request-portal/[token]/documents/route.ts',
    ]) {
      const source = read(path)
      const validationIndex = source.indexOf('validateRequestDocumentUpload({')
      const canonicalTypeIndex = source.indexOf(
        'const contentType = uploadType.contentType',
        validationIndex,
      )
      const uploadIndex = source.indexOf('.upload(storagePath, buffer', canonicalTypeIndex)

      expect(validationIndex).toBeGreaterThan(-1)
      expect(canonicalTypeIndex).toBeGreaterThan(validationIndex)
      expect(uploadIndex).toBeGreaterThan(canonicalTypeIndex)
      expect(source).not.toContain("text(file.type) || 'application/octet-stream'")
    }
  })

  it('keeps staff signed access attachment-only with a sanitized filename', () => {
    const source = read('app/api/requests/[id]/documents/[documentId]/route.ts')
    const sanitizeIndex = source.indexOf(
      'safeRequestDocumentFilename(document.original_filename)',
    )
    const signedUrlIndex = source.indexOf(
      '.createSignedUrl(String(document.storage_path), 60, { download: downloadFilename })',
      sanitizeIndex,
    )

    expect(sanitizeIndex).toBeGreaterThan(-1)
    expect(signedUrlIndex).toBeGreaterThan(sanitizeIndex)
  })

  it('documents the exact security claim and remaining limitations', () => {
    const evidence = read('docs/REQUEST_DOCUMENT_CONTENT_SAFETY_BOUNDARY_20260720.md')

    for (const phrase of [
      'REQUEST_DOCUMENT_CONTENT_SAFETY_BOUNDARY_IMPLEMENTED_20260720',
      'PDF, JPEG, and PNG',
      'before any storage upload',
      'attachment download',
      'not antivirus or malware scanning',
      'Existing stored documents are not retroactively rescanned',
      'No migration, operational RLS change',
      'production rollout remains separately controlled',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})

