import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

const originalEnv = { ...process.env }

function request(origin?: string, fetchSite?: string, url = 'https://vinea.test/api/example') {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      ...(origin ? { origin } : {}),
      ...(fetchSite ? { 'sec-fetch-site': fetchSite } : {}),
    },
  })
}

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('same-origin mutation guard', () => {
  it('allows an exact same-origin browser mutation', () => {
    expect(rejectCrossOriginMutation(request('https://vinea.test', 'same-origin'))).toBeNull()
  })

  it('rejects missing, malformed, null, and cross-origin origins generically', async () => {
    for (const value of [
      undefined,
      'not-a-url',
      'null',
      'https://attacker.test',
      'https://vinea.test/path',
      'https://user:password@vinea.test',
      'https://vinea.test?query=value',
      'https://vinea.test/#fragment',
    ]) {
      const response = rejectCrossOriginMutation(request(value))
      expect(response?.status).toBe(403)
      await expect(response?.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
    }
  })

  it('rejects cross-site fetch metadata even if the Origin value looks trusted', () => {
    const response = rejectCrossOriginMutation(
      request('https://vinea.test', 'cross-site'),
    )
    expect(response?.status).toBe(403)
  })

  it('accepts an explicitly configured app or Vercel deployment origin', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.vineaplatform.test'
    process.env.VERCEL_URL = 'preview-vinea.vercel.app'

    expect(
      rejectCrossOriginMutation(
        request('https://app.vineaplatform.test', 'same-origin', 'http://internal.test/api/example'),
      ),
    ).toBeNull()
    expect(
      rejectCrossOriginMutation(
        request('https://preview-vinea.vercel.app', 'same-origin', 'http://internal.test/api/example'),
      ),
    ).toBeNull()
  })

  it.each([
    'https://user:password@app.vineaplatform.test',
    'https://app.vineaplatform.test/dashboard',
    'https://app.vineaplatform.test?query=value',
    'https://app.vineaplatform.test/#fragment',
    'ftp://app.vineaplatform.test',
  ])('does not trust an unsafe configured app origin: %s', (configuredOrigin) => {
    vi.stubEnv('VERCEL', '1')
    process.env.NEXT_PUBLIC_APP_URL = configuredOrigin
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    const response = rejectCrossOriginMutation(
      request(
        'https://app.vineaplatform.test',
        'same-origin',
        'http://internal.test/api/example',
      ),
    )

    expect(response?.status).toBe(403)
  })

  it('fails closed in production when no trusted app or deployment origin is configured', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    const response = rejectCrossOriginMutation(
      request('https://vinea.test', 'same-origin'),
    )

    expect(response?.status).toBe(403)
  })

  it('does not trust request-derived origins in Vercel processes', () => {
    vi.stubEnv('VERCEL', '1')
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    const response = rejectCrossOriginMutation(
      request('https://vinea.test', 'same-origin'),
    )

    expect(response?.status).toBe(403)
  })

  it('accepts configured Vercel branch and production deployment origins', () => {
    vi.stubEnv('VERCEL', '1')
    process.env.VERCEL_BRANCH_URL = 'feature-vinea.vercel.app'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'vinea.vercel.app'

    expect(
      rejectCrossOriginMutation(
        request('https://feature-vinea.vercel.app', 'same-origin', 'http://internal.test/api/example'),
      ),
    ).toBeNull()
    expect(
      rejectCrossOriginMutation(
        request('https://vinea.vercel.app', 'same-origin', 'http://internal.test/api/example'),
      ),
    ).toBeNull()
  })
})
