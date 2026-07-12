import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const routePath = 'app/api/family/request-portal/[token]/documents/route.ts'
const docPath = 'docs/FAMILY_PORTAL_DOCUMENT_UPLOAD_SAFE_ERROR_LOGGING_20260706.md'

function readSource(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('family portal document upload safe error logging', () => {
  it('returns generic upload failures while preserving validation and storage setup guidance', () => {
    const source = readSource(routePath)

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[family-portal-documents] upload storage failed'")
    expect(source).toContain("logServerError('[family-portal-documents] upload insert failed'")
    expect(source).toContain("logServerError('[family-portal-documents] upload failed'")
    expect(source).toContain("logServerError('[family-portal-documents] rate limit check failed'")
    expect(source).toContain("route: '/api/family/request-portal/[token]/documents'")
    expect(source).toContain('hasPortalToken: Boolean(token)')
    expect(source).toContain('hasWorkflowStepId: Boolean(workflowStepId)')
    expect(source).toContain('fileSizeBytes: file.size')
    expect(source).toContain('storageCleanupAttempted: true')
    expect(source).toContain('REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE')
    expect(source).toContain("error: 'This upload link is invalid or expired.'")
    expect(source).toContain("error: 'Choose a document request from the list.'")
    expect(source).toContain("error: 'Could not upload document.'")
    expect(source).toContain("error: 'Too many upload attempts. Please try again later.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: message')
    expect(source).not.toContain('token,')
    expect(source).not.toContain('storagePath:')
  })

  it('documents the family portal upload safe error logging boundary', () => {
    const doc = readSource(docPath)

    expect(doc).toContain('# Family Portal Document Upload Safe Error Logging - 2026-07-06')
    expect(doc).toContain('`app/api/family/request-portal/[token]/documents/route.ts`')
    expect(doc).toContain('`logServerError`')
    expect(doc).toContain('Preserved invalid or expired upload-link behavior')
    expect(doc).toContain('Preserved request-document storage setup guidance')
    expect(doc).toContain('does not log raw portal tokens, token hashes, storage paths, original filenames, or document contents')
  })
})
