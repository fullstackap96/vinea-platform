import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  clientIpFromRequest,
  durableRateLimitKeyFromRequest,
} from './simpleRateLimit'

function requestWith(headers: Record<string, string>): Request {
  return new Request('https://app.example.test/api/intake', { headers })
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('public rate-limit client identity', () => {
  it('prefers the Vercel canonical forwarded address', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': '203.0.113.20',
      'x-forwarded-for': '198.51.100.10',
      'x-real-ip': '192.0.2.5',
    })

    expect(clientIpFromRequest(request)).toBe('203.0.113.20')
  })

  it('uses the first valid standard forwarded address outside Vercel', () => {
    const request = requestWith({
      'x-forwarded-for': '198.51.100.10, 192.0.2.5',
    })

    expect(clientIpFromRequest(request)).toBe('198.51.100.10')
  })

  it('does not trust fallback forwarding headers when Vercel canonical identity is absent', () => {
    vi.stubEnv('VERCEL', '1')

    const request = requestWith({
      'x-forwarded-for': '198.51.100.10',
      'x-real-ip': '192.0.2.5',
    })

    expect(clientIpFromRequest(request)).toBe('unknown')
  })

  it('falls through malformed forwarded values to a valid real IP', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': 'attacker-controlled-bucket',
      'x-forwarded-for': 'not-an-ip, 203.0.113.20',
      'x-real-ip': '192.0.2.5',
    })

    expect(clientIpFromRequest(request)).toBe('192.0.2.5')
  })

  it('accepts IPv6 addresses and normalizes hex casing', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': '2001:DB8::1',
    })

    expect(clientIpFromRequest(request)).toBe('2001:db8::1')
  })

  it('collapses missing or malformed identity headers to one fail-closed bucket', () => {
    expect(clientIpFromRequest(requestWith({}))).toBe('unknown')
    expect(
      clientIpFromRequest(
        requestWith({
          'x-vercel-forwarded-for': 'forged-a',
          'x-forwarded-for': 'forged-b',
          'x-real-ip': 'forged-c',
        }),
      ),
    ).toBe('unknown')
  })

  it('derives a stable opaque durable key without storing the raw address', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': '203.0.113.20',
    })

    const first = durableRateLimitKeyFromRequest(request, 'public-intake')
    const second = durableRateLimitKeyFromRequest(request, 'public-intake')

    expect(first).toBe(second)
    expect(first).toMatch(/^public-intake:v1:[A-Za-z0-9_-]{43}$/)
    expect(first).not.toContain('203.0.113.20')
  })

  it('separates route namespaces and rejects unsafe namespace labels', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': '203.0.113.20',
    })

    expect(durableRateLimitKeyFromRequest(request, 'demo-request')).not.toBe(
      durableRateLimitKeyFromRequest(request, 'public-intake'),
    )
    expect(() => durableRateLimitKeyFromRequest(request, 'Invalid namespace!')).toThrow(
      'Invalid durable rate-limit namespace.',
    )
  })
})
