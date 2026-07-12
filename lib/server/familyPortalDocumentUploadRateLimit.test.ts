import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app',
    'api',
    'family',
    'request-portal',
    '[token]',
    'documents',
    'route.ts',
  ),
  'utf8',
)

describe('family portal document upload durable rate limit', () => {
  it('runs before token lookup, form parsing, storage, and audit writes', () => {
    const rateLimitIndex = source.indexOf('const rateLimit = await checkDurableRateLimit')
    const portalIndex = source.indexOf('const portal = await loadFamilyPortalByToken')
    const formIndex = source.indexOf('const form = await request.formData()')
    const uploadIndex = source.indexOf('.upload(storagePath, buffer')
    const auditIndex = source.indexOf('await writeAuditEvent')

    expect(rateLimitIndex).toBeGreaterThan(-1)
    expect(portalIndex).toBeGreaterThan(rateLimitIndex)
    expect(formIndex).toBeGreaterThan(portalIndex)
    expect(uploadIndex).toBeGreaterThan(formIndex)
    expect(auditIndex).toBeGreaterThan(uploadIndex)
  })

  it('uses a token-free per-IP key and bounded upload cadence', () => {
    expect(source).toContain(
      "key: durableRateLimitKeyFromRequest(request, 'family-document-upload')",
    )
    expect(source).toContain('const RATE_LIMIT = { limit: 20, windowMs: 15 * 60_000 }')
    expect(source).not.toContain('key: `family-document-upload:${token}')
  })

  it('fails closed and returns standards-friendly limit metadata', () => {
    expect(source).toContain("status: 503")
    expect(source).toContain("status: 429")
    expect(source).toContain("headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }")
    expect(source).toContain("error: 'Too many upload attempts. Please try again later.'")
  })
})
