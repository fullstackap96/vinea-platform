import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

let readBoundedJsonBody: typeof import('./boundedJsonBody').readBoundedJsonBody

beforeAll(async () => {
  ;({ readBoundedJsonBody } = await import('./boundedJsonBody'))
})

function jsonRequest(body: string, headers?: HeadersInit): Request {
  return new Request('https://vinea.test/api/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  })
}

describe('readBoundedJsonBody', () => {
  it('parses JSON at or below the configured byte limit', async () => {
    const body = JSON.stringify({ name: 'Safe Parish' })

    await expect(readBoundedJsonBody(jsonRequest(body), Buffer.byteLength(body))).resolves.toEqual({
      ok: true,
      value: { name: 'Safe Parish' },
    })
  })

  it('rejects a declared body size above the limit without reading the stream', async () => {
    const request = jsonRequest('{}', { 'Content-Length': '4097' })
    const getReader = vi.spyOn(request.body as ReadableStream<Uint8Array>, 'getReader')

    await expect(readBoundedJsonBody(request, 4096)).resolves.toEqual({
      ok: false,
      reason: 'too_large',
    })
    expect(getReader).not.toHaveBeenCalled()
  })

  it('counts actual UTF-8 bytes when content length is absent or untrusted', async () => {
    const body = JSON.stringify({ notes: 'é'.repeat(20) })

    await expect(readBoundedJsonBody(jsonRequest(body), 24)).resolves.toEqual({
      ok: false,
      reason: 'too_large',
    })
  })

  it('does not trust malformed content-length headers', async () => {
    const body = JSON.stringify({ ok: true })

    await expect(
      readBoundedJsonBody(jsonRequest(body, { 'Content-Length': 'not-a-number' }), 1024),
    ).resolves.toEqual({ ok: true, value: { ok: true } })
  })

  it('returns a generic invalid-json result for empty or malformed bodies', async () => {
    await expect(readBoundedJsonBody(jsonRequest('{broken'), 1024)).resolves.toEqual({
      ok: false,
      reason: 'invalid_json',
    })
    await expect(
      readBoundedJsonBody(new Request('https://vinea.test/api/public', { method: 'POST' }), 1024),
    ).resolves.toEqual({ ok: false, reason: 'invalid_json' })
  })

  it('rejects invalid internal limits before reading a request', async () => {
    await expect(readBoundedJsonBody(jsonRequest('{}'), 0)).rejects.toThrow(RangeError)
  })
})
