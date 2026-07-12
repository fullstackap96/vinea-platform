import 'server-only'

import { createHash } from 'node:crypto'
import { isIP } from 'node:net'

type RateLimitEntry = {
  count: number
  windowStartedAt: number
}

const buckets = new Map<string, RateLimitEntry>()

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number }

/**
 * Basic in-memory rate limiter (per server instance).
 * Suitable for low-volume abuse protection on single-route handlers.
 */
export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now - existing.windowStartedAt >= options.windowMs) {
    buckets.set(key, { count: 1, windowStartedAt: now })
    return { ok: true }
  }

  if (existing.count >= options.limit) {
    const retryAfterMs = options.windowMs - (now - existing.windowStartedAt)
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  existing.count += 1
  buckets.set(key, existing)
  return { ok: true }
}

function validFirstIp(value: string | null): string | null {
  const candidate = value?.split(',')[0]?.trim()
  if (!candidate || isIP(candidate) === 0) return null
  return candidate.toLowerCase()
}

export function clientIpFromRequest(request: Request): string {
  const vercelForwardedIp = validFirstIp(request.headers.get('x-vercel-forwarded-for'))
  if (vercelForwardedIp) return vercelForwardedIp

  if (process.env.VERCEL === '1') return 'unknown'

  const forwardedIp = validFirstIp(request.headers.get('x-forwarded-for'))
  if (forwardedIp) return forwardedIp

  const realIp = validFirstIp(request.headers.get('x-real-ip'))
  if (realIp) return realIp

  return 'unknown'
}

const RATE_LIMIT_NAMESPACE_PATTERN = /^[a-z0-9][a-z0-9-]{0,47}$/

export function durableRateLimitKeyFromRequest(
  request: Request,
  namespace: string,
): string {
  if (!RATE_LIMIT_NAMESPACE_PATTERN.test(namespace)) {
    throw new Error('Invalid durable rate-limit namespace.')
  }

  const digest = createHash('sha256')
    .update(`vinea-public-rate-limit:v1\0${namespace}\0${clientIpFromRequest(request)}`)
    .digest('base64url')

  return `${namespace}:v1:${digest}`
}
