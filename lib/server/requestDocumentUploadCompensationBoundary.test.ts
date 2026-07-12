import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const routes = [
  'app/api/requests/[id]/documents/route.ts',
  'app/api/family/request-portal/[token]/documents/route.ts',
]

describe('request document upload compensation boundary', () => {
  for (const routePath of routes) {
    it(`${routePath} confirms storage and document-row persistence`, () => {
      const source = read(routePath)
      const uploadIndex = source.indexOf('.upload(storagePath, buffer')
      const uploadConfirmationIndex = source.indexOf(
        'uploaded?.path !== storagePath',
        uploadIndex,
      )
      const insertIndex = source.indexOf(".from('request_documents')", uploadConfirmationIndex)
      const insertConfirmationIndex = source.indexOf('!inserted?.id', insertIndex)
      const cleanupIndex = source.indexOf(
        'cleanupFailedRequestDocumentUpload({',
        insertConfirmationIndex,
      )
      const auditIndex = source.indexOf('await writeAuditEvent({', cleanupIndex)
      const successIndex = source.indexOf('return NextResponse.json({', auditIndex)

      expect(uploadIndex).toBeGreaterThanOrEqual(0)
      expect(uploadConfirmationIndex).toBeGreaterThan(uploadIndex)
      expect(insertIndex).toBeGreaterThan(uploadConfirmationIndex)
      expect(source.slice(insertIndex, insertConfirmationIndex)).toMatch(
        /\.insert\([\s\S]*?\.select\([\s\S]*?\.single\(\)/,
      )
      expect(insertConfirmationIndex).toBeGreaterThan(insertIndex)
      expect(cleanupIndex).toBeGreaterThan(insertConfirmationIndex)
      expect(auditIndex).toBeGreaterThan(cleanupIndex)
      expect(successIndex).toBeGreaterThan(auditIndex)
      expect(source).toContain('storageCleanupComplete: cleanup.ok')
      expect(source).not.toContain(
        'await admin.storage.from(REQUEST_DOCUMENTS_BUCKET).remove([storagePath])',
      )
    })
  }

  it('keeps cleanup logs free of private object identifiers', () => {
    const helper = read('lib/server/requestDocumentUploadCleanup.ts')
    const logBlock = helper.slice(
      helper.indexOf("logServerError(\n        '[request-document-upload]"),
      helper.indexOf('return { ok: false', helper.indexOf("logServerError(\n        '[request-document-upload]")),
    )

    expect(logBlock).toContain('cleanupRequestedObjectCount')
    expect(logBlock).toContain('removedObjectCount')
    expect(logBlock).not.toContain('storagePath:')
    expect(logBlock).not.toContain('bucket:')
  })

  it('documents checked compensation and the remaining non-transactional boundary', () => {
    const doc = read('docs/REQUEST_DOCUMENT_UPLOAD_COMPENSATION_BOUNDARY_20260711.md')

    for (const phrase of [
      'positively confirms the uploaded object path',
      'exactly one removed object',
      'staff upload',
      'family portal upload',
      'not a storage/database transaction',
      'No production or shared-QA access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
