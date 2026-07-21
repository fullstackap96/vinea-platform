import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app',
    'dashboard',
    'requests',
    '[id]',
    '_components',
    'RequestDocumentsSection.tsx',
  ),
  'utf8',
)

function handler(name: string, nextName: string): string {
  const start = source.indexOf(`async function ${name}`)
  const end = source.indexOf(`\n  async function ${nextName}`, start)
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('request document mutation single-flight boundary', () => {
  it('uses one synchronous lock across upload, review, and portal-link creation', () => {
    expect(source).toContain(
      "const mutationInFlightRef = useRef<'upload' | 'review' | 'portal-link' | null>(null)",
    )

    const upload = handler('uploadDocument', 'reviewDocument')
    const review = handler('reviewDocument', 'openDocument')
    const portal = source.slice(source.indexOf('async function createPortalLink'))

    for (const [body, kind, dispatch] of [
      [upload, 'upload', 'fetch(`/api/requests/${requestId}/documents`'],
      [review, 'review', 'fetch(`/api/requests/${requestId}/documents/${documentId}`'],
      [portal, 'portal-link', 'fetch(`/api/requests/${requestId}/portal-token`'],
    ] as const) {
      expect(body).toContain('if (mutationInFlightRef.current || mutationRequiresRefresh) return')
      expect(body).toContain(`mutationInFlightRef.current = '${kind}'`)
      expect(body.indexOf(`mutationInFlightRef.current = '${kind}'`)).toBeLessThan(
        body.indexOf(dispatch),
      )
      expect(body).toContain('mutationInFlightRef.current = null')
    }
  })

  it('disables every document mutation control while any write is active', () => {
    expect(source).toContain(
      'uploading || Boolean(reviewingId) || creatingPortalLink || mutationRequiresRefresh',
    )
    expect(source).toContain('aria-busy={mutationBusy}')
    expect(source.match(/disabled=\{mutationBusy\}/g)).toHaveLength(8)
    expect(source).toContain(
      "{uploading ? 'Uploading...' : mutationRequiresRefresh ? 'Refresh required' : 'Upload'}",
    )
    expect(source).toContain("? 'Refresh required'")
  })

  it('keeps read-only signed document opening outside the mutation lock', () => {
    const open = handler('openDocument', 'createPortalLink')

    expect(open).not.toContain('mutationInFlightRef.current =')
    expect(open).toContain("window.open('', '_blank')")
    expect(open).not.toContain("method: 'POST'")
  })

  it('documents the storage and token boundary without stronger claims', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'REQUEST_DOCUMENT_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Request Document Mutation Single-Flight Boundary',
      'upload',
      'review',
      'family upload link',
      'signed document opening',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
