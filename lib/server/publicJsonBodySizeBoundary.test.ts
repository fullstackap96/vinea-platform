import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('public JSON body size boundary', () => {
  it.each([
    ['app/api/intake/route.ts', '64 * 1024', 'const requestType = text(body.requestType)'],
    ['app/api/demo-request/route.ts', '32 * 1024', 'const bodyRecord ='],
    [
      'app/api/request-notifications/route.ts',
      '32 * 1024',
      'const verification = await verifyRequestNotificationPayload',
    ],
  ])('bounds %s after durable limiting and before downstream work', (path, limit, downstream) => {
    const route = source(path)

    expect(route).toContain(`const MAX_BODY_BYTES = ${limit}`)
    expect(route).toContain('readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain("parsedBody.reason === 'too_large'")
    expect(route).toContain('{ status: 413 }')
    expect(route).not.toContain('request.json()')
    expectBefore(route, 'const rateLimit = await checkDurableRateLimit', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', downstream)
  })

  it('implements streamed actual-byte enforcement without body logging', () => {
    const reader = source('lib/server/boundedJsonBody.ts')

    for (const required of [
      "request.headers.get('content-length')",
      'request.body.getReader()',
      'totalBytes += value.byteLength',
      'if (totalBytes > maxBytes)',
      'await reader.cancel()',
      "reason: 'too_large'",
      "reason: 'invalid_json'",
    ]) {
      expect(reader).toContain(required)
    }

    expect(reader).not.toContain('console.')
    expect(reader).not.toContain('logServer')
  })

  it('documents the limits, ordering, and unchanged production boundaries', () => {
    const doc = source('docs/PUBLIC_JSON_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'PUBLIC_JSON_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`/api/intake` | `64 KiB`',
      '`/api/demo-request` | `32 KiB`',
      '`/api/request-notifications` | `32 KiB`',
      'Durable rate limiting remains before bounded body parsing',
      'does not apply migrations or change operational RLS',
      'does not approve public intake routing for production',
      'does not make a public trust-center claim',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
