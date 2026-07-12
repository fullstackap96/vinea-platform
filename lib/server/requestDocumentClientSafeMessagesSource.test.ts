import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const sourcePath = 'app/dashboard/requests/[id]/_components/RequestDocumentsSection.tsx'

function readSource(): string {
  return readFileSync(join(repoRoot, sourcePath), 'utf8')
}

describe('request document client safe messages', () => {
  it('routes staff document panel failures through curated client messages', () => {
    const source = readSource()

    expect(source).toContain(
      "import { requestDocumentClientFailureMessage } from '@/lib/requestDocumentClientMessages'"
    )

    for (const action of [
      'loadDocuments',
      'uploadDocument',
      'reviewDocument',
      'openDocument',
      'openDocumentPopupBlocked',
      'createFamilyUploadLink',
    ]) {
      expect(source).toContain(`requestDocumentClientFailureMessage('${action}'`)
    }
  })

  it('does not render raw API or exception messages for document failures', () => {
    const source = readSource()

    for (const unsafePattern of [
      "throw new Error(payload?.error || 'Could not load documents.')",
      "throw new Error(payload?.error || 'Could not upload document.')",
      "throw new Error(payload?.error || 'Could not review document.')",
      "throw new Error(payload?.error || 'Could not open document.')",
      "throw new Error(payload?.error || 'Could not create family upload link.')",
      "setMessage(error instanceof Error ? error.message : 'Could not load documents.')",
      "setMessage(error instanceof Error ? error.message : 'Could not upload document.')",
      "setMessage(error instanceof Error ? error.message : 'Could not review document.')",
      "setMessage(error instanceof Error ? error.message : 'Could not open document.')",
      "setMessage(error instanceof Error ? error.message : 'Could not create family upload link.')",
    ]) {
      expect(source).not.toContain(unsafePattern)
    }

    expect(source).toContain("const documentWindow = window.open('', '_blank')")
    expect(source).toContain('documentWindow.opener = null')
    expect(source).toContain('if (!documentWindow)')
    expect(source).toContain("requestDocumentClientFailureMessage('openDocumentPopupBlocked')")
    expect(source).toContain('documentWindow.location.replace(payload.url)')
    expect(source).toContain('documentWindow.close()')
    expect(source.indexOf("const documentWindow = window.open('', '_blank')")).toBeLessThan(
      source.indexOf('fetch(`/api/requests/${requestId}/documents/${documentId}`)')
    )
    expect(source).toContain('navigator.clipboard.writeText(payload.url)')
  })
})
