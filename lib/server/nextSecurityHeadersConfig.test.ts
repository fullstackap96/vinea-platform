import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import nextConfig, {
  apiNoStoreHeaders,
  familyPortalPrivacyHeaders,
  productionSecurityHeaders,
  sensitiveNoStoreHeaders,
} from '../../next.config'

describe('Next.js production security headers', () => {
  it('does not advertise the application framework', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })

  it('sets conservative security headers for every route', async () => {
    expect(typeof nextConfig.headers).toBe('function')

    const headerRules = await nextConfig.headers!()

    expect(headerRules).toEqual([
      {
        source: '/:path*',
        headers: [...productionSecurityHeaders],
      },
      {
        source: '/api/:path*',
        headers: [...sensitiveNoStoreHeaders],
      },
      {
        source: '/dashboard/:path*',
        headers: [...sensitiveNoStoreHeaders],
      },
      {
        source: '/family/request/:path*',
        headers: [...familyPortalPrivacyHeaders],
      },
    ])
  })

  it('includes the approved baseline without adding CSP before a separate QA pass', () => {
    const headers = new Map(
      productionSecurityHeaders.map(({ key, value }) => [key, value]),
    )

    expect(headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains',
    )
    expect(headers.get('X-Frame-Options')).toBe('DENY')
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=(), payment=()',
    )
    const headerKeys = productionSecurityHeaders.map(({ key }) => String(key))
    expect(headerKeys).not.toContain('Content-Security-Policy')
  })

  it('prevents browser and intermediary caching for every API response', () => {
    const headers = new Map(apiNoStoreHeaders.map(({ key, value }) => [key, value]))

    expect(headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(headers.get('Pragma')).toBe('no-cache')
    expect(headers.get('Expires')).toBe('0')
    expect(headers.get('X-Robots-Tag')).toBe('noindex, nofollow, noarchive')
  })

  it('applies the same no-store boundary to staff and tokenized family pages', async () => {
    expect(apiNoStoreHeaders).toBe(sensitiveNoStoreHeaders)

    const headerRules = await nextConfig.headers!()
    expect(headerRules).toContainEqual({
      source: '/dashboard/:path*',
      headers: [...sensitiveNoStoreHeaders],
    })
    expect(headerRules).toContainEqual({
      source: '/family/request/:path*',
      headers: [...familyPortalPrivacyHeaders],
    })
  })

  it('does not send the tokenized family portal URL as a referrer', () => {
    const headers = new Map(
      familyPortalPrivacyHeaders.map(({ key, value }) => [key, value]),
    )

    expect(headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(headers.get('Pragma')).toBe('no-cache')
    expect(headers.get('Expires')).toBe('0')
    expect(headers.get('X-Robots-Tag')).toBe('noindex, nofollow, noarchive')
    expect(headers.get('Referrer-Policy')).toBe('no-referrer')
  })

  it('keeps public pages indexable while sensitive responses opt out through scoped rules', async () => {
    const headerRules = await nextConfig.headers!()
    const globalRule = headerRules.find(({ source }) => source === '/:path*')
    const sensitiveRules = headerRules.filter(({ source }) =>
      ['/api/:path*', '/dashboard/:path*', '/family/request/:path*'].includes(source),
    )

    expect(globalRule?.headers.map(({ key }) => key)).not.toContain('X-Robots-Tag')
    for (const rule of sensitiveRules) {
      expect(new Map(rule.headers.map(({ key, value }) => [key, value])).get('X-Robots-Tag'))
        .toBe('noindex, nofollow, noarchive')
    }
  })

  it('documents the sensitive no-store boundary without approving CSP', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md'),
      'utf8',
    )

    expect(evidence).toContain('## Sensitive Response Cache Boundary')
    expect(evidence).toContain('`private, no-store, max-age=0`')
    expect(evidence).toContain('`/api/:path*`')
    expect(evidence).toContain('`/dashboard/:path*`')
    expect(evidence).toContain('`/family/request/:path*`')
    expect(evidence).toContain('`no-referrer`')
    expect(evidence).toContain('token-bearing portal URL')
    expect(evidence).toContain('`X-Robots-Tag`')
    expect(evidence).toContain('`noindex, nofollow, noarchive`')
    expect(evidence).toContain('`poweredByHeader: false`')
    expect(evidence).toContain('CSP REMAINS SEPARATE QA')
  })
})
