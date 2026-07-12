import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolveAppOrigin } from '@/lib/appOrigin'

const originalEnv = { ...process.env }

function request(url = 'https://request-derived.test/dashboard') {
  return new NextRequest(url)
}

afterEach(() => {
  process.env = { ...originalEnv }
  vi.unstubAllEnvs()
})

describe('application redirect and link origin', () => {
  it('uses only an exact configured app origin', () => {
    process.env.NEXT_PUBLIC_APP_URL = ' https://app.vineaplatform.test/ '

    expect(resolveAppOrigin(request())).toBe('https://app.vineaplatform.test')
  })

  it.each([
    'https://user:password@app.vineaplatform.test',
    'https://app.vineaplatform.test/dashboard',
    'https://app.vineaplatform.test?query=value',
    'https://app.vineaplatform.test/#fragment',
    'ftp://app.vineaplatform.test',
  ])('fails closed on an unsafe configured origin in production: %s', (value) => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    process.env.NEXT_PUBLIC_APP_URL = value
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    expect(() => resolveAppOrigin(request())).toThrow('Application origin is not configured.')
  })

  it('accepts trusted Vercel deployment hostnames without trusting the request host', () => {
    vi.stubEnv('VERCEL', '1')
    delete process.env.NEXT_PUBLIC_APP_URL
    process.env.VERCEL_BRANCH_URL = 'safe-preview.vercel.app'

    expect(resolveAppOrigin(request('https://attacker-controlled.test/dashboard'))).toBe(
      'https://safe-preview.vercel.app',
    )
  })

  it('requires HTTPS for a configured Vercel app origin', () => {
    vi.stubEnv('VERCEL', '1')
    process.env.NEXT_PUBLIC_APP_URL = 'http://preview-vinea.vercel.app'
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    expect(() => resolveAppOrigin(request())).toThrow('Application origin is not configured.')
  })

  it('retains request-derived fallback only for local non-production development', () => {
    Object.assign(process.env, { NODE_ENV: 'development' })
    delete process.env.VERCEL
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    const localRequest = request('http://127.0.0.1:3000/dashboard')
    expect(resolveAppOrigin(localRequest)).toBe(localRequest.nextUrl.origin)
  })

  it('fails closed when production has no trusted origin', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    delete process.env.VERCEL
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL

    expect(() => resolveAppOrigin(request())).toThrow('Application origin is not configured.')
  })
})
