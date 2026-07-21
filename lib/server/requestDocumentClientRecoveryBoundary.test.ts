import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'requests',
  '[id]',
  '_components',
  'RequestDocumentsSection.tsx',
)
const component = readFileSync(componentPath, 'utf8')
const requestDetail = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', '[id]', 'page.tsx'),
  'utf8',
)

function handler(name: string, nextName: string): string {
  const start = component.indexOf(`async function ${name}`)
  const end = component.indexOf(`\n  async function ${nextName}`, start)
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)
  return component.slice(start, end)
}

describe('request document client recovery boundary', () => {
  it('keeps list reads latest-request-wins, abortable, request-scoped, and bounded', () => {
    const start = component.indexOf('const loadDocuments = useCallback')
    const end = component.indexOf('\n\n  useEffect(', start)
    const load = component.slice(start, end)

    expect(load).toContain('const loadSequence = ++documentLoadSequenceRef.current')
    expect(load).toContain('documentLoadAbortRef.current?.abort()')
    expect(load).toContain('signal: controller.signal')
    expect(load).toContain('REQUEST_DOCUMENT_READ_TIMEOUT_MS')
    expect(load).toContain('if (!isLatestLoad()) return')
    expect(load).toContain('document.request_id === requestId')
    expect(load.indexOf('if (!isLatestLoad()) return')).toBeLessThan(load.indexOf('setDocuments('))
    expect(component).toContain('documentLoadSequenceRef.current += 1')
    expect(component).toContain('documentLoadAbortRef.current?.abort()')
    expect(requestDetail).toContain('<RequestDocumentsSection\n              key={routeId}')
  })

  it('bounds every document operation and distinguishes uncertain writes', () => {
    const upload = handler('uploadDocument', 'reviewDocument')
    const review = handler('reviewDocument', 'openDocument')
    const open = handler('openDocument', 'createPortalLink')
    const portal = component.slice(component.indexOf('async function createPortalLink'))

    expect(upload).toContain('AbortSignal.timeout(REQUEST_DOCUMENT_UPLOAD_TIMEOUT_MS)')
    expect(upload).toContain("'uploadDocumentUnconfirmed'")
    expect(review).toContain('AbortSignal.timeout(REQUEST_DOCUMENT_WRITE_TIMEOUT_MS)')
    expect(review).toContain("'reviewDocumentUnconfirmed'")
    expect(open).toContain('AbortSignal.timeout(REQUEST_DOCUMENT_READ_TIMEOUT_MS)')
    expect(portal).toContain('AbortSignal.timeout(REQUEST_DOCUMENT_WRITE_TIMEOUT_MS)')
    expect(portal).toContain("'createFamilyUploadLinkUnconfirmed'")
    expect(component).toContain(
      'const [mutationRequiresRefresh, setMutationRequiresRefresh] = useState(false)',
    )
    expect(component.match(/setMutationRequiresRefresh\(true\)/g)?.length).toBeGreaterThanOrEqual(6)
    expect(component).toContain(
      'uploading || Boolean(reviewingId) || creatingPortalLink || mutationRequiresRefresh',
    )
  })

  it('preserves confirmed success while refreshing the scoped document list', () => {
    const upload = handler('uploadDocument', 'reviewDocument')
    const review = handler('reviewDocument', 'openDocument')

    expect(upload).toContain("setMessage('Document uploaded for staff review.')")
    expect(upload).toContain('const refreshed = await loadDocuments({ preserveMessage: true })')
    expect(upload.indexOf('if (!refreshed)')).toBeLessThan(
      upload.indexOf("setMessage('Document uploaded for staff review.')"),
    )
    expect(review).toContain("setMessage(status === 'approved' ? 'Document approved.' : 'Document rejected.')")
    expect(review).toContain('const refreshed = await loadDocuments({ preserveMessage: true })')
    expect(review.indexOf('if (!refreshed)')).toBeLessThan(
      review.indexOf("setMessage(status === 'approved' ? 'Document approved.' : 'Document rejected.')"),
    )
  })

  it('keeps a confirmed family link visible when clipboard copying fails', () => {
    const portal = component.slice(component.indexOf('async function createPortalLink'))

    expect(portal).toContain('setPortalLink(payload.url)')
    expect(portal).toContain('await navigator.clipboard.writeText(payload.url)')
    expect(portal).toContain("setMessage('Family upload link created. Copy it below.')")
    expect(portal.indexOf('setPortalLink(payload.url)')).toBeLessThan(
      portal.indexOf('await navigator.clipboard.writeText(payload.url)'),
    )
  })

  it('keeps confirmed server rejection retryable while malformed success fails closed', () => {
    const upload = handler('uploadDocument', 'reviewDocument')
    const review = handler('reviewDocument', 'openDocument')
    const portal = component.slice(component.indexOf('async function createPortalLink'))

    for (const [body, malformedSuccessCheck] of [
      [upload, 'if (payload?.ok !== true)'],
      [review, 'if (payload?.ok !== true)'],
      [
        portal,
        "if (payload?.ok !== true || typeof payload.url !== 'string' || !payload.url.trim())",
      ],
    ] as const) {
      const rejectionIndex = body.indexOf('if (!response.ok)')
      const malformedIndex = body.indexOf(malformedSuccessCheck)

      expect(rejectionIndex).toBeGreaterThan(-1)
      expect(malformedIndex).toBeGreaterThan(rejectionIndex)
      expect(body.slice(rejectionIndex, malformedIndex)).not.toContain(
        'setMutationRequiresRefresh(true)',
      )
      expect(body.slice(malformedIndex)).toContain('setMutationRequiresRefresh(true)')
    }
  })

  it('documents the exact non-production boundary without stronger claims', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'REQUEST_DOCUMENT_CLIENT_RECOVERY_BOUNDARY_20260712.md'),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_DOCUMENT_CLIENT_RECOVERY_BOUNDARY_IMPLEMENTED_20260712',
      'latest-request-wins',
      'confirm before retrying',
      'not durable server idempotency',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
